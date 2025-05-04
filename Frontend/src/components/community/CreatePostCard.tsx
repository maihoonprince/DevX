
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";
import { PostForm } from "./PostForm";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreatePostCardProps {
  onPostCreated: () => void;
}

export function CreatePostCard({ onPostCreated }: CreatePostCardProps) {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const { user } = useAuth();
  const { profile } = useAuth();

  const handlePostCreated = (newPost: any) => {
    // Immediately inform parent component
    onPostCreated();
    
    // Close form
    setIsCreatingPost(false);
  };

  return (
    <Card className="hover-card-shine overflow-hidden bg-white/80 backdrop-blur-sm border-purple-100 shadow-md">
      <CardContent className="p-6">
        {isCreatingPost ? (
          <PostForm 
            onPostCreated={handlePostCreated} 
            onCancel={() => setIsCreatingPost(false)} 
          />
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 ring-2 ring-purple-100">
                <AvatarImage src={profile?.profile_image || ""} />
                <AvatarFallback className="bg-purple-gradient text-white">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button 
                onClick={() => setIsCreatingPost(true)} 
                variant="outline"
                className="flex-1 justify-start text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200"
              >
                What's on your mind?
              </Button>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <Button 
                onClick={() => setIsCreatingPost(true)} 
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
