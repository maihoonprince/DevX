
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PostCard, Post } from "./PostCard";

interface PostListProps {
  posts: Post[];
  isLoading: boolean;
  onLikeToggle: (postId: string, isLiked: boolean) => Promise<void>;
  onCreatePost?: () => void; // Make this prop optional
}

export function PostList({ posts, isLoading, onLikeToggle, onCreatePost }: PostListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse shadow-md rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-24 w-full mb-4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="overflow-hidden bg-gradient-to-b from-white to-purple-50 border-purple-100 shadow-md">
        <CardContent className="p-8 text-center">
          <div className="bg-purple-50/60 p-6 inline-flex rounded-full mb-4">
            <svg className="h-12 w-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
          <p className="text-gray-500 mb-6">Be the first to share something with the community!</p>
          {onCreatePost && (
            <Button 
              onClick={onCreatePost} 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Post
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${posts.indexOf(post) * 0.1}s` }}>
          <PostCard post={post} onLikeToggle={onLikeToggle} />
        </div>
      ))}
    </div>
  );
}
