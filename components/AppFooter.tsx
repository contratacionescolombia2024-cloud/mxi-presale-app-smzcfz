
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

const styles = StyleSheet.create({
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
});

export default function AppFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>© 2025 MXI Strategic Holdings Ltd.</Text>
      <Text style={styles.footerText}>
        MAXCOIN (MXI) es una marca registrada de MXI Strategic Holdings Ltd., Islas Caimán.
      </Text>
      <Text style={styles.footerText}>Aplicación operada por MXI Technologies Inc. (Panamá).</Text>
    </View>
  );
}
