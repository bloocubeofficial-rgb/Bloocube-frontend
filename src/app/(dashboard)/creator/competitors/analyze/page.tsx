'use client';
import React, { Suspense, useCallback, useState } from 'react';
import { Plus, X, Search, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Sidebar from '@/Components/Creater/Sidebar';
import { apiRequest } from '@/lib/apiClient';
import { useSearchParams } from 'next/navigation';

interface CompetitorUrl {
  id: string;
  url: string;
  platform?: string;
  username?: string;
  isValid?: boolean;
  error?: string;
}

interface AnalysisResult {
  analysis_id: string;
  competitors_analyzed: number;
  competitors_failed: number;
  analysis_type: string;
  results: {
    ai_insights: any;
    competitive_landscape: any;
    market_insights: any;
    benchmark_metrics: any;
    recommendations: any[];
    competitors_data: any[];
    metadata: any;
  };
  warnings?: {
    failed_competitors: Array<{ url: string; error: string }>;
  };
}

// Suspense-wrapped reader of search params
const PrefillFromQuery = ({ onPrefill }: { onPrefill: (url: string) => void }) => {
  const searchParams = useSearchParams();
  React.useEffect(() => {
    const url = searchParams?.get('url');
    if (url) onPrefill(url);
  }, [searchParams, onPrefill]);
  return null;
};

const CompetitorAnalysisPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [competitorUrls, setCompetitorUrls] = useState<CompetitorUrl[]>([
    { id: '1', url: '' }
  ]);
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  // Avoid calling useSearchParams in this component; use child wrapped in Suspense instead

  // Add new competitor URL input
  const addCompetitorUrl = () => {
    if (competitorUrls.length < 10) {
      setCompetitorUrls([
        ...competitorUrls,
        { id: Date.now().toString(), url: '' }
      ]);
    }
  };

  // Remove competitor URL input
  const removeCompetitorUrl = (id: string) => {
    if (competitorUrls.length > 1) {
      setCompetitorUrls(competitorUrls.filter(comp => comp.id !== id));
    }
  };

  // Update competitor URL
  const updateCompetitorUrl = (id: string, url: string) => {
    setCompetitorUrls(competitorUrls.map(comp => 
      comp.id === id 
        ? { ...comp, url, ...validateUrl(url) }
        : comp
    ));
  };

  // Validate social media URL
  const validateUrl = (url: string) => {
    if (!url.trim()) return { isValid: false };

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname;

      if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        const username = pathname.split('/')[1];
        return {
          isValid: !!username,
          platform: 'Twitter',
          username: username?.replace('@', ''),
          error: !username ? 'Invalid Twitter URL format' : undefined
        };
      }

      if (hostname.includes('instagram.com')) {
        const username = pathname.split('/')[1];
        return {
          isValid: !!username,
          platform: 'Instagram',
          username: username?.replace('@', ''),
          error: !username ? 'Invalid Instagram URL format' : undefined
        };
      }

      if (hostname.includes('youtube.com')) {
        if (
          pathname.includes('/channel/') ||
          pathname.includes('/c/') ||
          pathname.includes('/user/') ||
          pathname.includes('/@')
        ) {
          return {
            isValid: true,
            platform: 'YouTube',
            username: pathname.split('/').pop()?.replace('@', ''),
          };
        }
        return { isValid: false, error: 'Invalid YouTube URL format' };
      }

      if (hostname.includes('linkedin.com')) {
        if (pathname.includes('/in/') || pathname.includes('/company/')) {
          return {
            isValid: true,
            platform: 'LinkedIn',
            username: pathname.split('/')[2],
          };
        }
        return { isValid: false, error: 'Invalid LinkedIn URL format' };
      }

      if (hostname.includes('facebook.com')) {
        const username = pathname.split('/')[1];
        return {
          isValid: !!username,
          platform: 'Facebook',
          username: username?.replace('@', ''),
          error: !username ? 'Invalid Facebook URL format' : undefined
        };
      }

      return { isValid: false, error: 'Unsupported platform' };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  };

  const onPrefill = useCallback((url: string) => {
    setCompetitorUrls([{ id: '1', url, ...validateUrl(url) }]);
  }, []);

  // Fetch competitor data for preview
  const fetchCompetitorData = async () => {
    const validUrls = competitorUrls.filter(comp => comp.isValid && comp.url.trim());
    
    if (validUrls.length === 0) {
      setError('Please add at least one valid competitor profile URL');
      return;
    }

    setFetchingData(true);
    setError(null);
    setFetchedData([]);

    try {
      const blocked = new Set(['instagram', 'facebook', 'linkedin']);
      // Pre-parse platforms and filter out blocked ones
      const parsed = validUrls.map(comp => {
        try {
          const url = new URL(comp.url);
          const hostname = url.hostname.toLowerCase();
          let platform = 'unknown';
          if (hostname.includes('instagram.com')) platform = 'instagram';
          else if (hostname.includes('twitter.com') || hostname.includes('x.com')) platform = 'twitter';
          else if (hostname.includes('youtube.com')) platform = 'youtube';
          else if (hostname.includes('linkedin.com')) platform = 'linkedin';
          else if (hostname.includes('facebook.com')) platform = 'facebook';
          return { url: comp.url, platform };
        } catch {
          return { url: comp.url, platform: 'unknown' };
        }
      });

      const blockedList = parsed.filter(p => blocked.has(p.platform));
      const allowed = parsed.filter(p => !blocked.has(p.platform));

      if (blockedList.length > 0) {
        const names = Array.from(new Set(blockedList.map(b => b.platform))).join(', ');
        setError(`Fetching for ${names} is currently unavailable. Those entries were skipped.`);
      }

      if (allowed.length === 0) {
        setShowPreview(false);
        setFetchedData([]);
        return;
      }

      const fetchPromises = allowed.map(async (item) => {
        const response = await apiRequest<{ success: boolean; data: any }>('/api/competitor/fetch', {
          method: 'POST',
          body: JSON.stringify({
            competitorUrl: item.url,
            platform: item.platform
          })
        });
        return response.success ? response.data : null;
      });

      const results = await Promise.all(fetchPromises);
      const validResults = results.filter(result => result !== null);
      
      if (validResults.length > 0) {
        setFetchedData(validResults);
        setShowPreview(true);
      } else {
        setError('Failed to fetch data for any of the competitors');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch competitor data');
    } finally {
      setFetchingData(false);
    }
  };

  // Start competitor analysis
  const startAnalysis = async () => {
    if (fetchedData.length === 0) {
      setError('Please fetch competitor data first');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Extract platforms from fetched data
      const platforms = [...new Set(fetchedData.map(data => data.profile.platform))];

      const response = await apiRequest<{ success: boolean; data: AnalysisResult }>('/api/competitor/analyze', {
        method: 'POST',
        body: JSON.stringify({
          competitorUrls: fetchedData.map(data => data.profile.profileUrl),
          analysisType,
          platforms: platforms,
          options: {
            maxPosts: 50,
            timePeriodDays: 30,
            includeContentAnalysis: true,
            includeEngagementAnalysis: true,
            includeAudienceAnalysis: true,
            includeCompetitiveInsights: true,
            includeRecommendations: true,
            fetchRealTimeData: true,
            platformSpecific: true,
            useEnvironmentCredentials: true
          }
        })
      });

      if (response.success) {
        setResults(response.data);
        setShowPreview(false);
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative z-50">
            <Sidebar sidebarOpen={sidebarOpen} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar sidebarOpen={true} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitors</h1>
              <p className="text-gray-600">
                Analyze your competitors' social media strategies and get AI-powered insights
              </p>
            </div>

            {/* Suspense search params prefill */}
            <Suspense fallback={null}>
              <PrefillFromQuery onPrefill={onPrefill} />
            </Suspense>

            {!results ? (
              /* Analysis Setup Form */
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6">Setup Analysis</h2>

                {/* Competitor URLs */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Competitor Profile URLs
                  </label>
                  <div className="space-y-3">
                    {competitorUrls.map((competitor, index) => (
                      <div key={competitor.id} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="relative">
                            <input
                              type="url"
                              value={competitor.url}
                              onChange={(e) => updateCompetitorUrl(competitor.id, e.target.value)}
                              placeholder={`https://instagram.com/competitor${index + 1}`}
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                competitor.url && !competitor.isValid 
                                  ? 'border-red-300 bg-red-50' 
                                  : competitor.isValid 
                                    ? 'border-green-300 border bg-green-50' 
                                    : 'border-gray-800 border'
                              }`}
                            />
                            {competitor.isValid && (
                              <div className="absolute right-3 top-2.5">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              </div>
                            )}
                          </div>
                          {competitor.platform && (
                            <div className="mt-1 text-sm text-gray-600">
                              {competitor.platform} • @{competitor.username}
                            </div>
                          )}
                          {competitor.error && (
                            <div className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {competitor.error}
                            </div>
                          )}
                        </div>
                        {competitorUrls.length > 1 && (
                          <button
                            onClick={() => removeCompetitorUrl(competitor.id)}
                            className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {competitorUrls.length < 10 && (
                    <button
                      onClick={addCompetitorUrl}
                      className="mt-3 flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add another competitor
                    </button>
                  )}
                </div>

                {/* Analysis Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Analysis Type
                  </label>
                  <select
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="comprehensive">Comprehensive Analysis</option>
                    <option value="content_focused">Content-Focused Analysis</option>
                    <option value="engagement_focused">Engagement-Focused Analysis</option>
                    <option value="quick">Quick Overview</option>
                  </select>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-700">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      {error}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!showPreview ? (
                    <button
                      onClick={fetchCompetitorData}
                      disabled={fetchingData || competitorUrls.filter(c => c.isValid).length === 0}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {fetchingData ? (
                        <>
                          <Clock className="h-5 w-5 mr-2 animate-spin" />
                          Fetching Competitor Data...
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Fetch Competitor Data
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={startAnalysis}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Clock className="h-5 w-5 mr-2 animate-spin" />
                          Running AI Analysis...
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Start AI Analysis
                        </>
                      )}
                    </button>
                  )}
                </div>

                {loading && (
                  <div className="mt-4 text-center text-gray-600">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <div>
                        <p className="font-medium">Analyzing competitors...</p>
                        <p className="text-sm mt-1">Fetching real-time data from social media platforms</p>
                        <p className="text-xs mt-1 text-gray-500">This may take a few minutes as we collect fresh data</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : showPreview && fetchedData.length > 0 ? (
              /* Competitor Data Preview */
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Competitor Data Preview</h2>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setFetchedData([]);
                    }}
                    className="text-gray-700 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {fetchedData.map((data, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">@{data.profile.username}</h3>
                          <p className="text-sm text-gray-600 capitalize">{data.profile.platform}</p>
                        </div>
                        <div className="text-right">
                          {data.profile.followers && (
                            <div className="text-lg font-bold">{data.profile.followers.toLocaleString()}</div>
                          )}
                          <div className="text-sm text-gray-600">followers</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-700">Engagement Rate</div>
                          <div className="text-lg font-semibold">{data.engagement.engagementRate}%</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Recent Posts</div>
                          <div className="text-lg font-semibold">{data.content.totalPosts}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Data Quality</div>
                          <div className={`text-lg font-semibold capitalize ${
                            data.dataQuality.level === 'high' ? 'text-green-600' :
                            data.dataQuality.level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {data.dataQuality.level}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Ready for AI Analysis</p>
                      <p className="text-xs text-blue-700">Click "Start AI Analysis" to proceed with comprehensive analysis</p>
                    </div>
                    <button
                      onClick={startAnalysis}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-800 transition-colors"
                    >
                      {loading ? 'Analyzing...' : 'Start AI Analysis'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Analysis Results */
              <div className="space-y-6">
                {/* Results Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                    <button
                      onClick={() => setResults(null)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      New Analysis
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {results.competitors_analyzed}
                      </div>
                      <div className="text-sm text-green-700">Competitors Analyzed</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.results.metadata.platforms_analyzed.length}
                      </div>
                      <div className="text-sm text-blue-700">Platforms Covered</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {results.results.metadata.total_posts_analyzed}
                      </div>
                      <div className="text-sm text-purple-700">Posts Analyzed</div>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {results.warnings && results.warnings.failed_competitors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center text-yellow-700 mb-2">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Some competitors couldn't be analyzed
                    </div>
                    <div className="space-y-1">
                      {results.warnings.failed_competitors.map((failed, index) => (
                        <div key={index} className="text-sm text-yellow-600">
                          • {failed.url}: {failed.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                {results.results.ai_insights && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      AI-Powered Insights
                    </h3>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                        {JSON.stringify(results.results.ai_insights, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Competitors Data */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-xl font-semibold mb-4">Competitor Profiles</h3>
                  <div className="space-y-4">
                    {results.results.competitors_data.map((competitor, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">@{competitor.username}</h4>
                            <div className="text-sm text-gray-600">{competitor.platform}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{competitor.key_metrics.followers.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">followers</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Engagement Rate</div>
                            <div>{competitor.key_metrics.engagement_rate}%</div>
                          </div>
                          <div>
                            <div className="font-medium">Posts Analyzed</div>
                            <div>{competitor.key_metrics.posts_analyzed}</div>
                          </div>
                          <div>
                            <div className="font-medium">Data Quality</div>
                            <div className="capitalize">{competitor.key_metrics.data_quality}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {results.results.recommendations && results.results.recommendations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {results.results.recommendations.map((rec, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg">
                          <div className="font-medium text-blue-900">{rec.title || `Recommendation ${index + 1}`}</div>
                          <div className="text-blue-700 mt-1">{rec.description || JSON.stringify(rec)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return <Suspense fallback={<div className="p-6">Loading…</div>}>{content}</Suspense>;
};

export default CompetitorAnalysisPage;
