import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_display_name: string;
  profiles?: {
    full_name: string;
    username: string;
    profile_image: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
  onCommentAdded?: () => void;
}

export function CommentSection({ postId, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles:user_id(full_name, username, profile_image)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;

      // Ensure we have a proper structure for the profiles data
      const formattedComments = data?.map(comment => {
        // If profiles exists and is not an error, use it
        // Otherwise, create a default profile using the user_display_name
        const profileData = comment.profiles && !('error' in comment.profiles)
          ? comment.profiles
          : {
              full_name: comment.user_display_name || 'Anonymous',
              username: '',
              profile_image: null
            };

        return {
          ...comment,
          profiles: profileData
        };
      }) || [];
      
      setComments(formattedComments);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError("Failed to load comments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment on posts",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
        
      const userDisplayName = profileData?.full_name || "Anonymous";
      
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment,
          user_display_name: userDisplayName
        });
        
      if (error) throw error;
      
      setNewComment("");
      fetchComments();
      
      if (onCommentAdded) {
        onCommentAdded();
      }
      
      toast({
        title: "Comment added",
        description: "Your comment was successfully added",
      });
    } catch (err: any) {
      console.error('Error adding comment:', err);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryFetchComments = () => {
    fetchComments();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      
      {error && (
        <Alert variant="destructive" className="my-2">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={retryFetchComments}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 border-b pb-4 last:border-0">
              <Link to={`/user/${comment.user_id}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.profiles?.profile_image || ""} />
                  <AvatarFallback>
                    {comment.profiles?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Link to={`/user/${comment.user_id}`} className="font-medium hover:text-primary transition-colors">
                    {comment.profiles?.full_name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-gray-700 whitespace-pre-line">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="pt-4">
        <Textarea
          placeholder={user ? "Write a comment..." : "Please log in to comment"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!user || isSubmitting}
          className="mb-2"
          resize={true}
        />
        <Button 
          onClick={handleSubmitComment}
          disabled={!user || !newComment.trim() || isSubmitting}
        >
          Post Comment
        </Button>
      </div>
    </div>
  );
}
