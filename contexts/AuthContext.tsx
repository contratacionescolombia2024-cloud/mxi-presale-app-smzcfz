
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

// Helper function to generate a unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REF';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
          const referralCode = generateReferralCode();
          
          const { data: newProfile, error: createError } = await supabase
            .from('users_profiles')
            .insert({
              id: userId,
              email: email,
              name: email.split('@')[0],
              kyc_status: 'pending',
              is_admin: false,
              referral_code: referralCode,
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
        const referralCode = generateReferralCode();
        
        const { data: newProfile, error: createError } = await supabase
          .from('users_profiles')
          .insert({
            id: userId,
            email: email,
            name: email.split('@')[0],
            kyc_status: 'pending',
            is_admin: false,
            referral_code: referralCode,
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
        
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else {
          throw new Error(error.message);
        }
      }

      if (!data.user) {
        throw new Error('Login failed - no user data returned');
      }

      // Check if user's email is confirmed
      if (!data.user.email_confirmed_at) {
        console.error('❌ Email not confirmed for user:', email);
        throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
      }

      console.log('✅ Login successful for:', email);
      await loadUserProfile(data.user.id, email);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: Partial<User>, password: string, referralCode?: string) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      console.log('🔗 Referral code provided:', referralCode);
      
      if (!userData.email) {
        throw new Error('Email is required');
      }

      // Validate referral code if provided
      let referrerId: string | null = null;
      if (referralCode && referralCode.trim() !== '') {
        console.log('🔍 Validating referral code:', referralCode);
        const { data: referrerData, error: referrerError } = await supabase
          .from('users_profiles')
          .select('id, email, name')
          .eq('referral_code', referralCode.trim().toUpperCase())
          .maybeSingle();

        if (referrerError) {
          console.error('❌ Error validating referral code:', referrerError);
        } else if (referrerData) {
          referrerId = referrerData.id;
          console.log('✅ Valid referral code from user:', referrerData.email);
        } else {
          console.log('⚠️ Invalid referral code provided:', referralCode);
          Alert.alert('Invalid Referral Code', 'The referral code you entered is not valid. Registration will continue without a referral.');
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            name: userData.name,
            referral_code: referralCode?.trim().toUpperCase() || null,
          }
        },
      });

      if (error) {
        console.error('❌ Registration error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('Registration failed - no user data returned');
      }

      console.log('✅ Registration successful, user ID:', data.user.id);

      // Generate unique referral code for new user
      const newUserReferralCode = generateReferralCode();

      // Create user profile with referral information
      // Use a small delay to ensure auth.users record is committed
      await new Promise(resolve => setTimeout(resolve, 500));

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
          referral_code: newUserReferralCode,
          referred_by: referralCode && referrerId ? referralCode.trim().toUpperCase() : null,
        });

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        // Don't throw error here - the trigger will create the profile on email confirmation
        console.log('⚠️ Profile creation failed, but trigger will handle it on email confirmation');
      } else {
        console.log('✅ Profile created with referral code:', newUserReferralCode);
      }

      // Create referral relationship if referral code was valid
      if (referrerId) {
        console.log('🔗 Creating referral relationship...');
        const { error: referralError } = await supabase
          .from('referrals')
          .insert({
            referrer_id: referrerId,
            referred_id: data.user.id,
            level: 1,
            mxi_earned: 0,
            commission_mxi: 0,
          });

        if (referralError) {
          console.error('❌ Referral creation error:', referralError);
          // Don't throw error here, profile is already created
        } else {
          console.log('✅ Referral relationship created');
        }
      }

      console.log('✅ Registration complete');
      
      // Show success message with clear instructions
      Alert.alert(
        '✅ Registration Successful!',
        'Please check your email inbox and click the verification link to activate your account. You must verify your email before you can log in.\n\nNote: Check your spam folder if you don\'t see the email within a few minutes.',
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
      Alert.alert(
        'Email Sent!',
        'A new verification email has been sent to your inbox. Please check your email and click the verification link.\n\nNote: Check your spam folder if you don\'t see the email.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Resend failed:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔐 Sending password reset email to:', email);
      
      // Use the app's custom scheme for deep linking
      // This URL must be added to Supabase's allowed redirect URLs
      const redirectUrl = 'mxipresale://reset-password';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('❌ Password reset error:', error);
        throw error;
      }

      console.log('✅ Password reset email sent with redirect URL:', redirectUrl);
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
