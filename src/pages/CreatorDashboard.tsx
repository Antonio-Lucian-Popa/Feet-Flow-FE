import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/Post/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { Post, Subscription } from '@/types';
import { postService } from '@/services/postService';
import { subscriptionService } from '@/services/subscriptionService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  DollarSign, 
  Users, 
  Heart, 
  TrendingUp, 
  Plus, 
  Calendar,
  Eye,
  MessageCircle
} from 'lucide-react';

export const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock analytics data
  const analyticsData = [
    { name: 'Jan', earnings: 1200, subscribers: 45 },
    { name: 'Feb', earnings: 1800, subscribers: 52 },
    { name: 'Mar', earnings: 2200, subscribers: 61 },
    { name: 'Apr', earnings: 2800, subscribers: 73 },
    { name: 'May', earnings: 3200, subscribers: 89 },
    { name: 'Jun', earnings: 3800, subscribers: 102 },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (user?.id) {
        const [postsResponse, subscriptionsResponse] = await Promise.all([
          postService.getPostsByCreator(user.id),
          subscriptionService.getCreatorSubscriptions(),
        ]);
        setPosts(postsResponse.content);
        setSubscriptions(subscriptionsResponse.content);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = 3800; // Mock data
  const totalSubscribers = subscriptions.length;
  const totalLikes = posts.reduce((sum, post) => sum + (post.voteCount || 0), 0);
  const totalViews = 15420; // Mock data

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
              <div className="w-full h-20 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Creator Dashboard</h1>
          <p className="text-gray-400">Manage your content and track your performance</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalEarnings}</div>
            <p className="text-xs text-green-500">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSubscribers}</div>
            <p className="text-xs text-blue-500">+8 new this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalLikes}</div>
            <p className="text-xs text-red-500">+23% engagement</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalViews}</div>
            <p className="text-xs text-purple-500">+15% this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Earnings Overview</CardTitle>
            <CardDescription className="text-gray-400">Monthly earnings progression</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="earnings" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Subscriber Growth</CardTitle>
            <CardDescription className="text-gray-400">Monthly subscriber count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="subscribers" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Content Management */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="posts" className="data-[state=active]:bg-red-600">
            My Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="data-[state=active]:bg-red-600">
            Subscribers ({totalSubscribers})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-red-600">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} isSubscribed={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Plus className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-gray-400 mb-4">Start creating content to engage with your audience</p>
              <Button className="bg-red-600 hover:bg-red-700">
                Create Your First Post
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscribers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {subscription.subscriber?.firstName} {subscription.subscriber?.lastName}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Subscribed {new Date(subscription.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="text-white text-sm">{post.title || 'Untitled'}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-red-500 flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {post.voteCount || 0}
                        </span>
                        <span className="text-blue-500 flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {post.comments?.length || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-gray-300 text-sm">New subscriber: Sarah Johnson</p>
                    <span className="text-gray-500 text-xs">2h ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-gray-300 text-sm">Post liked by 15 users</p>
                    <span className="text-gray-500 text-xs">4h ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-gray-300 text-sm">New comment on "Summer Collection"</p>
                    <span className="text-gray-500 text-xs">6h ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};