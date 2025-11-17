
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
    fontSize: 12,
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
        MAXCOIN (MXI) is a registered trademark of MXI Strategic Holdings Ltd., Cayman Islands.
      </Text>
      <Text style={styles.footerText}>App operated by MXI Technologies Inc. (Panamá).</Text>
    </View>
  );
}
