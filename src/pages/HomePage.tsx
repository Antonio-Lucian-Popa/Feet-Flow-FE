import React, { useState, useEffect } from 'react';
import { PostCard } from '@/components/Post/PostCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Post } from '@/types';
import { postService } from '@/services/postService';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, TrendingUp, Clock } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadPosts();
  }, [activeTab]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getPosts(0, 20);
      setPosts(response.content);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: number, value: 1 | -1) => {
    // Implement voting logic
    console.log('Vote:', postId, value);
  };

  const handleComment = (postId: number) => {
    // Implement comment modal or navigation
    console.log('Comment on post:', postId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Heart className="h-24 w-24 text-red-500 mb-8" />
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Welcome to FeetFlow
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl">
          The premium platform for foot content creators and enthusiasts. 
          Discover exclusive content, connect with creators, and explore your passions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
            Join as Creator
          </Button>
          <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8">
            Browse Content
          </Button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="text-center">
            <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Premium Content</h3>
            <p className="text-gray-400">Access exclusive content from verified creators</p>
          </div>
          <div className="text-center">
            <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Trending</h3>
            <p className="text-gray-400">Discover popular creators and trending content</p>
          </div>
          <div className="text-center">
            <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Fresh Content</h3>
            <p className="text-gray-400">New content added daily from creators worldwide</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Feed</h1>
        <p className="text-gray-400">Discover content from creators you follow</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="trending" className="data-[state=active]:bg-red-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="following" className="data-[state=active]:bg-red-600">
            <Heart className="h-4 w-4 mr-2" />
            Following
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-red-600">
            <Clock className="h-4 w-4 mr-2" />
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-gray-700 rounded"></div>
                      <div className="w-24 h-3 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="w-full h-64 bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onVote={handleVote}
                  onComment={handleComment}
                  isSubscribed={true} // This should be determined based on user's subscriptions
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-gray-400">Start following creators to see their content here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};