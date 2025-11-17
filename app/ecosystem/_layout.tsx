
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function EcosystemLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    />
  );
}
