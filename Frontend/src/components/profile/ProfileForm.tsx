
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
  bio: z.string().max(500, { message: "Bio must be 500 characters or less" }).optional().or(z.literal("")),
  portfolio_link: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  organization: z.string().min(2, { message: "Organization must be at least 2 characters" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  defaultValues: ProfileFormValues;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileForm({ 
  defaultValues, 
  onSubmit, 
  onCancel, 
  isLoading,
  handleImageChange
}: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-6">
          <FormLabel htmlFor="profile-image">Profile Image</FormLabel>
          <Input 
            id="profile-image"
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="cursor-pointer mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-primary file:text-white hover:file:bg-primary/90"
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            name="position"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Student or Job Title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            name="organization"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization/University</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Company or University name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          name="bio"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Tell us about yourself"
                  className="min-h-[120px]"
                  resize={false}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                {field.value?.length || 0}/500 characters
              </p>
            </FormItem>
          )}
        />
        
        <FormField
          name="portfolio_link"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio Link</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://yourportfolio.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
