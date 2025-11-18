
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/app/integrations/supabase/client';
import AppFooter from '@/components/AppFooter';

interface KYCDocuments {
  idFront?: string;
  idBack?: string;
  selfie?: string;
  proofOfResidence?: string;
}

export default function KYCScreen() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<KYCDocuments>({});
  const [loading, setLoading] = useState(false);
  const [residenceAddress, setResidenceAddress] = useState('');
  const [residenceCity, setResidenceCity] = useState('');
  const [residenceCountry, setResidenceCountry] = useState('');
  const [residencePostalCode, setResidencePostalCode] = useState('');

  const loadUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('address')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user data:', error);
        return;
      }

      if (data?.address) {
        setResidenceAddress(data.address);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const pickDocument = async (type: keyof KYCDocuments) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocuments({ ...documents, [type]: result.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    // Validate all required documents
    if (!documents.idFront || !documents.idBack || !documents.selfie || !documents.proofOfResidence) {
      Alert.alert('Error', 'Please upload all required documents:\n- ID Front\n- ID Back\n- Selfie with ID\n- Proof of Residence');
      return;
    }

    // Validate residence information
    if (!residenceAddress || !residenceCity || !residenceCountry || !residencePostalCode) {
      Alert.alert('Error', 'Please fill in all residence information fields');
      return;
    }

    setLoading(true);

    try {
      // In a real implementation, you would upload the documents to Supabase Storage
      // For now, we'll just update the user profile with the residence information
      const fullAddress = `${residenceAddress}, ${residenceCity}, ${residencePostalCode}, ${residenceCountry}`;

      const { error } = await supabase
        .from('users_profiles')
        .update({
          address: fullAddress,
          kyc_status: 'pending',
          kyc_documents: [
            'id_front_uploaded',
            'id_back_uploaded',
            'selfie_uploaded',
            'proof_of_residence_uploaded'
          ]
        })
        .eq('id', user?.id);

      if (error) throw error;

      Alert.alert('Success', 'KYC documents submitted for review. You will be notified once the review is complete.');
      
      // Clear the form
      setDocuments({});
      setResidenceAddress('');
      setResidenceCity('');
      setResidenceCountry('');
      setResidencePostalCode('');
    } catch (error) {
      console.error('Error submitting KYC:', error);
      Alert.alert('Error', 'Failed to submit KYC documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (user?.kycStatus) {
      case 'approved':
        return {
          icon: 'verified_user',
          color: colors.success || '#4CAF50',
          title: 'KYC Verified ✓',
          message: 'Your identity has been verified successfully.',
        };
      case 'rejected':
        return {
          icon: 'cancel',
          color: colors.error || '#F44336',
          title: 'KYC Rejected',
          message: 'Your KYC submission was rejected. Please resubmit with correct documents.',
        };
      default:
        return {
          icon: 'schedule',
          color: colors.warning || '#FF9800',
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
            ios_icon_name="person.badge.shield.checkmark.fill" 
            android_material_icon_name={statusInfo.icon} 
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
              <Text style={styles.cardTitle}>📋 Required Documents</Text>
              <Text style={styles.cardText}>
                Please upload clear photos of the following:
              </Text>
              
              <View style={styles.requirementsList}>
                <View style={styles.requirementItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success || '#4CAF50'} 
                  />
                  <Text style={styles.requirementText}>Government-issued ID (front and back)</Text>
                </View>
                <View style={styles.requirementItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success || '#4CAF50'} 
                  />
                  <Text style={styles.requirementText}>Selfie holding your ID</Text>
                </View>
                <View style={styles.requirementItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success || '#4CAF50'} 
                  />
                  <Text style={styles.requirementText}>Proof of residence (utility bill, bank statement)</Text>
                </View>
              </View>
            </View>

            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>📄 Upload Documents</Text>
              
              {/* ID Front */}
              <View style={styles.documentSection}>
                <Text style={styles.documentLabel}>ID Front</Text>
                {documents.idFront ? (
                  <View style={styles.documentItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={24} 
                      color={colors.success || '#4CAF50'} 
                    />
                    <Text style={styles.documentText}>ID Front Uploaded</Text>
                    <TouchableOpacity onPress={() => setDocuments({ ...documents, idFront: undefined })}>
                      <IconSymbol 
                        ios_icon_name="trash.fill" 
                        android_material_icon_name="delete" 
                        size={20} 
                        color={colors.error || '#F44336'} 
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[buttonStyles.outline, styles.uploadButton]}
                    onPress={() => pickDocument('idFront')}
                  >
                    <IconSymbol 
                      ios_icon_name="plus.circle.fill" 
                      android_material_icon_name="add_circle" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={[buttonStyles.textOutline, { marginLeft: 8 }]}>Upload ID Front</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* ID Back */}
              <View style={styles.documentSection}>
                <Text style={styles.documentLabel}>ID Back</Text>
                {documents.idBack ? (
                  <View style={styles.documentItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={24} 
                      color={colors.success || '#4CAF50'} 
                    />
                    <Text style={styles.documentText}>ID Back Uploaded</Text>
                    <TouchableOpacity onPress={() => setDocuments({ ...documents, idBack: undefined })}>
                      <IconSymbol 
                        ios_icon_name="trash.fill" 
                        android_material_icon_name="delete" 
                        size={20} 
                        color={colors.error || '#F44336'} 
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[buttonStyles.outline, styles.uploadButton]}
                    onPress={() => pickDocument('idBack')}
                  >
                    <IconSymbol 
                      ios_icon_name="plus.circle.fill" 
                      android_material_icon_name="add_circle" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={[buttonStyles.textOutline, { marginLeft: 8 }]}>Upload ID Back</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Selfie */}
              <View style={styles.documentSection}>
                <Text style={styles.documentLabel}>Selfie with ID</Text>
                {documents.selfie ? (
                  <View style={styles.documentItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={24} 
                      color={colors.success || '#4CAF50'} 
                    />
                    <Text style={styles.documentText}>Selfie Uploaded</Text>
                    <TouchableOpacity onPress={() => setDocuments({ ...documents, selfie: undefined })}>
                      <IconSymbol 
                        ios_icon_name="trash.fill" 
                        android_material_icon_name="delete" 
                        size={20} 
                        color={colors.error || '#F44336'} 
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[buttonStyles.outline, styles.uploadButton]}
                    onPress={() => pickDocument('selfie')}
                  >
                    <IconSymbol 
                      ios_icon_name="plus.circle.fill" 
                      android_material_icon_name="add_circle" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={[buttonStyles.textOutline, { marginLeft: 8 }]}>Upload Selfie</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Proof of Residence */}
              <View style={styles.documentSection}>
                <Text style={styles.documentLabel}>Proof of Residence</Text>
                {documents.proofOfResidence ? (
                  <View style={styles.documentItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={24} 
                      color={colors.success || '#4CAF50'} 
                    />
                    <Text style={styles.documentText}>Proof of Residence Uploaded</Text>
                    <TouchableOpacity onPress={() => setDocuments({ ...documents, proofOfResidence: undefined })}>
                      <IconSymbol 
                        ios_icon_name="trash.fill" 
                        android_material_icon_name="delete" 
                        size={20} 
                        color={colors.error || '#F44336'} 
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[buttonStyles.outline, styles.uploadButton]}
                    onPress={() => pickDocument('proofOfResidence')}
                  >
                    <IconSymbol 
                      ios_icon_name="plus.circle.fill" 
                      android_material_icon_name="add_circle" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={[buttonStyles.textOutline, { marginLeft: 8 }]}>Upload Proof of Residence</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Residence Information */}
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>🏠 Residence Information</Text>
              <Text style={styles.cardText}>
                Please provide your current residence details:
              </Text>

              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput
                style={styles.input}
                value={residenceAddress}
                onChangeText={setResidenceAddress}
                placeholder="123 Main Street, Apt 4B"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                value={residenceCity}
                onChangeText={setResidenceCity}
                placeholder="New York"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={residencePostalCode}
                onChangeText={setResidencePostalCode}
                placeholder="10001"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                style={styles.input}
                value={residenceCountry}
                onChangeText={setResidenceCountry}
                placeholder="United States"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
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
              color={colors.success || '#4CAF50'} 
            />
            <Text style={styles.approvedText}>
              You&apos;re all set! Your account is fully verified and you can access all features.
            </Text>
          </View>
        )}

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
  documentSection: {
    marginBottom: 16,
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
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
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderColor: colors.success || '#4CAF50',
  },
  approvedText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});
