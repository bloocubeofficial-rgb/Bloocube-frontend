"use client";
import * as echarts from "echarts";
import { useEffect, useRef } from "react";

const platformData: any = {
  instagram: {
    title: "Instagram Engagement",
    legend: ["Likes", "Comments", "Shares", "Saves"],
    data: {
      Likes: [240, 380, 420, 500, 620, 700, 880],
      Comments: [60, 120, 200, 230, 260, 300, 360],
      Shares: [40, 90, 140, 160, 190, 250, 300],
      Saves: [120, 180, 250, 300, 350, 420, 500],
    },
  },
  youtube: {
    title: "YouTube Engagement",
    legend: ["Views", "Likes", "Comments", "Shares"],
    data: {
      Views: [2000, 3000, 3500, 4200, 5000, 6200, 8000],
      Likes: [200, 400, 500, 620, 720, 800, 900],
      Comments: [50, 90, 130, 160, 200, 240, 320],
      Shares: [20, 40, 70, 90, 120, 150, 200],
    },
  },
  linkedin: {
    title: "LinkedIn Engagement",
    legend: ["Impressions", "Reactions", "Comments", "Shares"],
    data: {
      Impressions: [900, 1200, 1500, 1900, 2300, 2800, 3500],
      Reactions: [80, 150, 220, 300, 400, 480, 550],
      Comments: [20, 40, 70, 90, 110, 150, 200],
      Shares: [5, 10, 20, 30, 45, 60, 85],
    },
  },
  twitter: {
    title: "Twitter (X) Engagement",
    legend: ["Likes", "Retweets", "Replies", "Bookmarks"],
    data: {
      Likes: [150, 250, 400, 520, 640, 700, 820],
      Retweets: [40, 80, 130, 160, 200, 260, 330],
      Replies: [25, 40, 60, 90, 120, 150, 200],
      Bookmarks: [30, 60, 80, 120, 150, 190, 250],
    },
  },
};

const getChartOption = (platform: string) => {
  const { title, legend, data } = platformData[platform];

  const gradientColors = [
    ["rgb(128,255,165)", "rgb(1,191,236)"],
    ["rgb(0,221,255)", "rgb(77,119,255)"],
    ["rgb(55,162,255)", "rgb(116,21,219)"],
    ["rgb(255,191,0)", "rgb(224,62,76)"],
  ];

  return {
    title: {
      text: title,
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: 500,
      },
      top: 5,
      bottom:10// 🟢 Title thoda upar
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0,0,0,0.7)",
      borderRadius: 6,
      textStyle: { color: "#fff" },
    },
    legend: {
      data: legend,
      top: 50, // 🟢 Title aur legend ke beech gap
      textStyle: { fontSize: 12 },
      itemGap: 15, // 🟢 Legend items ke beech gap
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "10%",
      top: "28%", // 🟢 Legend ke neeche extra gap
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisLabel: {
          fontSize: 10,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: { fontSize: 10 },
      },
    ],
    series: legend.map((name: string, idx: number) => ({
      name,
      type: "line",
      stack: "Total",
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 0 },
      areaStyle: {
        opacity: 0.8,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: gradientColors[idx][0] },
          { offset: 1, color: gradientColors[idx][1] },
        ]),
      },
      emphasis: { focus: "series" },
      data: data[name],
    })),
  };
};

export default function EngagementChart({ activePlatform }: any) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    chart.setOption(getChartOption(activePlatform));

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      chart.dispose();
      resizeObserver.disconnect();
    };
  }, [activePlatform]);

  return (
    <div
      ref={chartRef}
      className="w-full h-[400px] md:h-[350px] sm:h-[300px] xs:h-[250px]"
    />
  );
}
