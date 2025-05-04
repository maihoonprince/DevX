
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { UserActivity } from "@/components/profile/UserActivity";
import { z } from "zod";

// We reuse the same schema as in the ProfileForm component
const profileSchema = z.object({
  bio: z.string().max(500, { message: "Bio must be 500 characters or less" }).optional().or(z.literal("")),
  portfolio_link: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  organization: z.string().min(2, { message: "Organization must be at least 2 characters" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { profile, updateProfile, isLoading: authLoading, getProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileFetchAttempted, setProfileFetchAttempted] = useState(false); 
  const { toast } = useToast();

  // This useEffect prevents infinite loops by tracking if we've attempted to fetch the profile
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!profile && !profileFetchAttempted) {
        setProfileFetchAttempted(true);
        await getProfile();
      } 
      
      if (profile && previewUrl === null) {
        setPreviewUrl(profile.profile_image || null);
      }
    };

    fetchProfileData();
  }, [profile, getProfile, profileFetchAttempted, previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);

      // Preview image before upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage.from("profile_images").upload(filePath, file);

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      // Fix: Correctly access the publicUrl property
      const { data: publicUrlData } = supabase.storage.from("profile_images").getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      return null;
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!profile) return;

    setIsLoading(true);
    
    try {
      let profileImageUrl = profile.profile_image;

      // Upload new profile image if provided
      if (profileImage) {
        const uploadedUrl = await uploadProfileImage(profileImage, profile.id);
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        }
      }

      // Update profile in database
      await updateProfile({
        ...values,
        profile_image: profileImageUrl,
      });

      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      });

      setIsEditing(false);
      setProfileImage(null);
    } catch (error: any) {
      toast({
        title: "Profile update failed",
        description: error.message || "An error occurred during profile update",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="container mx-auto pt-24 pb-10 px-4 text-center">
          <Card className="w-full max-w-4xl mx-auto">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't find your profile. Please try logging in again.
              </p>
              <a href="/auth/login" className="inline-block py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90">
                Go to Login
              </a>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const defaultValues = {
    bio: profile.bio || "",
    portfolio_link: profile.portfolio_link || "",
    position: profile.position || "",
    organization: profile.organization || "",
  };

  return (
    <>
      <Header />
      <div className="container mx-auto pt-24 pb-10 px-4">
        <Card className="w-full max-w-4xl mx-auto overflow-hidden">
          <CardContent className="p-8">
            {isEditing ? (
              <ProfileForm />
            ) : (
              <>
                <ProfileHeader 
                  profile={{
                    ...profile,
                    profile_image: previewUrl,
                  }} 
                  onEdit={() => setIsEditing(true)} 
                />
                
                <Separator className="my-8" />
                
                <UserActivity userId={profile.id} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// Skeleton loading state component
const ProfileSkeleton = () => (
  <>
    <Header />
    <div className="container mx-auto pt-24 pb-10 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:gap-8 animate-pulse">
            <Skeleton className="w-32 h-32 rounded-full" />
            
            <div className="flex-1 space-y-4 mt-4 md:mt-0">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-24 w-full max-w-2xl" />
            </div>
          </div>
          
          <Skeleton className="h-8 w-32 mt-8" />
          <div className="space-y-4 mt-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  </>
);

export default Profile;
