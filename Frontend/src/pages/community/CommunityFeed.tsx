import { useEffect } from "react";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { CreatePostCard } from "@/components/community/CreatePostCard";
import { PostList } from "@/components/community/PostList";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/context/AuthContext";
const CommunityFeed = () => {
  const {
    posts,
    isLoading,
    fetchPosts,
    handleLikeToggle
  } = usePosts();
  const {
    user
  } = useAuth();

  // Refetch posts when user changes or component mounts
  useEffect(() => {
    console.log("CommunityFeed: Fetching posts (user or component changed)");
    fetchPosts();
  }, [user?.id, fetchPosts]);
  const handlePostCreated = () => {
    // Immediately fetch posts after a new post is created
    console.log("CommunityFeed: Post created, refreshing posts");
    fetchPosts();
  };
  return <CommunityLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-purple-100 to-indigo-50 p-6 rounded-xl mb-8">
          <h1 className="text-3xl font-bold text-gradient-purple mb-2">DevZone </h1>
          <p className="text-gray-600">Connect with developers, share your thoughts, and stay updated with the latest discussions.</p>
        </div>
        
        <CreatePostCard onPostCreated={handlePostCreated} />
        
        <PostList posts={posts} isLoading={isLoading} onLikeToggle={handleLikeToggle} />
      </div>
    </CommunityLayout>;
};
export default CommunityFeed;