
import { Alert } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { User } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthContext - Initializing...');
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 Initial session check:', session ? 'Session found' : 'No session');
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('🔄 Auth state changed:', _event, session ? 'Session active' : 'No session');
        
        // Handle password recovery event
        if (_event === 'PASSWORD_RECOVERY') {
          console.log('🔐 Password recovery event detected in AuthContext');
          // The reset-password screen will handle the actual password update
        }
        
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log('🛑 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      console.log('👤 Loading user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading profile:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('📝 Creating new profile for user:', userId);
          const { data: newProfile, error: createError } = await supabase
            .from('users_profiles')
            .insert({
              id: userId,
              email: email,
              name: email.split('@')[0],
              kyc_status: 'pending',
              is_admin: false,
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ Error creating profile:', createError);
            throw createError;
          }

          console.log('✅ Profile created:', newProfile);
          setUser({
            id: newProfile.id,
            email: newProfile.email,
            name: newProfile.name,
            identification: newProfile.identification,
            address: newProfile.address,
            kycStatus: newProfile.kyc_status,
            isAdmin: newProfile.is_admin || false,
            referralCode: newProfile.referral_code,
            referredBy: newProfile.referred_by,
          });
        } else {
          throw error;
        }
      } else if (data) {
        console.log('✅ Profile loaded:', data);
        console.log('🔑 Is Admin:', data.is_admin);
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          identification: data.identification,
          address: data.address,
          kycStatus: data.kyc_status,
          isAdmin: data.is_admin || false,
          referralCode: data.referral_code,
          referredBy: data.referred_by,
        });
      } else {
        console.log('⚠️ No profile found, creating one...');
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('users_profiles')
          .insert({
            id: userId,
            email: email,
            name: email.split('@')[0],
            kyc_status: 'pending',
            is_admin: false,
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating profile:', createError);
          throw createError;
        }

        console.log('✅ Profile created:', newProfile);
        setUser({
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name,
          identification: newProfile.identification,
          address: newProfile.address,
          kycStatus: newProfile.kyc_status,
          isAdmin: newProfile.is_admin || false,
          referralCode: newProfile.referral_code,
          referredBy: newProfile.referred_by,
        });
      }
    } catch (error) {
      console.error('❌ Failed to load user profile:', error);
      Alert.alert('Error', 'Failed to load user profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('Login failed - no user data returned');
      }

      console.log('✅ Login successful for:', email);
      await loadUserProfile(data.user.id, email);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: Partial<User>, password: string) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
      if (!userData.email) {
        throw new Error('Email is required');
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
        },
      });

      if (error) {
        console.error('❌ Registration error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('Registration failed - no user data returned');
      }

      console.log('✅ Registration successful, creating profile...');

      // Create user profile
      const { error: profileError } = await supabase
        .from('users_profiles')
        .insert({
          id: data.user.id,
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          identification: userData.identification,
          address: userData.address,
          kyc_status: 'pending',
          is_admin: false,
        });

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        throw profileError;
      }

      console.log('✅ Registration complete');
      Alert.alert(
        'Registration Successful',
        'Please check your email to verify your account before logging in.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Logout error:', error);
        throw error;
      }
      console.log('✅ Logout successful');
      setUser(null);
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user?.id) {
      throw new Error('No user logged in');
    }

    try {
      console.log('📝 Updating user profile:', user.id);
      
      const { error } = await supabase
        .from('users_profiles')
        .update({
          name: userData.name,
          identification: userData.identification,
          address: userData.address,
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }

      console.log('✅ Profile updated successfully');
      setUser({ ...user, ...userData });
    } catch (error) {
      console.error('❌ Update failed:', error);
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      console.log('📧 Resending verification email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
        },
      });

      if (error) {
        console.error('❌ Resend error:', error);
        throw error;
      }

      console.log('✅ Verification email sent');
      Alert.alert('Success', 'Verification email sent. Please check your inbox.');
    } catch (error) {
      console.error('❌ Resend failed:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔐 Sending password reset email to:', email);
      
      // Use the app's custom scheme for deep linking
      const redirectUrl = 'natively://reset-password';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('❌ Password reset error:', error);
        throw error;
      }

      console.log('✅ Password reset email sent');
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        resendVerificationEmail,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
