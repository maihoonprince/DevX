
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || sending) return;
    
    try {
      setSending(true);
      await onSendMessage(message);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  // Handle Shift+Enter for newlines and Enter to send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[80px] resize-none focus:ring-purple-300"
        disabled={sending}
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!message.trim() || sending}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </form>
  );
}
