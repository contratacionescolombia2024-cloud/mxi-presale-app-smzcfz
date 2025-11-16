
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import React, { useState, useEffect } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginButton: {
    ...buttonStyles.primary,
    marginTop: 8,
  },
  loginButtonText: {
    ...buttonStyles.primaryText,
  },
  resendButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
    lineHeight: 20,
  },
  successBox: {
    backgroundColor: '#D1FAE5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#065F46',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login, resendVerificationEmail, isAuthenticated } = useAuth();
  const router = useRouter();

  // Navigate to home when authenticated
  useEffect(() => {
    console.log('🔍 Login screen - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('✅ User is authenticated, navigating to home...');
      router.replace('/(tabs)/(home)/');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    setShowResendButton(false);
    setLoginSuccess(false);
    
    try {
      console.log('🔐 Attempting login...');
      await login(email, password);
      console.log('✅ Login function completed');
      setLoginSuccess(true);
      
      // Show success message
      Alert.alert(
        'Login Successful',
        'Welcome back! Redirecting to home...',
        [{ text: 'OK' }]
      );
      
      // Navigation will happen automatically via useEffect when isAuthenticated changes
    } catch (error: any) {
      console.error('❌ Login error in component:', error);
      
      if (error.message === 'EMAIL_NOT_CONFIRMED') {
        setShowResendButton(true);
        Alert.alert(
          'Email Not Verified',
          'Your email address has not been verified yet. Please check your inbox for the verification email, or click the button below to resend it.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Login Failed', 
          error.message || 'Failed to log in. Please check your credentials and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await resendVerificationEmail(email);
    } catch (error: any) {
      console.error('❌ Resend verification error:', error);
      Alert.alert('Error', error.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="lock.shield.fill" 
            android_material_icon_name="lock" 
            size={64} 
            color={colors.primary} 
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your MXI account</Text>
        </View>

        {loginSuccess && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              ✅ Login successful! Redirecting to home screen...
            </Text>
          </View>
        )}

        {showResendButton && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Your email is not verified. Please check your inbox or click the button below to resend the verification email.
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {showResendButton && (
            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={handleResendVerification}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resendButtonText}>Resend Verification Email</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.linkText}>Register</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>First time admin?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/admin-setup')}>
              <Text style={styles.linkText}>Setup Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
