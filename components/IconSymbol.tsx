
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
  ColorValue,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Type for valid Material Icons
type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

// Comprehensive icon mapping from SF Symbols to Material Icons
const ICON_MAP: Record<string, MaterialIconName> = {
  // Home & Navigation
  'house.fill': 'home',
  'house': 'home',
  'home': 'home',
  'menu': 'menu',
  'chevron.right': 'chevron_right',
  'chevron.left': 'chevron_left',
  'arrow.right': 'arrow_forward',
  'arrow.left': 'arrow_back',
  'arrow.up': 'arrow_upward',
  'arrow.down': 'arrow_downward',
  
  // Shopping & Purchase
  'cart.fill': 'shopping_cart',
  'cart': 'shopping_cart',
  'shopping': 'shopping_cart',
  'shopping_cart': 'shopping_cart',
  'creditcard.fill': 'credit_card',
  'creditcard': 'credit_card',
  'credit_card': 'credit_card',
  'payment': 'payment',
  'bitcoinsign.circle.fill': 'currency_bitcoin',
  'bitcoinsign.circle': 'currency_bitcoin',
  'bitcoin': 'currency_bitcoin',
  'currency_bitcoin': 'currency_bitcoin',
  
  // Charts & Analytics
  'chart.line.uptrend.xyaxis': 'trending_up',
  'chart.bar.fill': 'bar_chart',
  'chart.bar': 'bar_chart',
  'chart': 'show_chart',
  'trending': 'trending_up',
  'trending_up': 'trending_up',
  'analytics': 'analytics',
  'bar_chart': 'bar_chart',
  'show_chart': 'show_chart',
  
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
  'lock.fill': 'lock',
  'lock': 'lock',
  'security': 'security',
  'verified': 'verified',
  'verified_user': 'verified_user',
  'check': 'check',
  'check_circle': 'check_circle',
  
  // Documents & Files
  'doc.fill': 'description',
  'doc': 'description',
  'doc.text.fill': 'description',
  'doc.text': 'description',
  'doc.on.doc.fill': 'content_copy',
  'doc.on.doc': 'content_copy',
  'document': 'description',
  'description': 'description',
  'file': 'insert_drive_file',
  'insert_drive_file': 'insert_drive_file',
  'content_copy': 'content_copy',
  'folder.fill': 'folder',
  'folder': 'folder',
  
  // Communication
  'message.fill': 'message',
  'message': 'message',
  'envelope.fill': 'email',
  'envelope': 'email',
  'envelope.open.fill': 'mail_outline',
  'envelope.open': 'mail_outline',
  'mail': 'email',
  'email': 'email',
  'mail_outline': 'mail_outline',
  'chat': 'chat',
  'bubble.left.and.bubble.right.fill': 'chat',
  'phone.fill': 'phone',
  'phone': 'phone',
  
  // Actions
  'plus.circle.fill': 'add_circle',
  'plus.circle': 'add_circle',
  'plus': 'add',
  'add': 'add',
  'add_circle': 'add_circle',
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
  'cancel': 'cancel',
  'square.and.arrow.up.fill': 'share',
  'square.and.arrow.up': 'share',
  'share': 'share',
  'arrow.clockwise': 'refresh',
  'refresh': 'refresh',
  'magnifyingglass': 'search',
  'search': 'search',
  
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
  'timer': 'timer',
  
  // Media
  'photo.fill': 'photo',
  'photo': 'photo',
  'camera.fill': 'camera_alt',
  'camera': 'camera_alt',
  'video.fill': 'videocam',
  'video': 'videocam',
  'play.fill': 'play_arrow',
  'play': 'play_arrow',
  'pause.fill': 'pause',
  'pause': 'pause',
  
  // Misc
  'lightbulb.fill': 'lightbulb',
  'lightbulb': 'lightbulb',
  'gearshape.fill': 'settings',
  'gearshape': 'settings',
  'settings': 'settings',
  'questionmark.circle.fill': 'help',
  'questionmark.circle': 'help',
  'help': 'help',
  'star.fill': 'star',
  'star': 'star',
  'heart.fill': 'favorite',
  'heart': 'favorite',
  'bell.fill': 'notifications',
  'bell': 'notifications',
  'bookmark.fill': 'bookmark',
  'bookmark': 'bookmark',
};

/**
 * Resolves an icon name to a valid Material Icon with comprehensive fallback
 */
function resolveIconName(
  iosIconName?: string,
  androidIconName?: string | MaterialIconName
): MaterialIconName {
  // Try Android icon name first (if provided)
  if (androidIconName) {
    // Check if it's a valid Material Icon
    if (androidIconName in MaterialIcons.glyphMap) {
      return androidIconName as MaterialIconName;
    }
    
    // Try mapping
    const lowerAndroid = androidIconName.toLowerCase();
    if (lowerAndroid in ICON_MAP) {
      return ICON_MAP[lowerAndroid];
    }
  }

  // Try iOS icon name
  if (iosIconName) {
    // Direct mapping
    if (iosIconName in ICON_MAP) {
      return ICON_MAP[iosIconName];
    }

    // Try lowercase
    const lowerIos = iosIconName.toLowerCase();
    if (lowerIos in ICON_MAP) {
      return ICON_MAP[lowerIos];
    }

    // Try to extract base name (remove .fill, .circle, etc.)
    const baseName = iosIconName.split('.')[0].toLowerCase();
    if (baseName in ICON_MAP) {
      return ICON_MAP[baseName];
    }
  }

  // Ultimate fallback
  console.warn(
    `[IconSymbol] Icon not found: iOS="${iosIconName}", Android="${androidIconName}". Using "help" as fallback.`
  );
  return 'help';
}

/**
 * An icon component that uses MaterialIcons on Android and web with support for colored icons.
 * Provides comprehensive fallback mechanism for icon resolution.
 */
export function IconSymbol({
  ios_icon_name = undefined,
  android_material_icon_name,
  size = 24,
  color,
  colors: colorArray,
  style,
  type,
}: {
  ios_icon_name?: string | undefined;
  android_material_icon_name?: MaterialIconName | string;
  size?: number;
  color?: string | OpaqueColorValue;
  colors?: ColorValue[];
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  type?: "monochrome" | "hierarchical" | "palette" | "multicolor";
}) {
  const iconName = resolveIconName(ios_icon_name, android_material_icon_name);

  // For Android, we use the first color from the colors array if provided and type is palette
  let finalColor = color;
  if (type === "palette" && colorArray && colorArray.length > 0) {
    finalColor = colorArray[0];
  }

  try {
    return (
      <MaterialIcons
        color={finalColor as string}
        size={size}
        name={iconName}
        style={style as StyleProp<TextStyle>}
      />
    );
  } catch (error) {
    console.error('[IconSymbol] Error rendering Material Icon:', error, 'Icon:', iconName);
    // Render a fallback text icon
    return (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ fontSize: size * 0.6, color: finalColor as string || '#FFFFFF', fontWeight: 'bold' }}>?</Text>
      </View>
    );
  }
}
