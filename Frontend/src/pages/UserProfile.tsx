
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ProfileHeader } from "@/components/profile/PublicProfileHeader";
import { UserActivity } from "@/components/profile/UserActivity";
import { useToast } from "@/hooks/use-toast";

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        if (!userId) {
          toast({
            title: "Error",
            description: "User ID is missing",
            variant: "destructive",
          });
          return;
        }
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProfile(data);
        }
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message || "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, toast]);

  if (isLoading) {
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
                We couldn't find this user's profile.
              </p>
              <a href="/community/feed" className="inline-block py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90">
                Back to Community
              </a>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto pt-24 pb-10 px-4">
        <Card className="w-full max-w-4xl mx-auto overflow-hidden">
          <CardContent className="p-8">
            <ProfileHeader profile={profile} />
            
            <Separator className="my-8" />
            
            <UserActivity userId={profile.id} />
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

export default UserProfile;
