"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

type Platform = "instagram" | "youtube" | "linkedin" | "twitter";

interface Props {
  platform: Platform;
}

const platformData: Record<
  Platform,
  { likes: number; shares: number; comments: number }
> = {
  instagram: { likes: 2500, shares: 1200, comments: 900 },
  youtube: { likes: 4500, shares: 2300, comments: 1500 },
  linkedin: { likes: 1800, shares: 700, comments: 500 },
  twitter: { likes: 3200, shares: 1600, comments: 900 },
};

const PlatformBreakdownChart: React.FC<Props> = ({ platform }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const data = platformData[platform];

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
            { value: data.likes, name: "Likes" },
            { value: data.shares, name: "Shares" },
            { value: data.comments, name: "Comments" },
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
  }, [platform]);

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
