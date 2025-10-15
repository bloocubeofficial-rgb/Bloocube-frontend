'use client';
import React, { useState } from 'react';
import { useInstagram } from '@/hooks/useInstagram';
import { Loader2, Send, Image, X, Instagram, Camera } from 'lucide-react';
import { InstagramIntegration } from './InstagramIntegration';
import { InstagramPostData } from '@/types/instagram';

interface InstagramPostProps {
  className?: string;
}

export const InstagramPost: React.FC<InstagramPostProps> = ({ className = '' }) => {
  const { isConnected, postContent, postStory, uploadMedia, loading, error } = useInstagram();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [postType, setPostType] = useState<'post' | 'story'>('post');
  const [location, setLocation] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image or video file');
      return;
    }

    // Validate file size (100MB limit for Instagram)
    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB');
      return;
    }

    try {
      setIsUploading(true);
      setSelectedFile(file);

      // Upload media to get URL
      const url = await uploadMedia(file);
      setMediaUrl(url);

    } catch (error: unknown) {
      console.error('Media upload error:', error);
      alert('Failed to upload media: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setSelectedFile(null);
      setMediaUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedFile) {
      alert('Please enter some content or select a media file for your Instagram post');
      return;
    }

    if (!mediaUrl && selectedFile) {
      alert('Please wait for media upload to complete');
      return;
    }

    try {
      setIsPosting(true);
      
      const postData: InstagramPostData = {
        type: postType,
        content: content,
        caption: content,
        mediaUrl: mediaUrl || '',
        location: location || undefined
      };

      const result = await postContent(postData);
      
      if (result) {
        alert(`Instagram ${postType} posted successfully!`);
        setContent('');
        setSelectedFile(null);
        setMediaUrl(null);
        setLocation('');
      }
    } catch (error: unknown) {
      console.error('Instagram posting error:', error);
      alert('Failed to post to Instagram: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsPosting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <Instagram className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Instagram Not Connected</h3>
        <p className="text-gray-600 mb-4">
          Connect your Instagram account to post content directly from Bloocube.
        </p>
        <InstagramIntegration />
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Instagram className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Post to Instagram</h3>
          <p className="text-sm text-gray-500">Share your content with your Instagram audience</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Post Type Selection */}
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="postType"
              value="post"
              checked={postType === 'post'}
              onChange={(e) => setPostType(e.target.value as 'post' | 'story')}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Post</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="postType"
              value="story"
              checked={postType === 'story'}
              onChange={(e) => setPostType(e.target.value as 'post' | 'story')}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Story</span>
          </label>
        </div>

        {/* Content Input */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={postType === 'story' ? "Add a caption to your story..." : "Write a caption..."}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            rows={4}
            maxLength={2200}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {content.length}/2200 characters
            </span>
            {error && (
              <span className="text-sm text-red-500">{error}</span>
            )}
          </div>
        </div>

        {/* Location Input (only for posts) */}
        {postType === 'post' && (
          <div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location (optional)"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        )}

        {/* Media Preview */}
        {selectedFile && (
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
            <Image className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 flex-1 truncate">
              {selectedFile.name}
            </span>
            <button
              onClick={() => {
                setSelectedFile(null);
                setMediaUrl(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors">
                <Camera className="w-4 h-4" />
                <span className="text-sm">
                  {isUploading ? 'Uploading...' : 'Add media'}
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={handlePost}
            disabled={isPosting || loading || (!content.trim() && !selectedFile)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Post {postType === 'story' ? 'Story' : 'Content'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
