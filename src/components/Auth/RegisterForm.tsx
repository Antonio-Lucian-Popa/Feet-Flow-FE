/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Heart, Eye, EyeOff, User, Crown } from 'lucide-react';

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['USER', 'CREATOR']),
    agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'USER',
            agreeToTerms: false,
        },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            await registerUser(data);
            toast({
                title: 'Account created successfully!',
                description: 'Please check your email to verify your account.',
            });
            navigate('/login');
        } catch (error: any) {
            toast({
                title: 'Registration failed',
                description: error.message || 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 py-8">
            <Card className="w-full max-w-md bg-gray-900 border-gray-800">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Heart className="h-12 w-12 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Join FeetFlow</CardTitle>
                    <CardDescription className="text-gray-400">
                        Create your account and start exploring
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                                    {...register('firstName')}
                                />
                                {errors.firstName && (
                                    <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                                    {...register('lastName')}
                                />
                                {errors.lastName && (
                                    <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                                    {...register('password')}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                                    {...register('confirmPassword')}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </Button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label className="text-gray-300">Account Type</Label>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                            <RadioGroupItem value="USER" id="user" className="data-[state=checked]:bg-red-600 data-[state=checked]:text-white" />
                                            <Label htmlFor="user" className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                                                <User className="h-4 w-4" />
                                                <span>Fan</span>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                            <RadioGroupItem value="CREATOR" id="creator" className="data-[state=checked]:bg-red-600 data-[state=checked]:text-white" />
                                            <Label htmlFor="creator" className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                                                <Crown className="h-4 w-4" />
                                                <span>Creator</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />

                            {selectedRole === 'CREATOR' && (
                                <p className="text-sm text-gray-400 bg-gray-800 p-2 rounded">
                                    As a creator, you'll be able to upload content and earn from subscriptions.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Controller
                                name="agreeToTerms"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="agreeToTerms"
                                        checked={field.value}
                                        onCheckedChange={(checked) => field.onChange(!!checked)}
                                        className="border-gray-600 data-[state=checked]:bg-red-600"
                                    />
                                )}
                            />

                            <Label htmlFor="agreeToTerms" className="text-sm text-gray-300">
                                I agree to the{' '}
                                <Link to="/terms" className="text-red-500 hover:text-red-400">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-red-500 hover:text-red-400">
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>
                        {errors.agreeToTerms && (
                            <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-red-500 hover:text-red-400 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};