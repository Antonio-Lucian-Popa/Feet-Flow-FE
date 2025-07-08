import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};