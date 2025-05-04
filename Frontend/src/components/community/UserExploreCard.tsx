
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Award, Star, ExternalLink } from "lucide-react";

interface UserExploreCardProps {
  user: {
    id: string;
    full_name: string;
    username: string;
    profile_image: string | null;
    badge: string | null;
    position: string;
    organization: string;
    bio: string | null;
  };
}

export const UserExploreCard = ({ user }: UserExploreCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => (part[0] || "").toUpperCase())
      .join("");
  };

  const getBadgeStyles = (badge: string | null) => {
    switch (badge) {
      case "Diamond":
        return "bg-gradient-to-r from-blue-400 to-purple-500 text-white";
      case "Gold":
        return "bg-gradient-to-r from-amber-300 to-yellow-400 text-black";
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
        return <Award className="w-3.5 h-3.5 mr-1" />;
      case "Gold":
        return <Star className="w-3.5 h-3.5 mr-1 fill-current" />;
      case "Silver":
        return <Star className="w-3.5 h-3.5 mr-1" />;
      case "Bronze":
        return <Star className="w-3.5 h-3.5 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Link 
      to={`/user/${user.id}`} 
      className="block transition-all duration-300 hover:translate-y-[-8px] hover:shadow-xl"
    >
      <Card className="h-full overflow-hidden border-purple-100 hover-card-shine bg-white/80 backdrop-blur-sm card-shadow">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
        <CardContent className="pt-7">
          <div className="flex flex-col items-center mb-4">
            <div className="relative mb-3">
              <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                <AvatarImage src={user.profile_image || ""} alt={user.full_name} />
                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-md ${getBadgeStyles(user.badge)}`}>
                  {getBadgeIcon(user.badge)}
                  {user.badge || "Beginner"}
                </div>
              </div>
            </div>
            
            <h3 className="font-semibold text-center text-lg">{user.full_name}</h3>
            <p className="text-sm text-purple-700">@{user.username}</p>
            
            {(user.position || user.organization) && (
              <p className="text-sm text-center mt-2 text-gray-600">
                {user.position}
                {user.position && user.organization && " at "}
                {user.organization && <span className="font-medium">{user.organization}</span>}
              </p>
            )}
          </div>
          
          {user.bio && (
            <p className="text-sm text-gray-600 text-center line-clamp-2 mb-2 px-2">
              "{user.bio}"
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center pb-4 pt-0">
          <div className="flex items-center text-sm text-primary gap-1 hover:underline">
            <span>View Profile</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
