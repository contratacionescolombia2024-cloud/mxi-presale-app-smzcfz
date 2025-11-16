
import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { StyleProp, ViewStyle, Text, View, ColorValue } from "react-native";
import React from "react";

/**
 * RADICAL ICON SOLUTION - iOS Version
 * 
 * This is a simplified, bulletproof icon system that GUARANTEES rendering.
 * - Uses only verified SF Symbols
 * - Simple name mapping
 * - Always renders something (never blank)
 * - Clear error messages
 */

// Type for SF Symbol names
type SFSymbolName = SymbolViewProps["name"];

// CORE ICON MAP - Only icons we absolutely need and know exist
const ICON_MAP: Record<string, SFSymbolName> = {
  // Navigation
  'home': 'house.fill',
  'menu': 'line.3.horizontal',
  'arrow-back': 'arrow.left',
  'arrow-forward': 'arrow.right',
  'chevron-left': 'chevron.left',
  'chevron-right': 'chevron.right',
  
  // Shopping & Money
  'shopping-cart': 'cart.fill',
  'credit-card': 'creditcard.fill',
  'payment': 'creditcard.fill',
  'attach-money': 'dollarsign.circle.fill',
  
  // Charts & Analytics
  'trending-up': 'chart.line.uptrend.xyaxis',
  'bar-chart': 'chart.bar.fill',
  'show-chart': 'chart.line.uptrend.xyaxis',
  'analytics': 'chart.bar.fill',
  
  // People
  'person': 'person.fill',
  'people': 'person.2.fill',
  'group': 'person.3.fill',
  
  // Verification & Security
  'verified-user': 'checkmark.shield.fill',
  'security': 'lock.shield.fill',
  'verified': 'checkmark.seal.fill',
  'check-circle': 'checkmark.circle.fill',
  'check': 'checkmark',
  'lock': 'lock.fill',
  'shield': 'shield.fill',
  
  // Documents
  'description': 'doc.text.fill',
  'insert-drive-file': 'doc.fill',
  'content-copy': 'doc.on.doc.fill',
  'folder': 'folder.fill',
  
  // Communication
  'message': 'message.fill',
  'email': 'envelope.fill',
  'mail-outline': 'envelope.open',
  'chat': 'bubble.left.and.bubble.right.fill',
  'phone': 'phone.fill',
  
  // Actions
  'add-circle': 'plus.circle.fill',
  'add': 'plus',
  'delete': 'trash.fill',
  'edit': 'pencil.circle.fill',
  'cancel': 'xmark.circle.fill',
  'close': 'xmark',
  'share': 'square.and.arrow.up.fill',
  'refresh': 'arrow.clockwise',
  'search': 'magnifyingglass',
  
  // Status
  'info': 'info.circle.fill',
  'warning': 'exclamationmark.triangle.fill',
  'error': 'xmark.octagon.fill',
  
  // Time
  'event': 'calendar',
  'schedule': 'clock.fill',
  'timer': 'timer',
  'access-time': 'clock.fill',
  
  // Media
  'photo': 'photo.fill',
  'camera-alt': 'camera.fill',
  'videocam': 'video.fill',
  'play-arrow': 'play.fill',
  'pause': 'pause.fill',
  
  // Misc
  'lightbulb': 'lightbulb.fill',
  'settings': 'gearshape.fill',
  'help': 'questionmark.circle.fill',
  'star': 'star.fill',
  'favorite': 'heart.fill',
  'notifications': 'bell.fill',
  'bookmark': 'bookmark.fill',
};

/**
 * Resolve icon name to a valid SF Symbol
 * This function ALWAYS returns a valid symbol name
 */
function resolveIcon(name?: string): SFSymbolName {
  if (!name) {
    console.warn('[IconSymbol iOS] No icon name provided, using "questionmark.circle.fill"');
    return 'questionmark.circle.fill';
  }

  // Normalize the name (lowercase, replace underscores with hyphens)
  const normalized = name.toLowerCase().replace(/_/g, '-').trim();
  
  // Check our map
  if (normalized in ICON_MAP) {
    return ICON_MAP[normalized];
  }

  // If it looks like an SF Symbol (has dots), try it directly
  if (name.includes('.')) {
    return name as SFSymbolName;
  }

  // Fallback
  console.warn(`[IconSymbol iOS] Symbol "${name}" not found. Using "questionmark.circle.fill" as fallback.`);
  return 'questionmark.circle.fill';
}

/**
 * IconSymbol Component - iOS Version
 * 
 * Props:
 * - name: Simple icon name (e.g., "home", "shopping-cart")
 * - size: Icon size in pixels (default: 24)
 * - color: Icon color (default: "#FFFFFF")
 * - style: Additional styles
 * - weight: SF Symbol weight (default: "regular")
 * - type: SF Symbol rendering type (default: "hierarchical")
 * 
 * Legacy props (for backwards compatibility):
 * - ios_icon_name: Used as primary name
 * - android_material_icon_name: Used as fallback
 */
export function IconSymbol({
  name,
  ios_icon_name,
  android_material_icon_name,
  size = 24,
  color = '#FFFFFF',
  colors: colorArray,
  style,
  weight = "regular",
  type = "hierarchical",
}: {
  name?: string;
  ios_icon_name?: SFSymbolName | string;
  android_material_icon_name?: any;
  size?: number;
  color?: string | ColorValue;
  colors?: ColorValue[];
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  type?: "monochrome" | "hierarchical" | "palette" | "multicolor";
}) {
  // Priority: name > ios_icon_name > android_material_icon_name
  const symbolName = resolveIcon(name || ios_icon_name || android_material_icon_name);

  try {
    return (
      <SymbolView
        name={symbolName}
        size={size}
        tintColor={color}
        colors={colorArray}
        weight={weight}
        type={type}
        resizeMode="scaleAspectFit"
        style={[
          {
            width: size,
            height: size,
          },
          style,
        ]}
        fallback={
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
            <Text
              style={{
                fontSize: size * 0.6,
                color: color as string || '#FFFFFF',
                fontWeight: 'bold',
              }}
            >
              ?
            </Text>
          </View>
        }
      />
    );
  } catch (error) {
    console.error('[IconSymbol iOS] Render error:', error);
    
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
        <Text
          style={{
            fontSize: size * 0.6,
            color: color as string || '#FFFFFF',
            fontWeight: 'bold',
          }}
        >
          ?
        </Text>
      </View>
    );
  }
}
