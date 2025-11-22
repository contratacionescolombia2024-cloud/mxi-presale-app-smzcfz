
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';

export default function TransparentModal() {
  const theme = useTheme();
  
  // Create glass effect using standard React Native styling
  const glassBackgroundColor = theme.dark 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.8)';
  
  const glassBorderColor = theme.dark 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.1)';

  return (
    <Pressable style={styles.backdrop} onPress={() => router.back()}>
      <Pressable onPress={(e) => e.stopPropagation()}>
        <View 
          style={[
            styles.modal, 
            { 
              backgroundColor: glassBackgroundColor,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: glassBorderColor,
            }
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>Transparent Modal</Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>Tap outside to dismiss</Text>
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});
