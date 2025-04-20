import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MessageSquare, Star, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// These types would ideally come from your data models
type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  has_image?: boolean;
  image_url?: string | null;
};

type Job = {
  id: string;
  title: string;
  company: string;
  description: string;
  created_at: string;
  location: string;
  type?: string;
  job_type?: string;
  experience?: string;
};

interface UserActivityProps {
  userId: string;
}

export function UserActivity({ userId }: UserActivityProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserActivity();
  }, [userId]);

  const fetchUserActivity = async () => {
    setIsLoading(true);
    try {
      // Fetch user's posts
      const { data: userPosts, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error("Error fetching user posts:", postsError);
        throw postsError;
      }

      // Fetch user's jobs
      const { data: userJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error("Error fetching user jobs:", jobsError);
        throw jobsError;
      }

      setPosts(userPosts || []);
      
      // Transform the jobs data to include the 'type' property for backward compatibility
      const jobsWithType = (userJobs || []).map(job => ({
        ...job,
        type: job.job_type // Ensure 'type' is set to job_type for backward compatibility
      }));
      
      setJobs(jobsWithType);
    } catch (error: any) {
      toast({
        title: "Error fetching activity",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6 space-y-4">
        <div className="h-8 bg-gray-200 animate-pulse rounded-md w-1/3"></div>
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="mt-6">
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No posts yet</p>
          ) : (
            posts.map(post => (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-medium mb-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-3 line-clamp-2">{post.content}</p>
                  
                  {post.has_image && post.image_url && (
                    <div className="mb-3">
                      <img 
                        src={post.image_url} 
                        alt="Post image" 
                        className="rounded-md max-h-48 object-contain" 
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500" />
                        {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        {post.comments_count}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No jobs posted yet</p>
          ) : (
            jobs.map(job => (
              <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-medium">{job.title}</h3>
                    <Badge>{job.job_type || job.type}</Badge>
                  </div>
                  
                  <h4 className="text-primary font-medium mb-3">{job.company} • {job.location}</h4>
                  <p className="text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                  
                  <div className="flex justify-end mt-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      Posted on {formatDate(job.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
