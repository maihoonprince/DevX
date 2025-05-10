import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { User, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

type ConversationPartner = {
  id: string;
  full_name: string;
  username: string;
  profile_image: string | null;
};

type Conversation = {
  id: string;
  updated_at: string;
  last_message?: {
    content: string;
    created_at: string;
  };
};

interface ConversationListProps {
  conversations: Conversation[];
  conversationPartners: Record<string, ConversationPartner>;
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  onConversationsRefresh: () => void;
}

export function ConversationList({
  conversations,
  conversationPartners,
  selectedId,
  onSelectConversation,
  onConversationsRefresh
}: ConversationListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
  };

  const handleExploreUsers = () => {
    navigate('/community/explore');
  };

  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const filteredConversations = sortedConversations.filter(conv => {
    const partner = conversationPartners[conv.id];
    if (!partner) return false;
    
    return partner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           partner.username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, return time
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'h:mm a');
    }
    
    // If this year, return month and day
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'MMM d');
    }
    
    // Otherwise, return month, day, and year
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredConversations.length > 0 ? (
        <ScrollArea className="flex-1 px-3 pb-3">
          {filteredConversations.map((conversation) => {
            const partner = conversationPartners[conversation.id];
            if (!partner) return null;
            
            return (
              <div
                key={conversation.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  selectedId === conversation.id 
                    ? 'bg-purple-100' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={partner.profile_image || undefined} alt={partner.full_name} />
                  <AvatarFallback className="bg-purple-200 text-purple-700">
                    {partner.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-medium text-sm truncate">{partner.full_name}</p>
                    {conversation.updated_at && (
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {formatDate(conversation.updated_at)}
                      </span>
                    )}
                  </div>
                  
                  {conversation.last_message ? (
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.last_message.content}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No messages yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          {searchTerm ? (
            <p className="text-sm text-gray-500">No conversations match your search</p>
          ) : (
            <div className="space-y-4">
              <MessageCircle className="h-10 w-10 text-gray-300 mx-auto" />
              <div>
                <p className="text-sm text-gray-500 mb-3">No conversations yet</p>
                <Button 
                  onClick={handleExploreUsers}
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                >
                  <User className="h-3.5 w-3.5 mr-1" />
                  Explore Users
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
