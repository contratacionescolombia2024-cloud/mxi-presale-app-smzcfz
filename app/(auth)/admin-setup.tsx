
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
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import React, { useState } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

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
  warning: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    color: '#1E40AF',
    fontSize: 14,
    lineHeight: 20,
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
  createButton: {
    ...buttonStyles.primary,
    marginTop: 8,
  },
  createButtonText: {
    ...buttonStyles.primaryText,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
});

export default function AdminSetupScreen() {
  const [email, setEmail] = useState('admin@mxi.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateAdmin = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating admin user:', email);

      // Sign up the admin user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            name: 'Administrator',
            identification: 'ADMIN',
            address: 'N/A',
          }
        }
      });

      if (error) {
        console.error('Admin creation error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('Admin user created in auth, creating profile...');

        // Create admin profile
        const { error: profileError } = await supabase
          .from('users_profiles')
          .insert({
            id: data.user.id,
            name: 'Administrator',
            identification: 'ADMIN',
            address: 'N/A',
            referral_code: 'ADMIN' + Math.random().toString(36).substring(2, 6).toUpperCase(),
            referred_by: null,
          });

        if (profileError) {
          console.error('Admin profile creation error:', profileError);
          throw new Error('Failed to create admin profile: ' + profileError.message);
        }

        console.log('Admin profile created successfully');

        Alert.alert(
          'Admin Account Created! ✅',
          `The admin account has been created successfully.\n\n📧 IMPORTANT: You must verify your email before logging in!\n\n1. Check your email inbox (${email})\n2. Look for the verification email from Supabase\n3. Click the verification link in the email\n4. After verification, return here and log in\n\nNote: Check your spam folder if you don't see the email.`,
          [
            {
              text: 'Go to Login',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Admin creation failed:', error);
      Alert.alert('Creation Failed', error.message || 'Failed to create admin account');
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
            ios_icon_name="shield.fill" 
            android_material_icon_name="admin_panel_settings" 
            size={64} 
            color={colors.primary} 
          />
          <Text style={styles.title}>Admin Setup</Text>
          <Text style={styles.subtitle}>Create the administrator account</Text>
        </View>

        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ This screen is for initial setup only. After creating the admin account, this screen should be removed or protected.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ After creating the admin account, you MUST verify the email address before you can log in. Check your inbox for the verification email.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Admin Email</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@mxi.com"
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
              placeholder="Enter password (min 6 characters)"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleCreateAdmin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Admin Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
