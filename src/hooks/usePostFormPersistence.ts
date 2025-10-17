import { useState, useEffect, useCallback, useRef } from 'react';

interface PostFormData {
  selectedPlatform: string;
  selectedPostType: string;
  postData: any;
  mediaFiles: File[];
  pollOptions: string[];
  threadTweets: string[];
}

interface PostFormPersistenceOptions {
  debounceMs?: number;
  autoSave?: boolean;
}

export function usePostFormPersistence(options: PostFormPersistenceOptions = {}) {
  const { debounceMs = 1000, autoSave = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isInitialized = useRef<boolean>(false);

  // Form state
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedPostType, setSelectedPostType] = useState<string>('');
  const [postData, setPostData] = useState<any>({});
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [threadTweets, setThreadTweets] = useState<string[]>(['']);

  // Save form data to localStorage with debouncing
  const saveFormData = useCallback((data: PostFormData) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        // Convert File objects to serializable format
        const serializedData = {
          ...data,
          mediaFiles: data.mediaFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          }))
        };

        localStorage.setItem('post_form_data', JSON.stringify(serializedData));
        console.log('💾 Post form data saved:', { 
          platform: data.selectedPlatform, 
          postType: data.selectedPostType,
          hasMedia: data.mediaFiles.length > 0,
          hasContent: Object.keys(data.postData).length > 0
        });
      } catch (error) {
        console.error('❌ Failed to save post form data:', error);
      }
    }, debounceMs);
  }, [debounceMs]);

  // Load form data from localStorage
  const loadFormData = useCallback((): Partial<PostFormData> => {
    try {
      const saved = localStorage.getItem('post_form_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📂 Post form data loaded:', { 
          platform: parsed.selectedPlatform, 
          postType: parsed.selectedPostType,
          hasMedia: parsed.mediaFiles?.length > 0,
          hasContent: Object.keys(parsed.postData || {}).length > 0
        });
        return parsed;
      }
    } catch (error) {
      console.error('❌ Failed to load post form data:', error);
    }
    return {};
  }, []);

  // Clear saved form data
  const clearFormData = useCallback(() => {
    try {
      localStorage.removeItem('post_form_data');
      setSelectedPlatform('');
      setSelectedPostType('');
      setPostData({});
      setMediaFiles([]);
      setPollOptions(['', '']);
      setThreadTweets(['']);
      console.log('🗑️ Post form data cleared');
    } catch (error) {
      console.error('❌ Failed to clear post form data:', error);
    }
  }, []);

  // Auto-save when form data changes
  useEffect(() => {
    if (!autoSave) return;

    if (isInitialized.current) {
      saveFormData({
        selectedPlatform,
        selectedPostType,
        postData,
        mediaFiles,
        pollOptions,
        threadTweets
      });
    } else {
      isInitialized.current = true;
    }
  }, [selectedPlatform, selectedPostType, postData, mediaFiles, pollOptions, threadTweets, saveFormData, autoSave]);

  // Load data on mount
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData.selectedPlatform) setSelectedPlatform(savedData.selectedPlatform);
    if (savedData.selectedPostType) setSelectedPostType(savedData.selectedPostType);
    if (savedData.postData) setPostData(savedData.postData);
    if (savedData.pollOptions) setPollOptions(savedData.pollOptions);
    if (savedData.threadTweets) setThreadTweets(savedData.threadTweets);
    // Note: mediaFiles can't be restored from localStorage as File objects
  }, [loadFormData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    selectedPlatform,
    setSelectedPlatform,
    selectedPostType,
    setSelectedPostType,
    postData,
    setPostData,
    mediaFiles,
    setMediaFiles,
    pollOptions,
    setPollOptions,
    threadTweets,
    setThreadTweets,
    
    // Actions
    clearFormData,
    saveFormData: () => saveFormData({
      selectedPlatform,
      selectedPostType,
      postData,
      mediaFiles,
      pollOptions,
      threadTweets
    })
  };
}
