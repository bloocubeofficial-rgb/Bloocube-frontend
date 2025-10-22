import React from 'react';
import { Modal } from '@/Components/ui/Modal';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface ContentTypes {
  [key: string]: number;
}

interface CompetitorData {
  platform: string;
  username: string;
  profile_metrics: {
    followers: number;
    engagement_rate: number;
    verified: boolean;
  };
  engagement_metrics: {
    average_likes: number;
    average_comments: number;
    average_shares: number;
    total_engagement: number;
    engagement_trend: string;
  };
  content_analysis: {
    total_posts: number;
    average_posts_per_week: number;
    content_types: ContentTypes;
    top_hashtags: Array<{ tag: string; count: number }>;
  };
}

interface AnalysisResult {
  analysis_id: string;
  competitors_analyzed: number;
  competitors_failed: number;
  analysis_type: string;
  results: {
    ai_insights: {
      market_insights?: {
        platforms?: string[];
        themes?: string[];
        risk?: string;
      };
      competitive_landscape?: {
        top_creators?: string[];
        avg_engagement_rate?: number;
      };
      strategic_recommendations?: string[];
    };
    competitive_landscape?: Record<string, unknown>;
    market_insights?: Record<string, unknown>;
    benchmark_metrics?: Record<string, unknown>;
    recommendations?: Array<{
      title?: string;
      description?: string;
    }>;
    competitors_data?: CompetitorData[];
    // Enhanced analysis results
    key_insights?: string[];
    trending_hashtags?: Array<{
      tag: string;
      usage_count: number;
    }>;
    content_strategies?: string[];
    growth_strategies?: string[];
    monetization_opportunities?: string[];
    caption_optimization?: string[];
    optimal_posting_times?: string[];
    competitive_benchmarks?: Record<string, string | number>;
    actionable_recommendations?: string[];
    platform_insights?: Record<string, string[]>;
    content_themes?: Array<{
      theme: string;
      count: number;
    }>;
    engagement_patterns?: Record<string, unknown>;
    audience_insights?: Record<string, unknown>;
    metadata: {
      platforms_analyzed: string[];
      total_posts_analyzed: number;
      data_collection_timestamp: string;
    };
  };
  warnings?: {
    failed_competitors: Array<{ url: string; error: string }>;
  };
  processing_time_ms?: number;
  confidence_score?: number;
}

interface AnalysisResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: AnalysisResult | null;
  loading?: boolean;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const getEngagementColor = (engagement: number) => {
  if (engagement >= 7) return 'text-green-600 bg-green-100';
  if (engagement >= 4) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

export const AnalysisResultModal: React.FC<AnalysisResultModalProps> = ({
  isOpen,
  onClose,
  results,
  loading = false
}) => {
  // Debug logging
  if (results?.results?.competitors_data) {
    console.log('Competitor data structure:', results.results.competitors_data);
  }

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="AI Analysis in Progress" size="lg">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Competitors</h3>
          <p className="text-gray-600 mb-4">Our AI is processing the data and generating insights...</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </Modal>
    );
  }

  if (!results) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Analysis Results" size="lg">
        <div className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Available</h3>
          <p className="text-gray-600">Unable to load analysis results. Please try again.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Analysis Results" size="xl">
      <div className="p-6 space-y-6">
        {/* Analysis Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
              Analysis Summary
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              {results.processing_time_ms ? `${results.processing_time_ms}ms` : 'Completed'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{results.competitors_analyzed}</div>
                  <div className="text-sm text-gray-600">Competitors Analyzed</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {results.results.metadata.platforms_analyzed.length}
                  </div>
                  <div className="text-sm text-gray-600">Platforms Covered</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {results.results.metadata.total_posts_analyzed || 0}
                  </div>
                  <div className="text-sm text-gray-600">Posts Analyzed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {results.warnings && results.warnings.failed_competitors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Analysis Warnings</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {results.warnings.failed_competitors.map((warning, index) => (
                    <li key={index}>
                      <strong>{warning.url}:</strong> {warning.error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {results.results.ai_insights && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
              AI Insights
            </h3>
            
            {/* Market Insights */}
            {results.results.ai_insights.market_insights && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Market Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.results.ai_insights.market_insights.platforms && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Platforms</div>
                      <div className="flex flex-wrap gap-2">
                        {results.results.ai_insights.market_insights.platforms.map((platform, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {results.results.ai_insights.market_insights.themes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Content Themes</div>
                      <div className="flex flex-wrap gap-2">
                        {results.results.ai_insights.market_insights.themes.map((theme, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Strategic Recommendations */}
            {results.results.ai_insights.strategic_recommendations && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Strategic Recommendations</h4>
                <div className="space-y-3">
                  {results.results.ai_insights.strategic_recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Competitor Data */}
        {results.results.competitors_data && results.results.competitors_data.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitor Analysis</h3>
            <div className="space-y-4">
              {results.results.competitors_data.map((competitor, index) => {
                // Add fallbacks for missing data
                const profileMetrics = competitor.profile_metrics || {};
                const engagementMetrics = competitor.engagement_metrics || {};
                const contentAnalysis = competitor.content_analysis || {};
                
                return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {competitor.platform?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">@{competitor.username || 'Unknown'}</h4>
                        <p className="text-sm text-gray-600 capitalize">{competitor.platform || 'Unknown'}</p>
                      </div>
                    </div>
                    {profileMetrics.verified && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(profileMetrics.followers || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold px-2 py-1 rounded-full text-sm ${getEngagementColor(profileMetrics.engagement_rate || 0)}`}>
                        {profileMetrics.engagement_rate || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(engagementMetrics.average_likes || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {contentAnalysis.total_posts || 0}
                      </div>
                      <div className="text-sm text-gray-600">Posts</div>
                    </div>
                  </div>
                  
                  {contentAnalysis.top_hashtags && contentAnalysis.top_hashtags.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Top Hashtags</div>
                      <div className="flex flex-wrap gap-1">
                        {contentAnalysis.top_hashtags.slice(0, 5).map((hashtag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            #{hashtag.tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Trending Hashtags */}
        {results.results.trending_hashtags && results.results.trending_hashtags.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Trending Hashtags</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {results.results.trending_hashtags.map((hashtag, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-700 font-medium">#{hashtag.tag}</span>
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      {hashtag.usage_count} uses
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Strategy Recommendations */}
        {results.results.content_strategies && results.results.content_strategies.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Strategy Recommendations</h3>
            <div className="space-y-3">
              {results.results.content_strategies.map((strategy, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-green-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{strategy}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Growth Strategies */}
        {results.results.growth_strategies && results.results.growth_strategies.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Strategies</h3>
            <div className="space-y-3">
              {results.results.growth_strategies.map((strategy, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-yellow-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{strategy}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monetization Opportunities */}
        {results.results.monetization_opportunities && results.results.monetization_opportunities.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monetization Opportunities</h3>
            <div className="space-y-3">
              {results.results.monetization_opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-emerald-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{opportunity}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Caption Optimization Tips */}
        {results.results.caption_optimization && results.results.caption_optimization.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Caption Optimization Tips</h3>
            <div className="space-y-3">
              {results.results.caption_optimization.map((tip, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-indigo-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimal Posting Times */}
        {results.results.optimal_posting_times && results.results.optimal_posting_times.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimal Posting Times</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.results.optimal_posting_times.map((time, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-blue-700 font-medium">{time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitive Benchmarking */}
        {results.results.competitive_benchmarks && Object.keys(results.results.competitive_benchmarks).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Benchmarking</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(results.results.competitive_benchmarks).map(([metric, value], index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                  <div className="text-sm text-gray-600 capitalize">{metric.replace(/_/g, ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Recommendations */}
        {results.results.actionable_recommendations && results.results.actionable_recommendations.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actionable Recommendations</h3>
            <div className="space-y-3">
              {results.results.actionable_recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-orange-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {results.results.recommendations && results.results.recommendations.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Recommendations</h3>
            <div className="space-y-3">
              {results.results.recommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-medium text-green-900 mb-1">
                    {rec.title || `Recommendation ${index + 1}`}
                  </div>
                  <div className="text-green-800 text-sm">
                    {rec.description || JSON.stringify(rec)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AnalysisResultModal;
