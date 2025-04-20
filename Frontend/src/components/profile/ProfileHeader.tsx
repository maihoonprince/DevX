
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, Pencil } from "lucide-react";

interface ProfileHeaderProps {
  profile: {
    id: string;
    full_name: string;
    username: string;
    profile_image: string | null;
    badge: string | null;
    position: string;
    organization: string;
    bio: string | null;
    portfolio_link: string | null;
  };
  onEdit: () => void;
}

export function ProfileHeader({ profile, onEdit }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  const positionDisplay = profile.position === "Student" 
    ? `Student at ${profile.organization || ""}` 
    : `${profile.position || ""} at ${profile.organization || ""}`;

  return (
    <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
      <div className="relative group mb-4 md:mb-0">
        <Avatar className="w-32 h-32 border-4 border-background shadow-md">
          <AvatarImage src={profile.profile_image || ""} alt={profile.full_name} />
          <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
            {getInitials(profile.full_name)}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          
          <Button 
            onClick={onEdit} 
            variant="outline" 
            size="sm" 
            className="mt-2 md:mt-0 flex items-center gap-1"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
        
        <Badge className="mt-2 mb-4">{profile.badge || "Beginner"}</Badge>
        
        <h2 className="font-medium mb-3">{positionDisplay}</h2>
        
        {profile.bio && (
          <div className="mb-4 max-w-2xl">
            <h3 className="text-sm font-semibold mb-1">About</h3>
            <p className="text-muted-foreground">{profile.bio}</p>
          </div>
        )}
        
        {profile.portfolio_link && (
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-primary" />
            <a 
              href={profile.portfolio_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {profile.portfolio_link}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
