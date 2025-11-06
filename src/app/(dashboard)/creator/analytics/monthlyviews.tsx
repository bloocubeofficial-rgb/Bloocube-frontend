"use client";
import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { fetchPlatformEngagement, type PlatformEngagement } from "@/lib/engagementApi";

interface PlatformViewData {
  [key: string]: number[];
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MonthlyViewsGraph = ({ platform }: { platform: string }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [viewsData, setViewsData] = useState<number[]>([]);

  useEffect(() => {
    // Fetch engagement data and calculate monthly views
    fetchPlatformEngagement(platform)
      .then(data => {
        console.log(`Fetched ${platform} views data:`, data);
        if (data.success && data.posts && data.posts.length > 0) {
          // Group views by month (last 12 months)
          const now = new Date();
          const monthMap: Record<string, number> = {};
          
          // Initialize last 12 months with year-month key
          for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthMap[key] = 0;
          }
          
          // Aggregate views by month
          data.posts.forEach(post => {
            if (post.timestamp && post.views) {
              const postDate = new Date(post.timestamp);
              const key = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}`;
              if (monthMap[key] !== undefined) {
                monthMap[key] += post.views || 0;
              }
            }
          });
          
          // Convert to array (last 12 months) in chronological order
          const monthlyViews: number[] = [];
          for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyViews.push(monthMap[key] || 0);
          }
          
          setViewsData(monthlyViews);
        } else {
          // No data, show zeros
          setViewsData(Array(12).fill(0));
        }
      })
      .catch(err => {
        console.warn(`Failed to fetch ${platform} views:`, err);
        setViewsData(Array(12).fill(0));
      });
  }, [platform]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      title: {
        text: `${platform.toUpperCase()} Views by Month`,
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: 500,
        },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(0,0,0,0.75)",
        textStyle: { color: "#fff" },
        borderRadius: 6,
      },
      grid: {
        left: "6%",
        right: "5%",
        bottom: "10%",
        top: "18%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: months,
        boundaryGap: false,
        axisLabel: {
          fontSize: 11,
          rotate: 0,
        },
        axisLine: { lineStyle: { color: "#ccc" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { fontSize: 11 },
        splitLine: { lineStyle: { color: "#eee" } },
      },
      series: [
        {
          name: "Views",
          type: "line",
          data: viewsData.length > 0 ? viewsData : Array(12).fill(0),
          smooth: true,
          lineStyle: {
            width: 3,
            color: "#5470C6",
          },
          areaStyle: {
            opacity: 0.4,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#5470C6" },
              { offset: 1, color: "#91CC75" },
            ]),
          },
          symbol: "circle",
          symbolSize: 6,
          itemStyle: {
            color: "#5470C6",
          },
        },
      ],
    };

    chart.setOption(option);

    // Resize observer for responsive behavior
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      chart.dispose();
      resizeObserver.disconnect();
    };
  }, [platform, viewsData]);

  return (
    <div
      ref={chartRef}
      className="w-full h-[400px] md:h-[350px] sm:h-[300px] xs:h-[250px] "
    />
  );
};

export default MonthlyViewsGraph;
