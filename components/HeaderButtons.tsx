
import { Pressable, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";

export function HeaderRightButton() {
  const theme = useTheme();
  const router = useRouter();

  const handlePress = () => {
    console.log('Header right button pressed');
    // Navigate to a relevant screen or show a modal
    router.push('/(tabs)/messages');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.headerButtonContainer}
    >
      <IconSymbol 
        ios_icon_name="plus" 
        android_material_icon_name="add" 
        color={theme.colors.primary} 
      />
    </Pressable>
  );
}

export function HeaderLeftButton() {
  const theme = useTheme();
  const router = useRouter();

  const handlePress = () => {
    console.log('Header left button pressed');
    // Navigate to settings or show menu
    router.push('/(tabs)/profile');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.headerButtonContainer}
    >
      <IconSymbol 
        ios_icon_name="gear" 
        android_material_icon_name="settings" 
        color={theme.colors.primary} 
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButtonContainer: {
    padding: 6,
  },
});
