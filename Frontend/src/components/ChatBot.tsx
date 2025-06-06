import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Bot, X, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GiYinYang } from "react-icons/gi";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Check for direct messaging commands
    if (userMessage.toLowerCase().startsWith("/message") || userMessage.toLowerCase().startsWith("/dm")) {
      handleDirectMessageCommand(userMessage);
      return;
    }

    try {
      const response = await fetch("https://devx-backend.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get a response.");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get a response from AI.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectMessageCommand = async (message: string) => {
    // Show "Features Coming Soon" toast for direct messaging
    toast({
      title: "Features Coming Soon",
      description: "Direct messaging is coming soon! Stay tuned for updates.",
      variant: "default",
    });
    
    // Still display a helpful message in the chat
    setMessages((prev) => [...prev, { 
      role: "assistant", 
      content: "The direct messaging feature is coming soon! In the meantime, you can continue chatting with me or explore other parts of the application." 
    }]);
    
    setIsLoading(false);
  };

  // Handle clicks on the "Open Conversation" button
  useEffect(() => {
    const handleOpenConversation = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('open-conversation-btn')) {
        const conversationId = target.getAttribute('data-conversation-id');
        if (conversationId) {
          setIsOpen(false);
          navigate(`/community/messages/${conversationId}`);
        }
      }
    };

    document.addEventListener('click', handleOpenConversation);
    return () => {
      document.removeEventListener('click', handleOpenConversation);
    };
  }, [navigate]);

  // Display helpful hint about direct messaging feature when chat is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ 
        role: "assistant", 
        content: "Welcome to OrBi!" 
      }]);
    }
  }, [isOpen, messages.length]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-[350px] h-[500px] flex flex-col shadow-xl">
          <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-cyan-400 to-blue-500">
            <div className="flex items-center gap-2">
              <GiYinYang className="h-5 w-5" />
              <h3 className="font-semibold"> OrBi </h3>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:text-primary-foreground/80"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-4">
                Ask me anything! I'm here to help.
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground ml-4" : "bg-muted mr-4"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown components={{
                      // This allows the custom button to render correctly
                      button: ({node, ...props}) => <button className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center gap-1 text-sm hover:bg-blue-600 transition-colors" {...props}><MessageCircle className="h-3 w-3" /> {props.children}</button>
                    }}>
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder={user ? "Ask a question or use /message username..." : "Ask a question..."} 
                disabled={isLoading} 
              />
              <Button type="submit" disabled={isLoading}>
                Send
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" onClick={() => setIsOpen(true)}>
          <Bot className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default ChatBot;
