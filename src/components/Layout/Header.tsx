import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, User, Settings, LogOut, Plus, Search, Compass } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-red-500" />
          <span className="text-xl font-bold text-white">FeetFlow</span>
        </Link>

        {/* Navigation */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/explore" 
              className="text-gray-300 hover:text-white transition-colors flex items-center"
            >
              <Compass className="h-4 w-4 mr-1" />
              Explore
            </Link>
            <Link 
              to="/subscriptions" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Subscriptions
            </Link>
          </nav>
        )}

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search creators..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* Create Post Button - Show for creators */}
              {user?.role === 'CREATOR' && (
                <Button
                  onClick={() => navigate('/create-post')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden sm:inline">Create</span>
                </Button>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePictureUrl} alt={user?.firstName} />
                      <AvatarFallback className="bg-gray-700 text-white">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end">
                  <DropdownMenuLabel className="text-white">
                    {user?.firstName} {user?.lastName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={() => navigate(`/profile/${user?.id}`)}
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {user?.role === 'CREATOR' && (
                    <DropdownMenuItem 
                      onClick={() => navigate('/dashboard')}
                      className="text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Creator Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => navigate('/subscriptions')}
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    My Subscriptions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 hover:bg-gray-800"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};