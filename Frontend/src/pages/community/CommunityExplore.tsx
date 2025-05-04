
import { useState, useEffect } from "react";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { UserExploreCard } from "@/components/community/UserExploreCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { User, Search, Users, MapPin, Sparkles } from "lucide-react";

const CommunityExplore = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, username, profile_image, badge, position, organization, bio")
          .order("full_name", { ascending: true });

        if (error) throw error;
        
        setUsers(data || []);
        setFilteredUsers(data || []);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error loading users",
          description: error.message || "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        (user.organization && user.organization.toLowerCase().includes(query)) ||
        (user.position && user.position.toLowerCase().includes(query))
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Distribution of badges for stats
  const badgeCounts = users.reduce((counts: Record<string, number>, user) => {
    const badge = user.badge || "Beginner";
    counts[badge] = (counts[badge] || 0) + 1;
    return counts;
  }, {});

  return (
    <CommunityLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-100 rounded-2xl p-8 shadow-md">
          <h1 className="text-3xl font-bold text-gradient-purple mb-3">Explore Developers</h1>
          <p className="text-gray-700 max-w-2xl mb-6">
            Connect with talented developers from around the world. Discover new collaborators, mentors, 
            or potential team members for your next big project.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Community Size</p>
                <p className="font-bold text-lg">{users.length} Developers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-gray-600">Diamond Members</p>
                <p className="font-bold text-lg">{badgeCounts['Diamond'] || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
              <MapPin className="h-5 w-5 text-rose-500" />
              <div>
                <p className="text-sm text-gray-600">Global Community</p>
                <p className="font-bold text-lg">Worldwide</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative w-full max-w-md mx-auto mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            placeholder="Search by name, position, or organization..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 bg-white/80 backdrop-blur-sm border-purple-100 h-12 shadow-sm"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                  <Skeleton className="h-[240px] w-full rounded-xl" />
                </div>
              ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredUsers.map((user) => (
              <UserExploreCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white/50 rounded-xl shadow-sm">
            <User className="h-20 w-20 text-purple-200 mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">No developers found</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              No developers matching your search criteria were found. Try adjusting your search terms.
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
                className="border-purple-200 hover:bg-purple-50"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </CommunityLayout>
  );
};

export default CommunityExplore;
