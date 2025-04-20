
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "./ImageUploader";
import { uploadPostImage } from "@/services/imageUploadService";

interface PostFormProps {
  onPostCreated: (newPost: any) => void;
  onCancel: () => void;
}

export function PostForm({ onPostCreated, onCancel }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const validateForm = (): boolean => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a post",
        variant: "destructive",
      });
      return false;
    }
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      console.log("Creating new post with user ID:", user.id);
      
      let imageUrl = null;
      
      if (selectedImages.length > 0) {
        imageUrl = await uploadPostImage(selectedImages[0], user.id);
        
        if (selectedImages.length > 1) {
          await uploadPostImage(selectedImages[1], user.id);
        }
      }
      
      const newPost = { 
        title, 
        content, 
        user_id: user.id,
        has_image: selectedImages.length > 0,
        image_url: imageUrl,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('community_posts')
        .insert([newPost])
        .select('*')
        .single();
        
      if (error) {
        console.error("Error creating post:", error);
        throw error;
      }
      
      console.log("Post created successfully:", data);
      
      toast({
        title: "Success",
        description: "Your post has been published",
      });
      
      // Get user profile for the local post
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, username, profile_image')
        .eq('id', user.id)
        .single();
        
      onPostCreated(data);
      
      setTitle("");
      setContent("");
      setSelectedImages([]);
      setImagePreviewUrls([]);
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
      console.error("Post creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Create a Post</h3>
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full"
      />
      <Textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[120px]"
      />
      
      <ImageUploader
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        imagePreviewUrls={imagePreviewUrls}
        setImagePreviewUrls={setImagePreviewUrls}
        isSubmitting={isSubmitting}
      />
      
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Publishing..." : "Publish Post"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
