
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Learn from "./pages/Learn";
import MongoDBLearn from "./pages/MongoDBLearn";
import ExpressLearn from "./pages/ExpressLearn";
import ReactLearn from "./pages/ReactLearn";
import NodeLearn from "./pages/NodeLearn";
import DSAQuestions from "./pages/DSAQuestions";
import Playground from "./pages/Playground";
import NotFound from "./pages/NotFound";
import ChatBot from "./components/ChatBot";
import Community from "./pages/Community";
import CommunityFeed from "./pages/community/CommunityFeed";
import CommunityJobs from "./pages/community/CommunityJobs";
import Developers from "./pages/Developers";
import DSATheory from "./pages/DSATheory";
import Compiler from "./pages/Compiler";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/mongodb" element={<MongoDBLearn />} />
            <Route path="/learn/express" element={<ExpressLearn />} />
            <Route path="/learn/react" element={<ReactLearn />} />
            <Route path="/learn/nodejs" element={<NodeLearn />} />
            <Route path="/developers" element={<Developers />} />
            <Route path="/dsa-theory" element={<DSATheory/>}/>
            
            {/* Auth routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/playground" element={
              <ProtectedRoute>
                <Playground />
              </ProtectedRoute>
            } />
            <Route path="/compiler" element={
              <ProtectedRoute>
                <Compiler />
              </ProtectedRoute>
            } />
            <Route path="/dsa-questions" element={
              <ProtectedRoute>
                <DSAQuestions />
              </ProtectedRoute>
            } />
            
            {/* Community routes */}
            <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
            <Route path="/community/feed" element={
              <ProtectedRoute>
                <CommunityFeed />
              </ProtectedRoute>
            } />
            <Route path="/community/jobs" element={
              <ProtectedRoute>
                <CommunityJobs />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Not Found route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
