
// This file is a fallback for using MaterialIcons on Android and web.

import React from "react";
import { SymbolWeight } from "expo-symbols";
import {
  OpaqueColorValue,
  StyleProp,
  TextStyle,
  ViewStyle,
  View,
  Text,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Type for valid Material Icons
type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

// Common fallback icons for different categories
const FALLBACK_ICONS: Record<string, MaterialIconName> = {
  // Home & Navigation
  'home': 'home',
  'house': 'home',
  'menu': 'menu',
  
  // Shopping & Purchase
  'cart': 'shopping_cart',
  'shopping': 'shopping_cart',
  'payment': 'payment',
  'creditcard': 'credit_card',
  'bitcoin': 'currency_bitcoin',
  
  // Charts & Analytics
  'chart': 'trending_up',
  'trending': 'trending_up',
  'analytics': 'analytics',
  
  // People & Social
  'person': 'person',
  'people': 'people',
  'group': 'group',
  
  // Verification & Security
  'shield': 'verified_user',
  'verified': 'verified_user',
  'checkmark': 'check_circle',
  'security': 'security',
  
  // Documents & Files
  'doc': 'description',
  'document': 'description',
  'file': 'insert_drive_file',
  
  // Communication
  'message': 'message',
  'mail': 'email',
  'chat': 'chat',
  
  // Actions
  'add': 'add_circle',
  'delete': 'delete',
  'trash': 'delete',
  'edit': 'edit',
  'close': 'close',
  
  // Status
  'info': 'info',
  'warning': 'warning',
  'error': 'error',
  'success': 'check_circle',
  
  // Calendar & Time
  'calendar': 'event',
  'time': 'schedule',
  'clock': 'schedule',
  
  // Misc
  'lightbulb': 'lightbulb',
  'settings': 'settings',
  'help': 'help',
};

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  ios_icon_name = undefined,
  android_material_icon_name,
  size = 24,
  color,
  style,
}: {
  ios_icon_name?: string | undefined;
  android_material_icon_name: MaterialIconName | string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Validate that the icon name exists, with better fallback
  let iconName: MaterialIconName = 'help';
  
  try {
    // First, try the provided android_material_icon_name
    if (android_material_icon_name && android_material_icon_name in MaterialIcons.glyphMap) {
      iconName = android_material_icon_name as MaterialIconName;
    } else {
      // Try to find a fallback based on the icon name
      const searchKey = android_material_icon_name?.toLowerCase() || '';
      
      // Check if we have a direct fallback mapping
      for (const [key, fallbackIcon] of Object.entries(FALLBACK_ICONS)) {
        if (searchKey.includes(key)) {
          iconName = fallbackIcon;
          console.log(`Icon "${android_material_icon_name}" mapped to fallback "${fallbackIcon}"`);
          break;
        }
      }
      
      // If still no match, use help icon
      if (iconName === 'help' && android_material_icon_name !== 'help') {
        console.warn(`Icon "${android_material_icon_name}" not found in MaterialIcons, using fallback "help"`);
      }
    }
  } catch (error) {
    console.error('Error validating icon:', error);
  }

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={iconName}
      style={style as StyleProp<TextStyle>}
    />
  );
}
