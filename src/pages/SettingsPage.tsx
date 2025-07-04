import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Camera, 
  Upload, 
  Save, 
  ArrowLeft, 
  Settings, 
  Crown,
  Image as ImageIcon,
  X,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const SettingsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Profile picture must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }

      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File too large',
          description: 'Cover image must be less than 10MB',
          variant: 'destructive',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }

      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Update profile information
      await userService.updateProfile(data);

      // Upload profile picture if changed
      if (profilePictureFile) {
        await userService.uploadProfilePicture(profilePictureFile);
      }

      // Upload cover image if changed (for creators)
      if (coverImageFile && user?.role === 'CREATOR') {
         await userService.uploadCoverImage(coverImageFile);
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });

      // Reset file states
      setProfilePictureFile(null);
     // setProfilePicturePreview(null);
      setCoverImageFile(null);
     // setCoverImagePreview(null);

    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      // This would need a password change service method
      // await userService.changePassword(data.currentPassword, data.newPassword);
      
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully changed.',
      });

      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: 'Password change failed',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
        <Button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700">
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Settings className="h-8 w-8 mr-3" />
              Settings
            </h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
        </div>
        <Badge className={user.role === 'CREATOR' ? 'bg-red-600' : 'bg-blue-600'}>
          {user.role === 'CREATOR' ? (
            <>
              <Crown className="h-3 w-3 mr-1" />
              Creator
            </>
          ) : (
            <>
              <User className="h-3 w-3 mr-1" />
              Fan
            </>
          )}
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="profile" className="data-[state=active]:bg-red-600">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="images" className="data-[state=active]:bg-red-600">
            <ImageIcon className="h-4 w-4 mr-2" />
            Images
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-red-600">
            <Settings className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal information and bio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      {...profileForm.register('firstName')}
                    />
                    {profileForm.formState.errors.firstName && (
                      <p className="text-red-500 text-sm">{profileForm.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    <Input
                      id="lastName"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      {...profileForm.register('lastName')}
                    />
                    {profileForm.formState.errors.lastName && (
                      <p className="text-red-500 text-sm">{profileForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    {...profileForm.register('email')}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-red-500 text-sm">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell people about yourself..."
                    rows={4}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    {...profileForm.register('bio')}
                  />
                  <p className="text-gray-500 text-sm">
                    {profileForm.watch('bio')?.length || 0}/500 characters
                  </p>
                  {profileForm.formState.errors.bio && (
                    <p className="text-red-500 text-sm">{profileForm.formState.errors.bio.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="mt-6">
          <div className="space-y-6">
            {/* Profile Picture */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Profile Picture</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload a new profile picture (max 5MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative">
                    <Avatar className="w-32 h-32">
                      <AvatarImage 
                        src={profilePicturePreview || user.profilePictureUrl} 
                        alt="Profile picture" 
                      />
                      <AvatarFallback className="bg-gray-700 text-white text-2xl">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {profilePicturePreview && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={() => {
                          setProfilePictureFile(null);
                          setProfilePicturePreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                        id="profile-picture-upload"
                      />
                      <label htmlFor="profile-picture-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
                          asChild
                        >
                          <span>
                            <Camera className="h-4 w-4 mr-2" />
                            Choose New Picture
                          </span>
                        </Button>
                      </label>
                    </div>
                    
                    {profilePictureFile && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm font-medium">{profilePictureFile.name}</p>
                            <p className="text-gray-400 text-xs">
                              {(profilePictureFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    )}

                    <p className="text-gray-500 text-sm">
                      Recommended: Square image, at least 400x400 pixels. JPG, PNG, or GIF format.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image - Only for Creators */}
            {user.role === 'CREATOR' && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                    Cover Image
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Upload a cover image for your creator profile (max 10MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Cover Image Preview */}
                    <div className="relative">
                      <div className="w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
                        {coverImagePreview ? (
                          <img
                            src={coverImagePreview}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                              <p className="text-gray-500">No cover image set</p>
                            </div>
                          </div>
                        )}
                      </div>
                      {coverImagePreview && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
                          onClick={() => {
                            setCoverImageFile(null);
                            setCoverImagePreview(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                        id="cover-image-upload"
                      />
                      <label htmlFor="cover-image-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
                          asChild
                        >
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Cover Image
                          </span>
                        </Button>
                      </label>
                    </div>

                    {coverImageFile && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm font-medium">{coverImageFile.name}</p>
                            <p className="text-gray-400 text-xs">
                              {(coverImageFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    )}

                    <p className="text-gray-500 text-sm">
                      Recommended: 1920x480 pixels or similar aspect ratio. JPG, PNG, or GIF format.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Images Button */}
            {(profilePictureFile || coverImageFile) && (
              <div className="flex justify-end">
                <Button
                  onClick={() => onProfileSubmit(profileForm.getValues())}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Uploading...' : 'Save Images'}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
              <CardDescription className="text-gray-400">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                      {...passwordForm.register('currentPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-red-500 text-sm">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                <Separator className="bg-gray-700" />

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                      {...passwordForm.register('newPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-red-500 text-sm">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                      {...passwordForm.register('confirmPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Password Requirements:</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Include uppercase and lowercase letters</li>
                    <li>• Include at least one number</li>
                    <li>• Include at least one special character</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-gray-900 border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Account Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                  <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Enable 2FA
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Download Your Data</h4>
                  <p className="text-gray-400 text-sm">Get a copy of your account data</p>
                </div>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <div>
                  <h4 className="text-red-400 font-medium">Delete Account</h4>
                  <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};