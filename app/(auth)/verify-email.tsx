
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function VerifyEmailScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <IconSymbol 
          ios_icon_name="envelope.badge.fill" 
          android_material_icon_name="mark_email_read" 
          size={100} 
          color={colors.secondary} 
        />
        
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.text}>
          We&apos;ve sent a verification link to your email address. 
          Please check your inbox and click the link to verify your account.
        </Text>

        <TouchableOpacity 
          style={[buttonStyles.primary, styles.button]}
          onPress={() => router.replace('/(tabs)/(home)/')}
        >
          <Text style={buttonStyles.text}>Continue to App</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => console.log('Resend verification email')}
        >
          <Text style={styles.linkText}>Resend Verification Email</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  linkButton: {
    padding: 12,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
