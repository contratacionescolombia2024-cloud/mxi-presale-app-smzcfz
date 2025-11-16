
/**
 * Centralized icon configuration for the entire app
 * This ensures consistency and makes it easy to update icons
 */

export interface AppIcon {
  ios: string;
  android: string;
  label: string;
}

export const APP_ICONS = {
  // Navigation
  home: {
    ios: 'house.fill',
    android: 'home',
    label: 'Home',
  },
  menu: {
    ios: 'line.3.horizontal',
    android: 'menu',
    label: 'Menu',
  },
  back: {
    ios: 'chevron.left',
    android: 'arrow_back',
    label: 'Back',
  },
  forward: {
    ios: 'chevron.right',
    android: 'arrow_forward',
    label: 'Forward',
  },
  
  // Main Features
  purchase: {
    ios: 'cart.fill',
    android: 'shopping_cart',
    label: 'Purchase',
  },
  vesting: {
    ios: 'chart.line.uptrend.xyaxis',
    android: 'trending_up',
    label: 'Vesting',
  },
  referrals: {
    ios: 'person.2.fill',
    android: 'people',
    label: 'Referrals',
  },
  profile: {
    ios: 'person.fill',
    android: 'person',
    label: 'Profile',
  },
  kyc: {
    ios: 'checkmark.shield.fill',
    android: 'verified_user',
    label: 'KYC',
  },
  messages: {
    ios: 'message.fill',
    android: 'message',
    label: 'Messages',
  },
  admin: {
    ios: 'gearshape.fill',
    android: 'settings',
    label: 'Admin',
  },
  
  // Payment
  payment: {
    ios: 'creditcard.fill',
    android: 'credit_card',
    label: 'Payment',
  },
  bitcoin: {
    ios: 'bitcoinsign.circle.fill',
    android: 'currency_bitcoin',
    label: 'Bitcoin',
  },
  
  // Status
  verified: {
    ios: 'checkmark.circle.fill',
    android: 'check_circle',
    label: 'Verified',
  },
  pending: {
    ios: 'clock.fill',
    android: 'schedule',
    label: 'Pending',
  },
  error: {
    ios: 'xmark.octagon.fill',
    android: 'error',
    label: 'Error',
  },
  warning: {
    ios: 'exclamationmark.triangle.fill',
    android: 'warning',
    label: 'Warning',
  },
  info: {
    ios: 'info.circle.fill',
    android: 'info',
    label: 'Info',
  },
  
  // Actions
  add: {
    ios: 'plus.circle.fill',
    android: 'add_circle',
    label: 'Add',
  },
  edit: {
    ios: 'pencil.circle.fill',
    android: 'edit',
    label: 'Edit',
  },
  delete: {
    ios: 'trash.fill',
    android: 'delete',
    label: 'Delete',
  },
  share: {
    ios: 'square.and.arrow.up.fill',
    android: 'share',
    label: 'Share',
  },
  copy: {
    ios: 'doc.on.doc.fill',
    android: 'content_copy',
    label: 'Copy',
  },
  refresh: {
    ios: 'arrow.clockwise',
    android: 'refresh',
    label: 'Refresh',
  },
  search: {
    ios: 'magnifyingglass',
    android: 'search',
    label: 'Search',
  },
  close: {
    ios: 'xmark',
    android: 'close',
    label: 'Close',
  },
  
  // Misc
  calendar: {
    ios: 'calendar',
    android: 'event',
    label: 'Calendar',
  },
  chart: {
    ios: 'chart.bar.fill',
    android: 'bar_chart',
    label: 'Chart',
  },
  lock: {
    ios: 'lock.fill',
    android: 'lock',
    label: 'Lock',
  },
  email: {
    ios: 'envelope.fill',
    android: 'email',
    label: 'Email',
  },
  phone: {
    ios: 'phone.fill',
    android: 'phone',
    label: 'Phone',
  },
  star: {
    ios: 'star.fill',
    android: 'star',
    label: 'Star',
  },
  notification: {
    ios: 'bell.fill',
    android: 'notifications',
    label: 'Notification',
  },
} as const;

export type AppIconName = keyof typeof APP_ICONS;
