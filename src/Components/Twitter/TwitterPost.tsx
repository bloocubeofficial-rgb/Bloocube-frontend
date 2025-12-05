'use client';
import React, { useState } from 'react';
import { useTwitter } from '@/hooks/useTwitter';
import { Loader2, Send, Image, X } from 'lucide-react';
import { TwitterIntegration } from './TwitterIntegration';

interface TwitterPostProps {
  className?: string;
}

export const TwitterPost: React.FC<TwitterPostProps> = ({ className = '' }) => {
  const { isConnected, postTweet, uploadMedia, loading, error } = useTwitter();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

 const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
  if (!allowedTypes.includes(file.type)) {
    alert('Please select a valid image or video file');
    return;
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB');
    return;
  }

  try {
    setIsUploading(true);
    setSelectedFile(file);

    // ✅ Use the uploadMedia from useTwitter()
    const id = await uploadMedia(file);
    setMediaId(id);

  } catch (error: unknown) {
    console.error('Media upload error:', error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    alert('Failed to upload media: ' + errorMessage);
    setSelectedFile(null);
    setMediaId(null);
  } finally {
    setIsUploading(false);
  }
};


  const handlePost = async () => {
    if (!content.trim()) {
      alert('Please enter some content for your tweet');
      return;
    }

    try {
      setIsPosting(true);
      
      const mediaIds = mediaId ? [mediaId] : undefined;
      const result = await postTweet(content, mediaIds);
      
      if (result) {
        alert('Tweet posted successfully!');
        setContent('');
        setSelectedFile(null);
        setMediaId(null);
      }
    } catch (error: unknown) {
      console.error('Tweet posting error:', error);
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert('Failed to post tweet: ' + errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <X className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Twitter Not Connected</h3>
        <p className="text-gray-600 mb-4">
          Connect your Twitter account to post tweets directly from Bloocube.
        </p>
        <TwitterIntegration />
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-medium text-sm">X</span>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Post to Twitter</h3>
          <p className="text-sm text-gray-500">Share your content with your Twitter audience</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            maxLength={280}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {content.length}/280 characters
            </span>
            {error && (
              <span className="text-sm text-red-500">{error}</span>
            )}
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
            <Image className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 flex-1 truncate">
              {selectedFile.name}
            </span>
            <button
              onClick={() => {
                setSelectedFile(null);
                setMediaId(null);
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
                <Image className="w-4 h-4" />
                <span className="text-sm">
                  {isUploading ? 'Uploading...' : 'Add media'}
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={handlePost}
            disabled={isPosting || loading || !content.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Post Tweet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
