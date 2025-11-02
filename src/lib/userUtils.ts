import { cookieAuthUtils } from "@/lib/cookieAuth";

/**
 * Standardized user ID resolution utility
 * Normalizes different user ID formats to a consistent string format
 * 
 * @returns User ID as string, or null if not available
 */
export function getUserId(): string | null {
  const user = cookieAuthUtils.getUser();
  if (!user) return null;
  
  // Try multiple possible ID fields
  const id = user?.id || user?._id || user?.userId;
  if (!id) {
    // Fallback to getUserId method if available
    const getUserIdMethod = (cookieAuthUtils as unknown as { getUserId?: () => string }).getUserId;
    if (getUserIdMethod) {
      const methodId = getUserIdMethod();
      if (methodId) return String(methodId);
    }
    return null;
  }
  
  // Normalize to string (handles ObjectId, number, etc.)
  return String(id);
}

/**
 * Get user object with type safety
 */
export function getUser() {
  return cookieAuthUtils.getUser() as {
    id?: string;
    _id?: string;
    userId?: string;
  } | null;
}

