
import { supabase } from "@/integrations/supabase/client";

export async function uploadPostImage(file: File, userId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('post_images')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('post_images')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error("Error in uploadImage:", error);
    return null;
  }
}

export async function uploadProfileImage(file: File, userId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Using 'profile_images' bucket which already exists in Supabase
    const { error: uploadError } = await supabase.storage
      .from('profile_images')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error("Error uploading profile image:", uploadError);
      throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile_images')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error("Error in uploadProfileImage:", error);
    return null;
  }
}
