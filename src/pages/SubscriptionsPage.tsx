import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Subscription } from '@/types';
import { subscriptionService } from '@/services/subscriptionService';
import { Heart, Calendar, Crown, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionService.getMySubscriptions();
      setSubscriptions(response.content);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (creatorId: string) => {
    try {
      await subscriptionService.unsubscribe(creatorId);
      setSubscriptions(prev => prev.filter(sub => sub.creatorId !== creatorId));
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-gray-700 rounded"></div>
                  <div className="w-32 h-3 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Subscriptions</h1>
          <p className="text-gray-400">Manage your creator subscriptions</p>
        </div>
        <Badge variant="secondary" className="bg-red-600 text-white">
          {subscriptions.length} Active
        </Badge>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={subscription.creator?.profilePictureUrl} />
                      <AvatarFallback className="bg-gray-700 text-white">
                        {subscription.creator?.firstName?.charAt(0)}
                        {subscription.creator?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-white">
                          {subscription.creator?.firstName} {subscription.creator?.lastName}
                        </h3>
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </div>
                      <p className="text-gray-400 text-sm">
                        {subscription.creator?.bio || 'Premium content creator'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Subscribed {formatDistanceToNow(new Date(subscription.startDate), { addSuffix: true })}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          Expires {new Date(subscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={subscription.isActive ? "default" : "secondary"}
                      className={subscription.isActive ? "bg-green-600" : "bg-gray-600"}
                    >
                      {subscription.isActive ? 'Active' : 'Expired'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUnsubscribe(subscription.creatorId)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Unsubscribe
                    </Button>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Monthly Cost</p>
                      <p className="text-white font-medium">$9.99</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Next Billing</p>
                      <p className="text-white font-medium">
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Auto Renew</p>
                      <p className="text-green-500 font-medium">Enabled</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Subscriptions Yet</h3>
            <p className="text-gray-400 mb-6">
              Discover amazing creators and subscribe to access their premium content
            </p>
            <Button className="bg-red-600 hover:bg-red-700">
              Browse Creators
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscription Stats */}
      {subscriptions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$127.89</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {subscriptions.filter(sub => sub.isActive).length}
              </div>
              <p className="text-xs text-gray-500">Creators</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Next Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$29.97</div>
              <p className="text-xs text-gray-500">In 5 days</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};