
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PostForm } from "./PostForm";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/context/AuthContext";

interface CreatePostCardProps {
  onPostCreated: () => void;
}

export function CreatePostCard({ onPostCreated }: CreatePostCardProps) {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const { user } = useAuth();

  const handlePostCreated = (newPost: any) => {
    // Immediately inform parent component
    onPostCreated();
    
    // Close form
    setIsCreatingPost(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {isCreatingPost ? (
          <PostForm 
            onPostCreated={handlePostCreated} 
            onCancel={() => setIsCreatingPost(false)} 
          />
        ) : (
          <Button 
            onClick={() => setIsCreatingPost(true)} 
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
