
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { supabase } from '@/app/integrations/supabase/client';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
  },
  passwordRequirements: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  requirementText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  requirementMet: {
    color: colors.success,
  },
  submitButton: {
    ...buttonStyles.primary,
    marginTop: 8,
  },
  submitButtonText: {
    ...buttonStyles.text,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
  },
});

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if this is a password recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Current session:', session);
      
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Auth event:', event);
          if (event === 'PASSWORD_RECOVERY') {
            setIsRecoverySession(true);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    checkSession();
  }, []);

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('❌ Password update error:', updateError);
        throw updateError;
      }

      console.log('✅ Password updated successfully');
      
      Alert.alert(
        'Success',
        'Your password has been reset successfully. You can now log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Sign out and redirect to login
              supabase.auth.signOut();
              router.replace('/(auth)/login');
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordMeetsLength = newPassword.length >= 8;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="key.fill"
              android_material_icon_name="vpn_key"
              size={40}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Please enter your new password below.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor={colors.textSecondary}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setError('');
                }}
                secureTextEntry
                editable={!loading}
                autoFocus
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.passwordRequirements}>
            <Text
              style={[
                styles.requirementText,
                passwordMeetsLength && styles.requirementMet,
              ]}
            >
              {passwordMeetsLength ? '✓' : '○'} At least 8 characters
            </Text>
            <Text
              style={[
                styles.requirementText,
                passwordsMatch && styles.requirementMet,
              ]}
            >
              {passwordsMatch ? '✓' : '○'} Passwords match
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading || !passwordMeetsLength || !passwordsMatch}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
