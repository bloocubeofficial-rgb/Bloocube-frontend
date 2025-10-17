import { useEffect, useRef, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface FormStateOptions {
  key: string;
  debounceMs?: number;
  excludeFields?: string[];
  autoSave?: boolean;
}

export function useFormState<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  options: FormStateOptions
) {
  const { key, debounceMs = 1000, excludeFields = [], autoSave = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isInitialized = useRef<boolean>(false);
  const lastSavedData = useRef<string>('');

  // Save form data to localStorage with debouncing
  const saveFormData = useCallback((data: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        // Filter out excluded fields and convert to serializable format
        const filteredData = Object.keys(data).reduce((acc, field) => {
          if (!excludeFields.includes(field)) {
            const value = data[field];
            // Handle File objects and other non-serializable data
            if (value instanceof File) {
              acc[field] = { _type: 'file', name: value.name, size: value.size, type: value.type };
            } else if (value instanceof FileList) {
              acc[field] = Array.from(value).map(file => ({
                _type: 'file',
                name: file.name,
                size: file.size,
                type: file.type
              }));
            } else {
              acc[field] = value;
            }
          }
          return acc;
        }, {} as any);

        const serializedData = JSON.stringify(filteredData);
        
        // Only save if data has actually changed
        if (serializedData !== lastSavedData.current) {
          localStorage.setItem(`form_${key}`, serializedData);
          lastSavedData.current = serializedData;
          console.log('💾 Form state saved:', { key, fields: Object.keys(filteredData) });
        }
      } catch (error) {
        console.error('❌ Failed to save form state:', error);
      }
    }, debounceMs);
  }, [key, debounceMs, excludeFields]);

  // Load form data from localStorage
  const loadFormData = useCallback((): Partial<T> => {
    try {
      const saved = localStorage.getItem(`form_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📂 Form state loaded:', { key, fields: Object.keys(parsed) });
        return parsed;
      }
    } catch (error) {
      console.error('❌ Failed to load form state:', error);
    }
    return {};
  }, [key]);

  // Clear saved form data
  const clearFormData = useCallback(() => {
    try {
      localStorage.removeItem(`form_${key}`);
      lastSavedData.current = '';
      console.log('🗑️ Form state cleared:', { key });
    } catch (error) {
      console.error('❌ Failed to clear form state:', error);
    }
  }, [key]);

  // Auto-save when form data changes
  useEffect(() => {
    if (!autoSave) return;

    const subscription = form.watch((data) => {
      if (isInitialized.current) {
        saveFormData(data as T);
      } else {
        isInitialized.current = true;
      }
    });

    return () => subscription.unsubscribe();
  }, [form, saveFormData, autoSave]);

  // Load data on mount
  useEffect(() => {
    const savedData = loadFormData();
    if (Object.keys(savedData).length > 0) {
      form.reset(savedData as T);
    }
  }, [form, loadFormData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loadFormData,
    clearFormData,
    saveFormData: () => saveFormData(form.getValues())
  };
}
