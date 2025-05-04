
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, Pencil, Award, Star } from "lucide-react";

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

  const getBadgeStyles = (badge: string | null) => {
    switch (badge) {
      case "Diamond":
        return "bg-gradient-to-r from-blue-400 to-purple-500 text-white";
      case "Gold":
        return "bg-gradient-to-r from-yellow-300 to-amber-500 text-black";
      case "Silver":
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-black";
      case "Bronze":
        return "bg-gradient-to-r from-amber-700 to-amber-600 text-white";
      default:
        return "bg-gradient-to-r from-green-200 to-green-300 text-black";
    }
  };

  const getBadgeIcon = (badge: string | null) => {
    switch (badge) {
      case "Diamond":
        return <Award className="w-3 h-3 mr-1" />;
      case "Gold":
        return <Star className="w-3 h-3 mr-1 fill-current" />;
      case "Silver":
        return <Star className="w-3 h-3 mr-1" />;
      case "Bronze":
        return <Star className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

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
        
        <div className="mt-2 mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full shadow-sm transition-transform hover:scale-105 ${getBadgeStyles(profile.badge)}`}>
            {getBadgeIcon(profile.badge)}
            <span className="font-semibold">{profile.badge || "Beginner"}</span>
          </div>
        </div>
        
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
