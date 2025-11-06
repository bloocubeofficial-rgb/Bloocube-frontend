"use client";

import React from "react";
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

type Platform = "instagram" | "youtube" | "linkedin" | "twitter";

interface Props {
  platform: Platform;
}

const PostTypePerformanceChart: React.FC<Props> = ({ platform }) => {
  const data: Record<Platform, { type: string; engagement: number }[]> = {
    instagram: [
      { type: "Image", engagement: 3200 },
      { type: "Video", engagement: 5400 },
      { type: "Reel", engagement: 8700 },
      { type: "Carousel", engagement: 4600 },
    ],
    youtube: [
      { type: "Short", engagement: 10200 },
      { type: "Video", engagement: 7200 },
      { type: "Live", engagement: 5400 },
    ],
    linkedin: [
      { type: "Text", engagement: 1500 },
      { type: "Image", engagement: 2400 },
      { type: "Article", engagement: 1900 },
    ],
    twitter: [
      { type: "Text", engagement: 1200 },
      { type: "Image", engagement: 2100 },
      { type: "Video", engagement: 3200 },
    ],
  };

  return (
    <div className="bg-white p-5 ">
      <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">
        Post Type Performance
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Engagement by post content type
      </p>

      <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data[platform]}
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
      </div>
    </div>
  );
};

export default PostTypePerformanceChart;
