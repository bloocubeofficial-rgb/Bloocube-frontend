"use client";
import React from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useAIScore } from '@/hooks/useAIScore';

interface AIScoreIndicatorProps {
  content: string;
  field: string;
  platform: string;
  contentType?: string;
  enabled?: boolean;
  showDetails?: boolean;
  className?: string;
  isFieldFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export function AIScoreIndicator({
  content,
  field,
  platform,
  contentType = 'post',
  enabled = true,
  showDetails = false,
  className = '',
  isFieldFocused = false,
  onFocusChange
}: AIScoreIndicatorProps) {
  const { score, loading, error } = useAIScore({
    content,
    field,
    platform,
    contentType,
    enabled,
    debounceMs: 800,
    minLength: 3
  });

  const [isHovered, setIsHovered] = React.useState(false);
  
  // Show popup when field is focused OR when hovering over the score badge
  const shouldShowPopup = showDetails && (isFieldFocused || isHovered);

  // Debug logging
  React.useEffect(() => {
    if (enabled) {
      console.log('📊 AIScoreIndicator state:', { 
        field, 
        platform, 
        contentType,
        contentLength: content?.length || 0, 
        contentPreview: content?.substring(0, 20),
        loading, 
        hasScore: !!score, 
        error,
        scoreValue: score?.score 
      });
    }
  }, [enabled, content, field, platform, contentType, loading, score, error]);

  // Don't show anything if disabled
  if (!enabled) {
    return null;
  }

  // Don't show anything if no platform selected
  if (!platform) {
    return null;
  }

  // Show loading state when fetching score
  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border border-gray-200 bg-gray-50 ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
        <span className="text-gray-500">Analyzing...</span>
      </div>
    );
  }

  // Don't show score if content is too short
  if (!content || content.trim().length < 3) {
    return null;
  }

  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (scoreValue >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (scoreValue >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (scoreValue: number) => {
    if (scoreValue >= 80) return 'Excellent';
    if (scoreValue >= 60) return 'Good';
    if (scoreValue >= 40) return 'Fair';
    return 'Needs Work';
  };

  if (error) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border border-gray-200 bg-gray-50 ${className}`}>
        <AlertCircle className="w-3 h-3 text-gray-400" />
        <span className="text-gray-500">Score unavailable</span>
      </div>
    );
  }

  if (!score) {
    return null;
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (onFocusChange) onFocusChange(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        // Only call onFocusChange if field is not actually focused
        if (onFocusChange && !isFieldFocused) onFocusChange(false);
      }}
    >
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${getScoreColor(score.score)}`}
        title={`AI Score: ${score.score}/100 - ${getScoreLabel(score.score)}`}
      >
        <Sparkles className="w-3 h-3" />
        <span className="font-semibold">{Math.round(score.score)}</span>
        <span className="text-[10px] opacity-75">/100</span>
      </div>

      {shouldShowPopup && score && (
        <div 
          className="absolute top-full right-0 mt-2 w-80 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-left"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            if (onFocusChange && !isFieldFocused) onFocusChange(false);
          }}
        >
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-900">AI Score</span>
              <span className={`text-sm font-bold ${getScoreColor(score.score).split(' ')[0]}`}>
                {Math.round(score.score)}/100
              </span>
            </div>
            <div className="text-xs text-gray-500">{getScoreLabel(score.score)}</div>
          </div>

          {score.strengths && score.strengths.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-green-700 mb-1">Strengths:</div>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {score.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.improvements && score.improvements.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-orange-700 mb-1">Suggestions:</div>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {score.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.metrics && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                {score.metrics.char_count && (
                  <span>{score.metrics.char_count} chars</span>
                )}
                {score.metrics.word_count && (
                  <span className="ml-2">{score.metrics.word_count} words</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

