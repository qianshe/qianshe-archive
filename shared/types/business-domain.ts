/**
 * 业务领域专用类型定义
 * 涵盖用户管理、内容管理、项目管理、评论系统等核心业务领域
 */

// =============================================================================
// 用户管理领域
// =============================================================================

// 用户完整信息
export interface UserComplete {
  // 基础信息
  id: string;
  username: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  
  // 个人信息
  personalInfo: UserPersonalInfo;
  contactInfo: UserContactInfo;
  professionalInfo?: UserProfessionalInfo;
  
  // 系统信息
  accountInfo: UserAccountInfo;
  securityInfo: UserSecurityInfo;
  preferences: UserPreferences;
  
  // 权限和角色
  roles: UserRole[];
  permissions: UserPermission[];
  groups: UserGroup[];
  
  // 活动和统计
  profile: UserProfile;
  activity: UserActivity;
  statistics: UserStatistics;
  
  // 社交信息
  social: UserSocialInfo;
  
  // 内容相关
  content: UserContent;
  
  // 系统管理
  admin: UserAdminInfo;
  
  // 时间戳
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
  deletedAt?: number;
}

export interface UserPersonalInfo {
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  birthDate?: string;
  age?: number;
  location: UserLocation;
  timezone: string;
  language: string;
  nationality?: string;
  languages: Language[];
  interests: string[];
  skills: Skill[];
  education?: EducationInfo[];
  experience?: WorkExperienceInfo[];
}

export interface UserLocation {
  country: string;
  region?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isPublic: boolean;
}

export interface Language {
  code: string;
  name: string;
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
  isPrimary: boolean;
}

export interface Skill {
  name: string;
  category: string;
  level: number; // 1-5
  yearsExperience?: number;
  lastUsed?: string;
  verified?: boolean;
  endorsements?: string[];
}

export interface EducationInfo {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  description?: string;
  isCurrent: boolean;
}

export interface WorkExperienceInfo {
  company: string;
  position: string;
  department?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
  isCurrent: boolean;
}

export interface UserContactInfo {
  email: string;
  phone?: string;
  website?: string;
  socialMedia: SocialMediaLink[];
  address?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  communicationPreferences: CommunicationPreferences;
}

export interface SocialMediaLink {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'github' | 'youtube' | 'tiktok' | 'custom';
  username: string;
  url: string;
  isPublic: boolean;
  verified?: boolean;
}

export interface CommunicationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  mentions: boolean;
  comments: boolean;
  follows: boolean;
  messages: boolean;
  preferredContact: 'email' | 'phone' | 'social';
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface UserProfessionalInfo {
  currentJob?: {
    company: string;
    position: string;
    department?: string;
    startDate: string;
  };
  industry?: string;
  experience: number; // years
  specialization?: string[];
  portfolio?: string;
  resume?: string;
  linkedin?: string;
  github?: string;
  availableForHire: boolean;
  preferredWorkType: 'remote' | 'onsite' | 'hybrid' | 'flexible';
  preferredWorkLocation?: string[];
  salaryExpectation?: {
    min?: number;
    max?: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
}

export interface UserAccountInfo {
  status: UserAccountStatus;
  statusReason?: string;
  statusChangedAt?: number;
  statusChangedBy?: string;
  accountType: UserAccountType;
  subscription?: UserSubscription;
  limits: UserLimits;
  settings: UserAccountSettings;
  verification: UserVerification;
  flags: UserFlags;
}

export type UserAccountStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'banned'
  | 'pending'
  | 'under_review'
  | 'deleted';

export type UserAccountType = 
  | 'free'
  | 'basic'
  | 'premium'
  | 'business'
  | 'enterprise'
  | 'admin'
  | 'system';

export interface UserSubscription {
  plan: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'grace_period';
  startDate: number;
  endDate?: number;
  trialEndsAt?: number;
  renewsAutomatically: boolean;
  paymentMethod?: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  usage: SubscriptionUsage;
}

export interface SubscriptionUsage {
  storageUsed: number;
  storageLimit: number;
  bandwidthUsed: number;
  bandwidthLimit: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
  projectsUsed: number;
  projectsLimit: number;
  teamMembersUsed: number;
  teamMembersLimit: number;
}

export interface UserLimits {
  storage: number;
  bandwidth: number;
  projects: number;
  teamMembers: number;
  apiCalls: number;
  fileUploadSize: number;
  customDomains: number;
  exportRequests: number;
}

export interface UserAccountSettings {
  publicProfile: boolean;
  showEmail: boolean;
  showLocation: boolean;
  showBirthDate: boolean;
  allowMessages: boolean;
  allowFollows: boolean;
  allowTagging: boolean;
  showOnlineStatus: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'auto';
  customCSS?: string;
}

export interface UserVerification {
  email: {
    verified: boolean;
    verifiedAt?: number;
    token?: string;
    expiresAt?: number;
  };
  phone?: {
    verified: boolean;
    verifiedAt?: number;
    code?: string;
    expiresAt?: number;
  };
  identity?: {
    verified: boolean;
    verifiedAt?: number;
    documentType?: string;
    documentNumber?: string;
    expiresAt?: number;
  };
  address?: {
    verified: boolean;
    verifiedAt?: number;
    documents?: string[];
  };
}

export interface UserFlags {
  isStaff: boolean;
  isSuperuser: boolean;
  isBetaUser: boolean;
  isEarlyAdopter: boolean;
  isVerified: boolean;
  isPartner: boolean;
  isSponsor: boolean;
  isAmbassador: boolean;
  customFlags: Record<string, boolean>;
}

export interface UserSecurityInfo {
  password: {
    lastChanged: number;
    strength: 'weak' | 'fair' | 'good' | 'strong';
    compromised: boolean;
    requiresChange: boolean;
  };
  twoFactor: {
    enabled: boolean;
    method: 'sms' | 'app' | 'email' | 'key';
    setupAt?: number;
    backupCodes?: string[];
  };
  sessions: UserSession[];
  loginHistory: LoginHistory[];
  securityEvents: SecurityEvent[];
  trustedDevices: TrustedDevice[];
  apiKeys: UserAPIKey[];
}

export interface UserSession {
  id: string;
  device: DeviceInfo;
  location?: UserLocation;
  ip: string;
  userAgent: string;
  startedAt: number;
  lastActivityAt: number;
  isActive: boolean;
  expiresAt: number;
  current?: boolean;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'bot';
  os: string;
  browser: string;
  version: string;
  screenResolution?: string;
  isTouch: boolean;
}

export interface LoginHistory {
  id: string;
  timestamp: number;
  ip: string;
  userAgent: string;
  location?: UserLocation;
  success: boolean;
  failureReason?: string;
  method: 'password' | 'oauth' | 'sso' | 'magic_link' | 'biometric';
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  ip: string;
  userAgent?: string;
  location?: UserLocation;
  description: string;
  details?: Record<string, any>;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
}

export type SecurityEventType = 
  | 'login_success'
  | 'login_failure'
  | 'password_changed'
  | 'email_changed'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'suspicious_activity'
  | 'account_locked'
  | 'data_breach'
  | 'privilege_escalation'
  | 'export_downloaded';

export interface TrustedDevice {
  id: string;
  name: string;
  device: DeviceInfo;
  addedAt: number;
  lastUsedAt: number;
  expiresAt?: number;
  isActive: boolean;
  notificationToken?: string;
}

export interface UserAPIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsedAt?: number;
  expiresAt?: number;
  isActive: boolean;
  createdFrom: string;
  usage: {
    requests: number;
    lastRequest?: number;
  };
}

export interface UserPreferences {
  theme: ThemePreference;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  content: ContentPreferences;
  accessibility: AccessibilityPreferences;
  developer: DeveloperPreferences;
}

export interface ThemePreference {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  customCSS?: string;
  compactMode: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
}

export interface NotificationPreferences {
  email: EmailNotificationSettings;
  push: PushNotificationSettings;
  inApp: InAppNotificationSettings;
  channels: NotificationChannel[];
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
}

export interface EmailNotificationSettings {
  enabled: boolean;
  types: EmailNotificationTypes;
  frequency: 'immediate' | 'daily' | 'weekly';
  unsubscribeUrl?: string;
}

export interface EmailNotificationTypes {
  mentions: boolean;
  replies: boolean;
  follows: boolean;
  likes: boolean;
  comments: boolean;
  shares: boolean;
  messages: boolean;
  system: boolean;
  security: boolean;
  marketing: boolean;
  digest: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  types: PushNotificationTypes;
  deviceTokens: DeviceToken[];
  schedule?: PushNotificationSchedule;
}

export interface PushNotificationTypes {
  mentions: boolean;
  replies: boolean;
  follows: boolean;
  likes: boolean;
  comments: boolean;
  messages: boolean;
  system: boolean;
}

export interface DeviceToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  device: DeviceInfo;
  registeredAt: number;
  lastUsedAt: number;
  isActive: boolean;
}

export interface PushNotificationSchedule {
  enabled: boolean;
  startHour: number;
  endHour: number;
  timezone: string;
  weekends: boolean;
}

export interface InAppNotificationSettings {
  enabled: boolean;
  types: InAppNotificationTypes;
  sound: boolean;
  desktop: boolean;
  badge: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible: number;
}

export interface InAppNotificationTypes {
  mentions: boolean;
  replies: boolean;
  follows: boolean;
  likes: boolean;
  comments: boolean;
  shares: boolean;
  messages: boolean;
  system: boolean;
}

export interface NotificationChannel {
  type: 'email' | 'push' | 'sms' | 'webhook' | 'slack';
  enabled: boolean;
  address: string;
  verified: boolean;
  lastUsed?: number;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showBirthDate: boolean;
  showActivity: boolean;
  allowTagging: boolean;
  allowMessages: boolean;
  allowFollows: boolean;
  allowSearch: boolean;
  dataSharing: DataSharingPreferences;
  cookieConsent: CookieConsentPreferences;
}

export interface DataSharingPreferences {
  analytics: boolean;
  personalization: boolean;
  advertising: boolean;
  research: boolean;
  thirdParty: boolean;
}

export interface CookieConsentPreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
  social: boolean;
  updated: number;
}

export interface ContentPreferences {
  language: string[];
  topics: string[];
  categories: string[];
  tags: string[];
  sources: string[];
  matureContent: boolean;
  personalizedContent: boolean;
  autoPlay: boolean;
  showSpoilers: boolean;
  readingMode: 'standard' | 'focus' | 'speed' | 'custom';
}

export interface AccessibilityPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'default' | 'serif' | 'sans-serif' | 'dyslexic';
  lineHeight: 'compact' | 'normal' | 'relaxed';
  contrast: 'normal' | 'high' | 'very-high';
  colorBlindSupport: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  focusVisible: boolean;
  altText: boolean;
}

export interface DeveloperPreferences {
  codeEditor: CodeEditorPreferences;
  terminal: TerminalPreferences;
  git: GitPreferences;
  api: APIPreferences;
  debugging: DebuggingPreferences;
}

export interface CodeEditorPreferences {
  theme: string;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  autoSave: boolean;
  formatOnSave: boolean;
  linting: boolean;
  intellisense: boolean;
}

export interface TerminalPreferences {
  shell: string;
  fontSize: number;
  fontFamily: string;
  theme: string;
  opacity: number;
  alwaysOnTop: boolean;
  copyOnSelect: boolean;
  bell: boolean;
  cursorBlink: boolean;
}

export interface GitPreferences {
  defaultBranch: string;
  autoFetch: boolean;
  autoStash: boolean;
  commitTemplate?: string;
  signCommits: boolean;
  pullRebase: boolean;
  pushTags: boolean;
}

export interface APIPreferences {
  format: 'json' | 'xml' | 'yaml';
  indent: number;
  sortKeys: boolean;
  showLineNumbers: boolean;
  syntaxHighlight: boolean;
  autoComplete: boolean;
  historyEnabled: boolean;
  maxHistoryItems: number;
}

export interface DebuggingPreferences {
  autoOpenDebugView: boolean;
  showInlineValues: boolean;
  showVariableTypes: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  breakOnError: boolean;
  breakOnException: boolean;
  breakOnUnhandledRejection: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  inherits?: string[];
  isSystem: boolean;
  isActive: boolean;
  assignedAt: number;
  assignedBy: string;
  expiresAt?: number;
}

export interface UserPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  grantedAt: number;
  grantedBy: string;
  expiresAt?: number;
  isTemporary: boolean;
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
  value: any;
}

export interface UserGroup {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: 'system' | 'organization' | 'project' | 'community';
  members: number;
  isPublic: boolean;
  isActive: boolean;
  joinedAt: number;
  role: string;
  permissions: string[];
}

export interface UserProfile {
  avatar: UserProfileAvatar;
  banner: UserProfileBanner;
  bio: string;
  website?: string;
  socialLinks: SocialMediaLink[];
  portfolio: PortfolioLink[];
  achievements: Achievement[];
  badges: Badge[];
  reputation: UserReputation;
  stats: UserProfileStats;
}

export interface UserProfileAvatar {
  url: string;
  thumbnailUrl: string;
  originalUrl: string;
  uploadDate: number;
  size: number;
  format: string;
}

export interface UserProfileBanner {
  url: string;
  thumbnailUrl: string;
  originalUrl: string;
  uploadDate: number;
  size: number;
  format: string;
  position?: string;
}

export interface PortfolioLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  type: 'website' | 'project' | 'article' | 'video' | 'design' | 'code';
  tags: string[];
  featured: boolean;
  order: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: AchievementProgress;
  unlockedAt?: number;
  points: number;
  isHidden: boolean;
}

export interface AchievementProgress {
  current: number;
  required: number;
  percentage: number;
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  issuedBy: string;
  issuedAt: number;
  expiresAt?: number;
  verificationUrl?: string;
  isPublic: boolean;
}

export interface UserReputation {
  score: number;
  rank: string;
  level: number;
  points: ReputationPoints;
  history: ReputationHistory[];
  badges: ReputationBadge[];
}

export interface ReputationPoints {
  total: number;
  available: number;
  spent: number;
  earned: number;
  lost: number;
}

export interface ReputationHistory {
  id: string;
  type: 'earned' | 'lost' | 'spent';
  amount: number;
  reason: string;
  source: string;
  timestamp: number;
  expiresAt?: number;
}

export interface ReputationBadge {
  name: string;
  threshold: number;
  icon: string;
  color: string;
}

export interface UserProfileStats {
  followers: number;
  following: number;
  posts: number;
  comments: number;
  likes: number;
  shares: number;
  views: number;
  downloads: number;
  joinedAt: number;
  lastActive: number;
  streakDays: number;
}

export interface UserActivity {
  recent: UserActivityItem[];
  stats: UserActivityStats;
  patterns: ActivityPattern[];
  goals: ActivityGoal[];
}

export interface UserActivityItem {
  id: string;
  type: ActivityType;
  action: string;
  resource: string;
  resourceId: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  timestamp: number;
  ip?: string;
  location?: UserLocation;
  device?: DeviceInfo;
  isPublic: boolean;
}

export type ActivityType = 
  | 'login'
  | 'logout'
  | 'profile_update'
  | 'password_change'
  | 'email_change'
  | 'post_created'
  | 'post_updated'
  | 'post_deleted'
  | 'comment_created'
  | 'comment_updated'
  | 'comment_deleted'
  | 'like_given'
  | 'like_received'
  | 'follow_given'
  | 'follow_received'
  | 'share_created'
  | 'message_sent'
  | 'message_received'
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'file_uploaded'
  | 'file_downloaded'
  | 'search_performed'
  | 'export_created'
  | 'api_call'
  | 'system_event';

export interface UserActivityStats {
  totalActivities: number;
  activitiesToday: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  averagePerDay: number;
  mostActiveDay: string;
  mostActiveHour: number;
  topActivities: ActivityCount[];
  streaks: ActivityStreak[];
}

export interface ActivityCount {
  type: ActivityType;
  count: number;
  percentage: number;
}

export interface ActivityStreak {
  type: 'daily' | 'weekly' | 'monthly';
  current: number;
  longest: number;
  startDate: number;
  lastActiveDate: number;
}

export interface ActivityPattern {
  type: 'time_of_day' | 'day_of_week' | 'seasonal';
  data: number[];
  peak: number;
  peakTime?: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ActivityGoal {
  id: string;
  type: ActivityType;
  target: number;
  period: 'daily' | 'weekly' | 'monthly';
  current: number;
  progress: number;
  createdAt: number;
  deadline?: number;
  achieved: boolean;
  achievedAt?: number;
}

export interface UserStatistics {
  content: UserContentStats;
  engagement: UserEngagementStats;
  performance: UserPerformanceStats;
  growth: UserGrowthStats;
  comparison: UserComparisonStats;
}

export interface UserContentStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalWords: number;
  averageWordsPerPost: number;
  postsThisMonth: number;
  readingTime: number; // total reading time in minutes
  mostPopularPost?: string;
  categories: CategoryStats[];
  tags: TagStats[];
}

export interface CategoryStats {
  category: string;
  count: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface TagStats {
  tag: string;
  count: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface UserEngagementStats {
  totalViews: number;
  uniqueViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollowers: number;
  totalFollowing: number;
  averageLikesPerPost: number;
  averageCommentsPerPost: number;
  averageSharesPerPost: number;
  engagementRate: number;
  topPerformingContent: string[];
}

export interface UserPerformanceStats {
  averageReadingTime: number;
  bounceRate: number;
  returnVisitorRate: number;
  clickThroughRate: number;
  conversionRate: number;
  subscriberRate: number;
  emailOpenRate: number;
  emailClickRate: number;
  seoScore: number;
  siteSpeed: number;
  accessibilityScore: number;
}

export interface UserGrowthStats {
  followerGrowth: GrowthTrend;
  engagementGrowth: GrowthTrend;
  contentGrowth: GrowthTrend;
  viewGrowth: GrowthTrend;
  subscriberGrowth: GrowthTrend;
  monthlyGrowth: number;
  yearlyGrowth: number;
  projectedGrowth: number;
}

export interface GrowthTrend {
  daily: number[];
  weekly: number[];
  monthly: number[];
  current: number;
  previous: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface UserComparisonStats {
  rank: number;
  percentile: number;
  category: string;
  totalUsers: number;
  metrics: ComparisonMetric[];
}

export interface ComparisonMetric {
  name: string;
  userValue: number;
  averageValue: number;
  percentile: number;
  rank: number;
  improvement: number;
}

export interface UserSocialInfo {
  followers: UserFollowInfo;
  following: UserFollowingInfo;
  connections: UserConnectionInfo;
  mentions: UserMentionInfo;
  tags: UserTagInfo;
  blocks: UserBlockInfo;
  mutes: UserMuteInfo;
}

export interface UserFollowInfo {
  count: number;
  recent: UserProfile[];
  growth: GrowthTrend;
  requests: FollowRequest[];
  mutualFollows: UserProfile[];
}

export interface FollowRequest {
  id: string;
  requester: UserProfile;
  message?: string;
  createdAt: number;
  status: 'pending' | 'accepted' | 'declined';
  respondedAt?: number;
}

export interface UserFollowingInfo {
  count: number;
  recent: UserProfile[];
  growth: GrowthTrend;
  lists: FollowList[];
  recommendations: UserProfile[];
}

export interface FollowList {
  id: string;
  name: string;
  description?: string;
  users: UserProfile[];
  isPrivate: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserConnectionInfo {
  count: number;
  types: ConnectionType[];
  recent: Connection[];
  pending: ConnectionRequest[];
}

export interface ConnectionType {
  type: 'colleague' | 'classmate' | 'friend' | 'family' | 'mentor' | 'student' | 'client' | 'partner';
  count: number;
}

export interface Connection {
  id: string;
  user: UserProfile;
  type: ConnectionType['type'];
  since: number;
  strength: number; // 1-5
  interactions: number;
  lastInteraction: number;
  mutualConnections: number;
}

export interface ConnectionRequest {
  id: string;
  requester: UserProfile;
  type: ConnectionType['type'];
  message?: string;
  mutualConnections: UserProfile[];
  createdAt: number;
  status: 'pending' | 'accepted' | 'declined';
  respondedAt?: number;
}

export interface UserMentionInfo {
  count: number;
  recent: Mention[];
  mentionsByType: Record<string, number>;
  trending: string[];
}

export interface Mention {
  id: string;
  mentionedBy: UserProfile;
  content: string;
  context: string;
  url: string;
  type: 'post' | 'comment' | 'message';
  createdAt: number;
  isRead: boolean;
}

export interface UserTagInfo {
  count: number;
  recent: Tag[];
  tagsByType: Record<string, number>;
  popular: string[];
}

export interface Tag {
  id: string;
  name: string;
  type: 'skill' | 'interest' | 'topic' | 'location' | 'custom';
  count: number;
  addedBy: UserProfile;
  addedAt: number;
}

export interface UserBlockInfo {
  count: number;
  recent: UserProfile[];
  reasons: BlockReason[];
  since: number;
}

export interface BlockReason {
  type: 'spam' | 'harassment' | 'inappropriate' | 'privacy' | 'personal';
  count: number;
  description?: string;
}

export interface UserMuteInfo {
  count: number;
  recent: UserProfile[];
  types: MuteType[];
  duration: MuteDuration[];
}

export type MuteType = 'posts' | 'comments' | 'messages' | 'mentions' | 'all';

export interface MuteDuration {
  type: 'temporary' | 'permanent';
  duration?: number;
  expiresAt?: number;
}

export interface UserContent {
  posts: UserPostInfo;
  projects: UserProjectInfo;
  media: UserMediaInfo;
  drafts: UserDraftInfo;
  archived: UserArchivedInfo;
  scheduled: UserScheduledInfo;
}

export interface UserPostInfo {
  count: number;
  published: number;
  drafts: number;
  totalWords: number;
  averageReadingTime: number;
  categories: CategoryStats[];
  tags: TagStats[];
  recent: Post[];
  popular: Post[];
  scheduled: ScheduledPost[];
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  type: 'article' | 'tutorial' | 'news' | 'review' | 'opinion' | 'list' | 'custom';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  visibility: 'public' | 'private' | 'unlisted' | 'password_protected';
  featuredImage?: string;
  author: UserProfile;
  category?: string;
  tags: string[];
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
  metadata: PostMetadata;
  stats: PostStats;
  seo: PostSEO;
}

export interface PostMetadata {
  readingTime: number;
  wordCount: number;
  estimatedReadTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  series?: string;
  part?: number;
  totalParts?: number;
  relatedPosts: string[];
  translations: Record<string, string>;
  references: string[];
  acknowledgments?: string[];
  funding?: string[];
}

export interface PostStats {
  views: number;
  uniqueViews: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  downloads: number;
  averageReadTime: number;
  bounceRate: number;
  engagementRate: number;
  conversionRate: number;
  revenue?: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface PostSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noindex: boolean;
  nofollow: boolean;
  structuredData?: Record<string, any>;
  socialMedia: SocialMediaSEO;
  scores: SEOScores;
}

export interface SocialMediaSEO {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface SEOScores {
  overall: number;
  title: number;
  description: number;
  headings: number;
  content: number;
  images: number;
  links: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
}

export interface ScheduledPost {
  id: string;
  post: Post;
  scheduledAt: number;
  channels: string[];
  timezone: string;
  status: 'scheduled' | 'published' | 'failed';
  publishedAt?: number;
  error?: string;
}

export interface UserProjectInfo {
  count: number;
  active: number;
  completed: number;
  onHold: number;
  totalValue?: number;
  averageDuration: number;
  technologies: TechnologyStats[];
  types: ProjectTypeStats[];
  recent: Project[];
  featured: Project[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  type: 'web' | 'mobile' | 'desktop' | 'game' | 'design' | 'research' | 'custom';
  status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold' | 'cancelled';
  visibility: 'public' | 'private' | 'unlisted';
  featured: boolean;
  startDate?: number;
  endDate?: number;
  estimatedDuration?: number;
  budget?: number;
  currency?: string;
  team: ProjectTeamMember[];
  technologies: string[];
  categories: string[];
  tags: string[];
  links: ProjectLink[];
  images: ProjectImage[];
  demo?: ProjectDemo;
  repository?: ProjectRepository;
  client?: string;
  caseStudy?: string;
  awards: ProjectAward[];
  press: ProjectPress[];
  createdAt: number;
  updatedAt: number;
  metadata: ProjectMetadata;
  stats: ProjectStats;
}

export interface ProjectTeamMember {
  user: UserProfile;
  role: string;
  responsibilities: string[];
  joinedAt: number;
  leftAt?: number;
  isActive: boolean;
  contribution: number; // percentage
}

export interface ProjectLink {
  type: 'demo' | 'source' | 'documentation' | 'download' | 'app_store' | 'custom';
  url: string;
  title?: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface ProjectImage {
  url: string;
  thumbnailUrl: string;
  title?: string;
  description?: string;
  order: number;
  isFeatured: boolean;
  uploadedAt: number;
}

export interface ProjectDemo {
  url: string;
  type: 'video' | 'interactive' | 'live';
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  isActive: boolean;
}

export interface ProjectRepository {
  platform: 'github' | 'gitlab' | 'bitbucket' | 'custom';
  url: string;
  branch?: string;
  commit?: string;
  isActive: boolean;
  stars: number;
  forks: number;
  contributors: number;
  lastCommit?: number;
}

export interface ProjectAward {
  name: string;
  organization: string;
  category?: string;
  position?: number;
  date: number;
  url?: string;
  description?: string;
}

export interface ProjectPress {
  publication: string;
  title: string;
  url: string;
  date: number;
  author?: string;
  excerpt?: string;
  imageUrl?: string;
}

export interface ProjectMetadata {
  duration: number;
  teamSize: number;
  technologies: string[];
  methodologies: string[];
  tools: string[];
  challenges: string[];
  solutions: string[];
  learnings: string[];
  futurePlans: string[];
}

export interface ProjectStats {
  views: number;
  uniqueViews: number;
  likes: number;
  comments: number;
  shares: number;
  forks: number;
  stars: number;
  contributors: number;
  downloads: number;
  demoViews: number;
  sourceViews: number;
  conversionRate: number;
}

export interface TechnologyStats {
  technology: string;
  category: 'language' | 'framework' | 'library' | 'tool' | 'platform' | 'database';
  proficiency: number;
  projects: number;
  yearsExperience: number;
  lastUsed?: number;
}

export interface ProjectTypeStats {
  type: Project['type'];
  count: number;
  completionRate: number;
  averageBudget?: number;
  averageDuration: number;
  successRate: number;
}

export interface UserMediaInfo {
  count: number;
  totalSize: number;
  types: MediaTypeStats[];
  recent: MediaFile[];
  popular: MediaFile[];
  storage: MediaStorageStats;
}

export interface MediaTypeStats {
  type: FileCategory;
  count: number;
  size: number;
  averageSize: number;
  views: number;
  downloads: number;
}

export interface MediaFile {
  id: string;
  name: string;
  type: FileCategory;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: number;
  metadata: FileMetadata;
  stats: MediaStats;
  alt?: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
}

export interface MediaStats {
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  shares: number;
  averageViewTime?: number;
  bounceRate?: number;
}

export interface MediaStorageStats {
  used: number;
  available: number;
  total: number;
  percentage: number;
  byType: Record<FileCategory, number>;
  projectedGrowth: number;
}

export interface UserDraftInfo {
  count: number;
  posts: number;
  projects: number;
  totalWords: number;
  averageAge: number;
  oldest?: number;
  recent: Draft[];
}

export interface Draft {
  id: string;
  type: 'post' | 'project' | 'page' | 'custom';
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  lastEdited: number;
  wordCount: number;
  estimatedPublishTime?: number;
  autoSaveEnabled: boolean;
  collaborators: UserProfile[];
  version: number;
}

export interface UserArchivedInfo {
  count: number;
  posts: number;
  projects: number;
  totalSize: number;
  archiveDate?: number;
  retentionPeriod: number;
  expiresAt?: number;
  canRestore: boolean;
}

export interface UserScheduledInfo {
  count: number;
  posts: number;
  projects: number;
  nextScheduled?: number;
  upcoming: ScheduledContent[];
}

export interface ScheduledContent {
  id: string;
  type: 'post' | 'project' | 'announcement';
  title: string;
  scheduledAt: number;
  channels: string[];
  timezone: string;
  status: 'scheduled' | 'published' | 'failed';
  priority: 'low' | 'normal' | 'high';
}

export interface UserAdminInfo {
  role: AdminRole;
  permissions: AdminPermission[];
  department?: string;
  manager?: UserProfile;
  reports: UserProfile[];
  tools: AdminTool[];
  actions: AdminAction[];
  notes: AdminNote[];
}

export type AdminRole = 
  | 'super_admin'
  | 'admin'
  | 'moderator'
  | 'support'
  | 'analyst'
  | 'editor'
  | 'reviewer'
  | 'developer'
  | 'designer';

export interface AdminPermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
  grantedAt: number;
  grantedBy: string;
  expiresAt?: number;
}

export interface AdminTool {
  name: string;
  url: string;
  description?: string;
  category: 'content' | 'user' | 'system' | 'analytics' | 'security' | 'custom';
  permissions: string[];
  lastAccessed?: number;
}

export interface AdminAction {
  id: string;
  type: AdminActionType;
  target: string;
  targetType: 'user' | 'post' | 'project' | 'comment' | 'system';
  reason?: string;
  details?: Record<string, any>;
  performedAt: number;
  performedBy: string;
  duration?: number;
  reversible: boolean;
  reversedAt?: number;
  reversedBy?: string;
}

export type AdminActionType = 
  | 'suspend'
  | 'ban'
  | 'delete'
  | 'archive'
  | 'unpublish'
  | 'feature'
  | 'pin'
  | 'lock'
  | 'merge'
  | 'move'
  | 'restore'
  | 'verify'
  | 'promote'
  | 'demote';

export interface AdminNote {
  id: string;
  content: string;
  category: 'behavior' | 'performance' | 'security' | 'policy' | 'custom';
  visibility: 'private' | 'team' | 'public';
  tags: string[];
  createdAt: number;
  createdBy: string;
  updatedAt?: number;
  updatedBy?: string;
}

// =============================================================================
// 评论系统领域
// =============================================================================

export interface CommentSystem {
  comments: Comment[];
  threads: CommentThread[];
  reactions: CommentReaction[];
  moderation: CommentModeration[];
  analytics: CommentAnalytics;
  settings: CommentSettings;
}

export interface Comment {
  id: string;
  content: string;
  author: UserProfile;
  targetType: 'post' | 'project' | 'comment' | 'page' | 'custom';
  targetId: string;
  parentId?: string;
  rootId?: string;
  level: number;
  threadId: string;
  status: CommentStatus;
  visibility: CommentVisibility;
  mentions: UserProfile[];
  attachments: CommentAttachment[];
  reactions: CommentReaction[];
  replies: Comment[];
  metadata: CommentMetadata;
  stats: CommentStats;
  createdAt: number;
  updatedAt: number;
  editedAt?: number;
  deletedAt?: number;
  moderatedAt?: number;
  moderatedBy?: string;
}

export type CommentStatus = 
  | 'published'
  | 'pending'
  | 'spam'
  | 'deleted'
  | 'hidden'
  | 'flagged'
  | 'approved'
  | 'rejected';

export type CommentVisibility = 
  | 'public'
  | 'private'
  | 'unlisted'
  | 'members_only'
  | 'friends_only';

export interface CommentAttachment {
  id: string;
  type: 'image' | 'video' | 'document' | 'link' | 'code';
  url: string;
  title?: string;
  description?: string;
  size?: number;
  mimeType?: string;
  metadata?: Record<string, any>;
  uploadedAt: number;
}

export interface CommentReaction {
  id: string;
  type: ReactionType;
  userId: string;
  user: UserProfile;
  commentId: string;
  createdAt: number;
}

export type ReactionType = 
  | 'like'
  | 'love'
  | 'laugh'
  | 'wow'
  | 'sad'
  | 'angry'
  | 'custom';

export interface CommentMetadata {
  wordCount: number;
  readingTime: number;
  language: string;
  sentiment: CommentSentiment;
  toxicity: CommentToxicity;
  spam: CommentSpam;
  quality: CommentQuality;
  links: CommentLink[];
  code: CommentCode[];
  quotes: CommentQuote[];
}

export interface CommentSentiment {
  score: number; // -1 to 1
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface CommentToxicity {
  score: number; // 0 to 1
  label: 'safe' | 'low' | 'medium' | 'high';
  categories: {
    toxic: number;
    severe_toxic: number;
    obscene: number;
    threat: number;
    insult: number;
    identity_attack: number;
  };
}

export interface CommentSpam {
  score: number; // 0 to 1
  label: 'not_spam' | 'likely_spam' | 'spam';
  reasons: string[];
  confidence: number;
}

export interface CommentQuality {
  score: number; // 0 to 100
  label: 'poor' | 'fair' | 'good' | 'excellent';
  factors: QualityFactor[];
}

export interface QualityFactor {
  name: string;
  score: number;
  weight: number;
  description?: string;
}

export interface CommentLink {
  url: string;
  title?: string;
  domain: string;
  isSafe: boolean;
  isTracked: boolean;
  clickCount: number;
}

export interface CommentCode {
  language: string;
  code: string;
  lines: number;
  complexity?: number;
}

export interface CommentQuote {
  text: string;
  author: string;
  source?: string;
  context?: string;
}

export interface CommentStats {
  views: number;
  replies: number;
  reactions: number;
  shares: number;
  reports: number;
  averageReadTime: number;
  engagementRate: number;
  helpfulVotes: number;
  moderatorFlags: number;
}

export interface CommentThread {
  id: string;
  rootComment: Comment;
  comments: Comment[];
  depth: number;
  size: number;
  participants: UserProfile[];
  activity: ThreadActivity;
  metadata: ThreadMetadata;
  createdAt: number;
  updatedAt: number;
  lastActivityAt: number;
}

export interface ThreadActivity {
  messages: number;
  participants: number;
  averageResponseTime: number;
  totalReadingTime: number;
  engagementRate: number;
  growthRate: number;
}

export interface ThreadMetadata {
  isLocked: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  priority: 'low' | 'normal' | 'high';
  category?: string;
  tags: string[];
  moderation: ThreadModeration;
}

export interface ThreadModeration {
  status: 'active' | 'monitored' | 'restricted' | 'closed';
  moderatedBy?: string;
  moderatedAt?: number;
  reason?: string;
  autoModeration: boolean;
  flags: number;
  reports: number;
}

export interface CommentModeration {
  actions: ModerationAction[];
  rules: ModerationRule[];
  queue: ModerationQueue[];
  reports: ModerationReport[];
  autoModeration: AutoModerationConfig;
}

export interface ModerationAction {
  id: string;
  type: ModerationActionType;
  commentId: string;
  reason?: string;
  details?: Record<string, any>;
  performedBy: string;
  performedAt: number;
  duration?: number;
  reversed: boolean;
  reversedAt?: number;
  reversedBy?: string;
}

export type ModerationActionType = 
  | 'approve'
  | 'reject'
  | 'delete'
  | 'hide'
  | 'flag'
  | 'warn'
  | 'suspend'
  | 'ban'
  | 'lock'
  | 'pin'
  | 'feature';

export interface ModerationRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions: ModerationCondition[];
  actions: ModerationActionType[];
  priority: number;
  autoApply: boolean;
  createdBy: string;
  createdAt: number;
  updatedBy?: string;
  updatedAt?: number;
}

export interface ModerationCondition {
  field: string;
  operator: 'contains' | 'equals' | 'regex' | 'length' | 'links' | 'mentions' | 'attachments';
  value: any;
  caseSensitive?: boolean;
}

export interface ModerationQueue {
  id: string;
  commentId: string;
  type: 'pending' | 'flagged' | 'reported';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  status: 'pending' | 'in_review' | 'resolved' | 'escalated';
  createdAt: number;
  assignedAt?: number;
  resolvedAt?: number;
  resolvedBy?: string;
  resolution?: ModerationActionType;
  notes?: string;
}

export interface ModerationReport {
  id: string;
  commentId: string;
  reporterId: string;
  reason: ReportReason;
  description?: string;
  evidence?: string[];
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: number;
  resolution?: string;
  createdAt: number;
}

export type ReportReason = 
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'violence'
  | 'misinformation'
  | 'copyright'
  | 'privacy'
  | 'offensive'
  | 'off_topic'
  | 'other';

export interface AutoModerationConfig {
  enabled: boolean;
  rules: ModerationRule[];
  aiModeration: AIModerationConfig;
  spamProtection: SpamProtectionConfig;
  filters: ContentFilter[];
}

export interface AIModerationConfig {
  enabled: boolean;
  model: string;
  confidence: number;
  categories: {
    toxicity: boolean;
    spam: boolean;
    hate: boolean;
    violence: boolean;
    self_harm: boolean;
    sexual: boolean;
  };
  autoAction: ModerationActionType;
  humanReview: boolean;
}

export interface SpamProtectionConfig {
  enabled: boolean;
  rateLimit: {
    enabled: boolean;
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
  linkFilter: {
    enabled: boolean;
    allowedDomains: string[];
    blockedDomains: string[];
    maxLinks: number;
  };
  keywordFilter: {
    enabled: boolean;
    keywords: string[];
    regex: string[];
  };
  userFilter: {
    enabled: boolean;
    minAccountAge: number;
    minReputation: number;
    blockBanned: boolean;
  };
}

export interface ContentFilter {
  type: 'keyword' | 'regex' | 'link' | 'user' | 'ai';
  enabled: boolean;
  pattern: string;
  action: ModerationActionType;
  severity: 'low' | 'medium' | 'high';
  description?: string;
}

export interface CommentAnalytics {
  overview: CommentOverview;
  trends: CommentTrends;
  engagement: CommentEngagement;
  moderation: CommentModerationAnalytics;
  sentiment: CommentSentimentAnalytics;
  quality: CommentQualityAnalytics;
}

export interface CommentOverview {
  total: number;
  published: number;
  pending: number;
  spam: number;
  deleted: number;
  growthRate: number;
  averagePerDay: number;
  topContributors: UserProfile[];
  mostDiscussed: string[];
}

export interface CommentTrends {
  volume: TrendData;
  engagement: TrendData;
  sentiment: TrendData;
  quality: TrendData;
  moderation: TrendData;
}

export interface TrendData {
  daily: number[];
  weekly: number[];
  monthly: number[];
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CommentEngagement {
  totalReactions: number;
  totalReplies: number;
  totalShares: number;
  totalReports: number;
  averageReactions: number;
  averageReplies: number;
  averageReadTime: number;
  engagementRate: number;
  topReactions: ReactionTypeCount[];
  peakActivity: ActivityPeriod[];
}

export interface ReactionTypeCount {
  type: ReactionType;
  count: number;
  percentage: number;
}

export interface ActivityPeriod {
  hour: number;
  day: string;
  count: number;
  percentage: number;
}

export interface CommentModerationAnalytics {
  totalActions: number;
  autoActions: number;
  manualActions: number;
  averageResolutionTime: number;
  queueSize: number;
  averageWaitTime: number;
  moderatorPerformance: ModeratorPerformance[];
  ruleEffectiveness: RuleEffectiveness[];
}

export interface ModeratorPerformance {
  moderatorId: string;
  moderator: UserProfile;
  actionsPerformed: number;
  averageResolutionTime: number;
  accuracy: number;
  workload: number;
  efficiency: number;
}

export interface RuleEffectiveness {
  ruleId: string;
  rule: ModerationRule;
  triggered: number;
  accurate: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface CommentSentimentAnalytics {
  overall: CommentSentiment;
  distribution: SentimentDistribution;
  trends: SentimentTrends;
  topics: SentimentTopic[];
  influencers: SentimentInfluencer[];
}

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
  mixed: number;
}

export interface SentimentTrends {
  daily: SentimentPoint[];
  weekly: SentimentPoint[];
  monthly: SentimentPoint[];
}

export interface SentimentPoint {
  timestamp: number;
  positive: number;
  neutral: number;
  negative: number;
  average: number;
}

export interface SentimentTopic {
  topic: string;
  sentiment: CommentSentiment;
  count: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface SentimentInfluencer {
  userId: string;
  user: UserProfile;
  influence: number;
  averageSentiment: CommentSentiment;
  commentCount: number;
}

export interface CommentQualityAnalytics {
  overall: CommentQuality;
  distribution: QualityDistribution;
  trends: QualityTrends;
  factors: QualityFactorAnalytics[];
  improvements: QualityImprovement[];
}

export interface QualityDistribution {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

export interface QualityTrends {
  daily: QualityPoint[];
  weekly: QualityPoint[];
  monthly: QualityPoint[];
}

export interface QualityPoint {
  timestamp: number;
  average: number;
  distribution: QualityDistribution;
}

export interface QualityFactorAnalytics {
  factor: string;
  average: number;
  distribution: number[];
  correlation: number;
  impact: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface QualityImprovement {
  suggestion: string;
  impact: number;
  effort: 'low' | 'medium' | 'high';
  category: 'content' | 'structure' | 'engagement' | 'clarity';
  examples: string[];
}

export interface CommentSettings {
  enabled: boolean;
  requirements: CommentRequirements;
  permissions: CommentPermissions;
  display: CommentDisplaySettings;
  moderation: CommentModerationSettings;
  notifications: CommentNotificationSettings;
  integration: CommentIntegrationSettings;
}

export interface CommentRequirements {
  authenticated: boolean;
  emailVerification: boolean;
  minimumAccountAge: number;
  minimumReputation: number;
  rateLimit: {
    enabled: boolean;
    maxPerHour: number;
    maxPerDay: number;
  };
  wordLimit: {
    min: number;
    max: number;
  };
  allowedHtml: string[];
  blockedWords: string[];
  linkPolicy: 'allow' | 'nofollow' | 'block' | 'moderate';
}

export interface CommentPermissions {
  canComment: boolean;
  canReply: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReact: boolean;
  canReport: boolean;
  canModerate: boolean;
  customPermissions: Record<string, boolean>;
}

export interface CommentDisplaySettings {
  threadStyle: 'nested' | 'flat' | 'hybrid';
  sortOrder: 'newest' | 'oldest' | 'popular' | 'controversial';
  defaultExpanded: boolean;
  showAvatars: boolean;
  showTimestamps: boolean;
  showEditHistory: boolean;
  showReactionCounts: boolean;
  highlightAuthor: boolean;
  highlightModerator: boolean;
  pagination: {
    enabled: boolean;
    pageSize: number;
    loadMore: boolean;
  };
}

export interface CommentModerationSettings {
  autoModeration: boolean;
  preModeration: boolean;
  postModeration: boolean;
  userReporting: boolean;
  moderatorNotices: boolean;
  escalationThreshold: number;
  queueProcessing: 'realtime' | 'batch' | 'manual';
}

export interface CommentNotificationSettings {
  enabled: boolean;
  replyToMyComment: boolean;
  replyToMyThread: boolean;
  mentionInComment: boolean;
  commentOnMyContent: boolean;
  moderationActions: boolean;
  queueUpdates: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  channels: NotificationChannel[];
}

export interface CommentIntegrationSettings {
  socialSharing: boolean;
  emailNotifications: boolean;
  rssFeeds: boolean;
  webhooks: string[];
  thirdPartyServices: ThirdPartyService[];
  analytics: boolean;
  searchIndexing: boolean;
}

export interface ThirdPartyService {
  name: string;
  type: 'disqus' | 'facebook' | 'twitter' | 'slack' | 'discord' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
  sync: {
    enabled: boolean;
    direction: 'import' | 'export' | 'bidirectional';
    frequency: string;
  };
}