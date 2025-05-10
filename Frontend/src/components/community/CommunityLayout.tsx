
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { NotificationsPanel } from "./NotificationsPanel";
import { MessagePanel } from "@/components/messages/MessagePanel";

interface CommunityLayoutProps {
  children: ReactNode;
}

export function CommunityLayout({ children }: CommunityLayoutProps) {
  const location = useLocation();
  let currentTab = "feed";
  if (location.pathname.includes("/jobs")) {
    currentTab = "jobs";
  } else if (location.pathname.includes("/explore")) {
    currentTab = "explore";
  }
  
  const { profile } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      {/* Sub navbar - Styled with gradient and glass effect */}
      <div className="sticky top-16 z-40 w-full border-b bg-blur-light shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/community" className="flex items-center gap-2 font-semibold text-gradient-purple">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="text-lg">DevZone</span>
              </Link>
              
              <nav className="flex items-center space-x-6">
                <Link 
                  to="/community/feed" 
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    location.pathname.includes("/feed") 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageSquare className={`h-4 w-4 ${location.pathname.includes("/feed") ? "animate-pulse-soft" : ""}`} />
                  <span>Feed</span>
                </Link>
                
                <Link 
                  to="/community/jobs" 
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    location.pathname.includes("/jobs") 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className={`h-4 w-4 ${location.pathname.includes("/jobs") ? "animate-pulse-soft" : ""}`} />
                  <span>Jobs</span>
                </Link>
                
                <Link 
                  to="/community/explore" 
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    location.pathname.includes("/explore") 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className={`h-4 w-4 ${location.pathname.includes("/explore") ? "animate-pulse-soft" : ""}`} />
                  <span>Explore</span>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <MessagePanel />
              <NotificationsPanel />
              
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8 ring-2 ring-purple-200 ring-offset-1">
                  <AvatarImage src={profile?.profile_image || ""} />
                  <AvatarFallback className="bg-purple-gradient text-white">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="mb-6">
          <Tabs value={currentTab} className="w-full">
            <TabsList className="mb-6 w-full sm:w-auto bg-gradient-to-r from-purple-100 to-blue-50 p-1">
              <TabsTrigger value="feed" asChild>
                <Link to="/community/feed" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <MessageSquare className="h-4 w-4" />
                  <span>Feed</span>
                </Link>
              </TabsTrigger>
              <TabsTrigger value="jobs" asChild>
                <Link to="/community/jobs" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Users className="h-4 w-4" />
                  <span>Jobs</span>
                </Link>
              </TabsTrigger>
              <TabsTrigger value="explore" asChild>
                <Link to="/community/explore" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <User className="h-4 w-4" />
                  <span>Explore</span>
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
