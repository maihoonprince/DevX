
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  content: string;
  type: 'comment' | 'job_application';  // Removed 'like' type
  related_id: string | null;
  created_at: string;
  read: boolean;
  user_id: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Convert data to strongly typed notifications
      const typedNotifications = data?.map(notification => ({
        id: notification.id,
        content: notification.content,
        type: notification.type as 'comment' | 'job_application',  // Updated type
        related_id: notification.related_id,
        created_at: notification.created_at,
        read: !!notification.read,
        user_id: notification.user_id
      })) || [];
      
      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(notif => !notif.read).length);
      
      console.log("Notifications fetched successfully:", typedNotifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Failed to load notifications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true } 
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log("Notification marked as read:", notificationId);
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, read: true }))
      );
      
      setUnreadCount(0);
      
      console.log("All notifications marked as read");
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up real-time listener for new notifications
      const notificationsChannel = supabase
        .channel('notifications-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('New notification received:', payload);
            const newNotification = payload.new as any;
            
            // Filter out any notification types we don't handle
            if (newNotification.type === 'comment' || newNotification.type === 'job_application') {
              // Add to local state
              setNotifications(prev => [newNotification as Notification, ...prev]);
              setUnreadCount(prev => prev + 1);
              
              // Show toast
              toast({
                title: "New Notification",
                description: newNotification.content,
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Notification updated:', payload);
            // Update in local state
            setNotifications(prev => 
              prev.map(notif => 
                notif.id === (payload.new as Notification).id 
                  ? payload.new as Notification 
                  : notif
              )
            );
            
            // Update unread count
            const updatedNotifications = [...notifications];
            const updatedUnreadCount = updatedNotifications.filter(notif => !notif.read).length;
            setUnreadCount(updatedUnreadCount);
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(notificationsChannel);
      };
    }
  }, [user?.id]);

  return {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
