"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface PlatformViewData {
  [key: string]: number[];
}

// Dummy monthly data (12 months)
const platformViews: PlatformViewData = {
  instagram: [1200, 1800, 1500, 2000, 2500, 2700, 3000, 3500, 4000, 4200, 4500, 5000],
  youtube: [900, 1200, 1100, 1600, 2100, 2500, 2900, 3100, 3300, 3600, 4000, 4500],
  linkedin: [500, 800, 900, 1200, 1700, 2000, 2400, 2600, 3000, 3500, 3800, 4200],
  twitter: [300, 500, 600, 800, 1000, 1300, 1600, 1900, 2200, 2500, 2800, 3000],
};

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
          data: platformViews[platform],
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
  }, [platform]);

  return (
    <div
      ref={chartRef}
      className="w-full h-[400px] md:h-[350px] sm:h-[300px] xs:h-[250px] "
    />
  );
};

export default MonthlyViewsGraph;
