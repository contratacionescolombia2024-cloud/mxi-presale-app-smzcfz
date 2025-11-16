
import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { StyleProp, ViewStyle, Text, View } from "react-native";
import React from "react";

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
  // Fallback if icon name is invalid or missing
  if (!ios_icon_name) {
    console.warn('iOS icon name is missing, using fallback');
    return (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ fontSize: size * 0.7, color }}>?</Text>
      </View>
    );
  }

  try {
    return (
      <SymbolView
        weight={weight}
        tintColor={color}
        resizeMode="scaleAspectFit"
        name={ios_icon_name as SymbolViewProps["name"]}
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
