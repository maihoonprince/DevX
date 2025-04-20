
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CommentSection } from "./CommentSection";

export interface ProfileData {
  full_name: string;
  username: string;
  profile_image: string | null;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  has_image: boolean;
  image_url: string | null;
  user_id: string;
  profiles?: ProfileData;
  liked_by_user?: boolean;
}

interface PostCardProps {
  post: Post;
  onLikeToggle: (postId: string, isLiked: boolean) => Promise<void>;
}

export function PostCard({ post, onLikeToggle }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiking, setIsLiking] = useState(false);
  const [localPost, setLocalPost] = useState<Post>(post);

  // Update local post when the parent post changes
  if (post.id === localPost.id && 
      (post.likes_count !== localPost.likes_count || 
       post.comments_count !== localPost.comments_count || 
       post.liked_by_user !== localPost.liked_by_user)) {
    setLocalPost(post);
  }

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    if (isLiking) return;
    
    const prevLikedStatus = localPost.liked_by_user;
    const prevLikesCount = localPost.likes_count;
    
    // Optimistic update
    setLocalPost(prev => ({
      ...prev,
      likes_count: prevLikedStatus ? prev.likes_count - 1 : prev.likes_count + 1,
      liked_by_user: !prevLikedStatus
    }));
    
    setIsLiking(true);
    try {
      await onLikeToggle(localPost.id, !!prevLikedStatus);
      console.log("Like toggle successful");
    } catch (error) {
      console.error("Error toggling like:", error);
      
      // Revert optimistic update on error
      setLocalPost(prev => ({
        ...prev,
        likes_count: prevLikesCount,
        liked_by_user: prevLikedStatus
      }));
      
      toast({
        title: "Failed to update like status",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={localPost.profiles?.profile_image || ""} />
            <AvatarFallback>
              {localPost.profiles?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{localPost.profiles?.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(localPost.created_at)}
            </p>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{localPost.title}</h3>
        <p className="text-gray-600 mb-4 whitespace-pre-line">{localPost.content}</p>
        
        {localPost.has_image && localPost.image_url && (
          <div className="mb-4">
            <img 
              src={localPost.image_url} 
              alt="Post image" 
              className="rounded-md max-h-96 object-contain" 
            />
          </div>
        )}
        
        <div className="flex items-center gap-4 mt-4">
          <Button
            variant={localPost.liked_by_user ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            className="gap-2"
            disabled={isLiking}
          >
            <Heart className="h-4 w-4" fill={localPost.liked_by_user ? "currentColor" : "none"} />
            {localPost.likes_count}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
