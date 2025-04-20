
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Post, ProfileData } from "@/components/community/PostCard";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      console.log("Fetching posts from Supabase...");
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error("Error fetching posts:", postsError);
        throw postsError;
      }

      console.log("Posts fetched successfully:", postsData);

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setIsLoading(false);
        return;
      }

      // Fetch all user profiles in one query
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, profile_image')
        .in('id', userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue with posts but without profiles
      }

      // Create a map of user IDs to profiles
      const profilesMap = new Map<string, ProfileData>();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, {
          full_name: profile.full_name,
          username: profile.username,
          profile_image: profile.profile_image
        });
      });

      // Fetch user's liked posts if logged in
      let likedPostIds = new Set<string>();
      if (user) {
        const { data: likedPosts, error: likesError } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);
          
        if (likesError) {
          console.error("Error fetching likes:", likesError);
          // Don't throw, continue with posts
        } else {
          likedPostIds = new Set(likedPosts?.map(like => like.post_id) || []);
        }
      }
      
      // Combine posts with profiles and liked status
      const postsWithProfiles = postsData.map(post => {
        const profile = profilesMap.get(post.user_id);
        return {
          ...post,
          profiles: profile || { 
            full_name: "Unknown User", 
            username: "unknown", 
            profile_image: null 
          },
          liked_by_user: likedPostIds.has(post.id)
        };
      });
      
      setPosts(postsWithProfiles);
    } catch (error: any) {
      console.error("Error in fetchPosts:", error);
      toast({
        title: "Error fetching posts",
        description: error.message || "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Toggling like for post:", postId, "Current liked status:", isLiked);
      
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: user.id });
          
        if (error) {
          console.error("Error unliking post:", error);
          throw error;
        }
        
        console.log("Post unliked successfully");
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert([
            { post_id: postId, user_id: user.id }
          ]);
          
        if (error) {
          console.error("Error liking post:", error);
          throw error;
        }
        
        console.log("Post liked successfully");
      }
      
      // Update local state to reflect the change
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: isLiked ? Math.max(0, post.likes_count - 1) : post.likes_count + 1,
              liked_by_user: !isLiked
            };
          }
          return post;
        })
      );

      // Immediately fetch posts to ensure we have the latest data
      // This is important to ensure other users see the updated like count
      fetchPosts();
    } catch (error: any) {
      console.error("Error toggling like:", error);
      
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
      
      throw error; // Rethrow so the PostCard component can handle reverting UI
    }
  };

  // Set up real-time listeners for updates to posts and post likes
  useEffect(() => {
    console.log("Setting up real-time listeners for posts and likes...");
    
    const postsChannel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'community_posts' 
        },
        (payload) => {
          console.log('Post change received:', payload);
          fetchPosts(); // Refetch all posts when any post changes
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        },
        (payload) => {
          console.log('Like change received:', payload);
          fetchPosts(); // Refetch when likes change
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to realtime changes:', status);
        }
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(postsChannel);
    };
  }, [user?.id]);

  // Fetch posts when mounted and when user changes
  useEffect(() => {
    fetchPosts();
  }, [user?.id]);

  return {
    posts,
    isLoading,
    fetchPosts,
    handleLikeToggle,
  };
}
