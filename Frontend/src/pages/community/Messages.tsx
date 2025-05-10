import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { MessagesList } from "@/components/messages/MessagesList";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageInput } from "@/components/messages/MessageInput";
import { useAuth } from "@/context/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Users, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Profile {
  id: string;
  full_name: string;
  username: string;
  profile_image: string | null;
}

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversationId || null
  );
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [featuredUsers, setFeaturedUsers] = useState<Profile[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [usersLoading, setUsersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("conversations");
  
  const { 
    conversations, 
    conversationsLoading, 
    conversationsError,
    conversationPartners,
    fetchConversations,
    startConversation
  } = useConversations();
  
  const { 
    messages, 
    messagesLoading, 
    sendMessage,
    markAsRead
  } = useMessages(selectedConversationId || undefined);

  // Fetch all users for the platform
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      try {
        setUsersLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, profile_image')
          .neq('id', user.id) // Exclude the current user
          .order('full_name');
        
        if (error) throw error;
        
        setAllUsers(data || []);
        setFilteredUsers(data || []);
        
        // Set first 10 users as featured users for the avatar list
        setFeaturedUsers(data?.slice(0, 10) || []);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        // Removed the toast notification for error to avoid showing errors to users
      } finally {
        setUsersLoading(false);
      }
    };
    
    fetchUsers();
  }, [user]);

  // Filter users based on search term
  useEffect(() => {
    if (!userSearchTerm.trim()) {
      setFilteredUsers(allUsers);
      return;
    }
    
    const searchLower = userSearchTerm.toLowerCase();
    const filtered = allUsers.filter(
      (user) => 
        user.full_name.toLowerCase().includes(searchLower) || 
        user.username.toLowerCase().includes(searchLower)
    );
    
    setFilteredUsers(filtered);
  }, [userSearchTerm, allUsers]);

  useEffect(() => {
    if (conversationId) {
      setSelectedConversationId(conversationId);
      setActiveTab("conversations");
    }
  }, [conversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      markAsRead();
      
      // Update URL without forcing navigation
      if (selectedConversationId !== conversationId) {
        navigate(`/community/messages/${selectedConversationId}`, { replace: true });
      }
    }
  }, [selectedConversationId, markAsRead, navigate, conversationId]);

  const handleSendMessage = async (content: string) => {
    // Show "Features Coming Soon" toast
    toast({
      title: "Features Coming Soon",
      description: "Direct messaging is coming soon! Stay tuned for updates.",
      variant: "default",
    });
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleStartConversation = async (userId: string) => {
    // Show "Features Coming Soon" toast
    toast({
      title: "Features Coming Soon",
      description: "Direct messaging is coming soon! Stay tuned for updates.",
      variant: "default",
    });
  };

  if (!user) {
    return (
      <CommunityLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <p className="text-lg text-gray-600">Please log in to use the messaging feature</p>
          </div>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-100 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gradient-purple flex items-center gap-2">
            <MessageCircle className="h-6 w-6" /> Messages
          </h1>
          <p className="text-gray-600 mb-4">Connect with other developers through private messages.</p>
          
          {/* Featured Users Avatar List */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <User className="h-4 w-4" /> Quick Connect
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveTab("users")}
                className="text-xs"
              >
                View All Users
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {usersLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-full" />
                ))
              ) : featuredUsers.length > 0 ? (
                featuredUsers.map((profile) => (
                  <Tooltip key={profile.id}>
                    <TooltipTrigger asChild>
                      <Avatar 
                        className="h-10 w-10 cursor-pointer border-2 border-white hover:border-purple-300 transition-all duration-200"
                        onClick={() => handleStartConversation(profile.id)}
                      >
                        <AvatarImage src={profile.profile_image || undefined} alt={profile.full_name} />
                        <AvatarFallback className="bg-purple-200 text-purple-700">
                          {profile.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{profile.full_name}</p>
                      <p className="text-xs text-gray-500">@{profile.username}</p>
                    </TooltipContent>
                  </Tooltip>
                ))
              ) : (
                <p className="text-sm text-gray-500">No users found</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="conversations" className="text-xs sm:text-sm">
                  <MessageCircle className="h-4 w-4 mr-1" /> Chats
                </TabsTrigger>
                <TabsTrigger value="users" className="text-xs sm:text-sm">
                  <Users className="h-4 w-4 mr-1" /> Users
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="conversations" className="m-0 border-0 p-0">
                {conversationsLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : (
                  <ConversationList 
                    conversations={conversations}
                    conversationPartners={conversationPartners}
                    selectedId={selectedConversationId}
                    onSelectConversation={handleSelectConversation}
                    onConversationsRefresh={fetchConversations}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="users" className="m-0 border-0 p-0">
                <div className="p-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full pl-9 bg-gray-50"
                    />
                  </div>
                </div>
                
                {usersLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(70vh-120px)]">
                    <div className="p-2">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((profile) => (
                          <div
                            key={profile.id}
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleStartConversation(profile.id)}
                          >
                            <Avatar className="h-10 w-10">
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
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-[70vh]">
            {selectedConversationId ? (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  <MessagesList 
                    messages={messages} 
                    loading={messagesLoading}
                    conversationPartner={
                      selectedConversationId && conversationPartners 
                        ? conversationPartners[selectedConversationId] 
                        : null
                    }
                  />
                </div>
                <Separator />
                <div className="p-4">
                  <MessageInput onSendMessage={handleSendMessage} />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md p-6">
                  <MessageCircle className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                  <p className="text-gray-500">
                    Select a conversation from your chats or find a user to message from the Users tab.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
};

export default Messages;
