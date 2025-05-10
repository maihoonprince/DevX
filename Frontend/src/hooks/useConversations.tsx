
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Conversation {
  id: string;
  updated_at: string;
  last_message?: {
    content: string;
    created_at: string;
  };
}

interface ConversationPartner {
  id: string;
  full_name: string;
  username: string;
  profile_image: string | null;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationPartners, setConversationPartners] = useState<Record<string, ConversationPartner>>({});
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setConversationsLoading(true);
      setConversationsError(null);

      // Get all conversations the user is part of
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantsError) throw participantsError;

      if (!participantsData?.length) {
        setConversations([]);
        setConversationsLoading(false);
        return;
      }

      const conversationIds = participantsData.map(p => p.conversation_id);

      // Get conversations with their last update time
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('id, updated_at')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Get the last message for each conversation
      const conversationsWithLastMessage = await Promise.all(
        conversationsData.map(async (conversation) => {
          const { data: messagesData } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...conversation,
            last_message: messagesData && messagesData.length > 0 ? messagesData[0] : undefined
          };
        })
      );

      setConversations(conversationsWithLastMessage);

      // For each conversation, get the other participant (assuming 2-person conversations)
      const partners: Record<string, ConversationPartner> = {};

      await Promise.all(
        conversationIds.map(async (convId) => {
          const { data: participantData } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', convId)
            .neq('user_id', user.id)
            .limit(1);

          if (participantData && participantData.length > 0) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, full_name, username, profile_image')
              .eq('id', participantData[0].user_id)
              .limit(1);

            if (profileData && profileData.length > 0) {
              partners[convId] = profileData[0];
            }
          }
        })
      );

      setConversationPartners(partners);
    } catch (error: any) {
      // Store the error in state but don't show a toast
      console.error("Error fetching conversations:", error);
      setConversationsError(error);
      // No toast notification here to prevent error display to user
    } finally {
      setConversationsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const startConversation = useCallback(async (otherUserId: string) => {
    if (!user) return null;
    
    try {
      // Check if the user is trying to message themselves
      if (user.id === otherUserId) {
        toast({
          title: "Cannot message yourself",
          description: "You cannot start a conversation with yourself.",
          variant: "destructive",
        });
        return null;
      }

      // Use the stored function to get or create a conversation
      const { data, error } = await supabase.rpc(
        'find_or_create_conversation',
        { user1_id: user.id, user2_id: otherUserId }
      );
      
      if (error) {
        console.error("Error in RPC function:", error);
        throw error;
      }
      
      // Refresh the conversations list
      await fetchConversations();
      
      return data;
    } catch (error: any) {
      console.error("Error starting conversation:", error);
      // Don't show toast for errors to avoid showing errors to users
      return null;
    }
  }, [user, fetchConversations, toast]);

  return {
    conversations,
    conversationsLoading,
    conversationsError,
    conversationPartners,
    fetchConversations,
    startConversation,
  };
}
