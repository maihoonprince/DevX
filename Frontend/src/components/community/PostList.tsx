
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-48"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to share something with the community!</p>
          {onCreatePost && (
            <Button onClick={onCreatePost}>Create Post</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLikeToggle={onLikeToggle} />
      ))}
    </div>
  );
}
