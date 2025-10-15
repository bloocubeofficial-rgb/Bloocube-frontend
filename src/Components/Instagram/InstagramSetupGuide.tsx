'use client';
import React from 'react';
import { Instagram, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

interface InstagramSetupGuideProps {
  className?: string;
}

export const InstagramSetupGuide: React.FC<InstagramSetupGuideProps> = ({ className = '' }) => {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-3">
        <Instagram className="w-6 h-6 text-blue-600 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Instagram Setup Required
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                Why do I need to set up Instagram?
              </h4>
              <p className="text-sm text-gray-600">
                Instagram requires a Business account connected to a Facebook Page to use advanced features like posting content and analytics.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Follow these steps:</h4>
              
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Create a Facebook Page</p>
                    <p className="text-xs text-gray-600">If you don't have one already</p>
                    <a 
                      href="https://www.facebook.com/pages/create" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                    >
                      Create Facebook Page <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Convert Instagram to Business Account</p>
                    <p className="text-xs text-gray-600">Switch from Personal to Business</p>
                    <a 
                      href="https://help.instagram.com/502981923235522" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                    >
                      Learn how to convert <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Connect Instagram to Facebook Page</p>
                    <p className="text-xs text-gray-600">Link your Instagram Business account to your Facebook Page</p>
                    <a 
                      href="https://help.instagram.com/898752960232396" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                    >
                      Connect Instagram to Page <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Try connecting again</p>
                    <p className="text-xs text-gray-600">Once setup is complete, try connecting Instagram again</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Note:</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    If you prefer to keep your Instagram as a personal account, you can still connect it, but you'll have limited functionality (view profile only, no posting).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramSetupGuide;
