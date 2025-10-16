"use client";
import { useState } from 'react';
import { useTextPersistence } from '@/hooks/useTextPersistence';
import { useForm } from 'react-hook-form';
import { useFormState } from '@/hooks/useFormState';

interface PostForm {
  title: string;
  content: string;
  tags: string;
  platform: string;
}

export function FormPersistenceDemo() {
  // Example 1: Simple text persistence
  const { value: title, setValue: setTitle, clearText: clearTitle } = useTextPersistence({
    key: 'post_title',
    debounceMs: 500
  });

  const { value: content, setValue: setContent, clearText: clearContent } = useTextPersistence({
    key: 'post_content',
    debounceMs: 500
  });

  // Example 2: Form state persistence with React Hook Form
  const form = useForm<PostForm>({
    defaultValues: {
      title: '',
      content: '',
      tags: '',
      platform: 'instagram'
    }
  });

  const { clearFormData } = useFormState(form, {
    key: 'post_form',
    debounceMs: 1000,
    excludeFields: ['platform'] // Don't save platform selection
  });

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Form Persistence Demo</h2>
      
      {/* Simple Text Persistence */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Simple Text Persistence</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Title (auto-saves):</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter post title..."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Content (auto-saves):</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded h-24"
            placeholder="Enter post content..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearTitle}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Title
          </button>
          <button
            onClick={clearContent}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Content
          </button>
        </div>
      </div>

      {/* Form State Persistence */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Form State Persistence</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showForm ? 'Hide' : 'Show'} Form
        </button>
        
        {showForm && (
          <form className="space-y-4 p-4 border rounded">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Form Title:</label>
              <input
                {...form.register('title')}
                className="w-full p-2 border rounded"
                placeholder="Enter form title..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Form Content:</label>
              <textarea
                {...form.register('content')}
                className="w-full p-2 border rounded h-24"
                placeholder="Enter form content..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Tags:</label>
              <input
                {...form.register('tags')}
                className="w-full p-2 border rounded"
                placeholder="Enter tags..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Platform:</label>
              <select {...form.register('platform')} className="w-full p-2 border rounded">
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearFormData}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear Form Data
              </button>
              <button
                type="button"
                onClick={() => console.log('Form data:', form.getValues())}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Log Form Data
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2">How to Test:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Type something in the text fields above</li>
          <li>Navigate to another page (like Settings)</li>
          <li>Come back to this page</li>
          <li>Your text should still be there! 🎉</li>
        </ol>
      </div>
    </div>
  );
}
