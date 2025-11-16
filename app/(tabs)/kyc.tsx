
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';

export default function KYCScreen() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocuments([...documents, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      Alert.alert('Error', 'Please upload at least one document');
      return;
    }

    setLoading(true);
    // Simulate upload
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'KYC documents submitted for review');
    }, 2000);
  };

  const getStatusInfo = () => {
    switch (user?.kycStatus) {
      case 'approved':
        return {
          icon: 'checkmark.shield.fill',
          androidIcon: 'verified_user',
          color: colors.success,
          title: 'KYC Verified',
          message: 'Your identity has been verified successfully.',
        };
      case 'rejected':
        return {
          icon: 'xmark.shield.fill',
          androidIcon: 'cancel',
          color: colors.error,
          title: 'KYC Rejected',
          message: 'Your KYC submission was rejected. Please resubmit with correct documents.',
        };
      default:
        return {
          icon: 'clock.fill',
          androidIcon: 'schedule',
          color: colors.warning,
          title: 'KYC Pending',
          message: 'Your KYC documents are under review. This usually takes 24-48 hours.',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name={statusInfo.icon as any} 
            android_material_icon_name={statusInfo.androidIcon} 
            size={80} 
            color={statusInfo.color} 
          />
          <Text style={styles.title}>{statusInfo.title}</Text>
          <Text style={styles.subtitle}>{statusInfo.message}</Text>
        </View>

        {user?.kycStatus === 'pending' && (
          <View style={styles.infoCard}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.infoText}>
              Your documents are being reviewed by our team. You&apos;ll receive a notification once the review is complete.
            </Text>
          </View>
        )}

        {(user?.kycStatus === 'rejected' || !user?.kycStatus || user?.kycStatus === 'pending') && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>Required Documents</Text>
              <Text style={styles.cardText}>
                Please upload clear photos of the following:
              </Text>
              
              <View style={styles.requirementsList}>
                <View style={styles.requirementItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.requirementText}>Government-issued ID (front and back)</Text>
                </View>
                <View style={styles.requirementItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.requirementText}>Proof of address (utility bill, bank statement)</Text>
                </View>
                <View style={styles.requirementItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.requirementText}>Selfie holding your ID</Text>
                </View>
              </View>
            </View>

            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>Upload Documents</Text>
              
              {documents.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <IconSymbol 
                    ios_icon_name="doc.fill" 
                    android_material_icon_name="description" 
                    size={24} 
                    color={colors.primary} 
                  />
                  <Text style={styles.documentText}>Document {index + 1}</Text>
                  <TouchableOpacity onPress={() => setDocuments(documents.filter((_, i) => i !== index))}>
                    <IconSymbol 
                      ios_icon_name="trash.fill" 
                      android_material_icon_name="delete" 
                      size={20} 
                      color={colors.error} 
                    />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity 
                style={[buttonStyles.outline, styles.uploadButton]}
                onPress={pickDocument}
              >
                <IconSymbol 
                  ios_icon_name="plus.circle.fill" 
                  android_material_icon_name="add_circle" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={[buttonStyles.textOutline, { marginLeft: 8 }]}>Add Document</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading || documents.length === 0}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={buttonStyles.text}>Submit for Review</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {user?.kycStatus === 'approved' && (
          <View style={styles.approvedCard}>
            <IconSymbol 
              ios_icon_name="checkmark.seal.fill" 
              android_material_icon_name="verified" 
              size={60} 
              color={colors.success} 
            />
            <Text style={styles.approvedText}>
              You&apos;re all set! Your account is fully verified and you can access all features.
            </Text>
          </View>
        )}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 8,
  },
  approvedCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    borderWidth: 2,
    borderColor: colors.success,
  },
  approvedText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});
