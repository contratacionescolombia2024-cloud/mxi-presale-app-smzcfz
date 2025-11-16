
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

// Comprehensive icon mapping from SF Symbols to Material Icons
const SF_TO_MATERIAL_ICON_MAP: Record<string, MaterialIconName> = {
  // Home & Navigation
  'house.fill': 'home',
  'house': 'home',
  'home': 'home',
  'menu': 'menu',
  'chevron.right': 'chevron_right',
  'chevron.left': 'chevron_left',
  'arrow.right': 'arrow_forward',
  'arrow.left': 'arrow_back',
  
  // Shopping & Purchase
  'cart.fill': 'shopping_cart',
  'cart': 'shopping_cart',
  'shopping': 'shopping_cart',
  'creditcard.fill': 'credit_card',
  'creditcard': 'credit_card',
  'payment': 'payment',
  'bitcoinsign.circle.fill': 'currency_bitcoin',
  'bitcoinsign.circle': 'currency_bitcoin',
  'bitcoin': 'currency_bitcoin',
  
  // Charts & Analytics
  'chart.line.uptrend.xyaxis': 'trending_up',
  'chart.bar.fill': 'bar_chart',
  'chart.bar': 'bar_chart',
  'chart': 'show_chart',
  'trending': 'trending_up',
  'analytics': 'analytics',
  
  // People & Social
  'person.fill': 'person',
  'person': 'person',
  'person.2.fill': 'people',
  'person.2': 'people',
  'person.3.fill': 'group',
  'person.3': 'group',
  'people': 'people',
  'group': 'group',
  
  // Verification & Security
  'checkmark.shield.fill': 'verified_user',
  'checkmark.shield': 'verified_user',
  'person.badge.shield.checkmark.fill': 'verified_user',
  'shield.fill': 'security',
  'shield': 'security',
  'checkmark.seal.fill': 'verified',
  'checkmark.seal': 'verified',
  'checkmark.circle.fill': 'check_circle',
  'checkmark.circle': 'check_circle',
  'checkmark': 'check',
  'lock.shield.fill': 'lock',
  'lock.shield': 'lock',
  'security': 'security',
  'verified': 'verified_user',
  
  // Documents & Files
  'doc.fill': 'description',
  'doc': 'description',
  'doc.text.fill': 'description',
  'doc.text': 'description',
  'doc.on.doc.fill': 'content_copy',
  'doc.on.doc': 'content_copy',
  'document': 'description',
  'file': 'insert_drive_file',
  
  // Communication
  'message.fill': 'message',
  'message': 'message',
  'envelope.fill': 'email',
  'envelope': 'email',
  'envelope.open.fill': 'mail_outline',
  'envelope.open': 'mail_outline',
  'mail': 'email',
  'chat': 'chat',
  'bubble.left.and.bubble.right.fill': 'chat',
  
  // Actions
  'plus.circle.fill': 'add_circle',
  'plus.circle': 'add_circle',
  'plus': 'add',
  'add': 'add_circle',
  'trash.fill': 'delete',
  'trash': 'delete',
  'delete': 'delete',
  'pencil.circle.fill': 'edit',
  'pencil.circle': 'edit',
  'pencil': 'edit',
  'edit': 'edit',
  'xmark.circle.fill': 'cancel',
  'xmark.circle': 'cancel',
  'xmark': 'close',
  'close': 'close',
  'square.and.arrow.up.fill': 'share',
  'square.and.arrow.up': 'share',
  'share': 'share',
  
  // Status
  'info.circle.fill': 'info',
  'info.circle': 'info',
  'info': 'info',
  'exclamationmark.triangle.fill': 'warning',
  'exclamationmark.triangle': 'warning',
  'warning': 'warning',
  'xmark.octagon.fill': 'error',
  'xmark.octagon': 'error',
  'error': 'error',
  'success': 'check_circle',
  
  // Calendar & Time
  'calendar': 'event',
  'event': 'event',
  'clock.fill': 'schedule',
  'clock': 'schedule',
  'time': 'schedule',
  'schedule': 'schedule',
  
  // Misc
  'lightbulb.fill': 'lightbulb',
  'lightbulb': 'lightbulb',
  'gearshape.fill': 'settings',
  'gearshape': 'settings',
  'settings': 'settings',
  'questionmark.circle.fill': 'help',
  'questionmark.circle': 'help',
  'help': 'help',
};

// Fallback icons for common categories
const CATEGORY_FALLBACKS: Record<string, MaterialIconName> = {
  'home': 'home',
  'cart': 'shopping_cart',
  'chart': 'trending_up',
  'person': 'person',
  'people': 'people',
  'shield': 'verified_user',
  'doc': 'description',
  'message': 'message',
  'add': 'add_circle',
  'delete': 'delete',
  'info': 'info',
  'warning': 'warning',
  'calendar': 'event',
  'lightbulb': 'lightbulb',
  'settings': 'settings',
};

/**
 * Resolves an icon name to a valid Material Icon
 */
function resolveIconName(
  iosIconName?: string,
  androidIconName?: string | MaterialIconName
): MaterialIconName {
  // First, try the provided Android icon name
  if (androidIconName && androidIconName in MaterialIcons.glyphMap) {
    return androidIconName as MaterialIconName;
  }

  // Try to map from iOS icon name
  if (iosIconName) {
    // Direct mapping
    if (iosIconName in SF_TO_MATERIAL_ICON_MAP) {
      return SF_TO_MATERIAL_ICON_MAP[iosIconName];
    }

    // Try lowercase version
    const lowerIosName = iosIconName.toLowerCase();
    if (lowerIosName in SF_TO_MATERIAL_ICON_MAP) {
      return SF_TO_MATERIAL_ICON_MAP[lowerIosName];
    }

    // Try to find a category match
    for (const [category, fallback] of Object.entries(CATEGORY_FALLBACKS)) {
      if (lowerIosName.includes(category)) {
        console.log(`Icon "${iosIconName}" matched category "${category}", using "${fallback}"`);
        return fallback;
      }
    }
  }

  // Try Android icon name as category
  if (androidIconName) {
    const lowerAndroidName = androidIconName.toLowerCase();
    for (const [category, fallback] of Object.entries(CATEGORY_FALLBACKS)) {
      if (lowerAndroidName.includes(category)) {
        console.log(`Icon "${androidIconName}" matched category "${category}", using "${fallback}"`);
        return fallback;
      }
    }
  }

  // Ultimate fallback
  console.warn(
    `Icon not found: iOS="${iosIconName}", Android="${androidIconName}". Using "help" as fallback.`
  );
  return 'help';
}

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
  android_material_icon_name?: MaterialIconName | string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = resolveIconName(ios_icon_name, android_material_icon_name);

  try {
    return (
      <MaterialIcons
        color={color}
        size={size}
        name={iconName}
        style={style as StyleProp<TextStyle>}
      />
    );
  } catch (error) {
    console.error('Error rendering Material Icon:', error);
    // Render a fallback text icon
    return (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ fontSize: size * 0.7, color: color as string }}>?</Text>
      </View>
    );
  }
}
