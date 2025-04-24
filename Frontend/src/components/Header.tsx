
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Infinity } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              DevX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/playground" className="text-sm font-medium hover:text-primary transition-colors">
              PlayGround
            </Link>
            <Link to="/community" className="text-sm font-medium hover:text-primary transition-colors">
              DevZone
            </Link>
            {/* <Link to="/dsa-theory" className="text-sm font-medium hover:text-primary transition-colors">
              DSA Theory
            </Link>
            <Link to="/dsa-questions" className="text-sm font-medium hover:text-primary transition-colors">
              DSA
            </Link> */}
            <Link to="/developers" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              Dev<Infinity className="h-4 w-4" />
            </Link>
            
          </nav>

          {/* User Profile or Login Button (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 h-10 w-10">
                    <Avatar>
                      <AvatarImage src={profile.profile_image || ""} alt={profile.full_name} />
                      <AvatarFallback>
                        {profile.full_name.split(' ').map(name => name[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate('/auth/login')}
                variant="default"
              >
                Register / Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 animate-in">
            <div className="flex flex-col space-y-4">
              <Link
                to="/learn"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Learn
              </Link>
              <Link
                to="/playground"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Playground
              </Link>
              <Link
                to="/community"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Community
              </Link>
              <Link
                to="/developers"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Dev<Infinity className="h-4 w-4" />
              </Link>
              <Link
                to="/dsa-theory"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                DSA Theory
              </Link>
              
              {/* User Profile or Login Button (Mobile) */}
              {user && profile ? (
                <>
                  <Link
                    to="/profile"
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={profile.profile_image || ""} alt={profile.full_name} />
                      <AvatarFallback>
                        {profile.full_name.split(' ').map(name => name[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    Profile
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    navigate('/auth/login');
                    setIsMenuOpen(false);
                  }}
                >
                  Register / Login
                </Button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
