
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, Award, Star, MapPin, Briefcase, AtSign } from "lucide-react";

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
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
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
        return <Award className="w-4 h-4 mr-1" />;
      case "Gold":
        return <Star className="w-4 h-4 mr-1 fill-current" />;
      case "Silver":
        return <Star className="w-4 h-4 mr-1" />;
      case "Bronze":
        return <Star className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-indigo-50 to-purple-100 rounded-2xl p-8 shadow-md">
      <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
        <div className="relative group mb-6 md:mb-0">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage src={profile.profile_image || ""} alt={profile.full_name} />
            <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
            <div className={`flex items-center px-4 py-1 rounded-full shadow text-sm ${getBadgeStyles(profile.badge)}`}>
              {getBadgeIcon(profile.badge)}
              <span className="font-semibold">{profile.badge || "Beginner"}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="mb-3">
            <h1 className="text-3xl font-bold text-gradient-purple">{profile.full_name}</h1>
            <div className="flex items-center justify-center md:justify-start text-purple-600">
              <AtSign className="h-4 w-4 mr-1" />
              <p className="text-sm font-medium">{profile.username}</p>
            </div>
          </div>
          
          {(profile.position || profile.organization) && (
            <div className="mb-4 flex items-center justify-center md:justify-start text-gray-700">
              <Briefcase className="h-4 w-4 mr-1.5" />
              <h2 className="font-medium">{positionDisplay}</h2>
            </div>
          )}
          
          {profile.bio && (
            <div className="mb-5 max-w-2xl bg-white/50 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
              <p className="text-gray-600">{profile.bio}</p>
            </div>
          )}
          
          {profile.portfolio_link && (
            <div className="flex items-center gap-2 justify-center md:justify-start bg-white/70 px-3 py-1.5 rounded-md inline-flex">
              <Link className="w-4 h-4 text-primary" />
              <a 
                href={profile.portfolio_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                {profile.portfolio_link}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
