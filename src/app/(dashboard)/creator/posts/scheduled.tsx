"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/Button";
import { Calendar, Clock, Loader2, Instagram, Facebook, Linkedin, Twitter, Youtube } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import Link from "next/link";

type StatusType = "published" | "scheduled" | "failed" | "draft";

interface ScheduledPost {
  _id: string;
  title?: string;
  content?: string | { text?: string; caption?: string };
  platform: string;
  status: StatusType;
  scheduling?: {
    scheduled_at?: string;
  };
  createdAt?: string;
}

const statusColors: Record<StatusType, string> = {
  published: "bg-green-100 text-green-700 border border-green-300",
  scheduled: "bg-blue-100 text-blue-700 border border-blue-300",
  failed: "bg-red-100 text-red-700 border border-red-300",
  draft: "bg-gray-100 text-gray-700 border border-gray-300",
};

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
};

const formatScheduledTime = (dateString?: string): string => {
  if (!dateString) return 'Not scheduled';
  
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const scheduledDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = scheduledDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Tomorrow, ${timeStr}`;
  if (diffDays === 2) return `Day after, ${timeStr}`;
  if (diffDays < 7) return `${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${timeStr}`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  });
};

const Scheduled = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ scheduled: ScheduledPost[]; pagination: any }>(
        "/api/posts/scheduled?limit=5"
      );
      // Filter to only show upcoming (future) scheduled posts
      const now = new Date();
      const upcoming = (res.scheduled || []).filter(post => {
        if (!post.scheduling?.scheduled_at) return false;
        const scheduledDate = new Date(post.scheduling.scheduled_at);
        return scheduledDate > now;
      });
      // Sort by scheduled time (earliest first)
      upcoming.sort((a, b) => {
        const dateA = new Date(a.scheduling?.scheduled_at || 0);
        const dateB = new Date(b.scheduling?.scheduled_at || 0);
        return dateA.getTime() - dateB.getTime();
      });
      setPosts(upcoming.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch scheduled posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledPosts();

    // Listen for post creation/update events to refresh
    const handlePostCreated = () => {
      fetchScheduledPosts();
    };
    const handlePostUpdated = () => {
      fetchScheduledPosts();
    };

    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('postUpdated', handlePostUpdated);
    window.addEventListener('postScheduled', handlePostCreated);

    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('postUpdated', handlePostUpdated);
      window.removeEventListener('postScheduled', handlePostCreated);
    };
  }, []);

  const getPostTitle = (post: ScheduledPost): string => {
    if (post.title) return post.title;
    if (typeof post.content === 'string') {
      return post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content;
    }
    if (post.content?.text) {
      return post.content.text.length > 50 ? post.content.text.substring(0, 50) + '...' : post.content.text;
    }
    if (post.content?.caption) {
      return post.content.caption.length > 50 ? post.content.caption.substring(0, 50) + '...' : post.content.caption;
    }
    return 'Untitled Post';
  };

  return (
    <Card className="rounded-sm border border-gray-200/04">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Upcoming Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No upcoming scheduled posts
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const PlatformIcon = platformIcons[post.platform?.toLowerCase()] || Calendar;
              
              return (
                <div key={post._id} className="border rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <PlatformIcon className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-foreground text-sm line-clamp-1">
                        {getPostTitle(post)}
                      </h4>
                    </div>
                    <div className={`px-2.5 py-1 text-xs rounded-full capitalize ${statusColors[post.status] || statusColors.scheduled}`}>
                      {post.status}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span className="capitalize">{post.platform}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatScheduledTime(post.scheduling?.scheduled_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <Link href="/creator/posts?status=scheduled">
              <Button variant="outline" size="sm" className="w-full">
                View All Scheduled
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Scheduled;
