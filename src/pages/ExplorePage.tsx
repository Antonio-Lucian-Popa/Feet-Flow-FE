import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/types';
import { userService } from '@/services/userService';
import { subscriptionService } from '@/services/subscriptionService';
import { Search, Heart, Users, Crown, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExplorePage: React.FC = () => {
  const [creators, setCreators] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [subscribedCreators, setSubscribedCreators] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      const response = await userService.getCreators();
      setCreators(response.content);

      // Check subscription status for each creator
      const subscriptionChecks = response.content.map(creator =>
        subscriptionService.checkSubscription(creator.id)
      );
      const subscriptionStatuses = await Promise.all(subscriptionChecks);

      const subscribedSet = new Set<string>();
      response.content.forEach((creator, index) => {
        if (subscriptionStatuses[index]) {
          subscribedSet.add(creator.id);
        }
      });
      setSubscribedCreators(subscribedSet);
    } catch (error) {
      console.error('Failed to load creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadCreators();
      return;
    }

    try {
      setLoading(true);
      const response = await userService.searchUsers(searchQuery);
      setCreators(response.content.filter(user => user.role === 'CREATOR'));
    } catch (error) {
      console.error('Failed to search creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (creatorId: string) => {
    try {
      await subscriptionService.subscribe(creatorId);
      setSubscribedCreators(prev => new Set([...prev, creatorId]));
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const handleUnsubscribe = async (creatorId: string) => {
    try {
      await subscriptionService.unsubscribe(creatorId);
      setSubscribedCreators(prev => {
        const newSet = new Set(prev);
        newSet.delete(creatorId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  // Mock featured creators for demo
  const featuredCreators = creators.slice(0, 3);
  const trendingCreators = creators.slice(3, 8);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
                <div className="w-1/2 h-3 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Explore Creators</h1>
        <p className="text-gray-400 text-lg">Discover amazing content creators and their premium content</p>

        {/* Search */}
        <div className="max-w-md mx-auto flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <Button onClick={handleSearch} className="bg-red-600 hover:bg-red-700">
            Search
          </Button>
        </div>
      </div>

      {/* Featured Creators */}
      {featuredCreators.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">Featured Creators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCreators.map((creator) => (
              <Card key={creator.id} className="bg-gray-900 border-gray-800 overflow-hidden">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-red-500 to-pink-600"></div>
                  <Badge className="absolute top-4 left-4 bg-yellow-500 text-black">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                  <Avatar className="absolute bottom-4 left-4 w-16 h-16 border-4 border-gray-900">
                    <AvatarImage src={creator.profilePictureUrl} />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {creator.firstName.charAt(0)}{creator.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {creator.firstName} {creator.lastName}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {creator.bio || 'Premium content creator specializing in foot photography and styling.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {creator.stats?.followersCount.toLocaleString() ?? 0} followers
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {creator.stats?.likesCount.toLocaleString() ?? 0} likes
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => navigate(`/profile/${creator.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600 text-black hover:bg-gray-700 hover:text-white"
                    >
                      View Profile
                    </Button>
                    {/* <Button
                      onClick={() => subscribedCreators.has(creator.id)
                        ? handleUnsubscribe(creator.id)
                        : handleSubscribe(creator.id)
                      }
                      size="sm"
                      className={subscribedCreators.has(creator.id)
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-red-600 hover:bg-red-700'
                      }
                    >
                      {subscribedCreators.has(creator.id) ? 'Subscribed' : 'Subscribe'}
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Browse Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-red-600">
            All Creators
          </TabsTrigger>
          <TabsTrigger value="trending" className="data-[state=active]:bg-red-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-red-600">
            New Creators
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <Card key={creator.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={creator.profilePictureUrl} />
                      <AvatarFallback className="bg-gray-700 text-white">
                        {creator.firstName.charAt(0)}{creator.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {creator.firstName} {creator.lastName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Crown className="h-3 w-3 text-yellow-500" />
                        <span className="text-gray-400 text-sm">Creator</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {creator.bio || 'Premium content creator'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{creator.stats?.followersCount.toLocaleString() ?? 0} followers</span>
                    <span>{creator.stats?.likesCount.toLocaleString() ?? 0} likes</span>
                    <span>{creator.stats?.subscribersCount ?? 0} subs</span> {/* sau $9.99/month dacă vrei monetizare */}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => navigate(`/profile/${creator.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600 text-black hover:bg-gray-700 hover:text-white"
                    >
                      View
                    </Button>
                    {/* <Button
                      onClick={() => subscribedCreators.has(creator.id)
                        ? handleUnsubscribe(creator.id)
                        : handleSubscribe(creator.id)
                      }
                      size="sm"
                      className={subscribedCreators.has(creator.id)
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-red-600 hover:bg-red-700'
                      }
                    >
                      {subscribedCreators.has(creator.id) ? 'Subscribed' : 'Subscribe'}
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingCreators.map((creator, index) => (
              <Card key={creator.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={creator.profilePictureUrl} />
                        <AvatarFallback className="bg-gray-700 text-white">
                          {creator.firstName.charAt(0)}{creator.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {creator.firstName} {creator.lastName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-500 text-sm">+15% this week</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {creator.bio || 'Trending creator with amazing content'}
                  </p>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => navigate(`/profile/${creator.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => subscribedCreators.has(creator.id)
                        ? handleUnsubscribe(creator.id)
                        : handleSubscribe(creator.id)
                      }
                      size="sm"
                      className={subscribedCreators.has(creator.id)
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-red-600 hover:bg-red-700'
                      }
                    >
                      {subscribedCreators.has(creator.id) ? 'Subscribed' : 'Subscribe'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.slice(-6).map((creator) => (
              <Card key={creator.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={creator.profilePictureUrl} />
                      <AvatarFallback className="bg-gray-700 text-white">
                        {creator.firstName.charAt(0)}{creator.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {creator.firstName} {creator.lastName}
                      </h3>
                      <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                        New Creator
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {creator.bio || 'New to the platform, welcome them!'}
                  </p>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => navigate(`/profile/${creator.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => subscribedCreators.has(creator.id)
                        ? handleUnsubscribe(creator.id)
                        : handleSubscribe(creator.id)
                      }
                      size="sm"
                      className={subscribedCreators.has(creator.id)
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-red-600 hover:bg-red-700'
                      }
                    >
                      {subscribedCreators.has(creator.id) ? 'Subscribed' : 'Subscribe'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};