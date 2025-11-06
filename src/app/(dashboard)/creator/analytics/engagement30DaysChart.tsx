"use client";
import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { fetchPlatformEngagement, type PlatformEngagement } from "@/lib/engagementApi";

type Platform = "instagram" | "youtube" | "linkedin" | "twitter" | "facebook";

interface Props {
  platform: Platform;
}

const Engagement30DaysChart = ({ platform }: Props) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [engagementData, setEngagementData] = useState<PlatformEngagement | null>(null);
  const [chartData, setChartData] = useState<{ date: string; likes: number; shares: number; comments: number }[]>([]);

  useEffect(() => {
    // Fetch engagement data for the platform
    fetchPlatformEngagement(platform)
      .then(data => {
        console.log(`Fetched ${platform} engagement for 30 days chart:`, data);
        setEngagementData(data);
        
        if (data.success && data.posts && data.posts.length > 0) {
          // Group posts by day (last 30 days)
          const now = new Date();
          const dayMap: Record<string, { likes: number; shares: number; comments: number }> = {};
          
          // Initialize last 30 days
          for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            dayMap[dateKey] = { likes: 0, shares: 0, comments: 0 };
          }
          
          // Aggregate metrics by day
          data.posts.forEach(post => {
            if (post.timestamp) {
              const postDate = new Date(post.timestamp);
              const dateKey = postDate.toISOString().split('T')[0];
              if (dayMap[dateKey]) {
                dayMap[dateKey].likes += post.likes || 0;
                dayMap[dateKey].shares += post.shares || 0;
                dayMap[dateKey].comments += post.comments || 0;
              }
            }
          });
          
          // Convert to array format
          const sortedData = Object.entries(dayMap)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([dateKey, metrics], index) => ({
              date: `Day ${index + 1}`,
              likes: metrics.likes,
              shares: metrics.shares,
              comments: metrics.comments,
            }));
          
          setChartData(sortedData);
        } else {
          // No data available, show empty chart
          setChartData(Array.from({ length: 30 }, (_, i) => ({
            date: `Day ${i + 1}`,
            likes: 0,
            shares: 0,
            comments: 0,
          })));
        }
      })
      .catch(err => {
        console.warn(`Failed to fetch ${platform} engagement:`, err);
        setChartData([]);
      });
  }, [platform]);

  useEffect(() => {
    if (!chartRef.current || !chartData.length) return;

    const chart = echarts.init(chartRef.current);

    const option = {
      dataset: {
        source: [
          ["score", "amount", "date"],
          ...chartData.map((d) => [
            d.likes + d.shares + d.comments,
            d.likes + d.shares + d.comments,
            d.date,
          ]),
        ],
      },
      grid: {
        containLabel: true,
        left: "5%",
        right: "5%",
        bottom: "28%",
        top: "10%",
      },
      xAxis: {
        name: "Total Engagement",
        nameLocation: "center",
        nameGap: 45,
        axisLabel: {
          fontSize: 10,
          interval: "auto",
        },
      },
      yAxis: {
        type: "category",
        name: "Days",
        axisLabel: {
          fontSize: 10,
        },
      },
      visualMap: {
        orient: "horizontal",
        left: "center",
        bottom: 8,
        min: 0,
        max: Math.max(...chartData.map((d) => d.likes + d.shares + d.comments), 1),
        text: ["High", "Low"],
        dimension: 0,
        inRange: {
          color: ["#65B581", "#FFCE34", "#FD665F"],
        },
      },
      series: [
        {
          type: "bar",
          encode: { x: "amount", y: "date" },
          barWidth: "60%",
        },
      ],
      tooltip: {
        trigger: "item",
        formatter: (params: any) =>
          `${params.value[2]}<br/>Total: ${params.value[1]}`,
      },
      responsive: true,
    };

    chart.setOption(option);

    // 🔹 Resize chart when window size changes
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [platform, chartData]);

  return (
    <div
      ref={chartRef}
      className="w-full h-[400px] sm:h-[350px] xs:h-[300px] bg-white "
    />
  );
};

export default Engagement30DaysChart;
