
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface JobApplicationFormProps {
  jobId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const applicationSchema = z.object({
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export function JobApplicationForm({ jobId, onSuccess, onCancel }: JobApplicationFormProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof applicationSchema>) => {
    if (!user || !profile) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply for jobs",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the job application
      const { error: applicationError } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          user_email: profile.email,
          message: values.message,
        });
        
      if (applicationError) throw applicationError;
      
      toast({
        title: "Application Submitted",
        description: "Your job application has been sent successfully!",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Apply for this Job</h3>
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message to Employer</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Introduce yourself and explain why you're a good fit for this role"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="text-sm text-muted-foreground">
          <p>Your application will be sent with the email: <strong>{profile?.email}</strong></p>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
