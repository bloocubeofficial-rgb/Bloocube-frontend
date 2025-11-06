"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchPublishedPosts, type PublishedPost } from "@/lib/engagementApi";

type Platform = "instagram" | "youtube" | "linkedin" | "twitter" | "facebook";

interface Props {
  platform: Platform;
}

const PostTypePerformanceChart: React.FC<Props> = ({ platform }) => {
  const [chartData, setChartData] = useState<{ type: string; engagement: number }[]>([]);

  useEffect(() => {
    // Fetch published posts for the platform
    fetchPublishedPosts({
      platform,
      limit: 100,
      includeMetrics: true,
    })
      .then(response => {
        if (response.success && response.data?.posts) {
          // Group posts by post_type and calculate total engagement
          const typeMap: Record<string, number> = {};
          
          response.data.posts.forEach((post: PublishedPost) => {
            const postType = post.post_type || 'Unknown';
            const engagement = (post.metrics?.likes || 0) + 
                             (post.metrics?.comments || 0) + 
                             (post.metrics?.shares || 0);
            
            if (!typeMap[postType]) {
              typeMap[postType] = 0;
            }
            typeMap[postType] += engagement;
          });
          
          // Convert to array format
          const data = Object.entries(typeMap)
            .map(([type, engagement]) => ({
              type: type.charAt(0).toUpperCase() + type.slice(1),
              engagement,
            }))
            .sort((a, b) => b.engagement - a.engagement);
          
          setChartData(data.length > 0 ? data : []);
        } else {
          setChartData([]);
        }
      })
      .catch(err => {
        console.warn(`Failed to fetch ${platform} post types:`, err);
        setChartData([]);
      });
  }, [platform]);

  return (
    <div className="bg-white p-5 ">
      <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">
        Post Type Performance
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Engagement by post content type
      </p>

      <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available for this platform
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
              top: 20,
              right: 20,
              left: 0,
              bottom: window.innerWidth < 640 ? 30 : 10, // ✅ extra space for small screens
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="type"
              tick={{
                fill: "#9ca3af",
                fontSize: window.innerWidth < 640 ? 10 : 12, // ✅ smaller text for mobile
              }}
              interval={0}
            />
            <YAxis
              tick={{
                fill: "#9ca3af",
                fontSize: window.innerWidth < 640 ? 10 : 12,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: window.innerWidth < 640 ? 10 : 12,
                bottom: 0,
              }}
            />
            <Bar
              dataKey="engagement"
              name="Engagement"
              fill="#6366F1"
              radius={[8, 8, 0, 0]}
              barSize={window.innerWidth < 640 ? 25 : 40} // ✅ thinner bars for mobile
            />
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PostTypePerformanceChart;
