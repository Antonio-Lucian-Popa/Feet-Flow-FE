import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { postService } from '@/services/postService';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image, Video, Lock, Globe } from 'lucide-react';

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title must be less than 150 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  isPublic: z.boolean(),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

export const CreatePostPage: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      isPublic: false,
    },
  });

  const isPublic = watch('isPublic');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      if (!isImage && !isVideo) {
        toast({
          title: 'Invalid file type',
          description: 'Please select only image or video files.',
          variant: 'destructive',
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: 'File too large',
          description: 'Please select files smaller than 50MB.',
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    });

    if (mediaFiles.length + validFiles.length > 10) {
      toast({
        title: 'Too many files',
        description: 'You can upload a maximum of 10 files per post.',
        variant: 'destructive',
      });
      return;
    }

    setMediaFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreatePostFormData) => {
    if (mediaFiles.length === 0) {
      toast({
        title: 'No media selected',
        description: 'Please select at least one image or video.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await postService.createPost({
        title: data.title,
        description: data.description,
        isPublic: data.isPublic,
        mediaFiles,
      });

      toast({
        title: 'Post created successfully!',
        description: 'Your content has been uploaded and is now live.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Failed to create post',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Create New Post</h1>
        <p className="text-gray-400">Share your content with your audience</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Post Details */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Post Details</CardTitle>
            <CardDescription className="text-gray-400">
              Add a title and description for your post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">Title *</Label>
              <Input
                id="title"
                placeholder="Enter a catchy title..."
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell your audience about this content..."
                rows={4}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {isPublic ? (
                    <Globe className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-red-500" />
                  )}
                  <Label htmlFor="isPublic" className="text-gray-300">
                    {isPublic ? 'Public Post' : 'Premium Content'}
                  </Label>
                </div>
                <p className="text-sm text-gray-400">
                  {isPublic 
                    ? 'Everyone can see this post' 
                    : 'Only subscribers can access this content'
                  }
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setValue('isPublic', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Media Upload</CardTitle>
            <CardDescription className="text-gray-400">
              Upload images or videos (max 10 files, 50MB each)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Click to upload media files</p>
                <p className="text-gray-500 text-sm">
                  Supports images and videos up to 50MB each
                </p>
              </label>
            </div>

            {/* Media Previews */}
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                      {mediaFiles[index].type.startsWith('image/') ? (
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 left-2 bg-black/50 text-white"
                    >
                      {mediaFiles[index].type.startsWith('image/') ? (
                        <Image className="h-3 w-3 mr-1" />
                      ) : (
                        <Video className="h-3 w-3 mr-1" />
                      )}
                      {mediaFiles[index].type.startsWith('image/') ? 'Image' : 'Video'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || mediaFiles.length === 0}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Creating Post...' : 'Create Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};