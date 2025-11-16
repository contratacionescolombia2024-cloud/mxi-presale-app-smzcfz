
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import React from 'react';

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
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    ...commonStyles.card,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  kycBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    ...buttonStyles.outline,
    marginTop: 16,
    borderColor: colors.error || '#F44336',
  },
  logoutButtonText: {
    ...buttonStyles.textOutline,
    color: colors.error || '#F44336',
  },
});

export default function ProfileScreen() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const getKYCStatusColor = () => {
    switch (user?.kycStatus) {
      case 'approved':
        return colors.success || '#4CAF50';
      case 'rejected':
        return colors.error || '#F44336';
      default:
        return colors.warning || '#FF9800';
    }
  };

  const getKYCStatusText = () => {
    switch (user?.kycStatus) {
      case 'approved':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person" 
              size={50} 
              color="#fff" 
            />
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person" 
              size={20} 
              color={colors.textSecondary} 
            />
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol 
              ios_icon_name="envelope.fill" 
              android_material_icon_name="email" 
              size={20} 
              color={colors.textSecondary} 
            />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol 
              ios_icon_name="checkmark.shield.fill" 
              android_material_icon_name="verified_user" 
              size={20} 
              color={colors.textSecondary} 
            />
            <Text style={styles.infoLabel}>KYC Status</Text>
            <View style={[styles.kycBadge, { backgroundColor: getKYCStatusColor() }]}>
              <Text style={styles.kycBadgeText}>{getKYCStatusText()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/kyc')}
          >
            <IconSymbol 
              ios_icon_name="checkmark.shield.fill" 
              android_material_icon_name="verified_user" 
              size={24} 
              color={colors.primary} 
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
            onPress={() => router.push('/messages')}
          >
            <IconSymbol 
              ios_icon_name="message.fill" 
              android_material_icon_name="message" 
              size={24} 
              color={colors.primary} 
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
              onPress={() => router.push('/admin')}
            >
              <IconSymbol 
                ios_icon_name="gearshape.fill" 
                android_material_icon_name="settings" 
                size={24} 
                color={colors.primary} 
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
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
