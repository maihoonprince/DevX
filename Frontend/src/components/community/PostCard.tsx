
import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share, Clock } from "lucide-react";
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
  const [showComments, setShowComments] = useState(false);

  // Update local post when the parent post changes
  useEffect(() => {
    if (post.id === localPost.id && 
        (post.likes_count !== localPost.likes_count || 
         post.comments_count !== localPost.comments_count || 
         post.liked_by_user !== localPost.liked_by_user)) {
      setLocalPost(post);
    }
  }, [post, localPost.id, localPost.likes_count, localPost.comments_count, localPost.liked_by_user]);

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

  const handleCommentAdded = () => {
    setLocalPost(prev => ({
      ...prev,
      comments_count: prev.comments_count + 1
    }));
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      if (hours === 0) {
        const minutes = Math.floor(diffInMs / (1000 * 60));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    if (diffInHours < 48) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover-card-shine overflow-hidden shadow-md transition-all border-purple-100 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-5">
          <RouterLink to={`/user/${localPost.user_id}`} className="hover:opacity-80 transition-opacity">
            <Avatar className="h-12 w-12 ring-2 ring-purple-100">
              <AvatarImage src={localPost.profiles?.profile_image || ""} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                {localPost.profiles?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </RouterLink>
          <div className="flex-1">
            <RouterLink to={`/user/${localPost.user_id}`} className="hover:text-primary transition-colors">
              <p className="font-semibold text-gray-900">{localPost.profiles?.full_name}</p>
            </RouterLink>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-3.5 w-3.5 mr-1 inline" />
              {formatDate(localPost.created_at)}
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3 text-gray-800">{localPost.title}</h3>
        <p className="text-gray-700 mb-5 whitespace-pre-line">{localPost.content}</p>
        
        {localPost.has_image && localPost.image_url && (
          <div className="mb-5 bg-gray-50 rounded-lg overflow-hidden">
            <img 
              src={localPost.image_url} 
              alt="Post image" 
              className="w-full max-h-96 object-contain" 
            />
          </div>
        )}
        
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
          <Button
            variant={localPost.liked_by_user ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            className={`gap-2 ${localPost.liked_by_user ? 'bg-rose-100 hover:bg-rose-200 text-rose-600 border-rose-200' : 'hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'}`}
            disabled={isLiking}
          >
            <Heart 
              className={`h-4 w-4 ${localPost.liked_by_user ? 'fill-rose-500 text-rose-500' : ''}`}
            />
            {localPost.likes_count}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleComments}
            className={`gap-2 ${showComments ? 'bg-blue-100 hover:bg-blue-200 text-blue-600 border-blue-200' : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'}`}
          >
            <MessageSquare className="h-4 w-4" />
            {localPost.comments_count}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 ml-auto"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + `/post/${localPost.id}`);
              toast({
                title: "Link copied",
                description: "Post link copied to clipboard",
              });
            }}
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>
        
        {showComments && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <CommentSection 
              postId={localPost.id} 
              onCommentAdded={handleCommentAdded}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
