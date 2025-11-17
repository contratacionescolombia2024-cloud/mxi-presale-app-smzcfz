
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [identification, setIdentification] = useState(user?.identification || '');
  const [address, setAddress] = useState(user?.address || '');

  // Check if KYC is already approved
  const isKYCApproved = user?.kycStatus === 'approved';

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!identification.trim()) {
      Alert.alert('Error', 'Identification is required');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Address is required');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Saving profile updates...');
      
      await updateUser({
        name: name.trim(),
        identification: identification.trim(),
        address: address.trim(),
      });

      console.log('✅ Profile updated successfully');
      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="arrow_back" 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isKYCApproved && (
          <View style={styles.warningCard}>
            <IconSymbol 
              ios_icon_name="exclamationmark.triangle.fill" 
              android_material_icon_name="warning" 
              size={24} 
              color={colors.warning} 
            />
            <Text style={styles.warningText}>
              Your KYC has been approved. Changes to your personal information may require re-verification.
            </Text>
          </View>
        )}

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.infoText}>
            Please ensure all information is accurate. This information will be used for KYC verification.
          </Text>

          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textSecondary}
            editable={!loading}
          />

          <Text style={styles.label}>Identification Number *</Text>
          <TextInput
            style={styles.input}
            value={identification}
            onChangeText={setIdentification}
            placeholder="Enter your ID number (passport, national ID, etc.)"
            placeholderTextColor={colors.textSecondary}
            editable={!loading}
          />

          <Text style={styles.label}>Residential Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your complete residential address"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            editable={!loading}
          />

          <View style={styles.infoBox}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={20} 
              color={colors.primary} 
            />
            <Text style={styles.infoBoxText}>
              This information must match your KYC documents. You can update this information before KYC verification is completed.
            </Text>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{user?.email}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Referral Code</Text>
            <Text style={styles.detailValue}>{user?.referralCode}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>KYC Status</Text>
            <View style={[styles.statusBadge, getKYCStatusStyle()]}>
              <Text style={styles.statusText}>{getKYCStatusText()}</Text>
            </View>
          </View>

          <Text style={styles.noteText}>
            Email and referral code cannot be changed.
          </Text>
        </View>

        <TouchableOpacity
          style={[buttonStyles.primary, loading && buttonStyles.disabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={buttonStyles.text}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.outline, styles.cancelButton]}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={buttonStyles.textOutline}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  function getKYCStatusStyle() {
    switch (user?.kycStatus) {
      case 'approved':
        return { backgroundColor: `${colors.success}20` };
      case 'rejected':
        return { backgroundColor: `${colors.error}20` };
      default:
        return { backgroundColor: `${colors.warning}20` };
    }
  }

  function getKYCStatusText() {
    switch (user?.kycStatus) {
      case 'approved':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${colors.warning}15`,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  noteText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 12,
  },
  cancelButton: {
    marginTop: 12,
  },
});
