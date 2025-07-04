import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Post, Comment } from '@/types';
import { postService } from '@/services/postService';
import { commentService } from '@/services/commentService';
import { voteService } from '@/services/voteService';
import { subscriptionService } from '@/services/subscriptionService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Send,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      if (postId) {
        const postData = await postService.getPost(postId);
        setPost(postData);
        setIsLiked(postData.userVote === 1);
        
        // Check subscription status
        await checkSubscriptionStatus(postData);
      }
    } catch (error) {
      console.error('Failed to load post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async (postData: Post) => {
    if (!postData.creatorId || !user) {
      setIsSubscribed(false);
      return;
    }

    // If it's the creator's own post, they can see it
    if (user.id === postData.creatorId) {
      setIsSubscribed(true);
      return;
    }

    // Check if user is subscribed to creator
    try {
      const subscribed = await subscriptionService.checkSubscription(postData.creatorId);
      console.log('Subscription check result:', subscribed); // Debug log
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Failed to check subscription:', error);
      setIsSubscribed(false);
    }
  };

  const loadComments = async () => {
    try {
      if (postId) {
        const response = await commentService.getPostComments(postId);
        setComments(response.content);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleVote = async (value: 1 | -1) => {
    try {
      if (postId) {
        await voteService.votePost(postId, value);
        setIsLiked(value === 1);
        // Update vote count in post
        if (post) {
          setPost({
            ...post,
            voteCount: (post.voteCount || 0) + (isLiked ? -1 : 1),
            userVote: value
          });
        }
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !postId) return;

    try {
      const comment = await commentService.createComment(postId, newComment);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully.',
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const handleSubscribe = async () => {
    if (!post?.creator?.id) return;
    
    setSubscriptionLoading(true);
    try {
      await subscriptionService.subscribe(post.creator.id);
      setIsSubscribed(true);
      toast({
        title: 'Subscribed!',
        description: `You are now subscribed to ${post.creator.firstName} ${post.creator.lastName}`,
      });
    } catch (error) {
      console.error('Failed to subscribe:', error);
      toast({
        title: 'Error',
        description: 'Failed to subscribe',
        variant: 'destructive',
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const nextImage = () => {
    if (post?.media && currentMediaIndex < post.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  // FIXED: Correct logic for blurring premium content
  const shouldBlurContent = !post?.isPublic && !isSubscribed;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-900 rounded-lg p-6 animate-pulse">
          <div className="w-full h-96 bg-gray-700 rounded-lg mb-4"></div>
          <div className="space-y-2">
            <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
            <div className="w-1/2 h-3 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Post not found</h2>
        <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Post Content */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.creator?.profilePictureUrl} />
                <AvatarFallback className="bg-gray-700 text-white">
                  {post.creator?.firstName?.charAt(0)}{post.creator?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium text-lg">
                  {post.creator?.firstName} {post.creator?.lastName}
                </p>
                <p className="text-gray-400 text-sm">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!post.isPublic && (
                <Badge variant="secondary" className="bg-red-600 text-white">
                  <Lock className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Media Display */}
          {post.media && post.media.length > 0 && (
            <div className="relative">
              <div className={`w-full ${shouldBlurContent ? 'blur-lg' : ''}`}>
                {post.media[currentMediaIndex].mediaType === 'photo' ? (
                  <img
                    src={post.media[currentMediaIndex].mediaUrl}
                    alt="Post content"
                    className="w-full max-h-[600px] object-contain bg-black"
                  />
                ) : (
                  <video
                    src={post.media[currentMediaIndex].mediaUrl}
                    className="w-full max-h-[600px] object-contain bg-black"
                    controls={!shouldBlurContent}
                    poster={post.media[currentMediaIndex].thumbnailUrl}
                  />
                )}
              </div>

              {/* Premium Content Overlay */}
              {shouldBlurContent && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="text-center p-8">
                    <Lock className="h-20 w-20 text-white mb-6 mx-auto" />
                    <p className="text-white text-2xl font-semibold mb-3">Premium Content</p>
                    <p className="text-gray-300 mb-6 max-w-md">
                      Subscribe to {post.creator?.firstName} {post.creator?.lastName} to unlock this exclusive content
                    </p>
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                      onClick={handleSubscribe}
                      disabled={subscriptionLoading}
                    >
                      {subscriptionLoading ? 'Subscribing...' : 'Subscribe Now'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Arrows - Only show if content is not blurred */}
              {post.media.length > 1 && !shouldBlurContent && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={prevImage}
                    disabled={currentMediaIndex === 0}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={nextImage}
                    disabled={currentMediaIndex === post.media.length - 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  {/* Media Counter */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentMediaIndex + 1} / {post.media.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Post Text Content */}
          <div className="p-6">
            {post.title && (
              <h1 className={`text-2xl font-bold text-white mb-3 ${
                shouldBlurContent ? 'blur-sm' : ''
              }`}>
                {post.title}
              </h1>
            )}
            {post.description && (
              <p className={`text-gray-300 leading-relaxed ${
                shouldBlurContent ? 'blur-sm' : ''
              }`}>
                {post.description}
              </p>
            )}
            {shouldBlurContent && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Subscribe to read the full content and view all media
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-4 border-t border-gray-800 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  onClick={() => handleVote(1)}
                  className={`text-gray-400 hover:text-red-500 ${
                    isLiked ? 'text-red-500' : ''
                  }`}
                  disabled={shouldBlurContent}
                >
                  <Heart className={`h-6 w-6 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-lg">{shouldBlurContent ? '?' : (post.voteCount || 0)}</span>
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  disabled={shouldBlurContent}
                >
                  <MessageCircle className="h-6 w-6 mr-2" />
                  <span className="text-lg">{shouldBlurContent ? '?' : comments.length}</span>
                </Button>
              </div>
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white"
                disabled={shouldBlurContent}
              >
                <Share className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <h3 className="text-xl font-semibold text-white">
            Comments ({shouldBlurContent ? '?' : comments.length})
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {shouldBlurContent ? (
            <div className="text-center py-8">
              <Lock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Subscribe to view and post comments</p>
            </div>
          ) : (
            <>
              {/* Add Comment */}
              {user && (
                <div className="flex space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profilePictureUrl} />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>
              )}

              <Separator className="bg-gray-700" />

              {/* Comments List */}
              {commentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-32 h-4 bg-gray-700 rounded"></div>
                        <div className="w-full h-3 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.user?.profilePictureUrl} />
                        <AvatarFallback className="bg-gray-700 text-white">
                          {comment.user?.firstName?.charAt(0)}{comment.user?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-white font-medium text-sm">
                              {comment.user?.firstName} {comment.user?.lastName}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};