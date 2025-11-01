import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Badge } from "lucide-react";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/Button";
import { 
  Instagram, 
  Facebook, 
  Linkedin,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Clock,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  platform: 'instagram' | 'facebook' | 'linkedin';
  content: string;
  timestamp: string;
  status: 'published' | 'scheduled' | 'failed';
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
}

const mockPosts: Post[] = [
  {
    id: '1',
    platform: 'instagram',
    content: 'Just launched our new product! 🚀 Excited to share this journey with you all...',
    timestamp: '2 hours ago',
    status: 'published',
    metrics: { likes: 234, comments: 12, shares: 8, views: 1200 }
  },
  {
    id: '2', 
    platform: 'linkedin',
    content: 'Insights on social media management trends for 2024. Thread 🧵',
    timestamp: '5 hours ago',
    status: 'published',
    metrics: { likes: 89, comments: 23, shares: 15 }
  },
  {
    id: '3',
    platform: 'facebook',
    content: 'Behind the scenes at our office. Team collaboration at its finest! 💪',
    timestamp: 'Tomorrow 9:00 AM',
    status: 'scheduled',
    metrics: { likes: 0, comments: 0, shares: 0 }
  }
];

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin
};

const platformColors = {
  instagram: 'text-pink-600',
  facebook: 'text-blue-700',
  linkedin: 'text-blue-500'
};

const statusColors = {
  published: "bg-green-100 text-green-700 border border-green-300",
  scheduled: "bg-blue-100 text-blue-700 border border-blue-300",
  failed: "bg-red-100 text-red-700 border border-red-300",
};

const RecentPosts = () => {
  return (
    <Card className="border border-gray-200/04  ">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Posts
          <Button variant="ghost" size="sm">View All</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockPosts.map((post) => {
            const PlatformIcon = platformIcons[post.platform];
            return (
              <div key={post.id} className="border p-4 hover:bg-surface/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-muted">
                        <PlatformIcon className={cn("w-4 h-4", platformColors[post.platform])} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium capitalize text-foreground">{post.platform}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {post.timestamp}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ">
                    <div  className={`px-2.5 py-1 text-xs font-sm rounded-full capitalize ${statusColors[post.status]}`}>
                      {post.status}
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-foreground mb-3 line-clamp-2">{post.content}</p>
                
                {post.status === 'published' && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{post.metrics.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.metrics.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share className="w-3 h-3" />
                      <span>{post.metrics.shares}</span>
                    </div>
                    {post.metrics.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{post.metrics.views}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPosts;