
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    console.log('🔐 AuthContext - Initializing...');
    
    let mounted = true;

    // Check active session with retry logic
    const checkSession = async () => {
      try {
        console.log('📱 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setIsLoading(false);
            setSessionChecked(true);
          }
          return;
        }

        console.log('📱 Session check result:', session ? 'Session found' : 'No session');
        
        if (session?.user && mounted) {
          await loadUserProfile(session.user.id, session.user.email || '');
        } else if (mounted) {
          setIsLoading(false);
          setSessionChecked(true);
        }
      } catch (error) {
        console.error('❌ Error in checkSession:', error);
        if (mounted) {
          setIsLoading(false);
          setSessionChecked(true);
        }
      }
    };

    // Initial session check with small delay to ensure AsyncStorage is ready
    const initTimer = setTimeout(() => {
      checkSession();
    }, 100);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state changed:', _event, session ? 'Session active' : 'No session');
        
        // Handle password recovery event
        if (_event === 'PASSWORD_RECOVERY') {
          console.log('🔐 Password recovery event detected in AuthContext');
          // The reset-password screen will handle the actual password update
        }
        
        // Handle sign out event
        if (_event === 'SIGNED_OUT') {
          console.log('🚪 User signed out, clearing user state');
          setUser(null);
          setIsLoading(false);
          setSessionChecked(true);
          return;
        }
        
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setIsLoading(false);
          setSessionChecked(true);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(initTimer);
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
              account_blocked: false,
              referral_code: referralCode,
              // Don't set referred_by here - the trigger will handle it
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
        console.log('🔒 Account Blocked:', data.account_blocked);
        
        // Check if account is blocked
        if (data.account_blocked) {
          console.log('⚠️ Account is blocked, logging out...');
          await supabase.auth.signOut();
          throw new Error('Your account has been blocked. Please contact support for assistance.');
        }
        
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
            account_blocked: false,
            referral_code: referralCode,
            // Don't set referred_by here - the trigger will handle it
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
    } catch (error: any) {
      console.error('❌ Failed to load user profile:', error);
      Alert.alert('Error', error.message || 'Failed to load user profile. Please try again.');
      // If account is blocked, clear the session
      if (error.message && error.message.includes('blocked')) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
      setSessionChecked(true);
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
      console.log('🔗 Referral code provided:', referralCode || 'None (will auto-link to admin)');
      
      if (!userData.email) {
        throw new Error('Email is required');
      }

      // Validate referral code if provided
      let referrerId: string | null = null;
      let validReferralCode: string | null = null;
      
      if (referralCode && referralCode.trim() !== '') {
        console.log('🔍 Validating referral code:', referralCode);
        const { data: referrerData, error: referrerError } = await supabase
          .from('users_profiles')
          .select('id, email, name, referral_code')
          .eq('referral_code', referralCode.trim().toUpperCase())
          .maybeSingle();

        if (referrerError) {
          console.error('❌ Error validating referral code:', referrerError);
        } else if (referrerData) {
          referrerId = referrerData.id;
          validReferralCode = referrerData.referral_code;
          console.log('✅ Valid referral code from user:', referrerData.email);
        } else {
          console.log('⚠️ Invalid referral code provided:', referralCode);
          Alert.alert('Invalid Referral Code', 'The referral code you entered is not valid. Your account will be automatically linked to the administrator.');
        }
      } else {
        console.log('ℹ️ No referral code provided - user will be auto-linked to admin by database trigger');
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

      // If no valid referral code was provided, don't set referred_by
      // The database trigger will automatically link to admin
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
          account_blocked: false,
          referral_code: newUserReferralCode,
          // Only set referred_by if a valid referral code was provided
          // Otherwise, the trigger will set it to admin's code
          referred_by: validReferralCode || undefined,
        });

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        // Don't throw error here - the trigger will create the profile on email confirmation
        console.log('⚠️ Profile creation failed, but trigger will handle it on email confirmation');
      } else {
        console.log('✅ Profile created with referral code:', newUserReferralCode);
        if (validReferralCode) {
          console.log('✅ Linked to referrer with code:', validReferralCode);
        } else {
          console.log('✅ Auto-linked to admin by database trigger');
        }
      }

      // Create referral relationship if referral code was valid
      if (referrerId && validReferralCode) {
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
      } else {
        console.log('ℹ️ Referral relationship will be created by database trigger (auto-link to admin)');
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
    console.log('🚪 ========== LOGOUT PROCESS STARTED ==========');
    
    try {
      // Step 1: Immediately clear user state to prevent any UI issues
      console.log('🧹 Step 1: Clearing user state immediately...');
      setUser(null);
      setIsLoading(true);
      console.log('✅ User state cleared');
      
      // Step 2: Clear all AsyncStorage keys related to authentication
      console.log('🗑️ Step 2: Clearing AsyncStorage...');
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('📋 All AsyncStorage keys:', allKeys);
        
        // Filter keys that might contain session data
        const authKeys = allKeys.filter(key => 
          key.includes('supabase') || 
          key.includes('auth') || 
          key.includes('session') ||
          key.includes('token')
        );
        
        console.log('🔑 Auth-related keys to remove:', authKeys);
        
        if (authKeys.length > 0) {
          await AsyncStorage.multiRemove(authKeys);
          console.log('✅ Removed', authKeys.length, 'auth-related keys from AsyncStorage');
        }
        
        // Also try to remove specific known keys
        const specificKeys = [
          'supabase.auth.token',
          'sb-kllolspugrhdgytwdmzp-auth-token',
          '@supabase.auth.token',
        ];
        
        for (const key of specificKeys) {
          try {
            await AsyncStorage.removeItem(key);
            console.log('✅ Removed specific key:', key);
          } catch (e) {
            console.log('⚠️ Could not remove key:', key, e);
          }
        }
        
        console.log('✅ AsyncStorage cleared successfully');
      } catch (storageError) {
        console.error('⚠️ Error clearing AsyncStorage:', storageError);
        // Continue with logout even if storage clear fails
      }
      
      // Step 3: Sign out from Supabase with scope 'global' to clear all sessions
      console.log('🔓 Step 3: Signing out from Supabase (global scope)...');
      try {
        const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
        
        if (signOutError) {
          console.error('❌ Supabase signOut error:', signOutError);
          console.error('Error details:', JSON.stringify(signOutError, null, 2));
          // Don't throw - we want to continue with local cleanup
        } else {
          console.log('✅ Supabase signOut successful');
        }
      } catch (supabaseError) {
        console.error('❌ Exception during Supabase signOut:', supabaseError);
        // Don't throw - we want to continue with local cleanup
      }
      
      // Step 4: Verify session is cleared
      console.log('🔍 Step 4: Verifying session is cleared...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.log('⚠️ Error checking session (expected after logout):', sessionError);
        }
        
        if (session) {
          console.warn('⚠️ WARNING: Session still exists after logout!', session);
          // Try one more time to clear it
          await supabase.auth.signOut({ scope: 'global' });
        } else {
          console.log('✅ Session verified as cleared');
        }
      } catch (verifyError) {
        console.log('⚠️ Could not verify session (this is OK):', verifyError);
      }
      
      // Step 5: Reset all state flags
      console.log('🔄 Step 5: Resetting state flags...');
      setIsLoading(false);
      setSessionChecked(true);
      console.log('✅ State flags reset');
      
      console.log('✅ ========== LOGOUT PROCESS COMPLETED SUCCESSFULLY ==========');
      
    } catch (error) {
      console.error('❌ ========== LOGOUT PROCESS FAILED ==========');
      console.error('Exception during logout:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Even on exception, ensure user is logged out locally
      console.log('🛡️ Forcing local logout despite error...');
      setUser(null);
      setIsLoading(false);
      setSessionChecked(true);
      
      // Clear AsyncStorage one more time as a safety measure
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const authKeys = allKeys.filter(key => 
          key.includes('supabase') || 
          key.includes('auth') || 
          key.includes('session') ||
          key.includes('token')
        );
        if (authKeys.length > 0) {
          await AsyncStorage.multiRemove(authKeys);
        }
      } catch (cleanupError) {
        console.error('⚠️ Final cleanup failed:', cleanupError);
      }
      
      console.log('✅ Local logout forced');
      
      // Re-throw with a user-friendly message
      throw new Error('Logout completed with warnings. If you experience issues, please restart the app.');
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
        isAuthenticated: !!user && sessionChecked,
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
