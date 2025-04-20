
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface CommentSectionProps {
  postId: string;
  initialComments?: any[];
  onCommentAdded?: () => void;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [error] = useState<string | null>(null);

  const retryFetchComments = () => {
    // Functionality removed
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      
      {error && (
        <Alert variant="destructive" className="my-2">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={retryFetchComments}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="text-center py-4 text-muted-foreground">
        Comments functionality has been removed.
      </div>
    </div>
  );
}
