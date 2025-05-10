import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Send, User, Search, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Profile {
  id: string;
  full_name: string;
  username: string;
  profile_image: string | null;
}

export function MessagePanel() {
  const [open, setOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [activeTab, setActiveTab] = useState<string>("conversations");
  const [users, setUsers] = useState<Profile[]>([]);
  const [featuredUsers, setFeaturedUsers] = useState<Profile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    conversations,
    conversationsLoading,
    conversationPartners,
    fetchConversations,
    startConversation
  } = useConversations();
  
  const {
    messages,
    messagesLoading,
    sendMessage
  } = useMessages(activeConversationId);
  
  // Refresh conversations when opening the panel
  useEffect(() => {
    if (open && user) {
      fetchConversations();
    }
  }, [open, user, fetchConversations]);
  
  // Auto-focus on the first conversation when opening panel
  useEffect(() => {
    if (open && conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [open, conversations, activeConversationId]);
  
  // Fetch users when panel is open and tab is users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!open || !user) return;
      
      try {
        setUsersLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, profile_image')
          .neq('id', user.id) // Exclude current user
          .order('full_name')
          .limit(20); // Limit to 20 users for performance
        
        if (error) throw error;
        
        setUsers(data || []);
        setFilteredUsers(data || []);
        
        // Set first 5 users as featured
        setFeaturedUsers(data?.slice(0, 5) || []);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error loading users",
          description: error.message || "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setUsersLoading(false);
      }
    };
    
    fetchUsers();
  }, [open, user, toast]);
  
  // Filter users based on search term
  useEffect(() => {
    if (!userSearchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const searchLower = userSearchTerm.toLowerCase();
    const filtered = users.filter(
      (user) => 
        user.full_name.toLowerCase().includes(searchLower) || 
        user.username.toLowerCase().includes(searchLower)
    );
    
    setFilteredUsers(filtered);
  }, [userSearchTerm, users]);
  
  const handleSendReply = async () => {
    if (!activeConversationId || !replyMessage.trim()) return;
    
    await sendMessage(replyMessage);
    setReplyMessage("");
  };
  
  const handleViewAllMessages = () => {
    setOpen(false);
    navigate("/community/messages");
  };
  
  const handleViewConversation = (conversationId: string) => {
    setOpen(false);
    navigate(`/community/messages/${conversationId}`);
  };
  
  const handleStartConversation = async (userId: string) => {
    // Show "Features Coming Soon" toast instead of starting a conversation
    toast({
      title: "Features Coming Soon",
      description: "Direct messaging is coming soon! Stay tuned for updates.",
      variant: "default",
    });
    
    // Close the panel
    setOpen(false);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {/* If we want to add unread message count badge later */}
          {/* {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )} */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" side="bottom">
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="font-semibold">Messages</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={handleViewAllMessages}
          >
            View all
          </Button>
        </div>
        
        {!user ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Sign in to view messages</p>
          </div>
        ) : (
          <>
            {/* Featured users avatar row */}
            {featuredUsers.length > 0 && (
              <div className="p-3 border-b">
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                  <User className="h-3 w-3 mr-1" /> Quick Connect
                </p>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {featuredUsers.map((profile) => (
                    <Tooltip key={profile.id}>
                      <TooltipTrigger asChild>
                        <Avatar
                          className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all"
                          onClick={() => handleStartConversation(profile.id)}
                        >
                          <AvatarImage src={profile.profile_image || undefined} alt={profile.full_name} />
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                            {profile.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        {profile.full_name}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 px-3 pt-2">
                <TabsTrigger value="conversations" className="text-xs">
                  Chats
                </TabsTrigger>
                <TabsTrigger value="users" className="text-xs">
                  Users
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="conversations" className="m-0 p-0 border-0">
                {conversationsLoading ? (
                  <div className="p-3 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 text-xs"
                      onClick={() => setActiveTab("users")}
                    >
                      Find people to message
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    {conversations.slice(0, 5).map((conversation) => {
                      const partner = conversationPartners[conversation.id];
                      if (!partner) return null;
                      
                      return (
                        <div
                          key={conversation.id}
                          className={`flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 ${
                            activeConversationId === conversation.id ? 'bg-purple-50' : ''
                          }`}
                          onClick={() => handleViewConversation(conversation.id)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={partner.profile_image || undefined} alt={partner.full_name} />
                            <AvatarFallback className="bg-purple-200 text-purple-700">
                              {partner.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-baseline">
                              <p className="font-medium text-sm truncate">{partner.full_name}</p>
                              {conversation.updated_at && (
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
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
                )}
              </TabsContent>
              
              <TabsContent value="users" className="m-0 p-0 border-0">
                <div className="p-3">
                  <Input
                    type="text"
                    placeholder="Search users..."
                    className="w-full text-sm bg-gray-50"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                </div>
                
                {usersLoading ? (
                  <div className="p-3 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleStartConversation(profile.id)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.profile_image || undefined} alt={profile.full_name} />
                            <AvatarFallback className="bg-purple-200 text-purple-700">
                              {profile.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">{profile.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">@{profile.username}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-gray-500 text-sm">No users found</p>
                      </div>
                    )}
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
