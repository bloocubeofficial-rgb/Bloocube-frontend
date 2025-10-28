"use client";
import React, { useState } from 'react';
import { usePostFormPersistence } from '@/hooks/usePostFormPersistence';
import { Instagram, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'pink' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'blue' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'sky' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'red' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'blue' },
];

export function PostFormWithPersistence() {
  const {
    selectedPlatform,
    setSelectedPlatform,
    selectedPostType,
    setSelectedPostType,
    postData,
    setPostData,
    mediaFiles,
    setMediaFiles,
    clearFormData
  } = usePostFormPersistence();

  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setPostData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles((prev: File[]) => [...prev, ...files]);
  };

  const handleClearForm = () => {
    clearFormData();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl md:text-2xl font-bold">Create Post</h1>
        <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
          <button
            onClick={handleClearForm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full sm:w-auto"
          >
            Clear Form
          </button>
          {showSuccess && (
            <div className="px-4 py-2 bg-green-500 text-white rounded w-full sm:w-auto text-center">
              Form cleared! 🎉
            </div>
          )}
        </div>
      </div>

      {/* Platform Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select Platform</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {PLATFORMS.map(platform => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`p-3 md:p-4 border-2 rounded-lg transition-all ${
                selectedPlatform === platform.id
                  ? `border-${platform.color}-500 bg-${platform.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <platform.icon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2" />
              <span className="text-xs md:text-sm font-medium">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Post Type Selection */}
      {selectedPlatform && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Post Type</h2>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <button
              onClick={() => setSelectedPostType('post')}
              className={`px-3 md:px-4 py-2 rounded ${
                selectedPostType === 'post'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Post
            </button>
            <button
              onClick={() => setSelectedPostType('story')}
              className={`px-3 md:px-4 py-2 rounded ${
                selectedPostType === 'story'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Story
            </button>
            {selectedPlatform === 'youtube' && (
              <button
                onClick={() => setSelectedPostType('video')}
                className={`px-3 md:px-4 py-2 rounded ${
                  selectedPostType === 'video'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Video
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content Form */}
      {selectedPlatform && selectedPostType && (
        <div className="space-y-6 p-4 md:p-6 border rounded-lg">
          <h2 className="text-lg font-semibold">Post Content</h2>
          
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={postData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter post title..."
            />
          </div>

          {/* Caption/Content */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Caption/Content</label>
            <textarea
              value={postData.caption || ''}
              onChange={(e) => handleInputChange('caption', e.target.value)}
              className="w-full p-3 border rounded-lg h-28 md:h-32"
              placeholder="Write your post content..."
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Hashtags</label>
            <input
              type="text"
              value={postData.hashtags || ''}
              onChange={(e) => handleInputChange('hashtags', e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="#fashion #style #ootd"
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Media Files</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full p-3 border rounded-lg"
            />
            {mediaFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Selected files:</p>
                <ul className="text-sm text-gray-500">
                  {mediaFiles.map((file, index) => (
                    <li key={index}>• {file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* YouTube specific fields */}
          {selectedPlatform === 'youtube' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={postData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3 border rounded-lg h-24"
                  placeholder="Describe your video..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Tags</label>
                <input
                  type="text"
                  value={postData.tags || ''}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="gaming, tutorial, review"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">How to Test Form Persistence:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Fill out some fields above</li>
          <li>Navigate to another page (like Settings)</li>
          <li>Come back to this page</li>
          <li>Your form data should still be there! 🎉</li>
        </ol>
      </div>
    </div>
  );
}
