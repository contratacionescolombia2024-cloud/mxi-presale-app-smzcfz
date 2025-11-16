
// This file is a fallback for using MaterialIcons on Android and web.

import React from "react";
import { SymbolWeight } from "expo-symbols";
import {
  OpaqueColorValue,
  StyleProp,
  TextStyle,
  ViewStyle,
  Text,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Type for valid Material Icons
type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

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
    if (android_material_icon_name && android_material_icon_name in MaterialIcons.glyphMap) {
      iconName = android_material_icon_name as MaterialIconName;
    } else {
      console.warn(`Icon "${android_material_icon_name}" not found in MaterialIcons, using fallback "help"`);
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
