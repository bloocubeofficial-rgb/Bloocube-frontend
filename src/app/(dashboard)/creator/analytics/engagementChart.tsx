"use client";
import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { fetchPlatformEngagement, type PlatformEngagement } from "@/lib/engagementApi";



const getChartOption = (platform: string, engagementData?: PlatformEngagement) => {
  // Use real data if available, otherwise show empty chart
  let title, legend, data;
  
  console.log(`getChartOption for ${platform}:`, engagementData);
  
  if (engagementData?.success && engagementData.posts && engagementData.posts.length > 0) {
    // Use real data from API
    const posts = engagementData.posts.slice(0, 30); // Last 7 posts
    console.log(`Using ${posts.length} posts for ${platform} chart:`, posts);
    title = `${platform.charAt(0).toUpperCase() + platform.slice(1)} Engagement`;
    
    if (platform === 'youtube') {
      legend = ["Views", "Likes", "Comments"];
      data = {
        Views: posts.map(p => p.views || 0),
        Likes: posts.map(p => p.likes || 0),
        Comments: posts.map(p => p.comments || 0),
        
      };
      console.log(`YouTube chart data:`, data);
    } else if (platform === 'linkedin') {
      legend = ["Impressions", "Reactions", "Comments"];
      data = {
        Impressions: posts.map(p => p.views || 0),
        Reactions: posts.map(p => p.likes || 0),
        Comments: posts.map(p => p.comments || 0),
      
      };
    } else if (platform === 'twitter') {
      legend = ["Likes", "Retweets", "Replies"];
      data = {
        Likes: posts.map(p => p.likes || 0),
        Retweets: posts.map(p => p.shares || 0),
        Replies: posts.map(p => p.comments || 0),
        
      };
    } else {
      // Instagram, Facebook, etc.
      legend = ["Likes", "Comments", "Shares","views"];
      data = {
        Likes: posts.map(p => p.likes || 0),
        Comments: posts.map(p => p.comments || 0),
        Shares: posts.map(p => p.shares || 0),
        Views: posts.map(p => p.views || 0),
      };
      console.log(`${platform} chart data:`, data);
    }
  } else {
    // No data available, show empty chart with default structure
    if (platform === 'youtube') {
      title = "YouTube Engagement";
      legend = ["Views", "Likes", "Comments", "Shares"];
      data = {
        Views: Array(7).fill(0),
        Likes: Array(7).fill(0),
        Comments: Array(7).fill(0),
        Shares: Array(7).fill(0),
      };
    } else if (platform === 'linkedin') {
      title = "LinkedIn Engagement";
      legend = ["Impressions", "Reactions", "Comments", "Shares"];
      data = {
        Impressions: Array(7).fill(0),
        Reactions: Array(7).fill(0),
        Comments: Array(7).fill(0),
        Shares: Array(7).fill(0),
      };
    } else if (platform === 'twitter') {
      title = "Twitter (X) Engagement";
      legend = ["Likes", "Retweets", "Replies"];
      data = {
        Likes: Array(7).fill(0),
        Retweets: Array(7).fill(0),
        Replies: Array(7).fill(0),
      };
    } else {
      // Instagram, Facebook, etc.
      title = `${platform.charAt(0).toUpperCase() + platform.slice(1)} Engagement`;
      legend = ["Likes", "Comments", "Shares"];
      data = {
        Likes: Array(7).fill(0),
        Comments: Array(7).fill(0),
        Shares: Array(7).fill(0),
      };
    }
  }

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
        data: engagementData?.posts && engagementData.posts.length > 0
          ? engagementData.posts.slice(0, 7).map((_, idx) => `Post ${idx + 1}`)
          : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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
      data: (data as Record<string, number[]>)[name] || [],
    })),
  };
};

export default function EngagementChart({ activePlatform }: any) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [engagementData, setEngagementData] = useState<PlatformEngagement | null>(null);

  useEffect(() => {
    // Reset engagement data when platform changes
    setEngagementData(null);
    
    // Fetch engagement data for the platform
    let isMounted = true;
    
    fetchPlatformEngagement(activePlatform)
      .then(data => {
        if (isMounted) {
          console.log(`Fetched ${activePlatform} engagement data:`, data);
          setEngagementData(data);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.warn(`Failed to fetch ${activePlatform} engagement:`, err);
          setEngagementData(null);
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, [activePlatform]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    const options = getChartOption(activePlatform, engagementData || undefined);
    console.log(`Setting chart options for ${activePlatform}:`, options);
    chart.setOption(options);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      chart.dispose();
      resizeObserver.disconnect();
    };
  }, [activePlatform, engagementData]);

  return (
    <div
      ref={chartRef}
      className="w-full h-[400px] md:h-[350px] sm:h-[300px] xs:h-[250px]"
    />
  );
}
