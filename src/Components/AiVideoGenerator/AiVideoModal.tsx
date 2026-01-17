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

  useEffect(() => {
    if (isOpen) {
      // Get the deployed AI Video Gen URL from config
      // Try multiple sources to ensure we get the value
      const url = config.aiVideoGenUrl || 
                  process.env.NEXT_PUBLIC_AI_VIDEO_GEN_URL || 
                  '';
      
      if (url && url.trim() !== '') {
        setIframeUrl(url.trim());
      } else {
        console.warn('⚠️ NEXT_PUBLIC_AI_VIDEO_GEN_URL is not configured', {
          configValue: config.aiVideoGenUrl,
          envValue: process.env.NEXT_PUBLIC_AI_VIDEO_GEN_URL,
          message: 'Please add NEXT_PUBLIC_AI_VIDEO_GEN_URL to your .env.local file and restart the dev server'
        });
      }
    }
  }, [isOpen]);

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
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0 rounded-b-xl"
            title="AI Video Generator"
            allow="camera; microphone; fullscreen; autoplay; encrypted-media; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-top-navigation"
          />
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

