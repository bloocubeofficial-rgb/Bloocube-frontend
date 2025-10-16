import { useEffect, useRef, useCallback } from 'react';

interface FormPersistenceOptions {
  key: string;
  debounceMs?: number;
  excludeFields?: string[];
}

export function useFormPersistence<T extends Record<string, any>>(
  formData: T,
  options: FormPersistenceOptions
) {
  const { key, debounceMs = 500, excludeFields = [] } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isInitialized = useRef(false);

  // Save form data to localStorage with debouncing
  const saveFormData = useCallback((data: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        // Filter out excluded fields
        const filteredData = Object.keys(data).reduce((acc, field) => {
          if (!excludeFields.includes(field)) {
            acc[field] = data[field];
          }
          return acc;
        }, {} as T);

        localStorage.setItem(`form_${key}`, JSON.stringify(filteredData));
        console.log('💾 Form data saved:', { key, data: filteredData });
      } catch (error) {
        console.error('❌ Failed to save form data:', error);
      }
    }, debounceMs);
  }, [key, debounceMs, excludeFields]);

  // Load form data from localStorage
  const loadFormData = useCallback((): Partial<T> => {
    try {
      const saved = localStorage.getItem(`form_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📂 Form data loaded:', { key, data: parsed });
        return parsed;
      }
    } catch (error) {
      console.error('❌ Failed to load form data:', error);
    }
    return {};
  }, [key]);

  // Clear saved form data
  const clearFormData = useCallback(() => {
    try {
      localStorage.removeItem(`form_${key}`);
      console.log('🗑️ Form data cleared:', { key });
    } catch (error) {
      console.error('❌ Failed to clear form data:', error);
    }
  }, [key]);

  // Auto-save when form data changes
  useEffect(() => {
    if (isInitialized.current) {
      saveFormData(formData);
    } else {
      isInitialized.current = true;
    }
  }, [formData, saveFormData]);

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
    saveFormData: () => saveFormData(formData)
  };
}
