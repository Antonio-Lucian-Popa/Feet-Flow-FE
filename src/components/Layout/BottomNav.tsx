import { Home, Compass, Heart, PlusCircle, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const BottomNav: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  type NavItem = { icon: React.ReactNode; label: string; path: string };

  const navItems: NavItem[] = [
    { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/' },
    { icon: <Compass className="h-5 w-5" />, label: 'Explore', path: '/explore' },
    { icon: <Heart className="h-5 w-5" />, label: 'Subs', path: '/subscriptions' },
    ...(user?.role === 'CREATOR'
      ? [{ icon: <PlusCircle className="h-5 w-5" />, label: 'Create', path: '/create-post' }]
      : []),
    { icon: <User className="h-5 w-5" />, label: 'Profile', path: `/profile/${user?.id}` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 flex justify-around items-center py-2 md:hidden">
      {navItems.map((item, index) => (
        <button
          key={index}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center text-xs ${
            location.pathname === item.path ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          {item.icon}
          <span className="mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
