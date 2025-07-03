import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Post } from '@/types';
import { Heart, MessageCircle, Share, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  isSubscribed?: boolean;
  onVote?: (postId: number, value: 1 | -1) => void;
  onComment?: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  isSubscribed = false,
  onVote,
  onComment 
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const handleVote = (value: 1 | -1) => {
    setIsLiked(value === 1);
    onVote?.(post.id, value);
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  const nextImage = () => {
    if (post.media && currentMediaIndex < post.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const shouldBlurContent = !post.isPublic && !isSubscribed;

  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.creator?.profilePictureUrl} />
              <AvatarFallback className="bg-gray-700 text-white">
                {post.creator?.firstName?.charAt(0)}{post.creator?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium">
                {post.creator?.firstName} {post.creator?.lastName}
              </p>
              <p className="text-gray-400 text-sm">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {!post.isPublic && (
            <Badge variant="secondary" className="bg-red-600 text-white">
              <Lock className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Media Carousel */}
        {post.media && post.media.length > 0 && (
          <div className="relative aspect-square cursor-pointer" onClick={handlePostClick}>
            <div className={`w-full h-full ${shouldBlurContent ? 'blur-lg' : ''}`}>
              {post.media[currentMediaIndex].mediaType === 'photo' ? (
                <img
                  src={post.media[currentMediaIndex].mediaUrl}
                  alt="Post content"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={post.media[currentMediaIndex].mediaUrl}
                  className="w-full h-full object-cover"
                  controls={!shouldBlurContent}
                />
              )}
            </div>

            {/* Premium Content Overlay */}
            {shouldBlurContent && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <Lock className="h-12 w-12 text-white mb-4 mx-auto" />
                  <p className="text-white text-lg font-semibold mb-2">Premium Content</p>
                  <p className="text-gray-300 text-sm mb-4">Subscribe to unlock this content</p>
                  <Button className="bg-red-600 hover:bg-red-700">
                    Subscribe Now
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            {post.media.length > 1 && !shouldBlurContent && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  disabled={currentMediaIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  disabled={currentMediaIndex === post.media.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {post.media.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentMediaIndex(index);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 cursor-pointer" onClick={handlePostClick}>
          {post.title && (
            <h3 className="text-white font-semibold text-lg mb-2">{post.title}</h3>
          )}
          {post.description && (
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{post.description}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 border-t border-gray-800">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(1)}
              className={`text-gray-400 hover:text-red-500 ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`h-5 w-5 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.voteCount || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment?.(post.id)}
              className="text-gray-400 hover:text-white"
            >
              <MessageCircle className="h-5 w-5 mr-1" />
              <span>{post.comments?.length || 0}</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};