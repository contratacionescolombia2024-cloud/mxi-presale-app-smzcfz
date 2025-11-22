
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { Href } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import React, { useMemo, useEffect, useCallback } from 'react';

export interface TabBarItem {
  name: string;
  route: Href;
  iosIcon: string;
  androidIcon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 70,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.card,
    ...Platform.select({
      ios: {},
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    top: 0,
  },
});

// CRITICAL: Extract route string helper function OUTSIDE component
function extractRouteString(route: Href): string {
  if (typeof route === 'string') {
    return route;
  }
  // Handle Href object
  if (route && typeof route === 'object') {
    return (route as any).pathname || String(route);
  }
  return String(route);
}

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get('window').width - 32,
  borderRadius = 25,
  bottomMargin = Platform.OS === 'ios' ? 20 : 10,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // CRITICAL: Create shared value with initial value of 0
  const indicatorPosition = useSharedValue(0);

  // CRITICAL: Extract ONLY primitive values for worklets
  // Convert tabs to serializable data structure
  const serializedTabs = useMemo(() => {
    return tabs.map((tab) => ({
      name: tab.name,
      routeString: extractRouteString(tab.route),
      iosIcon: tab.iosIcon,
      androidIcon: tab.androidIcon,
      label: tab.label,
    }));
  }, [tabs]);

  // CRITICAL: Calculate primitive values OUTSIDE of worklet
  const tabsLength = serializedTabs.length;
  const tabWidth = containerWidth / tabsLength;

  // Find active index using serialized route strings
  const activeIndex = useMemo(() => {
    const index = serializedTabs.findIndex((tab) => {
      return pathname.startsWith(tab.routeString || '');
    });
    return index !== -1 ? index : 0;
  }, [serializedTabs, pathname]);

  // CRITICAL: Update indicator position when active index changes
  // Use useEffect to avoid worklet issues during initialization
  useEffect(() => {
    const targetPosition = activeIndex * tabWidth;
    console.log('[FloatingTabBar] Updating indicator position:', {
      activeIndex,
      tabWidth,
      targetPosition,
    });
    
    // Animate to new position
    indicatorPosition.value = withSpring(targetPosition, {
      damping: 20,
      stiffness: 90,
    });
  }, [activeIndex, tabWidth, indicatorPosition]);

  // CRITICAL: Create animated style with ONLY primitive values
  // The worklet must not capture any complex objects
  const indicatorStyle = useAnimatedStyle(() => {
    'worklet';
    // Only use the shared value - no external dependencies
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: tabWidth,
    };
  }, [tabWidth]); // Only depend on primitive tabWidth

  // CRITICAL: Wrap navigation in useCallback to prevent re-creation
  const handleTabPress = useCallback((route: Href) => {
    console.log('[FloatingTabBar] Tab pressed:', route);
    router.push(route);
  }, [router]);

  const TabBarContent = (
    <View style={[styles.tabBar, { width: containerWidth, borderRadius }]}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        const iconColor = isActive ? colors.primary : colors.text;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.route)}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name={tab.iosIcon}
              android_material_icon_name={tab.androidIcon}
              size={24}
              color={iconColor}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: iconColor,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, { paddingBottom: bottomMargin }]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint="dark" style={{ borderRadius }}>
          {TabBarContent}
        </BlurView>
      ) : (
        TabBarContent
      )}
    </SafeAreaView>
  );
}
