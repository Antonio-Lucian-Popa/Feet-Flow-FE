import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { ProfilePage } from './pages/ProfilePage';
import { CreatorDashboard } from './pages/CreatorDashboard';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { ExplorePage } from './pages/ExplorePage';

import { PostDetailPage } from './pages/PostDetailPage';
import { Toaster } from '@/components/ui/sonner';
import './App.css';
import { CreatePostPage } from './pages/CreatorPostPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/dashboard" element={<CreatorDashboard />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;