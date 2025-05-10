
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, User } from "lucide-react";

interface UserExploreCardProps {
  user: {
    id: string;
    full_name: string;
    username: string;
    profile_image: string | null;
    badge: string | null;
    position: string | null;
    organization: string | null;
    bio: string | null;
  };
}

export function UserExploreCard({ user }: UserExploreCardProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { startConversation } = useConversations();
  const [isMessaging, setIsMessaging] = useState(false);

  const badgeVariant = user.badge === "Diamond" 
    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent" 
    : user.badge === "Gold" 
      ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-transparent" 
      : "bg-gray-100 text-gray-800";

  const handleMessage = async () => {
    if (!currentUser) {
      navigate("/auth/login");
      return;
    }
    
    try {
      setIsMessaging(true);
      
      // We don't want to start a conversation with ourselves
      if (user.id === currentUser.id) {
        navigate("/profile");
        return;
      }
      
      const conversationId = await startConversation(user.id);
      
      if (conversationId) {
        navigate(`/community/messages/${conversationId}`);
      }
    } finally {
      setIsMessaging(false);
    }
  };

  const handleViewProfile = () => {
    navigate(`/user/${user.id}`);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="h-24 bg-gradient-to-r from-purple-100 to-indigo-100" />
      <div className="-mt-12 flex justify-center">
        <Avatar className="h-24 w-24 border-4 border-white bg-white">
          <AvatarImage src={user.profile_image || undefined} alt={user.full_name} />
          <AvatarFallback className="bg-purple-200 text-purple-700 text-lg">
            {user.full_name.split(' ').map(name => name[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <CardContent className="pt-4 text-center">
        <h3 className="font-semibold text-lg">{user.full_name}</h3>
        <p className="text-gray-500 text-sm">@{user.username}</p>
        
        {user.badge && (
          <Badge className={`mt-2 ${badgeVariant}`}>
            {user.badge}
          </Badge>
        )}
        
        <div className="mt-3 space-y-1">
          {user.position && (
            <p className="text-sm">
              <span className="font-medium">Role:</span> {user.position}
            </p>
          )}
          {user.organization && (
            <p className="text-sm">
              <span className="font-medium">Org:</span> {user.organization}
            </p>
          )}
        </div>
        
        {user.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-3">{user.bio}</p>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2 justify-center pt-0 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewProfile}
          className="flex items-center gap-1"
        >
          <User className="h-4 w-4" />
          Profile
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={handleMessage}
          disabled={isMessaging || (currentUser && currentUser.id === user.id)}
          className="flex items-center gap-1"
        >
          <MessageCircle className="h-4 w-4" />
          Message
        </Button>
      </CardFooter>
    </Card>
  );
}
