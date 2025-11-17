
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/app/integrations/supabase/client';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default function PasswordRecoveryScreen() {
  const [status, setStatus] = useState('Verifying...');
  const router = useRouter();

  const handlePasswordRecovery = useCallback(async () => {
    try {
      // Listen for password recovery event
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Auth event in recovery screen:', event);
          
          if (event === 'PASSWORD_RECOVERY') {
            console.log('✅ Password recovery event detected');
            setStatus('Redirecting to password reset...');
            
            // Small delay to show the message
            setTimeout(() => {
              router.replace('/(auth)/reset-password');
            }, 1000);
          } else if (event === 'SIGNED_IN') {
            console.log('✅ User signed in during recovery');
            // This might happen after password reset
            router.replace('/(tabs)/(home)/');
          }
        }
      );

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('📱 Session found, redirecting to reset password');
        router.replace('/(auth)/reset-password');
      }

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('❌ Error in password recovery:', error);
      setStatus('An error occurred. Please try again.');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    }
  }, [router]);

  useEffect(() => {
    handlePasswordRecovery();
  }, [handlePasswordRecovery]);

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{status}</Text>
    </SafeAreaView>
  );
}
