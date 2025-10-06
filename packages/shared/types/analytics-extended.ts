/**
 * 扩展的分析系统类型定义
 * 提供完整的业务分析、用户行为分析、内容分析等高级类型
 */

// =============================================================================
// 业务分析核心类型
// =============================================================================

// 分析指标值
export interface AnalyticsValue {
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend?: 'up' | 'down' | 'stable';
  confidence?: number; // 置信度 0-1
  significant?: boolean; // 是否统计显著
  unit?: string;
  format?: 'number' | 'percentage' | 'currency' | 'duration' | 'bytes';
  formattedValue?: string;
  formattedChange?: string;
}

// 分析时间序列
export interface AnalyticsTimeSeries {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
  tags?: Record<string, string>;
  quality?: 'high' | 'medium' | 'low'; // 数据质量
  sampleSize?: number; // 样本大小
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
}

// 分析维度
export interface AnalyticsDimension {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'category';
  values?: AnalyticsDimensionValue[];
  cardinality?: number;
  isFilterable?: boolean;
  isSortable?: boolean;
  description?: string;
}

export interface AnalyticsDimensionValue {
  value: string | number;
  displayName: string;
  count?: number;
  percentage?: number;
  icon?: string;
  color?: string;
}

// 分析度量
export interface AnalyticsMetric {
  name: string;
  displayName: string;
  type: 'basic' | 'ratio' | 'derived' | 'calculated';
  category: 'traffic' | 'engagement' | 'conversion' | 'revenue' | 'performance' | 'custom';
  unit?: string;
  format?: 'number' | 'percentage' | 'currency' | 'duration' | 'bytes';
  description?: string;
  formula?: string; // 计算公式
  dependencies?: string[]; // 依赖的其他指标
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'rate' | 'ratio';
  isKPI?: boolean;
  goal?: AnalyticsGoal;
  trendAnalysis?: TrendAnalysis;
}

export interface AnalyticsGoal {
  value: number;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  achieved?: boolean;
  achievement?: number; // 达成率 0-1
  achievedAt?: number;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: 'weak' | 'moderate' | 'strong';
  seasonality?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
  forecast?: AnalyticsForecast;
  anomalies?: AnalyticsAnomaly[];
}

export interface AnalyticsForecast {
  values: AnalyticsTimeSeries[];
  confidence: number;
  method: 'linear' | 'exponential' | 'arima' | 'prophet' | 'lstm';
  horizon: number; // 预测期数
  accuracy?: number; // 预测准确度
}

export interface AnalyticsAnomaly {
  timestamp: number;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'spike' | 'drop' | 'trend' | 'pattern';
  description?: string;
  isConfirmed?: boolean;
}

// =============================================================================
// 用户行为分析类型
// =============================================================================

// 用户会话分析
export interface UserSessionAnalytics {
  sessionId: string;
  userId?: number;
  isNewUser: boolean;
  entryPage: string;
  exitPage: string;
  duration: number;
  pageViews: number;
  bounce: boolean;
  conversion?: boolean;
  conversionValue?: number;
  events: SessionEvent[];
  path: UserPath[];
  deviceInfo: DeviceInfo;
  geoInfo: GeoInfo;
  acquisitionInfo: AcquisitionInfo;
  engagementMetrics: EngagementMetrics;
  segments: UserSegment[];
  quality: SessionQuality;
}

export interface SessionEvent {
  id: string;
  type: 'click' | 'scroll' | 'form_submit' | 'download' | 'video_play' | 'search' | 'custom';
  name: string;
  timestamp: number;
  page: string;
  element?: ElementInfo;
  metadata?: Record<string, any>;
  value?: number;
  category?: string;
  label?: string;
}

export interface ElementInfo {
  selector: string;
  text?: string;
  attributes?: Record<string, string>;
  position?: {
    x: number;
    y: number;
  };
  viewport?: {
    width: number;
    height: number;
  };
}

export interface UserPath {
  timestamp: number;
  page: string;
  title: string;
  referrer?: string;
  duration?: number;
  exitReason?: 'click' | 'back' | 'close' | 'timeout' | 'external_link';
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'bot';
  os: string;
  browser: string;
  browserVersion: string;
  screenResolution: {
    width: number;
    height: number;
  };
  viewportSize: {
    width: number;
    height: number;
  };
  devicePixelRatio: number;
  isTouch: boolean;
  language: string;
  timezone: string;
}

export interface GeoInfo {
  country: string;
  region: string;
  city: string;
  continent: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  isEU: boolean;
}

export interface AcquisitionInfo {
  source: string;
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface EngagementMetrics {
  scrollDepth: number;
  timeOnPage: number;
  clickCount: number;
  formInteractions: number;
  searchQueries: number;
  videoPlays: number;
  socialShares: number;
  commentsCount: number;
  rating?: number;
  satisfaction?: number;
}

export interface UserSegment {
  name: string;
  category: 'demographic' | 'behavioral' | 'technographic' | 'firmographic' | 'custom';
  rules: SegmentRule[];
  confidence: number;
  assignedAt: number;
}

export interface SegmentRule {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
  value: any;
  weight?: number;
}

export interface SessionQuality {
  score: number; // 0-100
  factors: QualityFactor[];
  grade: 'excellent' | 'good' | 'average' | 'poor';
  issues: QualityIssue[];
}

export interface QualityFactor {
  name: string;
  score: number;
  weight: number;
  description?: string;
}

export interface QualityIssue {
  type: 'bot' | 'bounce' | 'short_session' | 'spam' | 'invalid_data';
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: number;
}

// =============================================================================
// 内容分析类型
// =============================================================================

// 内容性能分析
export interface ContentAnalytics {
  contentId: string;
  contentType: 'blog_post' | 'project' | 'page' | 'image' | 'video' | 'file';
  title: string;
  url: string;
  publishedAt: number;
  authorId?: number;
  category?: string;
  tags: string[];
  metrics: ContentMetrics;
  engagement: ContentEngagement;
  traffic: ContentTraffic;
  conversion: ContentConversion;
  seo: ContentSEO;
  performance: ContentPerformance;
  trends: ContentTrends;
  recommendations: ContentRecommendation[];
}

export interface ContentMetrics {
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  pagesPerSession: number;
  newVsReturning: {
    new: number;
    returning: number;
  };
  deviceBreakdown: Record<string, number>;
  geoBreakdown: Record<string, number>;
  acquisitionBreakdown: Record<string, number>;
}

export interface ContentEngagement {
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  downloads: number;
  clickThroughRate: number;
  scrollDepth: number;
  formSubmissions: number;
  videoCompletionRate?: number;
  rating?: number;
  reviewCount?: number;
  userSentiment?: 'positive' | 'neutral' | 'negative';
  score: number; // 综合互动得分
}

export interface ContentTraffic {
  totalVisits: number;
  organicSearch: number;
  directTraffic: number;
  referralTraffic: number;
  socialTraffic: number;
  emailTraffic: number;
  paidTraffic: number;
  trafficSources: TrafficSource[];
  topReferrers: ReferrerInfo[];
  topLandingPages: LandingPageInfo[];
  searchKeywords: SearchKeywordInfo[];
}

export interface TrafficSource {
  source: string;
  medium: string;
  visits: number;
  percentage: number;
  bounceRate: number;
  conversionRate: number;
  avgSessionDuration: number;
}

export interface ReferrerInfo {
  domain: string;
  url: string;
  visits: number;
  bounceRate: number;
  pagesPerSession: number;
  avgSessionDuration: number;
}

export interface LandingPageInfo {
  page: string;
  url: string;
  visits: number;
  bounceRate: number;
  conversionRate: number;
  avgSessionDuration: number;
}

export interface SearchKeywordInfo {
  keyword: string;
  visits: number;
  position?: number;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  conversionRate?: number;
}

export interface ContentConversion {
  goalCompletions: number;
  conversionRate: number;
  revenue?: number;
  leadGeneration: number;
  newsletterSignups: number;
  formSubmissions: number;
  productPurchases?: number;
  trialSignups?: number;
  demoRequests?: number;
  contactRequests?: number;
  conversionEvents: ConversionEvent[];
}

export interface ConversionEvent {
  id: string;
  type: 'purchase' | 'signup' | 'download' | 'form_submit' | 'newsletter' | 'contact' | 'custom';
  value?: number;
  currency?: string;
  timestamp: number;
  userId?: number;
  sessionId: string;
  attributionModel?: AttributionModel;
  touchpoints?: Touchpoint[];
}

export interface AttributionModel {
  type: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based' | 'data_driven';
  weights?: Record<string, number>;
  algorithm?: string;
}

export interface Touchpoint {
  channel: string;
  source: string;
  medium: string;
  timestamp: number;
  value: number;
  position: number;
}

export interface ContentSEO {
  organicVisibility: number;
  keywordRankings: KeywordRanking[];
  backlinks: BacklinkInfo[];
  technicalSEO: TechnicalSEO;
  localSEO?: LocalSEO;
  competitorAnalysis?: CompetitorAnalysis;
}

export interface KeywordRanking {
  keyword: string;
  position: number;
  url: string;
  searchVolume?: number;
  difficulty?: number;
  clicks: number;
  impressions: number;
  ctr: number;
  change?: number;
}

export interface BacklinkInfo {
  sourceDomain: string;
  sourceUrl: string;
  anchorText: string;
  linkStrength: number;
  traffic: number;
  isFollow: boolean;
  discoveredAt: number;
  lostAt?: number;
}

export interface TechnicalSEO {
  pageSpeed: PageSpeedMetrics;
  mobileFriendliness: boolean;
  httpsEnabled: boolean;
  structuredData: StructuredDataInfo[];
  crawlability: CrawlabilityMetrics;
  indexability: IndexabilityMetrics;
}

export interface PageSpeedMetrics {
  desktopScore: number;
  mobileScore: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export interface StructuredDataInfo {
  type: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CrawlabilityMetrics {
  crawlablePages: number;
  blockedPages: number;
  orphanPages: number;
  crawlErrors: number;
  lastCrawlDate: number;
}

export interface IndexabilityMetrics {
  indexedPages: number;
  blockedFromIndexing: number;
  excludedPages: number;
  indexCoverage: number;
}

export interface LocalSEO {
  googleBusinessProfile: boolean;
  localCitations: number;
  localRankings: LocalRanking[];
  reviews: LocalReviews;
}

export interface LocalRanking {
  keyword: string;
  position: number;
  location: string;
  distance?: number;
}

export interface LocalReviews {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  recentReviews: Review[];
}

export interface Review {
  rating: number;
  comment: string;
  author: string;
  date: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface CompetitorAnalysis {
  competitors: CompetitorInfo[];
  keywordOverlap: KeywordOverlap[];
  contentGap: ContentGap[];
  trafficComparison: TrafficComparison;
}

export interface CompetitorInfo {
  domain: string;
  traffic: number;
  ranking: number;
  keywords: number;
  backlinks: number;
  contentCount: number;
}

export interface KeywordOverlap {
  keyword: string;
  ourPosition: number;
  competitorPosition: number;
  searchVolume: number;
  difficulty: number;
}

export interface ContentGap {
  topic: string;
  competitorUrl: string;
  ourContent?: string;
  opportunityScore: number;
  estimatedTraffic: number;
}

export interface TrafficComparison {
  ourTraffic: number;
  competitorTraffic: number;
  trend: 'gaining' | 'losing' | 'stable';
  keyDrivers: string[];
}

export interface ContentPerformance {
  loadTime: number;
  renderTime: number;
  size: number;
  requests: number;
  errorRate: number;
  availability: number;
  coreWebVitals: CoreWebVitals;
  accessibility: AccessibilityMetrics;
  bestPractices: BestPracticesMetrics;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface AccessibilityMetrics {
  score: number;
  contrastIssues: number;
  missingAltText: number;
  keyboardIssues: number;
  ariaIssues: number;
  headingsIssues: number;
}

export interface BestPracticesMetrics {
  score: number;
  httpsUsed: boolean;
  imagesOptimized: boolean;
  fontsOptimized: boolean;
  cssOptimized: boolean;
  jsOptimized: boolean;
}

export interface ContentTrends {
  viewTrend: TrendData;
  engagementTrend: TrendData;
  trafficTrend: TrendData;
  conversionTrend: TrendData;
  seasonalPatterns: SeasonalPattern[];
  forecast: ContentForecast;
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  changePercentage: number;
  significance: number;
  timeWindow: string;
  data: AnalyticsTimeSeries[];
}

export interface SeasonalPattern {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  pattern: number[];
  strength: number;
  nextPeak?: number;
}

export interface ContentForecast {
  period: number;
  confidence: number;
  predictedViews: number;
  predictedEngagement: number;
  predictedConversion: number;
  factors: ForecastFactor[];
}

export interface ForecastFactor {
  factor: string;
  impact: number;
  confidence: number;
  explanation: string;
}

export interface ContentRecommendation {
  type: 'seo' | 'performance' | 'engagement' | 'conversion' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: number;
  effort: 'low' | 'medium' | 'high';
  implementation: string[];
  timeframe: string;
  resources: Resource[];
}

export interface Resource {
  type: 'tool' | 'guide' | 'template' | 'service' | 'person';
  name: string;
  url?: string;
  cost?: string;
  description?: string;
}

// =============================================================================
// 转化漏斗分析类型
// =============================================================================

export interface ConversionFunnel {
  id: string;
  name: string;
  description?: string;
  steps: FunnelStep[];
  overallMetrics: FunnelOverallMetrics;
  segments: FunnelSegment[];
  anomalies: FunnelAnomaly[];
  recommendations: FunnelRecommendation[];
  createdAt: number;
  updatedAt: number;
}

export interface FunnelStep {
  id: string;
  name: string;
  description?: string;
  event: string;
  conditions?: FunnelCondition[];
  metrics: FunnelStepMetrics;
  position: number;
  isOptional?: boolean;
  timeLimit?: number;
}

export interface FunnelCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
  value: any;
  weight?: number;
}

export interface FunnelStepMetrics {
  users: number;
  percentage: number;
  conversionRate: number;
  dropoffRate: number;
  avgTimeToConvert: number;
  medianTimeToConvert: number;
  timeDistribution: TimeDistribution[];
  userSegments: Record<string, number>;
  exitReasons: ExitReason[];
}

export interface TimeDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface ExitReason {
  reason: string;
  count: number;
  percentage: number;
  nextStep?: string;
}

export interface FunnelOverallMetrics {
  totalUsers: number;
  totalConversions: number;
  overallConversionRate: number;
  avgTimeToComplete: number;
  medianTimeToComplete: number;
  totalDropoff: number;
  completionRate: number;
  abandonmentRate: number;
  revenue?: number;
  revenuePerUser?: number;
  roi?: number;
}

export interface FunnelSegment {
  name: string;
  description?: string;
  filter: FunnelCondition[];
  metrics: FunnelOverallMetrics;
  stepMetrics: Record<string, FunnelStepMetrics>;
  performance: SegmentPerformance;
}

export interface SegmentPerformance {
  conversionRate: number;
  avgTimeToComplete: number;
  revenuePerUser?: number;
  comparison: {
    conversionRate: number;
    avgTimeToComplete: number;
    revenuePerUser?: number;
  };
  insights: string[];
}

export interface FunnelAnomaly {
  timestamp: number;
  type: 'dropoff_spike' | 'conversion_drop' | 'time_increase' | 'pattern_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSteps: string[];
  potentialCauses: string[];
  recommendations: string[];
}

export interface FunnelRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'optimization' | 'content' | 'design' | 'technical' | 'promotion';
  title: string;
  description: string;
  expectedImpact: number;
  affectedSteps: string[];
  implementation: string[];
  timeframe: string;
  confidence: number;
}

// =============================================================================
// 实时分析类型
// =============================================================================

export interface RealTimeAnalytics {
  timestamp: number;
  activeUsers: ActiveUsersMetrics;
  currentSessions: CurrentSession[];
  liveEvents: LiveEvent[];
  performanceMetrics: RealTimePerformance;
  alerts: RealTimeAlert[];
  trends: RealTimeTrend[];
}

export interface ActiveUsersMetrics {
  total: number;
  current: number;
  new: number;
  returning: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: RealTimePageMetric[];
  deviceBreakdown: Record<string, number>;
  geoBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
}

export interface RealTimePageMetric {
  page: string;
  activeUsers: number;
  pageViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export interface CurrentSession {
  sessionId: string;
  userId?: number;
  startTime: number;
  duration: number;
  currentPage: string;
  pageViews: number;
  isActive: boolean;
  deviceInfo: DeviceInfo;
  geoInfo: GeoInfo;
  acquisitionInfo: AcquisitionInfo;
  events: RealTimeEvent[];
  quality: SessionQuality;
}

export interface RealTimeEvent {
  type: string;
  name: string;
  timestamp: number;
  page: string;
  element?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface LiveEvent {
  id: string;
  type: 'page_view' | 'click' | 'form_submit' | 'conversion' | 'error' | 'alert';
  name: string;
  timestamp: number;
  userId?: number;
  sessionId: string;
  page?: string;
  data?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  impact?: number;
}

export interface RealTimePerformance {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  cpuUsage?: number;
  memoryUsage?: number;
  networkLatency?: number;
  databaseLatency?: number;
  cacheHitRate?: number;
}

export interface RealTimeAlert {
  id: string;
  type: 'performance' | 'traffic' | 'conversion' | 'error' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  resolved?: boolean;
  resolvedAt?: number;
  actions: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: string;
  url?: string;
  method?: 'GET' | 'POST';
  payload?: Record<string, any>;
}

export interface RealTimeTrend {
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  direction: 'up' | 'down' | 'stable';
  significance: number;
  timeWindow: string;
  forecast?: {
    nextValue: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
  };
}

// =============================================================================
// 分析报告类型
// =============================================================================

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;
  type: 'dashboard' | 'executive' | 'technical' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on_demand';
  recipients: ReportRecipient[];
  sections: ReportSection[];
  metadata: ReportMetadata;
  generatedAt: number;
  generatedBy: string;
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'scheduled';
  delivery: ReportDelivery;
  version: number;
}

export interface ReportRecipient {
  email: string;
  name?: string;
  role: 'viewer' | 'editor' | 'admin';
  preferences: RecipientPreferences;
}

export interface RecipientPreferences {
  format: 'html' | 'pdf' | 'json' | 'csv';
  language: string;
  timezone: string;
  sections?: string[];
  filters?: ReportFilter[];
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'chart' | 'table' | 'text' | 'insights' | 'recommendations';
  content: ReportSectionContent;
  layout: SectionLayout;
  visibility: SectionVisibility;
  dependencies?: string[];
}

export interface ReportSectionContent {
  summary?: ReportSummary;
  charts?: ReportChart[];
  tables?: ReportTable[];
  text?: ReportText[];
  insights?: ReportInsight[];
  recommendations?: ReportRecommendation[];
}

export interface ReportSummary {
  title: string;
  metrics: AnalyticsValue[];
  period: string;
  highlights: string[];
  keyFindings: string[];
}

export interface ReportChart {
  id: string;
  title: string;
  description?: string;
  type: string;
  data: any;
  config: any;
  insights?: string[];
}

export interface ReportTable {
  id: string;
  title: string;
  columns: TableColumn[];
  data: any[];
  pagination?: TablePagination;
  sorting?: TableSorting;
  filtering?: TableFiltering;
}

export interface TableColumn {
  key: string;
  title: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage';
  sortable?: boolean;
  filterable?: boolean;
  format?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface TableSorting {
  column: string;
  direction: 'asc' | 'desc';
}

export interface TableFiltering {
  filters: ReportFilter[];
  logic: 'and' | 'or';
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
  label?: string;
}

export interface ReportText {
  type: 'paragraph' | 'heading' | 'list' | 'quote';
  content: string;
  format?: 'markdown' | 'html' | 'plain';
  style?: TextStyle;
}

export interface TextStyle {
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export interface ReportInsight {
  title: string;
  description: string;
  category: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'performance';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  data?: Record<string, any>;
  recommendations?: string[];
}

export interface ReportRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  expectedImpact: number;
  implementation: string[];
  resources?: string[];
}

export interface SectionLayout {
  columns: number;
  span?: number;
  order?: number;
  group?: string;
  collapsed?: boolean;
}

export interface SectionVisibility {
  visible: boolean;
  conditions?: ReportFilter[];
  roles?: string[];
}

export interface ReportMetadata {
  period: {
    start: number;
    end: number;
    type: string;
  };
  timezone: string;
  currency: string;
  language: string;
  filters?: ReportFilter[];
  segments?: ReportFilter[];
  compareWith?: {
    start: number;
    end: number;
  };
}

export interface ReportDelivery {
  method: 'email' | 'webhook' | 'api' | 'download';
  schedule?: ReportSchedule;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  sentAt?: number;
  error?: string;
  recipients: string[];
  attachments?: ReportAttachment[];
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  nextRun?: number;
  lastRun?: number;
}

export interface ReportAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
  expiresAt?: number;
}

// =============================================================================
// 分析配置和管理类型
// =============================================================================

export interface AnalyticsConfig {
  tracking: TrackingConfig;
  dataProcessing: DataProcessingConfig;
  privacy: PrivacyConfig;
  performance: PerformanceConfig;
  alerts: AlertsConfig;
  reports: ReportsConfig;
  integrations: IntegrationsConfig;
  security: SecurityConfig;
  api: APIConfig;
}

export interface TrackingConfig {
  enabled: boolean;
  trackPageViews: boolean;
  trackEvents: boolean;
  trackUserSessions: boolean;
  trackScrollDepth: boolean;
  trackClicks: boolean;
  trackFormSubmissions: boolean;
  trackVideoEngagement: boolean;
  trackFileDownloads: boolean;
  trackSearchQueries: boolean;
  trackErrors: boolean;
  trackPerformance: boolean;
  sampleRate: number;
  debugMode: boolean;
  excludedPages: string[];
  excludedReferrers: string[];
  customDimensions: CustomDimension[];
  customMetrics: CustomMetric[];
}

export interface CustomDimension {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  scope: 'hit' | 'session' | 'user';
  active: boolean;
}

export interface CustomMetric {
  name: string;
  displayName: string;
  type: 'integer' | 'currency' | 'float' | 'time';
  scope: 'hit' | 'session' | 'user';
  active: boolean;
}

export interface DataProcessingConfig {
  dataRetention: number; // days
  aggregationInterval: number; // minutes
  batchSize: number;
  processingDelay: number; // minutes
  qualityChecks: QualityCheck[];
  anonymization: AnonymizationRule[];
  enrichment: EnrichmentRule[];
}

export interface QualityCheck {
  name: string;
  type: 'bot' | 'spam' | 'invalid' | 'duplicate';
  enabled: boolean;
  action: 'exclude' | 'flag' | 'transform';
  parameters: Record<string, any>;
}

export interface AnonymizationRule {
  field: string;
  method: 'hash' | 'mask' | 'remove' | 'generalize';
  parameters?: Record<string, any>;
}

export interface EnrichmentRule {
  name: string;
  type: 'geo' | 'device' | 'referrer' | 'campaign' | 'custom';
  enabled: boolean;
  source: string;
  mapping?: Record<string, any>;
  api?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    mapping?: string;
  };
}

export interface PrivacyConfig {
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  cookieConsent: boolean;
  dataProcessingAgreement: boolean;
  anonymizeIp: boolean;
  anonymizeUserAgent: boolean;
  doNotTrack: boolean;
  dataSubjectRequests: DataSubjectRequestConfig;
  cookiePolicy: CookiePolicyConfig;
}

export interface DataSubjectRequestConfig {
  enabled: boolean;
  retentionPeriod: number;
  deletionMethod: 'soft' | 'hard';
  exportFormats: ('json' | 'csv' | 'pdf')[];
  autoDelete: boolean;
}

export interface CookiePolicyConfig {
  required: boolean;
  categories: CookieCategory[];
  consentMethod: 'implicit' | 'explicit';
  cookieBanner: CookieBannerConfig;
}

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cookies: string[];
}

export interface CookieBannerConfig {
  enabled: boolean;
  position: 'top' | 'bottom' | 'center';
  style: 'simple' | 'detailed' | 'minimal';
  acceptAllText: string;
  customizeText: string;
  declineText: string;
  privacyPolicyUrl?: string;
}

export interface PerformanceConfig {
  samplingRate: number;
  batchSize: number;
  processingTimeout: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  compressionEnabled: boolean;
  parallelProcessing: boolean;
  retryAttempts: number;
  retryDelay: number;
}

export interface AlertsConfig {
  enabled: boolean;
  channels: AlertChannel[];
  rules: AlertRule[];
  suppression: AlertSuppression[];
  escalation: AlertEscalation[];
}

export interface AlertChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'push';
  enabled: boolean;
  config: Record<string, any>;
  rateLimit?: {
    maxPerHour: number;
    maxPerDay: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  metric: string;
  condition: AlertCondition;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  cooldown: number;
  tags: string[];
}

export interface AlertCondition {
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'contains' | 'changes';
  threshold: number | string;
  timeWindow?: number;
  aggregation?: 'avg' | 'sum' | 'count' | 'min' | 'max';
}

export interface AlertSuppression {
  rule: string;
  conditions: AlertCondition[];
  duration: number;
  reason?: string;
}

export interface AlertEscalation {
  rule: string;
  conditions: AlertCondition[];
  actions: AlertEscalationAction[];
  delay: number;
}

export interface AlertEscalationAction {
  type: 'notify' | 'create_ticket' | 'run_script' | 'send_email';
  config: Record<string, any>;
}

export interface ReportsConfig {
  enabled: boolean;
  templates: ReportTemplate[];
  schedules: ReportSchedule[];
  recipients: ReportRecipient[];
  storage: ReportStorageConfig;
  export: ReportExportConfig;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'dashboard' | 'executive' | 'technical' | 'custom';
  sections: ReportSection[];
  layout: ReportLayout;
  styles?: ReportStyles;
  variables?: ReportVariable[];
}

export interface ReportLayout {
  type: 'single_page' | 'multi_page' | 'dashboard';
  pageSize?: string;
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ReportStyles {
  theme: 'light' | 'dark' | 'custom';
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  logo?: string;
  footer?: string;
}

export interface ReportVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  defaultValue?: any;
  required?: boolean;
  description?: string;
}

export interface ReportStorageConfig {
  provider: 'local' | 's3' | 'gcs' | 'azure';
  config: Record<string, any>;
  retention: number;
  encryption: boolean;
}

export interface ReportExportConfig {
  formats: ('pdf' | 'excel' | 'csv' | 'json')[];
  quality: 'low' | 'medium' | 'high';
  watermark?: boolean;
  password?: boolean;
  compression: boolean;
}

export interface IntegrationsConfig {
  crm?: CRMIntegration;
  email?: EmailIntegration;
  advertising?: AdvertisingIntegration;
  social?: SocialIntegration;
  analytics?: AnalyticsIntegration;
  custom?: CustomIntegration[];
}

export interface CRMIntegration {
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
  sync: {
    enabled: boolean;
    fields: string[];
    frequency: 'realtime' | 'hourly' | 'daily';
    direction: 'import' | 'export' | 'bidirectional';
  };
}

export interface EmailIntegration {
  provider: 'mailchimp' | 'sendgrid' | 'ses' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
  events: string[];
  tracking: boolean;
}

export interface AdvertisingIntegration {
  provider: 'google_ads' | 'facebook_ads' | 'linkedin_ads' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
  accounts: string[];
  metrics: string[];
  costTracking: boolean;
}

export interface SocialIntegration {
  provider: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
  metrics: string[];
  engagementTracking: boolean;
}

export interface AnalyticsIntegration {
  provider: 'google_analytics' | 'adobe_analytics' | 'mixpanel' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
  dimensions: string[];
  metrics: string[];
  realtime: boolean;
}

export interface CustomIntegration {
  name: string;
  type: 'api' | 'webhook' | 'database' | 'file';
  enabled: boolean;
  config: Record<string, any>;
  authentication?: {
    type: 'basic' | 'bearer' | 'oauth2' | 'api_key';
    credentials: Record<string, any>;
  };
  mapping?: Record<string, string>;
  validation?: ValidationRule[];
}

export interface SecurityConfig {
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  encryption: EncryptionConfig;
  audit: AuditConfig;
  rateLimit: RateLimitConfig;
}

export interface AuthenticationConfig {
  method: 'basic' | 'oauth2' | 'saml' | 'jwt';
  config: Record<string, any>;
  sessionTimeout: number;
  multiFactor: boolean;
}

export interface AuthorizationConfig {
  roles: RoleConfig[];
  permissions: PermissionConfig[];
  policies: PolicyConfig[];
}

export interface RoleConfig {
  name: string;
  description?: string;
  permissions: string[];
  inherits?: string[];
}

export interface PermissionConfig {
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface PolicyConfig {
  name: string;
  description?: string;
  rules: PolicyRule[];
  effect: 'allow' | 'deny';
}

export interface PolicyRule {
  field: string;
  operator: string;
  value: any;
}

export interface EncryptionConfig {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
  keyRotation: number;
  keyManagement: string;
}

export interface AuditConfig {
  enabled: boolean;
  events: AuditEvent[];
  retention: number;
  storage: AuditStorageConfig;
}

export interface AuditEvent {
  type: 'login' | 'logout' | 'create' | 'read' | 'update' | 'delete' | 'export' | 'admin';
  enabled: boolean;
  details: string[];
}

export interface AuditStorageConfig {
  provider: 'local' | 'database' | 's3' | 'custom';
  config: Record<string, any>;
  encryption: boolean;
  compression: boolean;
}

export interface RateLimitConfig {
  enabled: boolean;
  rules: RateLimitRule[];
  storage: RateLimitStorageConfig;
}

export interface RateLimitRule {
  name: string;
  limit: number;
  window: number;
  scope: 'ip' | 'user' | 'global';
  burst?: number;
}

export interface RateLimitStorageConfig {
  type: 'memory' | 'redis' | 'database' | 'custom';
  config: Record<string, any>;
  ttl: number;
}

export interface APIConfig {
  version: string;
  baseUrl: string;
  authentication: APIAuthenticationConfig;
  rateLimit: APIRateLimitConfig;
  cors: CORSConfig;
  documentation: APIDocumentationConfig;
  testing: APITestingConfig;
}

export interface APIAuthenticationConfig {
  type: 'basic' | 'bearer' | 'oauth2' | 'api_key';
  config: Record<string, any>;
}

export interface APIRateLimitConfig {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export interface CORSConfig {
  enabled: boolean;
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge: number;
}

export interface APIDocumentationConfig {
  enabled: boolean;
  format: 'openapi' | 'swagger' | 'custom';
  url: string;
  authentication: boolean;
  examples: boolean;
}

export interface APITestingConfig {
  enabled: boolean;
  endpoints: APIEndpointTest[];
  environment: 'development' | 'staging' | 'production';
  schedule?: string;
}

export interface APIEndpointTest {
  name: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number;
  expectedResponse?: any;
  timeout: number;
}