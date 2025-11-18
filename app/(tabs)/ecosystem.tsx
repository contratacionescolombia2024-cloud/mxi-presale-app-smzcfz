
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

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
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  arrowIcon: {
    marginLeft: 'auto',
  },
});

interface EcosystemTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const topics: EcosystemTopic[] = [
  {
    id: 'mxi-strategic',
    title: 'MXI Strategic',
    description: 'Discover the strategic vision behind MXI',
    icon: 'lightbulb',
    color: colors.primary,
  },
  {
    id: 'generate-resources',
    title: '¿Cómo generar recursos con MXI en preventa?',
    description: 'Learn how to generate resources during presale',
    icon: 'attach-money',
    color: colors.success,
  },
  {
    id: 'why-buy-maxcoin',
    title: '¿Por qué debería comprar MAXCOIN?',
    description: 'Understand the benefits of investing in MAXCOIN',
    icon: 'trending-up',
    color: colors.accent,
  },
  {
    id: 'sustainability',
    title: 'Sostenibilidad',
    description: 'Explore our commitment to sustainability',
    icon: 'eco',
    color: colors.secondary,
  },
  {
    id: 'daily-vesting',
    title: 'Vesting diario',
    description: 'How daily vesting rewards work',
    icon: 'schedule',
    color: colors.info,
  },
  {
    id: 'ecosystem',
    title: 'Ecosistema',
    description: 'The complete MXI ecosystem explained',
    icon: 'hub',
    color: colors.highlight,
  },
  {
    id: 'expansion',
    title: 'Expansión',
    description: 'Crecimiento por etapas y expansión global',
    icon: 'rocket-launch',
    color: '#FF6B35',
  },
  {
    id: 'not-ponzi',
    title: '¿Porque MXI no es un esquema Ponzi?',
    description: 'Understanding our transparent business model',
    icon: 'verified',
    color: '#14B8A6',
  },
  {
    id: 'maxcoin-value',
    title: '¿Qué valor puede alcanzar MAXCOIN?',
    description: 'Potential value projections for MAXCOIN',
    icon: 'show-chart',
    color: '#F59E0B',
  },
  {
    id: 'withdrawals',
    title: 'Retiros',
    description: 'How to withdraw your earnings',
    icon: 'account-balance-wallet',
    color: '#8B5CF6',
  },
];

export default function EcosystemScreen() {
  const router = useRouter();

  const handleTopicPress = (topicId: string) => {
    console.log('📖 Opening ecosystem topic:', topicId);
    router.push(`/ecosystem/${topicId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🌐 Ecosistema MXI</Text>
          <Text style={styles.subtitle}>
            Descubre todo sobre el proyecto MXI, su visión estratégica y cómo puedes beneficiarte.
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          {topics.map((topic, index) => (
            <TouchableOpacity
              key={index}
              style={styles.button}
              onPress={() => handleTopicPress(topic.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: topic.color }]}>
                <IconSymbol name={topic.icon} size={28} color={colors.light} />
              </View>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonTitle}>{topic.title}</Text>
                <Text style={styles.buttonDescription}>{topic.description}</Text>
              </View>
              <IconSymbol
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
