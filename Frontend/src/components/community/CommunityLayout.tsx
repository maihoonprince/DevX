
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { NotificationsPanel } from "./NotificationsPanel";

interface CommunityLayoutProps {
  children: ReactNode;
}

export function CommunityLayout({ children }: CommunityLayoutProps) {
  const location = useLocation();
  const currentTab = location.pathname.includes("/jobs") ? "jobs" : "feed";
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      {/* Sub navbar */}
      <div className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/community" className="flex items-center gap-2 font-semibold">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span>Community</span>
              </Link>
              
              <nav className="flex items-center space-x-4">
                <Link 
                  to="/community/feed" 
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${location.pathname.includes("/feed") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Feed</span>
                </Link>
                
                <Link 
                  to="/community/jobs" 
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${location.pathname.includes("/jobs") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Users className="h-4 w-4" />
                  <span>Jobs</span>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <NotificationsPanel />
              
              <Link to="/profile" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.profile_image || ""} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 pt-20">
        <div className="mb-6">
          <Tabs value={currentTab} className="w-full">
            <TabsList className="mb-6 w-full sm:w-auto">
              <TabsTrigger value="feed" asChild>
                <Link to="/community/feed" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Feed</span>
                </Link>
              </TabsTrigger>
              <TabsTrigger value="jobs" asChild>
                <Link to="/community/jobs" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Jobs</span>
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}
