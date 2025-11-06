"use client";
import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { fetchPlatformEngagement, type PlatformEngagement } from "@/lib/engagementApi";

type Platform = "instagram" | "youtube" | "linkedin" | "twitter" | "facebook";

interface Props {
  platform: Platform;
}

const PlatformBreakdownChart: React.FC<Props> = ({ platform }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartData, setChartData] = useState<{ likes: number; shares: number; comments: number }>({
    likes: 0,
    shares: 0,
    comments: 0,
  });

  useEffect(() => {
    // Fetch engagement data for the platform
    fetchPlatformEngagement(platform)
      .then(data => {
        console.log(`Fetched ${platform} breakdown data:`, data);
        if (data.success && data.metrics) {
          setChartData({
            likes: data.metrics.likes || 0,
            shares: data.metrics.shares || 0,
            comments: data.metrics.comments || 0,
          });
        } else {
          setChartData({ likes: 0, shares: 0, comments: 0 });
        }
      })
      .catch(err => {
        console.warn(`Failed to fetch ${platform} engagement:`, err);
        setChartData({ likes: 0, shares: 0, comments: 0 });
      });
  }, [platform]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: window.innerWidth < 640 ? "vertical" : "horizontal", // 📱 mobile friendly
        bottom: window.innerWidth < 640 ? "center" : "0%",
        left: window.innerWidth < 640 ? "right" : "center",
        textStyle: { color: "#555", fontSize: 12 },
      },
      series: [
        {
          name: "Engagement",
          type: "pie",
          radius:
            window.innerWidth < 640 ? ["35%", "65%"] : ["40%", "70%"], // smaller radius on mobile
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: window.innerWidth > 640, // hide labels on very small screens
            formatter: "{b}: {d}%",
            fontSize: 12,
          },
          labelLine: {
            show: window.innerWidth > 640,
          },
          data: [
            { value: chartData.likes, name: "Likes" },
            { value: chartData.shares, name: "Shares" },
            { value: chartData.comments, name: "Comments" },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
      chart.setOption({
        legend: {
          orient: window.innerWidth < 640 ? "vertical" : "horizontal",
          bottom: window.innerWidth < 640 ? "center" : "0%",
          left: window.innerWidth < 640 ? "right" : "center",
        },
        series: [
          {
            radius:
              window.innerWidth < 640 ? ["35%", "65%"] : ["40%", "70%"],
            label: {
              show: window.innerWidth > 640,
            },
            labelLine: {
              show: window.innerWidth > 640,
            },
          },
        ],
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [platform, chartData]);

  return (
    <div className="bg-white p-5 ">
      <h2 className="text-lg font-semibold mb-1 text-gray-800">
        Platform Breakdown
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Engagement distribution across social media platforms
      </p>

      <div
        ref={chartRef}
        className="w-full h-[300px] sm:h-[350px] md:h-[400px]"
      />
    </div>
  );
};

export default PlatformBreakdownChart;
