
import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { StyleProp, ViewStyle, Text, View } from "react-native";
import React from "react";

// Comprehensive SF Symbol name validation and fallback mapping
const SF_SYMBOL_MAP: Record<string, SymbolViewProps["name"]> = {
  // Home & Navigation
  'house.fill': 'house.fill',
  'house': 'house',
  'home': 'house.fill',
  'menu': 'line.3.horizontal',
  'chevron.right': 'chevron.right',
  'chevron.left': 'chevron.left',
  'arrow.right': 'arrow.right',
  'arrow.left': 'arrow.left',
  
  // Shopping & Purchase
  'cart.fill': 'cart.fill',
  'cart': 'cart',
  'shopping': 'cart.fill',
  'shopping_cart': 'cart.fill',
  'creditcard.fill': 'creditcard.fill',
  'creditcard': 'creditcard',
  'credit_card': 'creditcard.fill',
  'payment': 'creditcard.fill',
  'bitcoinsign.circle.fill': 'bitcoinsign.circle.fill',
  'bitcoinsign.circle': 'bitcoinsign.circle',
  'bitcoin': 'bitcoinsign.circle.fill',
  'currency_bitcoin': 'bitcoinsign.circle.fill',
  
  // Charts & Analytics
  'chart.line.uptrend.xyaxis': 'chart.line.uptrend.xyaxis',
  'chart.bar.fill': 'chart.bar.fill',
  'chart.bar': 'chart.bar',
  'chart': 'chart.line.uptrend.xyaxis',
  'trending': 'chart.line.uptrend.xyaxis',
  'trending_up': 'chart.line.uptrend.xyaxis',
  'analytics': 'chart.bar.fill',
  'bar_chart': 'chart.bar.fill',
  'show_chart': 'chart.line.uptrend.xyaxis',
  
  // People & Social
  'person.fill': 'person.fill',
  'person': 'person',
  'person.2.fill': 'person.2.fill',
  'person.2': 'person.2',
  'person.3.fill': 'person.3.fill',
  'person.3': 'person.3',
  'people': 'person.2.fill',
  'group': 'person.3.fill',
  
  // Verification & Security
  'checkmark.shield.fill': 'checkmark.shield.fill',
  'checkmark.shield': 'checkmark.shield',
  'person.badge.shield.checkmark.fill': 'person.badge.shield.checkmark.fill',
  'shield.fill': 'shield.fill',
  'shield': 'shield',
  'checkmark.seal.fill': 'checkmark.seal.fill',
  'checkmark.seal': 'checkmark.seal',
  'checkmark.circle.fill': 'checkmark.circle.fill',
  'checkmark.circle': 'checkmark.circle',
  'checkmark': 'checkmark',
  'lock.shield.fill': 'lock.shield.fill',
  'lock.shield': 'lock.shield',
  'security': 'lock.shield.fill',
  'verified': 'checkmark.seal.fill',
  'verified_user': 'checkmark.shield.fill',
  'check': 'checkmark',
  'check_circle': 'checkmark.circle.fill',
  
  // Documents & Files
  'doc.fill': 'doc.fill',
  'doc': 'doc',
  'doc.text.fill': 'doc.text.fill',
  'doc.text': 'doc.text',
  'doc.on.doc.fill': 'doc.on.doc.fill',
  'doc.on.doc': 'doc.on.doc',
  'document': 'doc.text.fill',
  'description': 'doc.text.fill',
  'file': 'doc.fill',
  'insert_drive_file': 'doc.fill',
  'content_copy': 'doc.on.doc.fill',
  
  // Communication
  'message.fill': 'message.fill',
  'message': 'message',
  'envelope.fill': 'envelope.fill',
  'envelope': 'envelope',
  'envelope.open.fill': 'envelope.open.fill',
  'envelope.open': 'envelope.open',
  'mail': 'envelope.fill',
  'email': 'envelope.fill',
  'mail_outline': 'envelope.open',
  'chat': 'bubble.left.and.bubble.right.fill',
  'bubble.left.and.bubble.right.fill': 'bubble.left.and.bubble.right.fill',
  
  // Actions
  'plus.circle.fill': 'plus.circle.fill',
  'plus.circle': 'plus.circle',
  'plus': 'plus',
  'add': 'plus.circle.fill',
  'add_circle': 'plus.circle.fill',
  'trash.fill': 'trash.fill',
  'trash': 'trash',
  'delete': 'trash.fill',
  'pencil.circle.fill': 'pencil.circle.fill',
  'pencil.circle': 'pencil.circle',
  'pencil': 'pencil',
  'edit': 'pencil.circle.fill',
  'xmark.circle.fill': 'xmark.circle.fill',
  'xmark.circle': 'xmark.circle',
  'xmark': 'xmark',
  'close': 'xmark.circle.fill',
  'cancel': 'xmark.circle.fill',
  'square.and.arrow.up.fill': 'square.and.arrow.up.fill',
  'square.and.arrow.up': 'square.and.arrow.up',
  'share': 'square.and.arrow.up.fill',
  
  // Status
  'info.circle.fill': 'info.circle.fill',
  'info.circle': 'info.circle',
  'info': 'info.circle.fill',
  'exclamationmark.triangle.fill': 'exclamationmark.triangle.fill',
  'exclamationmark.triangle': 'exclamationmark.triangle',
  'warning': 'exclamationmark.triangle.fill',
  'xmark.octagon.fill': 'xmark.octagon.fill',
  'xmark.octagon': 'xmark.octagon',
  'error': 'xmark.octagon.fill',
  'success': 'checkmark.circle.fill',
  
  // Calendar & Time
  'calendar': 'calendar',
  'event': 'calendar',
  'clock.fill': 'clock.fill',
  'clock': 'clock',
  'time': 'clock.fill',
  'schedule': 'clock.fill',
  
  // Misc
  'lightbulb.fill': 'lightbulb.fill',
  'lightbulb': 'lightbulb',
  'gearshape.fill': 'gearshape.fill',
  'gearshape': 'gearshape',
  'settings': 'gearshape.fill',
  'questionmark.circle.fill': 'questionmark.circle.fill',
  'questionmark.circle': 'questionmark.circle',
  'help': 'questionmark.circle.fill',
};

// Category-based fallbacks
const CATEGORY_FALLBACKS: Record<string, SymbolViewProps["name"]> = {
  'house': 'house.fill',
  'home': 'house.fill',
  'cart': 'cart.fill',
  'shopping': 'cart.fill',
  'chart': 'chart.line.uptrend.xyaxis',
  'person': 'person.fill',
  'people': 'person.2.fill',
  'shield': 'checkmark.shield.fill',
  'doc': 'doc.fill',
  'document': 'doc.text.fill',
  'message': 'message.fill',
  'mail': 'envelope.fill',
  'add': 'plus.circle.fill',
  'delete': 'trash.fill',
  'trash': 'trash.fill',
  'edit': 'pencil.circle.fill',
  'close': 'xmark.circle.fill',
  'info': 'info.circle.fill',
  'warning': 'exclamationmark.triangle.fill',
  'error': 'xmark.octagon.fill',
  'calendar': 'calendar',
  'clock': 'clock.fill',
  'time': 'clock.fill',
  'lightbulb': 'lightbulb.fill',
  'settings': 'gearshape.fill',
  'help': 'questionmark.circle.fill',
};

/**
 * Resolves an icon name to a valid SF Symbol
 */
function resolveSymbolName(
  iosIconName?: string,
  androidIconName?: string
): SymbolViewProps["name"] {
  // First, try the provided iOS icon name
  if (iosIconName) {
    // Direct mapping
    if (iosIconName in SF_SYMBOL_MAP) {
      return SF_SYMBOL_MAP[iosIconName];
    }

    // Try lowercase version
    const lowerIosName = iosIconName.toLowerCase();
    if (lowerIosName in SF_SYMBOL_MAP) {
      return SF_SYMBOL_MAP[lowerIosName];
    }

    // Try to find a category match
    for (const [category, fallback] of Object.entries(CATEGORY_FALLBACKS)) {
      if (lowerIosName.includes(category)) {
        console.log(`iOS icon "${iosIconName}" matched category "${category}", using "${fallback}"`);
        return fallback;
      }
    }
  }

  // Try to map from Android icon name
  if (androidIconName) {
    // Direct mapping
    if (androidIconName in SF_SYMBOL_MAP) {
      return SF_SYMBOL_MAP[androidIconName];
    }

    // Try lowercase version
    const lowerAndroidName = androidIconName.toLowerCase();
    if (lowerAndroidName in SF_SYMBOL_MAP) {
      return SF_SYMBOL_MAP[lowerAndroidName];
    }

    // Try to find a category match
    for (const [category, fallback] of Object.entries(CATEGORY_FALLBACKS)) {
      if (lowerAndroidName.includes(category)) {
        console.log(`iOS icon mapped from Android "${androidIconName}" via category "${category}", using "${fallback}"`);
        return fallback;
      }
    }
  }

  // Ultimate fallback
  console.warn(
    `SF Symbol not found: iOS="${iosIconName}", Android="${androidIconName}". Using "questionmark.circle.fill" as fallback.`
  );
  return 'questionmark.circle.fill';
}

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
  const symbolName = resolveSymbolName(ios_icon_name, android_material_icon_name);

  try {
    return (
      <SymbolView
        weight={weight}
        tintColor={color}
        resizeMode="scaleAspectFit"
        name={symbolName}
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
    console.error('Error rendering SF Symbol:', error, 'Symbol:', symbolName);
    return (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ fontSize: size * 0.7, color }}>?</Text>
      </View>
    );
  }
}
