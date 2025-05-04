
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";

interface ProfileImageUploaderProps {
  existingImageUrl: string | null;
  onImageSelected: (file: File | null) => void;
}

export function ProfileImageUploader({ 
  existingImageUrl,
  onImageSelected 
}: ProfileImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Set initial preview from existing image
  useEffect(() => {
    if (existingImageUrl) {
      setPreviewUrl(existingImageUrl);
    }
  }, [existingImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onImageSelected(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageSelected(null);
  };

  return (
    <div 
      className="relative w-32 h-32 flex flex-col items-center justify-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Avatar className="w-32 h-32 border-4 border-muted bg-muted">
        <AvatarImage src={previewUrl || ""} alt="Profile" className="object-cover" />
        <AvatarFallback className="text-xl font-bold">
          <Upload className="h-8 w-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      
      {/* Overlay with actions */}
      {isHovering && (
        <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center gap-2">
          <label 
            htmlFor="profile-image-upload" 
            className="cursor-pointer bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm"
          >
            Upload
          </label>
          
          {previewUrl && (
            <Button 
              type="button" 
              variant="destructive" 
              size="sm" 
              onClick={handleRemoveImage}
              className="flex items-center gap-1 px-2 py-1 h-auto text-xs"
            >
              <X className="h-3 w-3" /> Remove
            </Button>
          )}
        </div>
      )}
      
      <input
        id="profile-image-upload"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleImageChange}
      />
    </div>
  );
}
