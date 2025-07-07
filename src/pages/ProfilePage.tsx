import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/Post/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { User, Post, UserStats } from '@/types';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService';
import { subscriptionService } from '@/services/subscriptionService';
import { useToast } from '@/hooks/use-toast';
import { Heart, Users, Calendar, Settings, MessageCircle, Share, UserPlus, UserMinus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadUserStats();
      loadPosts();
      if (!isOwnProfile) {
        checkSubscription();
        checkFollowStatus();
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
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      if (userId) {
        const stats = await userService.getUserStats(userId);
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setStatsLoading(false);
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

  const checkFollowStatus = async () => {
    try {
      if (userId) {
        const following = await userService.checkFollowStatus(userId);
        setIsFollowing(following);
      }
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  const handleSubscribe = async () => {
    setActionLoading(true);
    try {
      if (userId) {
        await subscriptionService.subscribe(userId);
        setIsSubscribed(true);
        // Refresh stats to update subscriber count
        await loadUserStats();
        toast({
          title: 'Subscribed!',
          description: `You are now subscribed to ${profileUser?.firstName} ${profileUser?.lastName}`,
        });
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      toast({
        title: 'Error',
        description: 'Failed to subscribe',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setActionLoading(true);
    try {
      if (userId) {
        await subscriptionService.unsubscribe(userId);
        setIsSubscribed(false);
        // Refresh stats to update subscriber count
        await loadUserStats();
        toast({
          title: 'Unsubscribed',
          description: `You have unsubscribed from ${profileUser?.firstName} ${profileUser?.lastName}`,
        });
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollow = async () => {
    setActionLoading(true);
    try {
      if (userId) {
        await userService.followUser(userId);
        setIsFollowing(true);
        // Refresh stats to update follower count
        await loadUserStats();
        toast({
          title: 'Following!',
          description: `You are now following ${profileUser?.firstName} ${profileUser?.lastName}`,
        });
      }
    } catch (error) {
      console.error('Failed to follow:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setActionLoading(true);
    try {
      if (userId) {
        await userService.unfollowUser(userId);
        setIsFollowing(false);
        // Refresh stats to update follower count
        await loadUserStats();
        toast({
          title: 'Unfollowed',
          description: `You have unfollowed ${profileUser?.firstName} ${profileUser?.lastName}`,
        });
      }
    } catch (error) {
      console.error('Failed to unfollow:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfollow user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
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
                  {profileUser.role === 'CREATOR' && (
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
                  <span>
                    {statsLoading ? (
                      <span className="inline-block w-8 h-4 bg-gray-700 rounded animate-pulse"></span>
                    ) : (
                      `${userStats?.followersCount || 0} followers`
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>
                    {statsLoading ? (
                      <span className="inline-block w-8 h-4 bg-gray-700 rounded animate-pulse"></span>
                    ) : (
                      `${userStats?.likesCount || 0} likes`
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {statsLoading ? (
                      <span className="inline-block w-8 h-4 bg-gray-700 rounded animate-pulse"></span>
                    ) : (
                      `${userStats?.postsCount || 0} posts`
                    )}
                  </span>
                </div>
                {profileUser.role === 'CREATOR' && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {statsLoading ? (
                        <span className="inline-block w-8 h-4 bg-gray-700 rounded animate-pulse"></span>
                      ) : (
                        `${userStats?.subscribersCount || 0} subscribers`
                      )}
                    </span>
                  </div>
                )}
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
                  {/* Follow/Unfollow Button */}
                  <Button
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    disabled={actionLoading}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        {actionLoading ? 'Unfollowing...' : 'Unfollow'}
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {actionLoading ? 'Following...' : 'Follow'}
                      </>
                    )}
                  </Button>

                  {/* Subscribe/Unsubscribe Button for Creators */}
                  {profileUser.role === 'CREATOR' && (
                    <Button
                      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                      disabled={actionLoading}
                      className={isSubscribed ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}
                    >
                      {isSubscribed ? 
                        (actionLoading ? 'Unsubscribing...' : 'Unsubscribe') : 
                        (actionLoading ? 'Subscribing...' : 'Subscribe')
                      }
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
            Posts ({postsLoading ? '...' : posts.length})
          </TabsTrigger>
          {profileUser.role === 'CREATOR' && (
            <TabsTrigger value="about" className="data-[state=active]:bg-red-600">
              About
            </TabsTrigger>
          )}
          {!isOwnProfile && (
            <TabsTrigger value="stats" className="data-[state=active]:bg-red-600">
              Stats
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
                  isSubscribed={isOwnProfile || isSubscribed || post.isPublic}
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

        {profileUser.role === 'CREATOR' && (
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
                    <div>
                      <p className="text-sm text-gray-400">Subscription price</p>
                      <p className="font-medium">$9.99/month</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total posts</p>
                      <p className="font-medium">
                        {statsLoading ? '...' : (userStats?.postsCount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : (userStats?.followersCount || 0)}
                </p>
                <p className="text-gray-400 text-sm">Followers</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : (userStats?.likesCount || 0)}
                </p>
                <p className="text-gray-400 text-sm">Total Likes</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : (userStats?.postsCount || 0)}
                </p>
                <p className="text-gray-400 text-sm">Posts</p>
              </CardContent>
            </Card>

            {profileUser.role === 'CREATOR' && (
              <>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {statsLoading ? '...' : (userStats?.subscribersCount || 0)}
                    </p>
                    <p className="text-gray-400 text-sm">Subscribers</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6 text-center">
                    <Heart className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {statsLoading ? '...' : Math.round((userStats?.likesCount || 0) / Math.max(userStats?.postsCount || 1, 1))}
                    </p>
                    <p className="text-gray-400 text-sm">Avg Likes/Post</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {formatDistanceToNow(new Date(profileUser.createdAt), { addSuffix: false })}
                    </p>
                    <p className="text-gray-400 text-sm">Active Since</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};