
import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { StyleProp, ViewStyle, Text, View, ColorValue } from "react-native";
import React from "react";

// VERIFIED SF Symbols - These are guaranteed to exist in iOS
const VERIFIED_SF_SYMBOLS: Record<string, SymbolViewProps["name"]> = {
  // Home & Navigation
  'home': 'house.fill',
  'house.fill': 'house.fill',
  'house': 'house',
  'menu': 'line.3.horizontal',
  'chevron_right': 'chevron.right',
  'chevron_left': 'chevron.left',
  'arrow_forward': 'arrow.right',
  'arrow_back': 'arrow.left',
  
  // Shopping & Purchase
  'shopping_cart': 'cart.fill',
  'cart.fill': 'cart.fill',
  'cart': 'cart',
  'credit_card': 'creditcard.fill',
  'creditcard.fill': 'creditcard.fill',
  'creditcard': 'creditcard',
  'payment': 'creditcard.fill',
  'currency_bitcoin': 'bitcoinsign.circle.fill',
  'bitcoinsign.circle.fill': 'bitcoinsign.circle.fill',
  
  // Charts & Analytics
  'trending_up': 'chart.line.uptrend.xyaxis',
  'chart.line.uptrend.xyaxis': 'chart.line.uptrend.xyaxis',
  'bar_chart': 'chart.bar.fill',
  'chart.bar.fill': 'chart.bar.fill',
  'show_chart': 'chart.line.uptrend.xyaxis',
  'analytics': 'chart.bar.fill',
  
  // People & Social
  'person': 'person.fill',
  'person.fill': 'person.fill',
  'people': 'person.2.fill',
  'person.2.fill': 'person.2.fill',
  'group': 'person.3.fill',
  'person.3.fill': 'person.3.fill',
  
  // Verification & Security
  'verified_user': 'checkmark.shield.fill',
  'checkmark.shield.fill': 'checkmark.shield.fill',
  'checkmark.shield': 'checkmark.shield',
  'security': 'lock.shield.fill',
  'shield': 'shield.fill',
  'shield.fill': 'shield.fill',
  'verified': 'checkmark.seal.fill',
  'checkmark.seal.fill': 'checkmark.seal.fill',
  'check_circle': 'checkmark.circle.fill',
  'checkmark.circle.fill': 'checkmark.circle.fill',
  'check': 'checkmark',
  'checkmark': 'checkmark',
  'lock': 'lock.fill',
  'lock.fill': 'lock.fill',
  
  // Documents & Files
  'description': 'doc.text.fill',
  'doc.text.fill': 'doc.text.fill',
  'doc.fill': 'doc.fill',
  'insert_drive_file': 'doc.fill',
  'content_copy': 'doc.on.doc.fill',
  'doc.on.doc.fill': 'doc.on.doc.fill',
  'folder': 'folder.fill',
  'folder.fill': 'folder.fill',
  
  // Communication
  'message': 'message.fill',
  'message.fill': 'message.fill',
  'email': 'envelope.fill',
  'envelope.fill': 'envelope.fill',
  'mail_outline': 'envelope.open',
  'envelope.open': 'envelope.open',
  'chat': 'bubble.left.and.bubble.right.fill',
  'bubble.left.and.bubble.right.fill': 'bubble.left.and.bubble.right.fill',
  'phone': 'phone.fill',
  'phone.fill': 'phone.fill',
  
  // Actions
  'add_circle': 'plus.circle.fill',
  'plus.circle.fill': 'plus.circle.fill',
  'add': 'plus',
  'plus': 'plus',
  'delete': 'trash.fill',
  'trash.fill': 'trash.fill',
  'edit': 'pencil.circle.fill',
  'pencil.circle.fill': 'pencil.circle.fill',
  'cancel': 'xmark.circle.fill',
  'xmark.circle.fill': 'xmark.circle.fill',
  'close': 'xmark',
  'xmark': 'xmark',
  'share': 'square.and.arrow.up.fill',
  'square.and.arrow.up.fill': 'square.and.arrow.up.fill',
  'refresh': 'arrow.clockwise',
  'arrow.clockwise': 'arrow.clockwise',
  'search': 'magnifyingglass',
  'magnifyingglass': 'magnifyingglass',
  
  // Status
  'info': 'info.circle.fill',
  'info.circle.fill': 'info.circle.fill',
  'warning': 'exclamationmark.triangle.fill',
  'exclamationmark.triangle.fill': 'exclamationmark.triangle.fill',
  'error': 'xmark.octagon.fill',
  'xmark.octagon.fill': 'xmark.octagon.fill',
  
  // Calendar & Time
  'event': 'calendar',
  'calendar': 'calendar',
  'schedule': 'clock.fill',
  'clock.fill': 'clock.fill',
  'timer': 'timer',
  
  // Media
  'photo': 'photo.fill',
  'photo.fill': 'photo.fill',
  'camera_alt': 'camera.fill',
  'camera.fill': 'camera.fill',
  'videocam': 'video.fill',
  'video.fill': 'video.fill',
  'play_arrow': 'play.fill',
  'play.fill': 'play.fill',
  'pause': 'pause.fill',
  'pause.fill': 'pause.fill',
  
  // Misc
  'lightbulb': 'lightbulb.fill',
  'lightbulb.fill': 'lightbulb.fill',
  'settings': 'gearshape.fill',
  'gearshape.fill': 'gearshape.fill',
  'help': 'questionmark.circle.fill',
  'questionmark.circle.fill': 'questionmark.circle.fill',
  'star': 'star.fill',
  'star.fill': 'star.fill',
  'favorite': 'heart.fill',
  'heart.fill': 'heart.fill',
  'notifications': 'bell.fill',
  'bell.fill': 'bell.fill',
  'bookmark': 'bookmark.fill',
  'bookmark.fill': 'bookmark.fill',
};

/**
 * Resolves an icon name to a valid SF Symbol
 * Uses only verified symbols to prevent rendering issues
 */
function resolveSymbolName(
  iosIconName?: string,
  androidIconName?: string
): SymbolViewProps["name"] {
  // Try iOS icon name first
  if (iosIconName) {
    const iconKey = iosIconName.toLowerCase().trim();
    
    if (iconKey in VERIFIED_SF_SYMBOLS) {
      const resolvedSymbol = VERIFIED_SF_SYMBOLS[iconKey];
      console.log(`[IconSymbol iOS] ✓ Resolved "${iosIconName}" -> "${resolvedSymbol}"`);
      return resolvedSymbol;
    }
  }

  // Try Android icon name
  if (androidIconName) {
    const iconKey = androidIconName.toLowerCase().trim();
    
    if (iconKey in VERIFIED_SF_SYMBOLS) {
      const resolvedSymbol = VERIFIED_SF_SYMBOLS[iconKey];
      console.log(`[IconSymbol iOS] ✓ Resolved from Android "${androidIconName}" -> "${resolvedSymbol}"`);
      return resolvedSymbol;
    }
  }

  // Fallback
  console.warn(
    `[IconSymbol iOS] ✗ SF Symbol not found: iOS="${iosIconName}", Android="${androidIconName}". Using fallback.`,
    `\nAvailable symbols: ${Object.keys(VERIFIED_SF_SYMBOLS).slice(0, 10).join(', ')}...`
  );
  return 'questionmark.circle.fill';
}

/**
 * IconSymbol component for iOS
 * Uses SF Symbols with comprehensive error handling
 */
export function IconSymbol({
  ios_icon_name,
  android_material_icon_name,
  size = 24,
  color = '#FFFFFF',
  colors: colorArray,
  style,
  weight = "regular",
  type = "hierarchical",
}: {
  ios_icon_name?: SymbolViewProps["name"] | string;
  android_material_icon_name?: any;
  size?: number;
  color?: string | ColorValue;
  colors?: ColorValue[];
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  type?: "monochrome" | "hierarchical" | "palette" | "multicolor";
}) {
  const symbolName = resolveSymbolName(ios_icon_name, android_material_icon_name);

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
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderRadius: size / 2,
              },
              style,
            ]}
          >
            <Text
              style={{
                fontSize: size * 0.5,
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
    console.error(
      '[IconSymbol iOS] Error rendering SF Symbol:',
      error,
      '\nSymbol:',
      symbolName,
      '\nOriginal iOS:',
      ios_icon_name,
      '\nOriginal Android:',
      android_material_icon_name
    );
    
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
        <Text
          style={{
            fontSize: size * 0.5,
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
