import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

type ConversationPartner = {
  id: string;
  full_name: string;
  profile_image: string | null;
};

interface MessagesListProps {
  messages: Message[];
  loading: boolean;
  conversationPartner: ConversationPartner | null;
}

export function MessagesList({ messages, loading, conversationPartner }: MessagesListProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Format date for messages
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, return time only
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'h:mm a');
    }
    
    // Otherwise, return date and time
    return format(date, 'MMM d, h:mm a');
  };

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const grouped: { [key: string]: Message[] } = {};
    
    msgs.forEach(msg => {
      const date = new Date(msg.created_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  // Display skeleton loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex gap-3 max-w-[80%] ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-64'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No messages yet
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date} className="space-y-4">
          {/* Date separator */}
          <div className="flex justify-center">
            <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
              {new Date(date).toDateString() === new Date().toDateString()
                ? "Today"
                : format(new Date(date), "MMMM d, yyyy")}
            </div>
          </div>
          
          {/* Messages for this date */}
          {msgs.map((message) => {
            const isCurrentUser = message.sender_id === user?.id;
            
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isCurrentUser && conversationPartner && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={conversationPartner.profile_image || undefined} alt={conversationPartner.full_name} />
                      <AvatarFallback className="bg-purple-200 text-purple-700 text-xs">
                        {conversationPartner.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div>
                    <div className={`mb-1 text-xs ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                      <span className="text-gray-500">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                    
                    <div
                      className={`p-3 rounded-lg ${
                        isCurrentUser
                          ? 'bg-purple-500 text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
