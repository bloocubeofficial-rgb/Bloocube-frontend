import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '@/lib/apiClient';

export interface AIScoreResult {
  score: number;
  field: string;
  platform: string;
  metrics: {
    word_count?: number;
    char_count?: number;
    hashtag_count?: number;
    mention_count?: number;
    url_count?: number;
    readability_score?: number;
    sentiment?: string;
    sentiment_score?: number;
    keyword_count?: number;
    platform_score?: number;
  };
  strengths: string[];
  improvements: string[];
  processing_time_ms: number;
}

interface UseAIScoreOptions {
  content: string;
  field: string;
  platform: string;
  contentType?: string;
  enabled?: boolean;
  debounceMs?: number;
  minLength?: number;
}

export function useAIScore({
  content,
  field,
  platform,
  contentType = 'post',
  enabled = true,
  debounceMs = 800,
  minLength = 3
}: UseAIScoreOptions) {
  const [score, setScore] = useState<AIScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchScore = useCallback(async (text: string) => {
    // Don't score if content is too short or empty
    if (!text || text.trim().length < minLength) {
      setScore(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching AI score:', { field, platform, contentType, contentLength: text.length });
      
      const response = await apiRequest<{ success: boolean; data: AIScoreResult }>('/api/ai/score', {
        method: 'POST',
        body: JSON.stringify({
          content: text,
          field,
          platform,
          content_type: contentType
        }),
        signal: abortControllerRef.current.signal
      });

      console.log('✅ AI score response:', response);

      // Handle response structure
      if (response && typeof response === 'object') {
        // Check if response has success and data properties (backend wrapper)
        if ('success' in response && 'data' in response && response.success) {
          const data = (response as { success: boolean; data: unknown }).data;
          if (data && typeof data === 'object' && 'score' in data) {
            console.log('✅ Setting AI score:', data);
            setScore(data as AIScoreResult);
            return;
          } else {
            console.warn('⚠️ Data missing score field:', data);
          }
        }
        // Direct response from AI service (shouldn't happen but handle it)
        if ('score' in response && 'field' in response && 'platform' in response) {
          console.log('✅ Setting AI score (direct):', response);
          setScore(response as unknown as AIScoreResult);
          return;
        }
        // Unexpected structure
        console.warn('⚠️ Unexpected response structure:', response);
        setError('Invalid response format');
        setScore(null);
      } else {
        console.warn('⚠️ Invalid response type:', typeof response);
        setError('Failed to get AI score');
        setScore(null);
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('⏸️ Request aborted');
        return;
      }
      
      console.error('❌ AI scoring error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI score';
      setError(errorMessage);
      setScore(null);
    } finally {
      setLoading(false);
    }
  }, [field, platform, contentType, minLength]);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't score if disabled
    if (!enabled) {
      setScore(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Don't score if platform is not provided
    if (!platform) {
      setScore(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Don't score if content is too short
    if (!content || content.trim().length < minLength) {
      setScore(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Set loading state immediately for better UX
    setLoading(true);
    setError(null);

    // Debounce the API call
    debounceTimerRef.current = setTimeout(() => {
      fetchScore(content);
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [content, enabled, platform, debounceMs, minLength, fetchScore]);

  return {
    score,
    loading,
    error
  };
}

