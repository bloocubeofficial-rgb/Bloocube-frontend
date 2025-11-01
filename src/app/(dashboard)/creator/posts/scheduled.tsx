import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/Button";
import { Calendar, Clock } from "lucide-react";
;


type StatusType = "published" | "scheduled" | "failed";

const statusColors: Record<StatusType, string> = {
  published: "bg-green-100 text-green-700 border border-green-300",
  scheduled: "bg-blue-100 text-blue-700 border border-blue-300",
  failed: "bg-red-100 text-red-700 border border-red-300",
};

const scheduledPosts: { id: number; title: string; platform: string; scheduledFor: string; status: StatusType }[] = [
  {
    id: 1,
    title: "Product Launch Announcement",
    platform: "Instagram",
    scheduledFor: "Today, 3:00 PM",
    status: "scheduled",
  },
  {
    id: 2,
    title: "Weekly Team Update",
    platform: "LinkedIn",
    scheduledFor: "Tomorrow, 9:00 AM",
    status: "scheduled",
  },
  {
    id: 3,
    title: "Customer Success Story",
    platform: "Facebook",
    scheduledFor: "Friday, 2:00 PM",
    status: "scheduled",
  },
];





const Scheduled = () => {
  return (
    <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 hover:bg-surface/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">{post.title}</h4>
                          <div className={` flex items center justify-center px-2.5 py-1 text-xs rounded-full ${statusColors[post.status] ?? ""}`}>
                         {post.status}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{post.platform}</span>
                        <span>{post.scheduledFor}</span>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    View All Scheduled
                  </Button>
                </div>
              </CardContent>
            </Card>

  );
};

export default Scheduled;







