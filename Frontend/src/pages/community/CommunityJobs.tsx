import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Briefcase, MapPin, DollarSign, Check } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobApplicationForm } from "@/components/community/JobApplicationForm";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  job_type: string;
  experience: string;
  description: string;
  created_at: string;
  user_id: string;
  has_applied?: boolean;
}

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  salary_min: z.coerce.number().min(0, "Minimum salary must be greater than 0").optional().or(z.literal("")),
  salary_max: z.coerce.number().min(0, "Maximum salary must be greater than 0").optional().or(z.literal("")),
  job_type: z.string().min(1, "Job type is required"),
  experience: z.string().min(1, "Experience level is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

type JobFormValues = z.infer<typeof jobSchema>;

const CommunityJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jobApplicationId, setJobApplicationId] = useState<string | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      salary_min: "",
      salary_max: "",
      job_type: "",
      experience: "",
      description: "",
    },
  });

  useEffect(() => {
    fetchJobs();
  }, [user?.id]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      let jobsData = data || [];
      
      // If user is logged in, check which jobs they've already applied to
      if (user) {
        const { data: applications, error: appError } = await supabase
          .rpc('get_user_job_applications', { user_id_param: user.id });
          
        if (!appError && applications) {
          const appliedJobIds = new Set(applications);
          jobsData = jobsData.map(job => ({
            ...job,
            has_applied: appliedJobIds.has(job.id)
          }));
        }
      }
      
      setJobs(jobsData);
    } catch (error: any) {
      toast({
        title: "Error fetching jobs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: JobFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to post a job",
        variant: "destructive",
      });
      return;
    }
    
    try {
      form.formState.isSubmitting;
      
      const jobData = {
        title: values.title,
        company: values.company,
        location: values.location,
        salary_min: values.salary_min || null,
        salary_max: values.salary_max || null,
        job_type: values.job_type,
        experience: values.experience,
        description: values.description,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Job Posted Successfully",
        description: "Your job posting has been published",
      });
      
      form.reset();
      setIsOpen(false);
      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error posting job",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      form.formState.isSubmitting;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setJobs(filteredJobs);
    } else {
      fetchJobs();
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not disclosed";
    if (min && !max) return `$${min.toLocaleString()}+`;
    if (!min && max) return `Up to $${max.toLocaleString()}`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
  };
  
  const handleApplyClick = (jobId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply for jobs",
        variant: "destructive",
      });
      return;
    }
    
    setJobApplicationId(jobId);
    setIsApplyDialogOpen(true);
  };
  
  const handleApplicationSuccess = () => {
    setIsApplyDialogOpen(false);
    setJobApplicationId(null);
    
    if (jobApplicationId) {
      setJobs(jobs.map(job => 
        job.id === jobApplicationId 
          ? { ...job, has_applied: true } 
          : job
      ));
    }
    
    fetchJobs();
  };

  return (
    <CommunityLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search jobs by title, company, or location"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Post Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post a New Job</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Senior React Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Acme Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. New York, Remote" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="salary_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Salary</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 50000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="salary_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Salary</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 80000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="job_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Full-time">Full-time</SelectItem>
                              <SelectItem value="Part-time">Part-time</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Entry Level">Entry Level</SelectItem>
                              <SelectItem value="Mid Level">Mid Level</SelectItem>
                              <SelectItem value="Senior Level">Senior Level</SelectItem>
                              <SelectItem value="Executive">Executive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the role, responsibilities, requirements, etc." 
                            className="min-h-[150px]"
                            resize={false}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? "Posting..." : "Post Job"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-48"></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          jobs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try adjusting your search criteria."
                    : "Be the first to post a job opportunity!"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsOpen(true)}>Post Job</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="sm:flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {job.company}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatSalary(job.salary_min, job.salary_max)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 flex gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                          {job.job_type}
                        </span>
                        <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full whitespace-nowrap">
                          {job.experience}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 whitespace-pre-line line-clamp-3">{job.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Posted on {new Date(job.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      
                      {job.has_applied ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2 text-green-600 border-green-600"
                          disabled
                        >
                          <Check className="h-4 w-4" />
                          Applied
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleApplyClick(job.id)}
                        >
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
      
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Apply for Job</DialogTitle>
          </DialogHeader>
          
          {jobApplicationId && (
            <JobApplicationForm 
              jobId={jobApplicationId}
              onSuccess={handleApplicationSuccess}
              onCancel={() => setIsApplyDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </CommunityLayout>
  );
};

export default CommunityJobs;
