
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';
import { Alert } from 'react-native';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from database
  const loadUserProfile = async (userId: string, email: string) => {
    try {
      console.log('Loading user profile for:', userId, email);
      
      const { data: profile, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        
        // If profile doesn't exist, try to create a basic one
        if (error.code === 'PGRST116') {
          console.log('Profile not found for user:', userId, '- attempting to create one');
          
          // Generate a unique referral code
          const referralCode = 'REF' + Math.random().toString(36).substring(2, 10).toUpperCase();
          
          // Create a basic profile
          const { data: newProfile, error: createError } = await supabase
            .from('users_profiles')
            .insert({
              id: userId,
              name: email.split('@')[0], // Use email prefix as name
              identification: 'PENDING',
              address: 'PENDING',
              referral_code: referralCode,
              referred_by: null,
            })
            .select()
            .single();

          if (createError) {
            console.error('Failed to create profile:', createError);
            Alert.alert(
              'Profile Missing',
              'Your user profile is missing and could not be created automatically. Please contact support.',
              [{ text: 'OK' }]
            );
            return null;
          }

          console.log('Profile created successfully:', newProfile);
          
          // Show alert to user to complete their profile
          Alert.alert(
            'Complete Your Profile',
            'Your profile was created with default values. Please update your information in the Profile section.',
            [{ text: 'OK' }]
          );

          // Continue with the newly created profile
          const { data: authUser } = await supabase.auth.getUser();
          
          const userData: User = {
            id: newProfile.id,
            email: email,
            name: newProfile.name,
            identification: newProfile.identification,
            address: newProfile.address,
            createdAt: newProfile.created_at || '',
            emailVerified: authUser.user?.email_confirmed_at ? true : false,
            kycStatus: (newProfile.kyc_status as 'pending' | 'approved' | 'rejected') || 'pending',
            kycDocuments: newProfile.kyc_documents || [],
            referralCode: newProfile.referral_code,
            referredBy: newProfile.referred_by || undefined,
          };

          setUser(userData);
          
          // Check if admin
          if (email === 'admin@mxi.com' || email === 'inversionesingo@gmail.com') {
            setIsAdmin(true);
          }
          
          return userData;
        }
        return null;
      }

      if (profile) {
        const { data: authUser } = await supabase.auth.getUser();
        
        const userData: User = {
          id: profile.id,
          email: email,
          name: profile.name,
          identification: profile.identification,
          address: profile.address,
          createdAt: profile.created_at || '',
          emailVerified: authUser.user?.email_confirmed_at ? true : false,
          kycStatus: (profile.kyc_status as 'pending' | 'approved' | 'rejected') || 'pending',
          kycDocuments: profile.kyc_documents || [],
          referralCode: profile.referral_code,
          referredBy: profile.referred_by || undefined,
        };

        setUser(userData);
        
        // Check if admin
        if (email === 'admin@mxi.com' || email === 'inversionesingo@gmail.com') {
          setIsAdmin(true);
        }
        
        return userData;
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
    return null;
  };

  // Initialize auth state
  useEffect(() => {
    console.log('Initializing auth state');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id);
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email || '');
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('EMAIL_NOT_CONFIRMED');
        } else {
          throw new Error(error.message);
        }
      }

      if (data.user) {
        const profile = await loadUserProfile(data.user.id, data.user.email || '');
        
        // Profile will be created automatically if it doesn't exist
        // So we don't need to sign out the user anymore
        console.log('Login successful, profile loaded:', profile?.id);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: Partial<User>, password: string, referralCode?: string) => {
    try {
      console.log('Register attempt:', userData.email);
      
      // Validate referral code if provided
      let referredBy: string | null = null;
      if (referralCode) {
        const { data: referrer, error: referrerError } = await supabase
          .from('users_profiles')
          .select('id')
          .eq('referral_code', referralCode)
          .single();

        if (referrerError || !referrer) {
          throw new Error('Invalid referral code');
        }
        referredBy = referrer.id;
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            name: userData.name,
            identification: userData.identification,
            address: userData.address,
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('User created in auth, creating profile...');
        
        // Generate a unique referral code
        const referralCode = 'REF' + Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Create user profile
        const { error: profileError } = await supabase
          .from('users_profiles')
          .insert({
            id: data.user.id,
            name: userData.name!,
            identification: userData.identification!,
            address: userData.address!,
            referral_code: referralCode,
            referred_by: referredBy,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          
          // If profile creation fails, we should delete the auth user
          // But we can't do that from the client, so just show an error
          throw new Error('Failed to create user profile. Please contact support with error code: PROFILE_CREATE_FAILED');
        }

        console.log('Profile created successfully');

        // Show email verification alert
        Alert.alert(
          'Verify Your Email',
          'Please check your email and click the verification link to complete your registration. After verification, you can log in.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) return;
      
      console.log('Updating user:', userData);
      
      const { error } = await supabase
        .from('users_profiles')
        .update({
          name: userData.name,
          identification: userData.identification,
          address: userData.address,
          kyc_status: userData.kycStatus,
          kyc_documents: userData.kycDocuments,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      // Reload profile
      await loadUserProfile(user.id, user.email);
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      console.log('Resending verification email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      if (error) {
        console.error('Resend verification error:', error);
        throw new Error(error.message);
      }

      Alert.alert(
        'Verification Email Sent',
        'Please check your email inbox (and spam folder) for the verification link.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Resend verification failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isAdmin, 
      isLoading,
      login, 
      register, 
      logout, 
      updateUser,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
