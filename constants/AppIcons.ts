
/**
 * RADICAL ICON CONFIGURATION
 * 
 * Centralized icon names for the entire app.
 * Use these constants to ensure consistency and avoid typos.
 * 
 * Usage:
 * import { ICONS } from '@/constants/AppIcons';
 * <IconSymbol name={ICONS.HOME} size={24} color={colors.text} />
 */

export const ICONS = Object.freeze({
  // Navigation
  HOME: 'home',
  MENU: 'menu',
  BACK: 'arrow-back',
  FORWARD: 'arrow-forward',
  ARROW_FORWARD: 'arrow-forward',
  ARROW_UP: 'arrow-upward',
  CHEVRON_LEFT: 'chevron-left',
  CHEVRON_RIGHT: 'chevron-right',
  LINK: 'link',
  
  // Shopping & Money
  SHOPPING_CART: 'shopping-cart',
  CREDIT_CARD: 'credit-card',
  PAYMENT: 'payment',
  MONEY: 'attach-money',
  
  // Charts & Analytics
  TRENDING_UP: 'trending-up',
  BAR_CHART: 'bar-chart',
  SHOW_CHART: 'show-chart',
  ANALYTICS: 'analytics',
  
  // People
  PERSON: 'person',
  PEOPLE: 'people',
  GROUP: 'group',
  
  // Verification & Security
  VERIFIED_USER: 'verified-user',
  SECURITY: 'security',
  VERIFIED: 'verified',
  CHECK_CIRCLE: 'check-circle',
  CHECK: 'check',
  LOCK: 'lock',
  SHIELD: 'shield',
  
  // Documents
  DESCRIPTION: 'description',
  FILE: 'insert-drive-file',
  COPY: 'content-copy',
  FOLDER: 'folder',
  
  // Communication
  MESSAGE: 'message',
  EMAIL: 'email',
  MAIL_OUTLINE: 'mail-outline',
  CHAT: 'chat',
  PHONE: 'phone',
  
  // Actions
  ADD_CIRCLE: 'add-circle',
  ADD: 'add',
  DELETE: 'delete',
  EDIT: 'edit',
  CANCEL: 'cancel',
  CLOSE: 'close',
  SHARE: 'share',
  REFRESH: 'refresh',
  SEARCH: 'search',
  
  // Status
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  
  // Time
  EVENT: 'event',
  SCHEDULE: 'schedule',
  TIMER: 'timer',
  ACCESS_TIME: 'access-time',
  
  // Media
  PHOTO: 'photo',
  CAMERA: 'camera-alt',
  VIDEO: 'videocam',
  PLAY: 'play-arrow',
  PAUSE: 'pause',
  
  // Misc
  LIGHTBULB: 'lightbulb',
  SETTINGS: 'settings',
  HELP: 'help',
  STAR: 'star',
  FAVORITE: 'favorite',
  NOTIFICATIONS: 'notifications',
  BOOKMARK: 'bookmark',
} as const);

export type IconName = typeof ICONS[keyof typeof ICONS];

/**
 * Legacy icon configuration for backwards compatibility
 * This maintains the old structure but uses the new simplified names
 * All objects are frozen to prevent mutations and ensure serializability
 */
export interface AppIcon {
  readonly ios: string;
  readonly android: string;
  readonly label: string;
}

// CRITICAL: Freeze all icon objects to ensure they're immutable and serializable
export const APP_ICONS: Readonly<Record<string, Readonly<AppIcon>>> = Object.freeze({
  home: Object.freeze({ ios: 'house.fill', android: 'home', label: 'Home' }),
  menu: Object.freeze({ ios: 'line.3.horizontal', android: 'menu', label: 'Menu' }),
  back: Object.freeze({ ios: 'chevron.left', android: 'arrow-back', label: 'Back' }),
  forward: Object.freeze({ ios: 'chevron.right', android: 'arrow-forward', label: 'Forward' }),
  
  purchase: Object.freeze({ ios: 'cart.fill', android: 'shopping-cart', label: 'Purchase' }),
  vesting: Object.freeze({ ios: 'chart.line.uptrend.xyaxis', android: 'trending-up', label: 'Vesting' }),
  referrals: Object.freeze({ ios: 'person.2.fill', android: 'people', label: 'Referrals' }),
  profile: Object.freeze({ ios: 'person.fill', android: 'person', label: 'Profile' }),
  kyc: Object.freeze({ ios: 'checkmark.shield.fill', android: 'verified-user', label: 'KYC' }),
  messages: Object.freeze({ ios: 'message.fill', android: 'message', label: 'Messages' }),
  admin: Object.freeze({ ios: 'gearshape.fill', android: 'settings', label: 'Admin' }),
  
  payment: Object.freeze({ ios: 'creditcard.fill', android: 'credit-card', label: 'Payment' }),
  bitcoin: Object.freeze({ ios: 'bitcoinsign.circle.fill', android: 'attach-money', label: 'Bitcoin' }),
  
  verified: Object.freeze({ ios: 'checkmark.circle.fill', android: 'check-circle', label: 'Verified' }),
  pending: Object.freeze({ ios: 'clock.fill', android: 'schedule', label: 'Pending' }),
  error: Object.freeze({ ios: 'xmark.octagon.fill', android: 'error', label: 'Error' }),
  warning: Object.freeze({ ios: 'exclamationmark.triangle.fill', android: 'warning', label: 'Warning' }),
  info: Object.freeze({ ios: 'info.circle.fill', android: 'info', label: 'Info' }),
  
  add: Object.freeze({ ios: 'plus.circle.fill', android: 'add-circle', label: 'Add' }),
  edit: Object.freeze({ ios: 'pencil.circle.fill', android: 'edit', label: 'Edit' }),
  delete: Object.freeze({ ios: 'trash.fill', android: 'delete', label: 'Delete' }),
  share: Object.freeze({ ios: 'square.and.arrow.up.fill', android: 'share', label: 'Share' }),
  copy: Object.freeze({ ios: 'doc.on.doc.fill', android: 'content-copy', label: 'Copy' }),
  refresh: Object.freeze({ ios: 'arrow.clockwise', android: 'refresh', label: 'Refresh' }),
  search: Object.freeze({ ios: 'magnifyingglass', android: 'search', label: 'Search' }),
  close: Object.freeze({ ios: 'xmark', android: 'close', label: 'Close' }),
  
  calendar: Object.freeze({ ios: 'calendar', android: 'event', label: 'Calendar' }),
  chart: Object.freeze({ ios: 'chart.bar.fill', android: 'bar-chart', label: 'Chart' }),
  lock: Object.freeze({ ios: 'lock.fill', android: 'lock', label: 'Lock' }),
  email: Object.freeze({ ios: 'envelope.fill', android: 'email', label: 'Email' }),
  phone: Object.freeze({ ios: 'phone.fill', android: 'phone', label: 'Phone' }),
  star: Object.freeze({ ios: 'star.fill', android: 'star', label: 'Star' }),
  notification: Object.freeze({ ios: 'bell.fill', android: 'notifications', label: 'Notification' }),
});

export type AppIconName = keyof typeof APP_ICONS;
