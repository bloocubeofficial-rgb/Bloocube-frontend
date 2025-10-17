import { useState, useEffect, useCallback, useRef } from 'react';

interface TextPersistenceOptions {
  key: string;
  debounceMs?: number;
  defaultValue?: string;
}

export function useTextPersistence(options: TextPersistenceOptions) {
  const { key, debounceMs = 500, defaultValue = '' } = options;
  const [value, setValue] = useState<string>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load text from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`text_${key}`);
      if (saved !== null) {
        setValue(saved);
        console.log('📂 Text loaded:', { key, length: saved.length });
      }
    } catch (error) {
      console.error('❌ Failed to load text:', error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // Save text to localStorage with debouncing
  const saveText = useCallback((text: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`text_${key}`, text);
        console.log('💾 Text saved:', { key, length: text.length });
      } catch (error) {
        console.error('❌ Failed to save text:', error);
      }
    }, debounceMs);
  }, [key, debounceMs]);

  // Update value and save
  const updateValue = useCallback((newValue: string) => {
    setValue(newValue);
    saveText(newValue);
  }, [saveText]);

  // Clear saved text
  const clearText = useCallback(() => {
    try {
      localStorage.removeItem(`text_${key}`);
      setValue(defaultValue);
      console.log('🗑️ Text cleared:', { key });
    } catch (error) {
      console.error('❌ Failed to clear text:', error);
    }
  }, [key, defaultValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    value,
    setValue: updateValue,
    clearText,
    isLoading
  };
}
