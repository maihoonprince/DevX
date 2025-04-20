
import { useState, useEffect } from "react";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { CreatePostCard } from "@/components/community/CreatePostCard";
import { PostList } from "@/components/community/PostList";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/context/AuthContext";

const CommunityFeed = () => {
  const { posts, isLoading, fetchPosts, handleLikeToggle } = usePosts();
  const { user } = useAuth();
  
  // Refetch posts when user changes
  useEffect(() => {
    fetchPosts();
  }, [user?.id]);

  const handlePostCreated = () => {
    // Immediately fetch posts after a new post is created
    fetchPosts();
  };

  return (
    <CommunityLayout>
      <div className="space-y-6">
        <CreatePostCard onPostCreated={handlePostCreated} />
        
        <PostList 
          posts={posts} 
          isLoading={isLoading} 
          onLikeToggle={handleLikeToggle} 
        />
      </div>
    </CommunityLayout>
  );
};

export default CommunityFeed;
