
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
} from 'react-native-reanimated';
import React from 'react';

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

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get('window').width - 32,
  borderRadius = 25,
  bottomMargin = Platform.OS === 'ios' ? 20 : 10,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const indicatorPosition = useSharedValue(0);

  const activeIndex = tabs.findIndex((tab) => {
    const tabPath = typeof tab.route === 'string' ? tab.route : tab.route.pathname;
    return pathname.startsWith(tabPath || '');
  });

  React.useEffect(() => {
    if (activeIndex !== -1) {
      const tabWidth = containerWidth / tabs.length;
      indicatorPosition.value = withSpring(activeIndex * tabWidth, {
        damping: 20,
        stiffness: 90,
      });
    }
  }, [activeIndex, containerWidth, tabs.length]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: containerWidth / tabs.length,
    };
  });

  const handleTabPress = (route: Href) => {
    console.log('[FloatingTabBar] Tab pressed:', route);
    router.push(route);
  };

  const TabBarContent = (
    <View style={[styles.tabBar, { width: containerWidth, borderRadius }]}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        const iconColor = isActive ? colors.primary : colors.text;

        console.log(`[FloatingTabBar] Rendering tab "${tab.label}":`, {
          ios: tab.iosIcon,
          android: tab.androidIcon,
          isActive,
          color: iconColor,
        });

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
