
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleProp, ViewStyle, View, Text } from "react-native";

/**
 * RADICAL ICON SOLUTION
 * 
 * This is a simplified, bulletproof icon system that GUARANTEES rendering.
 * - Uses only verified Material Icons
 * - Simple name mapping
 * - Always renders something (never blank)
 * - Clear error messages
 */

// Type for valid Material Icons
type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

// CORE ICON MAP - Only icons we absolutely need and know exist
const ICON_MAP: Record<string, MaterialIconName> = {
  // Navigation
  'home': 'home',
  'menu': 'menu',
  'arrow-back': 'arrow-back',
  'arrow-forward': 'arrow-forward',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  
  // Shopping & Money
  'shopping-cart': 'shopping-cart',
  'credit-card': 'credit-card',
  'payment': 'payment',
  'attach-money': 'attach-money',
  
  // Charts & Analytics
  'trending-up': 'trending-up',
  'bar-chart': 'bar-chart',
  'show-chart': 'show-chart',
  'analytics': 'analytics',
  
  // People
  'person': 'person',
  'people': 'people',
  'group': 'group',
  
  // Verification & Security
  'verified-user': 'verified-user',
  'security': 'security',
  'verified': 'verified',
  'check-circle': 'check-circle',
  'check': 'check',
  'lock': 'lock',
  'shield': 'shield',
  
  // Documents
  'description': 'description',
  'insert-drive-file': 'insert-drive-file',
  'content-copy': 'content-copy',
  'folder': 'folder',
  
  // Communication
  'message': 'message',
  'email': 'email',
  'mail-outline': 'mail-outline',
  'chat': 'chat',
  'phone': 'phone',
  
  // Actions
  'add-circle': 'add-circle',
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
  
  // Time
  'event': 'event',
  'schedule': 'schedule',
  'timer': 'timer',
  'access-time': 'access-time',
  
  // Media
  'photo': 'photo',
  'camera-alt': 'camera-alt',
  'videocam': 'videocam',
  'play-arrow': 'play-arrow',
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
 * Resolve icon name to a valid Material Icon
 * This function ALWAYS returns a valid icon name
 */
function resolveIcon(name?: string): MaterialIconName {
  if (!name) {
    console.warn('[IconSymbol] No icon name provided, using "help"');
    return 'help';
  }

  // Normalize the name (lowercase, replace underscores with hyphens)
  const normalized = name.toLowerCase().replace(/_/g, '-').trim();
  
  // Check our map first
  if (normalized in ICON_MAP) {
    return ICON_MAP[normalized];
  }

  // Check if it's directly in Material Icons
  if (name in MaterialIcons.glyphMap) {
    return name as MaterialIconName;
  }

  // Try normalized version
  if (normalized in MaterialIcons.glyphMap) {
    return normalized as MaterialIconName;
  }

  // Fallback
  console.warn(`[IconSymbol] Icon "${name}" not found. Using "help" as fallback.`);
  return 'help';
}

/**
 * IconSymbol Component - Android/Web Version
 * 
 * Props:
 * - name: Simple icon name (e.g., "home", "shopping-cart")
 * - size: Icon size in pixels (default: 24)
 * - color: Icon color (default: "#FFFFFF")
 * - style: Additional styles
 * 
 * Legacy props (for backwards compatibility):
 * - ios_icon_name: Ignored on Android
 * - android_material_icon_name: Used as primary name
 */
export function IconSymbol({
  name,
  ios_icon_name,
  android_material_icon_name,
  size = 24,
  color = '#FFFFFF',
  style,
}: {
  name?: string;
  ios_icon_name?: string;
  android_material_icon_name?: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  // Ignore these props on Android
  weight?: any;
  type?: any;
  colors?: any;
}) {
  // Priority: name > android_material_icon_name > ios_icon_name
  const iconName = resolveIcon(name || android_material_icon_name || ios_icon_name);

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
    console.error('[IconSymbol] Render error:', error);
    
    // Emergency fallback - render a visible placeholder
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: 'rgba(255, 0, 0, 0.5)',
          },
          style,
        ]}
      >
        <Text style={{ fontSize: size * 0.6, color, fontWeight: 'bold' }}>
          ?
        </Text>
      </View>
    );
  }
}
