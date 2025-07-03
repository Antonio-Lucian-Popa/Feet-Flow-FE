import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/Post/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { User, Post } from '@/types';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService';
import { subscriptionService } from '@/services/subscriptionService';
import { Heart, Users, Calendar, Settings, MessageCircle, Share } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadPosts();
      if (!isOwnProfile) {
        checkSubscription();
      }
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      if (userId) {
        const user = await userService.getUser(userId);
        setProfileUser(user);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      if (userId) {
        const response = await postService.getPostsByCreator(userId);
        setPosts(response.content);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      if (userId) {
        const subscribed = await subscriptionService.checkSubscription(userId);
        setIsSubscribed(subscribed);
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (userId) {
        await subscriptionService.subscribe(userId);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      if (userId) {
        await subscriptionService.unsubscribe(userId);
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="w-48 h-6 bg-gray-700 rounded"></div>
              <div className="w-32 h-4 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">User not found</h2>
        <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileUser.profilePictureUrl} />
              <AvatarFallback className="bg-gray-700 text-white text-2xl">
                {profileUser.firstName.charAt(0)}{profileUser.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    {profileUser.firstName} {profileUser.lastName}
                  </h1>
                  {profileUser.role === 'creator' && (
                    <Badge className="bg-red-600 text-white">Creator</Badge>
                  )}
                </div>
                <p className="text-gray-400">
                  Joined {formatDistanceToNow(new Date(profileUser.createdAt), { addSuffix: true })}
                </p>
              </div>

              {profileUser.bio && (
                <p className="text-gray-300">{profileUser.bio}</p>
              )}

              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>1.2K followers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>5.4K likes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{posts.length} posts</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {isOwnProfile ? (
                <Button
                  onClick={() => navigate('/settings')}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  {profileUser.role === 'creator' && (
                    <Button
                      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                      className={isSubscribed ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}
                    >
                      {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                    </Button>
                  )}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="posts" className="data-[state=active]:bg-red-600">
            Posts ({posts.length})
          </TabsTrigger>
          {profileUser.role === 'creator' && (
            <TabsTrigger value="about" className="data-[state=active]:bg-red-600">
              About
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          {postsLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
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
                  isSubscribed={isOwnProfile || isSubscribed}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-gray-400">
                {isOwnProfile ? 'Start sharing your content!' : 'This creator hasn\'t posted anything yet.'}
              </p>
            </div>
          )}
        </TabsContent>

        {profileUser.role === 'creator' && (
          <TabsContent value="about" className="mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">About {profileUser.firstName}</h3>
                <div className="space-y-4 text-gray-300">
                  <p>{profileUser.bio || 'No bio available.'}</p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div>
                      <p className="text-sm text-gray-400">Member since</p>
                      <p className="font-medium">{new Date(profileUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Content type</p>
                      <p className="font-medium">Premium foot content</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};