# Form Persistence Integration Guide

## Problem Solved
When users navigate between pages (e.g., from Posts to Settings), their form data gets lost because React components unmount and remount.

## Solution
I've created several hooks to automatically save and restore form data using localStorage:

## Available Hooks

### 1. `useTextPersistence` - For simple text inputs
```tsx
import { useTextPersistence } from '@/hooks/useTextPersistence';

function MyComponent() {
  const { value, setValue, clearText } = useTextPersistence({
    key: 'my_text_field',
    debounceMs: 500
  });

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="This text will persist across page navigation!"
    />
  );
}
```

### 2. `useFormState` - For React Hook Form
```tsx
import { useForm } from 'react-hook-form';
import { useFormState } from '@/hooks/useFormState';

function MyForm() {
  const form = useForm();
  
  useFormState(form, {
    key: 'my_form',
    debounceMs: 1000,
    excludeFields: ['password'] // Don't save sensitive fields
  });

  return (
    <form>
      {/* Your form fields */}
    </form>
  );
}
```

### 3. `usePostFormPersistence` - For your posts page
```tsx
import { usePostFormPersistence } from '@/hooks/usePostFormPersistence';

function PostsPage() {
  const {
    selectedPlatform,
    setSelectedPlatform,
    postData,
    setPostData,
    clearFormData
  } = usePostFormPersistence();

  // Use these state variables instead of regular useState
  // They automatically save/restore on navigation
}
```

## Integration Steps

### For Your Existing Posts Page:

1. **Replace useState with usePostFormPersistence:**
```tsx
// Before:
const [selectedPlatform, setSelectedPlatform] = useState<string>('');
const [postData, setPostData] = useState<any>({});

// After:
const {
  selectedPlatform,
  setSelectedPlatform,
  postData,
  setPostData,
  clearFormData
} = usePostFormPersistence();
```

2. **Add a clear form button:**
```tsx
<button onClick={clearFormData}>
  Clear Form
</button>
```

3. **That's it!** The form will now automatically:
   - Save data as you type (with 1-second debounce)
   - Restore data when you return to the page
   - Persist across browser sessions

## Features

- ✅ **Auto-save**: Saves form data as you type
- ✅ **Auto-restore**: Restores data when you return
- ✅ **Debounced**: Prevents excessive saves while typing
- ✅ **Cross-session**: Data persists even after browser restart
- ✅ **File handling**: Handles file uploads (metadata only)
- ✅ **Exclude fields**: Skip saving sensitive data
- ✅ **Performance**: Only saves when data actually changes

## Demo Components

- `FormPersistenceDemo.tsx` - Shows all hook types
- `PostFormWithPersistence.tsx` - Complete post form example

## Testing

1. Fill out a form
2. Navigate to another page
3. Come back
4. Your data should still be there! 🎉
