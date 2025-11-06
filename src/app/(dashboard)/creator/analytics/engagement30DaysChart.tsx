"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

type Platform = "instagram" | "youtube" | "linkedin" | "twitter";

const platformData: Record<
  Platform,
  { date: string; likes: number; shares: number; comments: number }[]
> = {
  instagram: Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    likes: Math.floor(Math.random() * 90),
    shares: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 40),
  })),
  youtube: Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    likes: Math.floor(Math.random() * 200),
    shares: Math.floor(Math.random() * 80),
    comments: Math.floor(Math.random() * 70),
  })),
  linkedin: Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    likes: Math.floor(Math.random() * 60),
    shares: Math.floor(Math.random() * 30),
    comments: Math.floor(Math.random() * 25),
  })),
  twitter: Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    likes: Math.floor(Math.random() * 100),
    shares: Math.floor(Math.random() * 60),
    comments: Math.floor(Math.random() * 50),
  })),
};

interface Props {
  platform: Platform;
}

const Engagement30DaysChart = ({ platform }: Props) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const data = platformData[platform];

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    const chart = echarts.init(chartRef.current);

    const option = {
      dataset: {
        source: [
          ["score", "amount", "date"],
          ...data.map((d) => [
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
        max: Math.max(...data.map((d) => d.likes + d.shares + d.comments)),
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
  }, [platform, data]);

  return (
    <div
      ref={chartRef}
      className="w-full h-[400px] sm:h-[350px] xs:h-[300px] bg-white "
    />
  );
};

export default Engagement30DaysChart;
