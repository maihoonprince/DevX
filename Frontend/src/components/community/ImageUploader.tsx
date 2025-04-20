
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  selectedImages: File[];
  setSelectedImages: React.Dispatch<React.SetStateAction<File[]>>;
  imagePreviewUrls: string[];
  setImagePreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
  isSubmitting: boolean;
}

export function ImageUploader({
  selectedImages,
  setSelectedImages,
  imagePreviewUrls,
  setImagePreviewUrls,
  isSubmitting
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const newFiles = Array.from(files).slice(0, 2 - selectedImages.length);
      
      if (selectedImages.length + newFiles.length > 2) {
        toast({
          title: "Too many images",
          description: "Maximum 2 images allowed per post",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImages(prev => [...prev, ...newFiles]);
      
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {imagePreviewUrls.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-2">
          {imagePreviewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`Preview ${index + 1}`} 
                className="h-24 w-24 object-cover rounded-md border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2 mt-4">
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageSelect}
        />
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={selectedImages.length >= 2 || isSubmitting}
          className="flex gap-2 items-center"
        >
          <ImageIcon className="h-4 w-4" />
          {selectedImages.length === 0 ? 'Add Images' : 'Add Another Image'}
        </Button>
        <span className="text-xs text-muted-foreground">
          {selectedImages.length}/2 images
        </span>
      </div>
    </div>
  );
}
