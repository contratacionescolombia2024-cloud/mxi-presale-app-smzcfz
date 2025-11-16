
import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { StyleProp, ViewStyle, Text, View } from "react-native";
import React from "react";

// Valid SF Symbol names mapping
const SF_SYMBOL_FALLBACKS: Record<string, string> = {
  // Home & Navigation
  'house': 'house.fill',
  'home': 'house.fill',
  
  // Shopping & Purchase
  'cart': 'cart.fill',
  'shopping': 'cart.fill',
  'creditcard': 'creditcard.fill',
  'payment': 'creditcard.fill',
  'bitcoin': 'bitcoinsign.circle.fill',
  
  // Charts & Analytics
  'chart': 'chart.line.uptrend.xyaxis',
  'trending': 'chart.line.uptrend.xyaxis',
  'analytics': 'chart.bar.fill',
  
  // People & Social
  'person': 'person.fill',
  'people': 'person.2.fill',
  'group': 'person.3.fill',
  
  // Verification & Security
  'shield': 'checkmark.shield.fill',
  'verified': 'checkmark.seal.fill',
  'checkmark': 'checkmark.circle.fill',
  'security': 'lock.shield.fill',
  
  // Documents & Files
  'doc': 'doc.fill',
  'document': 'doc.text.fill',
  'file': 'doc.fill',
  
  // Communication
  'message': 'message.fill',
  'mail': 'envelope.fill',
  'chat': 'bubble.left.and.bubble.right.fill',
  
  // Actions
  'add': 'plus.circle.fill',
  'delete': 'trash.fill',
  'trash': 'trash.fill',
  'edit': 'pencil.circle.fill',
  'close': 'xmark.circle.fill',
  
  // Status
  'info': 'info.circle.fill',
  'warning': 'exclamationmark.triangle.fill',
  'error': 'xmark.octagon.fill',
  'success': 'checkmark.circle.fill',
  
  // Calendar & Time
  'calendar': 'calendar',
  'time': 'clock.fill',
  'clock': 'clock.fill',
  
  // Misc
  'lightbulb': 'lightbulb.fill',
  'settings': 'gearshape.fill',
  'help': 'questionmark.circle.fill',
};

export function IconSymbol({
  ios_icon_name,
  android_material_icon_name,
  size = 24,
  color,
  style,
  weight = "regular",
}: {
  ios_icon_name?: SymbolViewProps["name"] | string;
  android_material_icon_name?: any;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Determine the icon name to use
  let symbolName = ios_icon_name;
  
  // If no iOS icon name provided, try to find a fallback
  if (!symbolName) {
    const searchKey = android_material_icon_name?.toLowerCase() || '';
    for (const [key, fallbackSymbol] of Object.entries(SF_SYMBOL_FALLBACKS)) {
      if (searchKey.includes(key)) {
        symbolName = fallbackSymbol;
        console.log(`iOS icon mapped from "${android_material_icon_name}" to "${fallbackSymbol}"`);
        break;
      }
    }
  }
  
  // Fallback if still no valid icon
  if (!symbolName) {
    console.warn('iOS icon name is missing, using fallback');
    symbolName = 'questionmark.circle.fill';
  }

  try {
    return (
      <SymbolView
        weight={weight}
        tintColor={color}
        resizeMode="scaleAspectFit"
        name={symbolName as SymbolViewProps["name"]}
        style={[
          {
            width: size,
            height: size,
          },
          style,
        ]}
        fallback={
          <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
            <Text style={{ fontSize: size * 0.7, color }}>?</Text>
          </View>
        }
      />
    );
  } catch (error) {
    console.error('Error rendering iOS icon:', error);
    return (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ fontSize: size * 0.7, color }}>?</Text>
      </View>
    );
  }
}
