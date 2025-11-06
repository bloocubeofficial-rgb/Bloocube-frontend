"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { TrendingUp } from "lucide-react";

// 🔹 Type for one platform data
type PlatformData = {
  name: string;
  engagementRate: number;
  change: number;
};

// 🔹 Array of platforms (typed)
const platformData: PlatformData[] = [
  { name: "Instagram", engagementRate: 5.4, change: 2.1 },
  { name: "YouTube", engagementRate: 4.1, change: 1.3 },
  { name: "LinkedIn", engagementRate: 3.7, change: -0.5 },
  { name: "Twitter", engagementRate: 2.9, change: 0.8 },
];

export default function EngagementCarousel() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % platformData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current: PlatformData = platformData[currentIndex];

  return (
    <Card className="rounded-sm hover:shadow-md  transition-all duration-300 border border-gray-200/04">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="text-xs text-gray-500 font-medium">
              {current.name} Engagement Rate
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {current.engagementRate}%
            </p>
          </div>

          <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div
          className={`flex items-center text-xs font-medium mt-1 ${
            current.change >= 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          {current.change >= 0 ? "+" : ""}
          {current.change}% from last month
        </div>
      </CardContent>
    </Card>
  );
}
