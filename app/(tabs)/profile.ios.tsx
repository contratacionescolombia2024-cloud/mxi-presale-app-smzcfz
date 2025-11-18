
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AppFooter from '@/components/AppFooter';

export default function ProfileScreen() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const getKYCStatusColor = () => {
    switch (user?.kycStatus) {
      case 'approved': return colors.success;
      case 'rejected': return colors.error;
      default: return colors.warning;
    }
  };

  const getKYCStatusText = () => {
    switch (user?.kycStatus) {
      case 'approved': return 'Verified';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person" 
              size={50} 
              color={colors.card} 
            />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          <View style={[styles.kycBadge, { backgroundColor: getKYCStatusColor() }]}>
            <IconSymbol 
              ios_icon_name={user?.kycStatus === 'approved' ? 'checkmark.shield.fill' : 'shield.fill'} 
              android_material_icon_name={user?.kycStatus === 'approved' ? 'verified_user' : 'shield'} 
              size={16} 
              color={colors.card} 
            />
            <Text style={styles.kycBadgeText}>KYC: {getKYCStatusText()}</Text>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.cardTitle}>Account Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Referral Code</Text>
            <Text style={styles.infoValue}>{user?.referralCode}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Identification</Text>
            <Text style={styles.infoValue}>{user?.identification || 'Not set'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{user?.address || 'Not set'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {new Date(user?.createdAt || '').toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Verified</Text>
            <View style={styles.verifiedBadge}>
              <IconSymbol 
                ios_icon_name={user?.emailVerified ? 'checkmark.circle.fill' : 'xmark.circle.fill'} 
                android_material_icon_name={user?.emailVerified ? 'check_circle' : 'cancel'} 
                size={16} 
                color={user?.emailVerified ? colors.success : colors.error} 
              />
              <Text style={[styles.verifiedText, { color: user?.emailVerified ? colors.success : colors.error }]}>
                {user?.emailVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/edit-profile')}
        >
          <IconSymbol 
            ios_icon_name="pencil.circle.fill" 
            android_material_icon_name="edit" 
            size={24} 
            color={colors.primary} 
          />
          <Text style={styles.menuItemText}>Edit Profile</Text>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron_right" 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/kyc')}
        >
          <IconSymbol 
            ios_icon_name="checkmark.shield.fill" 
            android_material_icon_name="verified_user" 
            size={24} 
            color={colors.secondary} 
          />
          <Text style={styles.menuItemText}>KYC Verification</Text>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron_right" 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/messages')}
        >
          <IconSymbol 
            ios_icon_name="message.fill" 
            android_material_icon_name="message" 
            size={24} 
            color={colors.accent} 
          />
          <Text style={styles.menuItemText}>Messages</Text>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron_right" 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/admin')}
          >
            <IconSymbol 
              ios_icon_name="gearshape.fill" 
              android_material_icon_name="settings" 
              size={24} 
              color={colors.error} 
            />
            <Text style={styles.menuItemText}>Admin Panel</Text>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[buttonStyles.outline, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={buttonStyles.textOutline}>Logout</Text>
        </TouchableOpacity>

        <AppFooter />
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
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  kycBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 20,
  },
});
