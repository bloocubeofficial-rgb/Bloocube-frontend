"use client";

import React, { useEffect, useState } from 'react';
import { Modal } from '@/Components/ui/Modal';
import { config } from '@/lib/config';

interface AiVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiVideoModal({ isOpen, onClose }: AiVideoModalProps) {
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Get the deployed AI Video Gen URL from config
      // Try multiple sources to ensure we get the value
      const url = config.aiVideoGenUrl || 
                  process.env.NEXT_PUBLIC_AI_VIDEO_GEN_URL || 
                  '';
      
      if (url && url.trim() !== '') {
        setIframeUrl(url.trim());
        setIframeError(null);
        setIsLoading(true);
      } else {
        console.warn('⚠️ NEXT_PUBLIC_AI_VIDEO_GEN_URL is not configured', {
          configValue: config.aiVideoGenUrl,
          envValue: process.env.NEXT_PUBLIC_AI_VIDEO_GEN_URL,
          message: 'Please add NEXT_PUBLIC_AI_VIDEO_GEN_URL to your .env.local file and restart the dev server'
        });
      }
    } else {
      // Reset state when modal closes
      setIframeError(null);
      setIsLoading(true);
    }
  }, [isOpen]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    const parentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown';
    setIframeError(`Failed to load AI Video Generator. This usually means the site (${iframeUrl}) is blocking iframe embedding from ${parentOrigin}. Please check X-Frame-Options or Content-Security-Policy headers.`);
    console.error('Iframe load error:', {
      iframeUrl,
      parentOrigin,
      message: 'The AI Video Generator site may be blocking iframe embedding. Check X-Frame-Options or CSP frame-ancestors headers.'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title="AI Video Generator"
      showCloseButton={true}
      closeOnOverlayClick={false}
      className="h-[95vh] flex flex-col"
    >
      <div className="flex-1 w-full h-full min-h-0" style={{ height: 'calc(95vh - 80px)' }}>
        {iframeUrl ? (
          <>
            {isLoading && !iframeError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading AI Video Generator...</p>
                </div>
              </div>
            )}
            {iframeError ? (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center max-w-2xl px-6 py-8 bg-white rounded-lg border border-red-200 shadow-sm">
                  <div className="text-red-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load AI Video Generator</h3>
                  <p className="text-sm text-gray-600 mb-4">{iframeError}</p>
                  
                  <button
                    onClick={() => {
                      setIframeError(null);
                      setIsLoading(true);
                      // Force reload iframe
                      const iframe = document.querySelector('iframe[title="AI Video Generator"]') as HTMLIFrameElement;
                      if (iframe) {
                        iframe.src = iframeUrl;
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <iframe
                src={iframeUrl}
                className="w-full h-full border-0 rounded-b-xl"
                title="AI Video Generator"
                allow="camera; microphone; fullscreen; autoplay; encrypted-media; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-top-navigation"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-semibold mb-2">AI Video Generator Not Configured</p>
              
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

