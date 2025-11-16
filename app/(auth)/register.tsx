
import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    identification: '',
    address: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.identification || 
        !formData.address || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        identification: formData.identification,
        address: formData.address,
        referredBy: formData.referralCode || undefined,
      }, formData.password);
      
      router.replace('/(auth)/verify-email');
    } catch (error) {
      Alert.alert('Error', 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="person.badge.plus.fill" 
            android_material_icon_name="person_add" 
            size={60} 
            color={colors.primary} 
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join MXI Pre-Sale</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            placeholderTextColor={colors.textSecondary}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            placeholderTextColor={colors.textSecondary}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Identification Number *"
            placeholderTextColor={colors.textSecondary}
            value={formData.identification}
            onChangeText={(text) => setFormData({ ...formData, identification: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Residential Address *"
            placeholderTextColor={colors.textSecondary}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Password *"
            placeholderTextColor={colors.textSecondary}
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password *"
            placeholderTextColor={colors.textSecondary}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Referral Code (Optional)"
            placeholderTextColor={colors.textSecondary}
            value={formData.referralCode}
            onChangeText={(text) => setFormData({ ...formData, referralCode: text })}
            autoCapitalize="characters"
          />

          <TouchableOpacity 
            style={[buttonStyles.primary, styles.button]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <Text style={buttonStyles.text}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  linkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  linkTextBold: {
    color: colors.primary,
    fontWeight: '600',
  },
});
