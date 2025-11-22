
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
    backgroundColor: colors.card,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  warningCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  button: {
    ...buttonStyles.primary,
    marginTop: 16,
  },
  buttonText: {
    ...buttonStyles.primaryText,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
});

export default function PurchaseCryptoScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Crypto Purchase</Text>
          <Text style={styles.subtitle}>
            Purchase MXI with cryptocurrency
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Feature Unavailable</Text>
          <Text style={styles.warningText}>
            The crypto payment feature has been temporarily removed after a system reversion. 
            Please use the standard purchase method instead.
          </Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol
            ios_icon_name="bitcoinsign.circle"
            android_material_icon_name="currency_bitcoin"
            size={80}
            color={colors.textSecondary}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ How to Purchase</Text>
          <Text style={styles.infoText}>
            • Go to the Purchase screen from the home page
          </Text>
          <Text style={styles.infoText}>
            • Enter the amount you wish to purchase
          </Text>
          <Text style={styles.infoText}>
            • Submit your purchase request
          </Text>
          <Text style={styles.infoText}>
            • Our team will contact you with payment instructions
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/purchase')}
        >
          <Text style={styles.buttonText}>Go to Purchase Screen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
