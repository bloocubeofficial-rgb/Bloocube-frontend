export class ApiError extends Error {
  status?: number;
  code?: string | number;
  details?: unknown;
  retryAfter?: number;
  raw?: unknown;

  constructor(message: string, init?: Partial<ApiError>) {
    super(message);
    this.name = 'ApiError';
    Object.assign(this, init);
  }
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof Error) return new ApiError(err.message);
  const fallback = typeof err === 'string' ? err : 'Something went wrong';
  return new ApiError(fallback);
}

export function getFriendlyMessage(err: unknown, context: 'login' | 'signup' | 'default' = 'default'): string {
  const apiErr = toApiError(err);
  const status = apiErr.status;
  const retryAfter = apiErr.retryAfter;
  const message = (apiErr.message || '').toLowerCase();

  // Network issues
  if (!status && (message.includes('failed to fetch') || message.includes('network'))) {
    return 'Network issue. Check your connection and try again.';
  }

  // Rate limiting
  if (status === 429) {
    const when = retryAfter ? `${retryAfter}s` : 'a moment';
    return `Too many attempts. Please wait ${when} and try again.`;
  }

  // Unauthorized / expired
  if (status === 401) {
    return 'Your session expired. Please sign in again.';
  }

  // Forbidden
  if (status === 403) {
    return "You don't have permission to do that.";
  }

  // Not found
  if (status === 404) {
    return 'We could not find what you were looking for.';
  }

  // Conflict
  if (status === 409 && context === 'signup') {
    return 'That email is already registered. Try logging in instead.';
  }

  // Validation
  if (status === 400 || status === 422) {
    if (context === 'login') {
      return 'Incorrect email or password. Please try again or reset your password.';
    }
    return 'Please review your inputs and try again.';
  }

  // Server errors
  if (status && status >= 500) {
    return "We're having trouble right now. Please try again shortly.";
  }

  // Default fallback
  if (context === 'login') return 'Something went wrong signing you in. Please try again.';
  if (context === 'signup') return 'Something went wrong creating your account. Please try again.';
  return 'Something went wrong. Please try again.';
}


