
import { useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

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

  // CRITICAL: Extract only primitive string value
  const currentPath = useMemo(() => {
    return String(pathname || '');
  }, [pathname]);

  // CRITICAL: Determine active tab using only string comparison
  const activeTabName = useMemo(() => {
    for (let i = 0; i < tabs.length; i++) {
      const tabName = String(tabs[i].name);
      if (currentPath.includes(tabName)) {
        return tabName;
      }
    }
    return '(home)';
  }, [currentPath, tabs]);

  // CRITICAL: Create navigation handler that doesn't capture router in worklets
  // Use a simple callback that only captures the router reference
  const handleTabPress = useCallback((route: string) => {
    console.log('🔄 Tab pressed, navigating to:', route);
    try {
      // Use setTimeout to break out of any potential worklet context
      setTimeout(() => {
        router.push(route as any);
      }, 0);
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          // Extract all values as primitives
          const tabName = String(tab.name);
          const tabRoute = String(tab.route);
          const tabIosIcon = String(tab.iosIcon);
          const tabAndroidIcon = String(tab.androidIcon);
          const tabLabel = String(tab.label);
          const isActive = activeTabName === tabName;
          
          return (
            <TouchableOpacity
              key={`tab-${index}-${tabName}`}
              style={styles.tab}
              onPress={() => handleTabPress(tabRoute)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <IconSymbol
                  ios_icon_name={tabIosIcon}
                  android_material_icon_name={tabAndroidIcon}
                  size={24}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tabLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.cardBackground + 'F0',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border + '40',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
