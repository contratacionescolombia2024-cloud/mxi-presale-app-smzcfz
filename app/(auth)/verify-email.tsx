
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { supabase } from '@/app/integrations/supabase/client';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 70,
    marginBottom: 32,
    resizeMode: 'contain',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    ...buttonStyles.primary,
    minWidth: 200,
  },
  buttonText: {
    ...buttonStyles.text,
  },
  secondaryButton: {
    ...buttonStyles.secondary,
    minWidth: 200,
    marginTop: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default function VerifyEmailScreen() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error checking session:', error);
        setErrorMessage('Failed to verify email. The verification link may have expired.');
        setIsSuccess(false);
      } else if (session?.user) {
        console.log('✅ Email verified successfully for:', session.user.email);
        setIsSuccess(true);
      } else {
        console.log('⚠️ No active session found');
        setErrorMessage('Email verification link may have expired or already been used.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('❌ Verification check failed:', error);
      setErrorMessage('An unexpected error occurred during verification.');
      setIsSuccess(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
    router.replace('/(auth)/login');
  };

  if (isVerifying) {
    return (
      <SafeAreaView style={styles.container}>
        <Image
          source={require('@/assets/images/147d13e8-074e-4fdc-8329-5701bd44e857.jpeg')}
          style={styles.logo}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.message, { marginTop: 24 }]}>
          Verifying your email address...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('@/assets/images/147d13e8-074e-4fdc-8329-5701bd44e857.jpeg')}
        style={styles.logo}
      />
      
      <View style={[styles.iconContainer, !isSuccess && styles.errorIconContainer]}>
        <IconSymbol
          ios_icon_name={isSuccess ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
          android_material_icon_name={isSuccess ? 'check_circle' : 'cancel'}
          size={60}
          color={isSuccess ? colors.success : colors.error}
        />
      </View>

      <Text style={styles.title}>
        {isSuccess ? 'Email Verified!' : 'Verification Failed'}
      </Text>

      <Text style={styles.message}>
        {isSuccess
          ? 'Your email has been successfully verified. You can now log in to your MXI account and start participating in the pre-sale.'
          : errorMessage || 'We couldn\'t verify your email. The link may have expired or already been used. Please try logging in or request a new verification email.'}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>
          {isSuccess ? 'Continue to Login' : 'Go to Login'}
        </Text>
      </TouchableOpacity>

      {!isSuccess && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.secondaryButtonText}>
            Register New Account
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
