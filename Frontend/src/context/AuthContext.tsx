
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type Profile = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  profile_image: string | null;
  position: string | null;
  organization: string | null;
  bio: string | null;
  portfolio_link: string | null;
  badge: string;
  questions_solved: number;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: Omit<Profile, 'id' | 'badge' | 'questions_solved' | 'bio' | 'portfolio_link'>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  getProfile: () => Promise<Profile | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Use a timeout to delay profile fetching to avoid recursion issues
      if (session?.user) {
        setTimeout(async () => {
          try {
            const userProfile = await fetchOrCreateProfile(session.user);
            console.log("Profile after auth change:", userProfile);
            setProfile(userProfile);
          } catch (error) {
            console.error("Error processing profile after auth change:", error);
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profile = await fetchOrCreateProfile(session.user);
          console.log("Retrieved profile during initial check:", profile);
          setProfile(profile);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // This is a function to handle both fetching and creating profiles
  const fetchOrCreateProfile = async (user: User): Promise<Profile | null> => {
    try {
      console.log("Fetching or creating profile for user ID:", user.id);
      
      // Try to fetch the profile first
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw fetchError;
      }

      if (existingProfile) {
        console.log('Found existing profile:', existingProfile);
        return existingProfile as Profile;
      }

      // If profile doesn't exist, create one from user metadata
      console.log('No profile found, creating new profile from metadata:', user.user_metadata);
      
      const metadata = user.user_metadata || {};
      const newProfileData = {
        id: user.id,
        full_name: metadata.full_name || user.email?.split('@')[0] || 'User',
        username: metadata.username || user.email?.split('@')[0] || 'user_' + Math.random().toString(36).substring(2, 8),
        email: user.email || '',
        profile_image: metadata.profile_image || null,
        position: metadata.position || null,
        organization: metadata.organization || null,
        bio: null,
        portfolio_link: null,
        badge: 'Beginner',
        questions_solved: 0
      };
      
      console.log('Creating new profile with data:', newProfileData);
      
      // Insert the new profile
      const { data: insertedProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfileData])
        .select('*')
        .maybeSingle();
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw insertError;
      }
      
      console.log('New profile created successfully:', insertedProfile);
      return insertedProfile as Profile;
    } catch (error) {
      console.error('Error in fetchOrCreateProfile function:', error);
      return null;
    }
  };

  const getProfile = async (): Promise<Profile | null> => {
    try {
      if (!user) {
        console.log("No user found in getProfile");
        return null;
      }

      return await fetchOrCreateProfile(user);
    } catch (error) {
      console.error('Error in getProfile function:', error);
      return null;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: Omit<Profile, 'id' | 'badge' | 'questions_solved' | 'bio' | 'portfolio_link'>
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            username: userData.username,
            position: userData.position,
            organization: userData.organization,
            profile_image: userData.profile_image,
          },
        },
      });

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account",
      });

      navigate('/auth/login');
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Get or create profile immediately after sign in
      const userProfile = await fetchOrCreateProfile(data.user);
      setProfile(userProfile);

      toast({
        title: "Login successful",
        description: `Welcome back, ${userProfile?.full_name || 'user'}!`,
      });

      navigate('/profile');
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear all auth state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clear any cached data in localStorage
      localStorage.removeItem('supabase.auth.token');
      
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Profile update failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Refresh profile data
      const updatedProfile = await getProfile();
      setProfile(updatedProfile);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    getProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
