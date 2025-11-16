
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleProp, ViewStyle, View, Text, Platform } from "react-native";

// Type for valid Material Icons - using only verified icons
type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

// VERIFIED Material Icons - These are guaranteed to exist
const VERIFIED_MATERIAL_ICONS: Record<string, MaterialIconName> = {
  // Home & Navigation
  'home': 'home',
  'menu': 'menu',
  'arrow_forward': 'arrow_forward',
  'arrow_back': 'arrow_back',
  'chevron_right': 'chevron_right',
  'chevron_left': 'chevron_left',
  
  // Shopping & Purchase
  'shopping_cart': 'shopping_cart',
  'credit_card': 'credit_card',
  'payment': 'payment',
  'currency_bitcoin': 'currency_bitcoin',
  
  // Charts & Analytics
  'trending_up': 'trending_up',
  'bar_chart': 'bar_chart',
  'show_chart': 'show_chart',
  'analytics': 'analytics',
  
  // People & Social
  'person': 'person',
  'people': 'people',
  'group': 'group',
  
  // Verification & Security
  'verified_user': 'verified_user',
  'security': 'security',
  'verified': 'verified',
  'check_circle': 'check_circle',
  'check': 'check',
  'lock': 'lock',
  'shield': 'shield',
  
  // Documents & Files
  'description': 'description',
  'insert_drive_file': 'insert_drive_file',
  'content_copy': 'content_copy',
  'folder': 'folder',
  
  // Communication
  'message': 'message',
  'email': 'email',
  'mail_outline': 'mail_outline',
  'chat': 'chat',
  'phone': 'phone',
  
  // Actions
  'add_circle': 'add_circle',
  'add': 'add',
  'delete': 'delete',
  'edit': 'edit',
  'cancel': 'cancel',
  'close': 'close',
  'share': 'share',
  'refresh': 'refresh',
  'search': 'search',
  
  // Status
  'info': 'info',
  'warning': 'warning',
  'error': 'error',
  
  // Calendar & Time
  'event': 'event',
  'schedule': 'schedule',
  'timer': 'timer',
  
  // Media
  'photo': 'photo',
  'camera_alt': 'camera_alt',
  'videocam': 'videocam',
  'play_arrow': 'play_arrow',
  'pause': 'pause',
  
  // Misc
  'lightbulb': 'lightbulb',
  'settings': 'settings',
  'help': 'help',
  'star': 'star',
  'favorite': 'favorite',
  'notifications': 'notifications',
  'bookmark': 'bookmark',
};

/**
 * Resolves an icon name to a valid Material Icon
 * Uses only verified icons to prevent rendering issues
 */
function resolveIconName(
  androidIconName?: string | MaterialIconName
): MaterialIconName {
  // If no icon provided, use default
  if (!androidIconName) {
    console.log('[IconSymbol] No icon name provided, using default "help"');
    return 'help';
  }

  // Convert to lowercase for case-insensitive matching
  const iconKey = androidIconName.toLowerCase().trim();
  
  // Check if it's in our verified list
  if (iconKey in VERIFIED_MATERIAL_ICONS) {
    const resolvedIcon = VERIFIED_MATERIAL_ICONS[iconKey];
    console.log(`[IconSymbol] ✓ Resolved "${androidIconName}" -> "${resolvedIcon}"`);
    return resolvedIcon;
  }

  // Check if it's already a valid Material Icon
  if (androidIconName in MaterialIcons.glyphMap) {
    console.log(`[IconSymbol] ✓ Direct match "${androidIconName}"`);
    return androidIconName as MaterialIconName;
  }

  // Fallback
  console.warn(
    `[IconSymbol] ✗ Icon not found: "${androidIconName}". Using "help" as fallback.`,
    `\nAvailable icons: ${Object.keys(VERIFIED_MATERIAL_ICONS).join(', ')}`
  );
  return 'help';
}

/**
 * IconSymbol component for Android/Web
 * Uses Material Icons with comprehensive error handling
 */
export function IconSymbol({
  ios_icon_name,
  android_material_icon_name,
  size = 24,
  color = '#FFFFFF',
  style,
}: {
  ios_icon_name?: string;
  android_material_icon_name?: MaterialIconName | string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  weight?: any;
  type?: any;
  colors?: any;
}) {
  // Resolve the icon name
  const iconName = resolveIconName(android_material_icon_name);

  try {
    return (
      <MaterialIcons
        name={iconName}
        size={size}
        color={color}
        style={style as any}
      />
    );
  } catch (error) {
    console.error(
      '[IconSymbol] Error rendering Material Icon:',
      error,
      '\nIcon:',
      iconName,
      '\nOriginal:',
      android_material_icon_name
    );
    
    // Render a fallback
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            borderRadius: size / 2,
          },
          style,
        ]}
      >
        <Text style={{ fontSize: size * 0.5, color, fontWeight: 'bold' }}>
          ?
        </Text>
      </View>
    );
  }
}
