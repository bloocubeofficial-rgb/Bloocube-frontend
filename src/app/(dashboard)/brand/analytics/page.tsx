"use client";
import { useState } from 'react';
import { 
  ChartBarIcon, 
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { TrendingUp, Eye, Heart, CircleDollarSign as CurrencyDollarIcon, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function BrandAnalyticsPage() {
  const { user, isLoading } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'brand') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Brand access required</h1>
          <p className="text-sm text-gray-600 mb-4">Please sign in with a brand account to view analytics.</p>
        </div>
      </div>
    );
  }

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'campaigns', name: 'Campaigns' },
    { id: 'creators', name: 'Creators' },
    { id: 'revenue', name: 'Revenue' }
  ];

  // Mock data
  const overviewStats = [
    {
      title: 'Total Campaigns',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'blue'
    },
    {
      title: 'Active Campaigns',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Total Reach',
      value: '2.4M',
      change: '+18%',
      changeType: 'positive',
      icon: Eye,
      color: 'purple'
    },
    {
      title: 'Total Engagement',
      value: '156K',
      change: '+8%',
      changeType: 'positive',
      icon: Heart,
      color: 'pink'
    },
    {
      title: 'Total Spent',
      value: '₹2.4L',
      change: '+15%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'yellow'
    },
    {
      title: 'Active Creators',
      value: '45',
      change: '+5',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'indigo'
    }
  ];

  const topCampaigns = [
    {
      id: 1,
      title: 'Summer Fashion Collection',
      reach: '450K',
      engagement: '12.5K',
      spend: '₹45K',
      status: 'active',
      performance: '+25%'
    },
    {
      id: 2,
      title: 'Tech Product Launch',
      reach: '320K',
      engagement: '8.9K',
      spend: '₹38K',
      status: 'completed',
      performance: '+18%'
    },
    {
      id: 3,
      title: 'Fitness Brand Partnership',
      reach: '280K',
      engagement: '7.2K',
      spend: '₹32K',
      status: 'active',
      performance: '+12%'
    }
  ];

  const topCreators = [
    {
      id: 1,
      name: 'Sarah Johnson',
      platform: 'Instagram',
      followers: '125K',
      engagement: '4.2%',
      posts: 3,
      performance: '+22%'
    },
    {
      id: 2,
      name: 'Mike Chen',
      platform: 'YouTube',
      followers: '89K',
      engagement: '6.8%',
      posts: 2,
      performance: '+18%'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      platform: 'TikTok',
      followers: '156K',
      engagement: '5.1%',
      posts: 4,
      performance: '+15%'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      pink: 'bg-pink-100 text-pink-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewStats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-900">vs last period</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-gray-800 mx-auto mb-2" />
              <p className="text-sm text-gray-900">Chart coming soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-800 mx-auto mb-2" />
              <p className="text-sm text-gray-900">Chart coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCampaigns = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Campaigns</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-900">
                    <span>Reach: {campaign.reach}</span>
                    <span>Engagement: {campaign.engagement}</span>
                    <span>Spend: {campaign.spend}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status}
                  </span>
                  <span className="text-sm font-medium text-green-600">{campaign.performance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreators = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Creators</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topCreators.map((creator) => (
              <div key={creator.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {creator.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{creator.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-900">
                      <span>{creator.platform}</span>
                      <span>{creator.followers} followers</span>
                      <span>{creator.engagement} engagement</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-900">{creator.posts} posts</span>
                  <span className="text-sm font-medium text-green-600">{creator.performance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹2.4L</p>
              <p className="text-sm text-green-600 mt-1">+15% from last month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900">Average Campaign Value</p>
              <p className="text-2xl font-bold text-gray-900">₹10K</p>
              <p className="text-sm text-green-600 mt-1">+8% from last month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900">ROI</p>
              <p className="text-2xl font-bold text-gray-900">340%</p>
              <p className="text-sm text-green-600 mt-1">+12% from last month</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
              <CurrencyDollarIcon className="w-12 h-12 text-gray-800 mx-auto mb-2" />
            <p className="text-sm text-gray-900">Revenue chart coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'campaigns':
        return renderCampaigns();
      case 'creators':
        return renderCreators();
      case 'revenue':
        return renderRevenue();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your campaign performance and insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderTabContent()}
    </div>
  );
}


