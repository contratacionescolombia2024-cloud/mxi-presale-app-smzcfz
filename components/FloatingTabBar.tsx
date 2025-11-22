
import { useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { usePathname, useRouter, Href } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { BlurView } from 'expo-blur';

export interface TabBarItem {
  name: string;
  route: string;
  iosIcon: string;
  androidIcon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
}

export default function FloatingTabBar({ tabs }: FloatingTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // CRITICAL: Extract active tab name as a primitive string
  const activeTabName = useMemo(() => {
    const currentPath = pathname || '';
    
    // Find the matching tab
    for (const tab of tabs) {
      if (currentPath.includes(tab.name)) {
        return tab.name;
      }
    }
    
    // Default to home if no match
    return '(home)';
  }, [pathname, tabs]);

  // CRITICAL: Create stable handler outside of map
  const handleTabPress = useCallback((route: string) => {
    console.log('🔄 Navigating to:', route);
    try {
      router.push(route as Href);
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  }, [router]);

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTabName === tab.name;
            
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tab}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                  <IconSymbol
                    ios_icon_name={tab.iosIcon}
                    android_material_icon_name={tab.androidIcon}
                    size={24}
                    color={isActive ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text style={[styles.label, isActive && styles.activeLabel]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border + '40',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.cardBackground + 'CC',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: colors.primary + '20',
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
});
