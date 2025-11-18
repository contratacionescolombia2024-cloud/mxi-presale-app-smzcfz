
import { Stack } from 'expo-router';
import { TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function HomeLayout() {
  const router = useRouter();

  return (
    <Stack 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/language-settings')}
            style={{ 
              marginRight: Platform.OS === 'ios' ? 0 : 16,
              padding: 8,
            }}
          >
            <IconSymbol 
              ios_icon_name="globe" 
              android_material_icon_name="language" 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'MXI',
        }}
      />
    </Stack>
  );
}
