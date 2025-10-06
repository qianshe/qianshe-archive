/**
 * 文件上传和处理类型定义
 * 提供完整的文件管理、上传、处理、存储和优化功能类型
 */

// =============================================================================
// 基础文件类型
// =============================================================================

// 文件基本信息
export interface FileInfo {
  id: string;
  name: string;
  originalName: string;
  displayName?: string;
  description?: string;
  extension: string;
  mimeType: string;
  size: number;
  sizeFormatted: string;
  category: FileCategory;
  type: FileType;
  hash: string;
  checksum: string;
  encoding?: string;
  charset?: string;
  createdAt: number;
  updatedAt: number;
  uploadedAt: number;
  expiresAt?: number;
  isPublic: boolean;
  isTemp: boolean;
  isEncrypted: boolean;
  tags: string[];
  metadata: FileMetadata;
  storage: StorageInfo;
  permissions: FilePermissions;
  owner: FileOwner;
  versions: FileVersion[];
  thumbnails: ThumbnailInfo[];
  preview?: PreviewInfo;
  processing?: ProcessingInfo;
  analytics: FileAnalytics;
}

// 文件分类
export type FileCategory = 
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'archive'
  | 'code'
  | 'data'
  | 'font'
  | 'model'
  | 'other';

// 文件类型
export type FileType = 
  // 图片
  | 'jpeg' | 'jpg' | 'png' | 'gif' | 'webp' | 'svg' | 'avif' | 'heic' | 'tiff' | 'bmp'
  // 视频
  | 'mp4' | 'avi' | 'mov' | 'wmv' | 'flv' | 'webm' | 'mkv' | 'm4v' | '3gp' | 'ogv'
  // 音频
  | 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg' | 'm4a' | 'wma' | 'aiff' | 'opus'
  // 文档
  | 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'txt' | 'rtf' | 'odt' | 'ods' | 'odp'
  // 压缩文件
  | 'zip' | 'rar' | '7z' | 'tar' | 'gz' | 'bz2' | 'xz'
  // 代码
  | 'js' | 'ts' | 'jsx' | 'tsx' | 'html' | 'css' | 'scss' | 'json' | 'xml' | 'yaml' | 'yml'
  | 'py' | 'java' | 'c' | 'cpp' | 'cs' | 'php' | 'rb' | 'go' | 'rs' | 'swift'
  // 数据
  | 'csv' | 'sql' | 'sqlite' | 'db'
  // 字体
  | 'ttf' | 'otf' | 'woff' | 'woff2' | 'eot'
  // 3D模型
  | 'obj' | 'fbx' | 'dae' | 'gltf' | 'glb' | 'stl'
  // 其他
  | 'exe' | 'dmg' | 'iso' | 'unknown';

// 文件元数据
export interface FileMetadata {
  // 通用元数据
  dimensions?: Dimensions;
  duration?: number;
  bitrate?: number;
  frameRate?: number;
  aspectRatio?: string;
  colorSpace?: string;
  compression?: string;
  quality?: number;
  
  // 图片特定元数据
  exif?: EXIFData;
  colorProfile?: ColorProfile;
  hasAlpha?: boolean;
  isAnimated?: boolean;
  
  // 视频特定元数据
  videoMetadata?: VideoMetadata;
  audioMetadata?: AudioMetadata;
  
  // 文档特定元数据
  pageCount?: number;
  wordCount?: number;
  author?: string;
  title?: string;
  subject?: string;
  keywords?: string[];
  
  // 技术元数据
  createdAt: string;
  modifiedAt: string;
  accessedAt?: string;
  permissions?: string;
  owner?: string;
  group?: string;
  
  // 自定义元数据
  custom?: Record<string, any>;
}

export interface Dimensions {
  width: number;
  height: number;
  unit: 'px' | 'in' | 'cm' | 'mm';
}

export interface EXIFData {
  camera?: {
    make?: string;
    model?: string;
    software?: string;
  };
  capture?: {
    dateTime?: string;
    orientation?: number;
    flash?: boolean;
    focalLength?: number;
    fNumber?: number;
    exposureTime?: string;
    iso?: number;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    gpsDateStamp?: string;
  };
  lens?: {
    make?: string;
    model?: string;
    focalLength?: number;
  };
}

export interface ColorProfile {
  name: string;
  space: 'sRGB' | 'Adobe RGB' | 'ProPhoto RGB' | 'CMYK' | 'Grayscale';
  version?: string;
}

export interface VideoMetadata {
  codec: string;
  container: string;
  bitrate: number;
  frameRate: number;
  aspectRatio: string;
  resolution: Dimensions;
  duration: number;
  hasAudio: boolean;
  audioCodec?: string;
  audioBitrate?: number;
  audioSampleRate?: number;
  chapters?: ChapterInfo[];
}

export interface ChapterInfo {
  id: number;
  title: string;
  startTime: number;
  endTime: number;
  thumbnail?: string;
}

export interface AudioMetadata {
  codec: string;
  bitrate: number;
  sampleRate: number;
  channels: number;
  duration: number;
  format: string;
  album?: string;
  artist?: string;
  title?: string;
  genre?: string;
  year?: number;
  track?: number;
  albumArt?: string;
}

// 存储信息
export interface StorageInfo {
  provider: StorageProvider;
  bucket?: string;
  region?: string;
  path: string;
  url: string;
  cdnUrl?: string;
  signedUrl?: string;
  signedUrlExpiry?: number;
  encryption: EncryptionInfo;
  backup?: BackupInfo;
  cost?: StorageCost;
}

export type StorageProvider = 
  | 'local'
  | 'aws_s3'
  | 'google_cloud'
  | 'azure_blob'
  | 'cloudflare_r2'
  | 'digitalocean_spaces'
  | 'alibaba_oss'
  | 'tencent_cos'
  | 'backblaze_b2';

export interface EncryptionInfo {
  enabled: boolean;
  algorithm?: string;
  keyId?: string;
  encryptedAt?: number;
  serverSideEncryption?: boolean;
  clientSideEncryption?: boolean;
}

export interface BackupInfo {
  enabled: boolean;
  locations: string[];
  lastBackup?: number;
  nextBackup?: number;
  retentionDays: number;
  schedule: string;
}

export interface StorageCost {
  storage: number; // per GB per month
  bandwidth: number; // per GB
  operations: number; // per 1000 operations
  total: number;
  currency: string;
}

// 文件权限
export interface FilePermissions {
  public: boolean;
  owner: PermissionLevel;
  group: PermissionLevel;
  others: PermissionLevel;
  users: UserPermission[];
  expires?: number;
  downloadLimit?: number;
  passwordProtected?: boolean;
  watermark?: boolean;
  domainRestrictions?: string[];
  ipRestrictions?: string[];
}

export type PermissionLevel = 'none' | 'read' | 'write' | 'delete' | 'admin';

export interface UserPermission {
  userId: string;
  level: PermissionLevel;
  grantedAt: number;
  grantedBy: string;
  expires?: number;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  type: 'time' | 'ip' | 'domain' | 'device' | 'custom';
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin';
  value: any;
}

// 文件所有者
export interface FileOwner {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'service' | 'system';
  department?: string;
  organization?: string;
}

// 文件版本
export interface FileVersion {
  id: string;
  version: number;
  name: string;
  description?: string;
  size: number;
  checksum: string;
  createdAt: number;
  createdBy: string;
  changes: string[];
  isActive: boolean;
  downloadCount: number;
  storage: StorageInfo;
  metadata?: Partial<FileMetadata>;
}

// 缩略图信息
export interface ThumbnailInfo {
  id: string;
  size: 'small' | 'medium' | 'large' | 'original';
  dimensions: Dimensions;
  fileSize: number;
  url: string;
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
  createdAt: number;
}

// 预览信息
export interface PreviewInfo {
  type: 'image' | 'video' | 'pdf' | 'text' | 'audio';
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  pageCount?: number;
  text?: string;
  format?: string;
  generatedAt: number;
  expiresAt?: number;
}

// 处理信息
export interface ProcessingInfo {
  status: ProcessingStatus;
  startedAt?: number;
  completedAt?: number;
  progress?: number;
  error?: string;
  operations: ProcessingOperation[];
  queue?: string;
  priority: ProcessingPriority;
  estimatedTime?: number;
}

export type ProcessingStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'retrying';

export type ProcessingPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ProcessingOperation {
  id: string;
  name: string;
  type: ProcessingType;
  status: ProcessingStatus;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  input?: string;
  output?: string;
  parameters?: Record<string, any>;
  error?: string;
  logs?: string[];
  metadata?: Record<string, any>;
}

export type ProcessingType = 
  | 'resize'
  | 'compress'
  | 'convert'
  | 'optimize'
  | 'watermark'
  | 'thumbnail'
  | 'preview'
  | 'transcode'
  | 'extract'
  | 'analyze'
  | 'encrypt'
  | 'decrypt'
  | 'backup'
  | 'restore'
  | 'custom';

// 文件分析
export interface FileAnalytics {
  views: number;
  downloads: number;
  shares: number;
  likes: number;
  comments: number;
  reports: number;
  averageRating: number;
  totalRatingCount: number;
  lastViewed?: number;
  lastDownloaded?: number;
  topReferrers: ReferrerInfo[];
  popularLocations: LocationInfo[];
  devices: DeviceBreakdown;
  browsers: BrowserBreakdown;
  operatingSystems: OSBreakdown;
  timeDistribution: TimeDistribution[];
  engagementMetrics: EngagementMetrics;
}

export interface ReferrerInfo {
  source: string;
  url: string;
  visits: number;
  percentage: number;
}

export interface LocationInfo {
  country: string;
  city?: string;
  visits: number;
  percentage: number;
}

export interface DeviceBreakdown {
  desktop: number;
  mobile: number;
  tablet: number;
  other: number;
}

export interface BrowserBreakdown {
  chrome: number;
  firefox: number;
  safari: number;
  edge: number;
  other: number;
}

export interface OSBreakdown {
  windows: number;
  macos: number;
  linux: number;
  ios: number;
  android: number;
  other: number;
}

export interface TimeDistribution {
  hour: number;
  visits: number;
  percentage: number;
}

export interface EngagementMetrics {
  averageViewDuration: number;
  bounceRate: number;
  returnVisitorRate: number;
  shareRate: number;
  downloadRate: number;
  conversionRate: number;
}

// =============================================================================
// 文件上传类型
// =============================================================================

// 上传配置
export interface UploadConfig {
  maxFileSize: number;
  maxFiles: number;
  allowedTypes: FileType[];
  allowedMimeTypes: string[];
  blockedTypes: FileType[];
  blockedMimeTypes: string[];
  requireAuth: boolean;
  autoProcess: boolean;
  generateThumbnails: boolean;
  generatePreviews: boolean;
  encrypt: boolean;
  watermark: boolean;
  compress: boolean;
  validate: boolean;
  virusScan: boolean;
  duplicateCheck: boolean;
  namingStrategy: NamingStrategy;
  storage: StorageConfig;
  processing: ProcessingConfig;
  permissions: UploadPermissions;
  notifications: UploadNotifications;
  retention: RetentionPolicy;
}

export interface StorageConfig {
  provider: StorageProvider;
  bucket: string;
  region?: string;
  path: string;
  encryption: boolean;
  compression: boolean;
  cdn: boolean;
  backup: boolean;
  settings: Record<string, any>;
}

export interface ProcessingConfig {
  enabled: boolean;
  queue: string;
  priority: ProcessingPriority;
  retries: number;
  timeout: number;
  operations: ProcessingOperationConfig[];
}

export interface ProcessingOperationConfig {
  type: ProcessingType;
  enabled: boolean;
  parameters: Record<string, any>;
  conditions?: ProcessingCondition[];
}

export interface ProcessingCondition {
  field: string;
  operator: string;
  value: any;
}

export interface UploadPermissions {
  public: boolean;
  ownerLevel: PermissionLevel;
  groupLevel: PermissionLevel;
  othersLevel: PermissionLevel;
  defaultExpiry?: number;
  downloadLimit?: number;
  domainRestrictions?: string[];
  ipRestrictions?: string[];
}

export interface UploadNotifications {
  enabled: boolean;
  channels: NotificationChannel[];
  events: NotificationEvent[];
  template?: string;
}

export interface NotificationChannel {
  type: 'email' | 'webhook' | 'slack' | 'sms' | 'push';
  config: Record<string, any>;
}

export interface NotificationEvent {
  type: 'upload_started' | 'upload_completed' | 'upload_failed' | 'processing_started' | 'processing_completed' | 'processing_failed';
  enabled: boolean;
  recipients: string[];
  template?: string;
}

export interface RetentionPolicy {
  enabled: boolean;
  retentionDays: number;
  autoDelete: boolean;
  notification: boolean;
  excludeFiles: string[];
  archiveBeforeDelete: boolean;
}

export type NamingStrategy = 
  | 'original'
  | 'timestamp'
  | 'uuid'
  | 'random'
  | 'custom';

// 上传会话
export interface UploadSession {
  id: string;
  userId?: string;
  files: UploadFile[];
  config: UploadConfig;
  status: UploadStatus;
  startedAt: number;
  completedAt?: number;
  expiresAt: number;
  progress: UploadProgress;
  errors: UploadError[];
  metadata: SessionMetadata;
}

export type UploadStatus = 
  | 'initializing'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired';

export interface UploadFile {
  id: string;
  file: File | UploadFileInfo;
  status: FileUploadStatus;
  progress: FileUploadProgress;
  url?: string;
  error?: string;
  metadata?: Partial<FileMetadata>;
  processing?: ProcessingInfo;
  result?: UploadResult;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface UploadFileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  slice?: (start?: number, end?: number, contentType?: string) => Blob;
  stream?: () => ReadableStream;
  text?: () => Promise<string>;
  arrayBuffer?: () => Promise<ArrayBuffer>;
}

export type FileUploadStatus = 
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  estimatedTimeRemaining?: number;
  chunks: ChunkProgress[];
}

export interface ChunkProgress {
  index: number;
  started: boolean;
  completed: boolean;
  size: number;
  uploaded: number;
  speed: number;
  retries: number;
  error?: string;
}

export interface UploadProgress {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  cancelledFiles: number;
  totalSize: number;
  uploadedSize: number;
  percentage: number;
  speed: number;
  estimatedTimeRemaining?: number;
  currentFile?: string;
}

export interface UploadError {
  id: string;
  type: ErrorType;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: number;
  fileId?: string;
  recoverable: boolean;
  retryCount: number;
  maxRetries: number;
}

export type ErrorType = 
  | 'validation'
  | 'size'
  | 'type'
  | 'network'
  | 'server'
  | 'permission'
  | 'quota'
  | 'timeout'
  | 'corruption'
  | 'virus'
  | 'duplicate'
  | 'processing'
  | 'storage'
  | 'unknown';

export interface SessionMetadata {
  userAgent: string;
  ip: string;
  referrer?: string;
  language: string;
  timezone: string;
  platform: string;
  location?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  custom?: Record<string, any>;
}

export interface UploadResult {
  file: FileInfo;
  url: string;
  cdnUrl?: string;
  thumbnails: ThumbnailInfo[];
  preview?: PreviewInfo;
  processing: ProcessingInfo;
  analytics: FileAnalytics;
}

// 上传请求
export interface UploadRequest {
  files: File[] | FileList;
  config?: Partial<UploadConfig>;
  metadata?: Record<string, any>;
  sessionId?: string;
  chunkSize?: number;
  concurrentUploads?: number;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
  onProgress?: (progress: UploadProgress) => void;
  onFileProgress?: (fileId: string, progress: FileUploadProgress) => void;
  onComplete?: (results: UploadResult[]) => void;
  onError?: (error: UploadError) => void;
  onCancel?: () => void;
}

// 上传响应
export interface UploadResponse {
  sessionId: string;
  files: UploadResult[];
  progress: UploadProgress;
  status: UploadStatus;
  urls: string[];
  errors: UploadError[];
  metadata: {
    totalSize: number;
    duration: number;
    averageSpeed: number;
  };
}

// =============================================================================
// 文件处理类型
// =============================================================================

// 处理任务
export interface ProcessingTask {
  id: string;
  type: ProcessingType;
  input: ProcessingInput;
  output: ProcessingOutput;
  config: ProcessingTaskConfig;
  status: ProcessingStatus;
  priority: ProcessingPriority;
  progress: ProcessingProgress;
  startedAt?: number;
  completedAt?: number;
  estimatedTime?: number;
  error?: ProcessingError;
  logs: ProcessingLog[];
  metadata: ProcessingMetadata;
}

export interface ProcessingInput {
  type: 'file' | 'url' | 'buffer' | 'stream';
  source: string;
  metadata?: Partial<FileMetadata>;
  parameters?: Record<string, any>;
}

export interface ProcessingOutput {
  files: ProcessingOutputFile[];
  metadata?: Partial<FileMetadata>;
  preview?: PreviewInfo;
  analytics?: ProcessingAnalytics;
}

export interface ProcessingOutputFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  url: string;
  thumbnail?: ThumbnailInfo;
  metadata?: Partial<FileMetadata>;
}

export interface ProcessingTaskConfig {
  operations: ProcessingOperation[];
  parameters: Record<string, any>;
  conditions?: ProcessingCondition[];
  hooks?: ProcessingHook[];
  notifications?: ProcessingNotification[];
}

export interface ProcessingHook {
  type: 'before' | 'after' | 'on_error' | 'on_success';
  action: string;
  parameters?: Record<string, any>;
}

export interface ProcessingNotification {
  type: 'started' | 'progress' | 'completed' | 'failed';
  channels: NotificationChannel[];
  template?: string;
  recipients: string[];
}

export interface ProcessingProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  currentOperation?: string;
  estimatedTimeRemaining?: number;
  speed?: number;
}

export interface ProcessingError {
  type: ProcessingErrorType;
  message: string;
  code?: string;
  details?: Record<string, any>;
  step?: number;
  operation?: string;
  recoverable: boolean;
  retryCount: number;
  maxRetries: number;
}

export type ProcessingErrorType = 
  | 'invalid_input'
  | 'unsupported_format'
  | 'corruption'
  | 'memory'
  | 'disk_space'
  | 'network'
  | 'timeout'
  | 'permission'
  | 'configuration'
  | 'external_service'
  | 'dependency'
  | 'unknown';

export interface ProcessingLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  step?: number;
  operation?: string;
}

export interface ProcessingMetadata {
  duration?: number;
  inputSize: number;
  outputSize: number;
  compressionRatio?: number;
  qualityScore?: number;
  operationsCompleted: number;
  operationsTotal: number;
  resourcesUsed: ResourceUsage;
  costs: ProcessingCost;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  gpu?: number;
}

export interface ProcessingCost {
  compute: number;
  storage: number;
  bandwidth: number;
  total: number;
  currency: string;
}

export interface ProcessingAnalytics {
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  qualityImprovement?: number;
  performanceImprovement?: number;
  timeSaved: number;
  costSaved: number;
  userSatisfaction: number;
}

// 图片处理配置
export interface ImageProcessingConfig {
  resize?: ResizeConfig;
  compress?: CompressConfig;
  watermark?: WatermarkConfig;
  filter?: FilterConfig;
  optimize?: OptimizeConfig;
  format?: FormatConfig;
  enhance?: EnhanceConfig;
  analyze?: AnalyzeConfig;
}

export interface ResizeConfig {
  enabled: boolean;
  width?: number;
  height?: number;
  mode: 'fit' | 'fill' | 'crop' | 'pad' | 'scale';
  quality?: number;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  background?: string;
}

export interface CompressConfig {
  enabled: boolean;
  quality: number;
  method: 'lossy' | 'lossless';
  progressive: boolean;
  optimization: boolean;
}

export interface WatermarkConfig {
  enabled: boolean;
  type: 'text' | 'image' | 'logo';
  content: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size?: number;
  color?: string;
  font?: string;
  margin?: number;
}

export interface FilterConfig {
  enabled: boolean;
  filters: ImageFilter[];
  intensity?: number;
}

export interface ImageFilter {
  type: 'blur' | 'sharpen' | 'brightness' | 'contrast' | 'saturation' | 'hue' | 'grayscale' | 'sepia' | 'vintage' | 'custom';
  parameters: Record<string, any>;
}

export interface OptimizeConfig {
  enabled: boolean;
  level: 'low' | 'medium' | 'high';
  preserveMetadata: boolean;
  progressive: boolean;
}

export interface FormatConfig {
  enabled: boolean;
  format: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'svg';
  quality?: number;
}

export interface EnhanceConfig {
  enabled: boolean;
  autoEnhance: boolean;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sharpness?: number;
  noise?: number;
}

export interface AnalyzeConfig {
  enabled: boolean;
  features: AnalysisFeature[];
}

export interface AnalysisFeature {
  type: 'object_detection' | 'face_detection' | 'scene_recognition' | 'color_analysis' | 'text_detection' | 'quality_assessment';
  enabled: boolean;
  parameters?: Record<string, any>;
}

// 视频处理配置
export interface VideoProcessingConfig {
  transcode?: TranscodeConfig;
  thumbnail?: VideoThumbnailConfig;
  watermark?: VideoWatermarkConfig;
  trim?: TrimConfig;
  merge?: MergeConfig;
  extract?: ExtractConfig;
  caption?: CaptionConfig;
  optimize?: VideoOptimizeConfig;
}

export interface TranscodeConfig {
  enabled: boolean;
  format: 'mp4' | 'webm' | 'avi' | 'mov' | 'mkv';
  codec: 'h264' | 'h265' | 'vp9' | 'av1';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution?: Resolution;
  bitrate?: number;
  frameRate?: number;
  audioCodec?: string;
  audioBitrate?: number;
}

export interface Resolution {
  width: number;
  height: number;
  label: string;
}

export interface VideoThumbnailConfig {
  enabled: boolean;
  count: number;
  format: 'jpeg' | 'png';
  quality: number;
  width?: number;
  height?: number;
  captureTimes?: ('auto' | number[])[];
}

export interface VideoWatermarkConfig {
  enabled: boolean;
  type: 'text' | 'image' | 'logo';
  content: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size?: number;
  duration?: number;
  startTime?: number;
}

export interface TrimConfig {
  enabled: boolean;
  startTime: number;
  endTime: number;
  precision?: 'frame' | 'second';
}

export interface MergeConfig {
  enabled: boolean;
  inputs: string[];
  transition?: TransitionConfig;
}

export interface TransitionConfig {
  type: 'cut' | 'fade' | 'dissolve' | 'slide' | 'custom';
  duration: number;
  parameters?: Record<string, any>;
}

export interface ExtractConfig {
  enabled: boolean;
  type: 'audio' | 'frames' | 'subtitles';
  format?: string;
  interval?: number;
  quality?: number;
}

export interface CaptionConfig {
  enabled: boolean;
  type: 'auto' | 'manual' | 'import';
  language?: string;
  format?: 'srt' | 'vtt' | 'ass';
  style?: CaptionStyle;
}

export interface CaptionStyle {
  font: string;
  size: number;
  color: string;
  backgroundColor?: string;
  position?: 'top' | 'center' | 'bottom';
}

export interface VideoOptimizeConfig {
  enabled: boolean;
  level: 'low' | 'medium' | 'high';
  preserveQuality: boolean;
  targetSize?: number;
}

// 音频处理配置
export interface AudioProcessingConfig {
  transcode?: AudioTranscodeConfig;
  normalize?: NormalizeConfig;
  filter?: AudioFilterConfig;
  trim?: AudioTrimConfig;
  merge?: AudioMergeConfig;
  extract?: AudioExtractConfig;
  optimize?: AudioOptimizeConfig;
}

export interface AudioTranscodeConfig {
  enabled: boolean;
  format: 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg' | 'm4a';
  codec?: string;
  bitrate?: number;
  sampleRate?: number;
  channels?: 1 | 2;
  quality?: number;
}

export interface NormalizeConfig {
  enabled: boolean;
  targetLevel: number;
  peakNormalization: boolean;
  rmsNormalization: boolean;
}

export interface AudioFilterConfig {
  enabled: boolean;
  filters: AudioFilter[];
}

export interface AudioFilter {
  type: 'equalizer' | 'compressor' | 'noise_reduction' | 'reverb' | 'echo' | 'bass' | 'treble' | 'custom';
  parameters: Record<string, any>;
}

export interface AudioTrimConfig {
  enabled: boolean;
  startTime: number;
  endTime: number;
  fadeOut?: number;
  fadeIn?: number;
}

export interface AudioMergeConfig {
  enabled: boolean;
  inputs: string[];
  crossfade?: number;
}

export interface AudioExtractConfig {
  enabled: boolean;
  source: 'video' | 'media';
  format: string;
  quality?: number;
}

export interface AudioOptimizeConfig {
  enabled: boolean;
  level: 'low' | 'medium' | 'high';
  preserveMetadata: boolean;
  targetSize?: number;
}

// 文档处理配置
export interface DocumentProcessingConfig {
  convert?: DocumentConvertConfig;
  merge?: DocumentMergeConfig;
  split?: DocumentSplitConfig;
  watermark?: DocumentWatermarkConfig;
  protect?: DocumentProtectConfig;
  compress?: DocumentCompressConfig;
  extract?: DocumentExtractConfig;
  analyze?: DocumentAnalyzeConfig;
}

export interface DocumentConvertConfig {
  enabled: boolean;
  format: 'pdf' | 'docx' | 'html' | 'txt' | 'epub';
  options?: Record<string, any>;
  preserveFormatting: boolean;
}

export interface DocumentMergeConfig {
  enabled: boolean;
  inputs: string[];
  order?: number[];
  bookmarks?: boolean;
}

export interface DocumentSplitConfig {
  enabled: boolean;
  method: 'pages' | 'bookmarks' | 'size';
  parameters?: Record<string, any>;
}

export interface DocumentWatermarkConfig {
  enabled: boolean;
  type: 'text' | 'image';
  content: string;
  position: 'header' | 'footer' | 'background';
  opacity: number;
  pages?: 'all' | number[] | 'first' | 'last';
}

export interface DocumentProtectConfig {
  enabled: boolean;
  password?: string;
  permissions: DocumentPermissions;
  encryption?: string;
}

export interface DocumentPermissions {
  print: boolean;
  copy: boolean;
  modify: boolean;
  annotate: boolean;
  fillForms: boolean;
  extract: boolean;
  assemble: boolean;
}

export interface DocumentCompressConfig {
  enabled: boolean;
  level: 'low' | 'medium' | 'high';
  preserveQuality: boolean;
  optimizeImages: boolean;
}

export interface DocumentExtractConfig {
  enabled: boolean;
  type: 'text' | 'images' | 'tables' | 'metadata' | 'annotations';
  format?: string;
  options?: Record<string, any>;
}

export interface DocumentAnalyzeConfig {
  enabled: boolean;
  features: DocumentAnalysisFeature[];
}

export interface DocumentAnalysisFeature {
  type: 'text_extraction' | 'layout_analysis' | 'table_detection' | 'language_detection' | 'sentiment_analysis' | 'entity_extraction';
  enabled: boolean;
  parameters?: Record<string, any>;
}

// =============================================================================
// 文件管理类型
// =============================================================================

// 文件夹
export interface Folder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  level: number;
  children: Folder[];
  files: FileInfo[];
  size: number;
  fileCount: number;
  permissions: FolderPermissions;
  metadata: FolderMetadata;
  createdAt: number;
  updatedAt: number;
  owner: FileOwner;
  isPublic: boolean;
  isVirtual: boolean;
  tags: string[];
  color?: string;
  icon?: string;
  description?: string;
  settings: FolderSettings;
}

export interface FolderPermissions {
  public: boolean;
  owner: PermissionLevel;
  group: PermissionLevel;
  others: PermissionLevel;
  users: UserPermission[];
  inheritance: boolean;
  defaultPermissions: DefaultPermissions;
}

export interface DefaultPermissions {
  files: PermissionLevel;
  folders: PermissionLevel;
  inheritFromParent: boolean;
}

export interface FolderMetadata {
  itemCount: number;
  totalSize: number;
  lastModified: number;
  lastAccessed: number;
  creationDate: number;
  modifiedBy: string;
  accessedBy: string[];
  searchTerms: string[];
  tags: string[];
  custom?: Record<string, any>;
}

export interface FolderSettings {
  autoOrganize: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'list' | 'grid' | 'tree';
  groupBy?: string;
  filterBy?: string;
  autoTag: boolean;
  duplicateCheck: boolean;
  versionControl: boolean;
  notifications: FolderNotifications;
}

export interface FolderNotifications {
  enabled: boolean;
  events: FolderNotificationEvent[];
  channels: NotificationChannel[];
}

export interface FolderNotificationEvent {
  type: 'file_added' | 'file_removed' | 'file_modified' | 'folder_created' | 'folder_deleted' | 'permission_changed';
  enabled: boolean;
}

// 文件搜索
export interface FileSearchRequest {
  query: string;
  filters: FileSearchFilter[];
  sort: FileSearchSort[];
  pagination: FileSearchPagination;
  aggregations?: FileSearchAggregation[];
  highlight?: boolean;
  facets?: string[];
}

export interface FileSearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'starts_with' | 'ends_with';
  value: any;
  type?: 'text' | 'number' | 'date' | 'boolean';
}

export interface FileSearchSort {
  field: string;
  direction: 'asc' | 'desc';
  mode?: 'min' | 'max' | 'sum' | 'avg';
}

export interface FileSearchPagination {
  page: number;
  limit: number;
  offset?: number;
}

export interface FileSearchAggregation {
  name: string;
  field: string;
  type: 'terms' | 'date_histogram' | 'histogram' | 'range' | 'stats';
  parameters?: Record<string, any>;
}

export interface FileSearchResponse {
  files: FileInfo[];
  folders: Folder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  aggregations?: Record<string, FileSearchAggregationResult>;
  suggestions?: string[];
  searchTime: number;
  queryId: string;
}

export interface FileSearchAggregationResult {
  buckets: Array<{
    key: string;
    count: number;
    percentage?: number;
    subAggregations?: Record<string, any>;
  }>;
  total?: number;
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
}

// 文件操作
export interface FileOperation {
  id: string;
  type: FileOperationType;
  status: OperationStatus;
  source: string[];
  destination?: string;
  options: FileOperationOptions;
  progress: OperationProgress;
  startedAt?: number;
  completedAt?: number;
  estimatedTime?: number;
  error?: OperationError;
  result?: FileOperationResult;
  metadata: OperationMetadata;
}

export type FileOperationType = 
  | 'copy'
  | 'move'
  | 'rename'
  | 'delete'
  | 'compress'
  | 'extract'
  | 'download'
  | 'share'
  | 'backup'
  | 'restore'
  | 'sync'
  | 'batch';

export type OperationStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export interface FileOperationOptions {
  overwrite?: boolean;
  preserveMetadata?: boolean;
  updatePermissions?: boolean;
  createFolders?: boolean;
  followSymlinks?: boolean;
  dryRun?: boolean;
  concurrency?: number;
  retryAttempts?: number;
  timeout?: number;
}

export interface OperationProgress {
  processed: number;
  total: number;
  percentage: number;
  speed: number;
  estimatedTimeRemaining?: number;
  currentItem?: string;
  errors: number;
  warnings: number;
}

export interface OperationError {
  type: OperationErrorType;
  message: string;
  item?: string;
  recoverable: boolean;
  retryCount: number;
  maxRetries: number;
}

export type OperationErrorType = 
  | 'not_found'
  | 'permission_denied'
  | 'disk_full'
  | 'network'
  | 'corruption'
  | 'invalid_operation'
  | 'timeout'
  | 'quota_exceeded'
  | 'lock_conflict'
  | 'unknown';

export interface FileOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  skipped: number;
  totalSize: number;
  duration: number;
  items: OperationResultItem[];
  errors: OperationError[];
  warnings: OperationWarning[];
}

export interface OperationResultItem {
  source: string;
  destination?: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
  size?: number;
  duration?: number;
}

export interface OperationWarning {
  type: string;
  message: string;
  item?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface OperationMetadata {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  initiatedBy: string;
  reason?: string;
  tags: string[];
  custom?: Record<string, any>;
}

// 文件共享
export interface FileShare {
  id: string;
  fileId: string;
  type: ShareType;
  access: ShareAccess;
  permissions: SharePermissions;
  restrictions: ShareRestrictions;
  settings: ShareSettings;
  metadata: ShareMetadata;
  createdAt: number;
  expiresAt?: number;
  createdBy: string;
  url: string;
  shortUrl?: string;
  qrCode?: string;
  password?: string;
  status: ShareStatus;
  analytics: ShareAnalytics;
}

export type ShareType = 
  | 'public_link'
  | 'private_link'
  | 'email_invite'
  | 'domain_access'
  | 'embed'
  | 'api_access';

export type ShareAccess = 
  | 'view'
  | 'download'
  | 'comment'
  | 'edit'
  | 'admin';

export type ShareStatus = 
  | 'active'
  | 'expired'
  | 'revoked'
  | 'suspended'
  | 'pending';

export interface SharePermissions {
  canView: boolean;
  canDownload: boolean;
  canComment: boolean;
  canEdit: boolean;
  canShare: boolean;
  canPrint: boolean;
  canCopy: boolean;
  customPermissions?: Record<string, boolean>;
}

export interface ShareRestrictions {
  passwordRequired: boolean;
  emailRequired: boolean;
  domainRestrictions: string[];
  ipRestrictions: string[];
  timeRestrictions: TimeRestriction[];
  deviceRestrictions: DeviceRestriction[];
  geographicRestrictions: GeographicRestriction[];
}

export interface TimeRestriction {
  type: 'date_range' | 'time_range' | 'business_hours' | 'custom';
  parameters: Record<string, any>;
}

export interface DeviceRestriction {
  type: 'mobile' | 'desktop' | 'tablet' | 'specific';
  parameters?: Record<string, any>;
}

export interface GeographicRestriction {
  type: 'country' | 'region' | 'city' | 'coordinates';
  parameters: Record<string, any>;
}

export interface ShareSettings {
  allowComments: boolean;
  requireApproval: boolean;
  notifications: ShareNotificationSettings;
  watermark: boolean;
  preview: boolean;
  downloadLimit?: number;
  viewLimit?: number;
  tracking: boolean;
  customMessage?: string;
  branding: ShareBranding;
}

export interface ShareNotificationSettings {
  enabled: boolean;
  onView: boolean;
  onDownload: boolean;
  onComment: boolean;
  onShare: boolean;
  recipients: string[];
}

export interface ShareBranding {
  logo?: string;
  title?: string;
  description?: string;
  colors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  customCSS?: string;
}

export interface ShareMetadata {
  title?: string;
  description?: string;
  tags: string[];
  category?: string;
  language?: string;
  custom?: Record<string, any>;
}

export interface ShareAnalytics {
  views: number;
  uniqueViews: number;
  downloads: number;
  comments: number;
  shares: number;
  averageViewDuration: number;
  bounceRate: number;
  topReferrers: ReferrerInfo[];
  popularLocations: LocationInfo[];
  devices: DeviceBreakdown;
  browsers: BrowserBreakdown;
  operatingSystems: OSBreakdown;
  timeDistribution: TimeDistribution[];
  lastViewed?: number;
  conversionRate?: number;
}

// =============================================================================
// 文件API类型
// =============================================================================

// API请求/响应类型
export interface FileAPIRequest {
  action: FileAPIAction;
  parameters: Record<string, any>;
  files?: File[];
  metadata?: Record<string, any>;
  options?: FileAPIOptions;
}

export interface FileAPIResponse {
  success: boolean;
  data?: any;
  error?: FileAPIError;
  metadata?: FileAPIMetadata;
}

export type FileAPIAction = 
  | 'upload'
  | 'download'
  | 'list'
  | 'search'
  | 'delete'
  | 'move'
  | 'copy'
  | 'rename'
  | 'share'
  | 'process'
  | 'analyze'
  | 'compress'
  | 'extract'
  | 'convert'
  | 'thumbnail'
  | 'preview'
  | 'metadata'
  | 'permissions'
  | 'analytics';

export interface FileAPIOptions {
  timeout?: number;
  retries?: number;
  chunkSize?: number;
  concurrent?: boolean;
  validate?: boolean;
  encrypt?: boolean;
  compress?: boolean;
  cache?: boolean;
  priority?: ProcessingPriority;
  webhook?: string;
}

export interface FileAPIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  requestId?: string;
}

export interface FileAPIMetadata {
  version: string;
  requestId: string;
  timestamp: number;
  processingTime: number;
  rateLimit?: RateLimitInfo;
  server: ServerInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface ServerInfo {
  version: string;
  region: string;
  provider: StorageProvider;
  capabilities: string[];
}

// 批量操作API
export interface BatchFileAPIRequest {
  action: FileAPIAction;
  items: BatchFileItem[];
  options?: BatchFileAPIOptions;
}

export interface BatchFileItem {
  id: string;
  parameters?: Record<string, any>;
  file?: File;
}

export interface BatchFileAPIOptions extends FileAPIOptions {
  mode?: 'sequential' | 'parallel';
  concurrency?: number;
  continueOnError?: boolean;
  progress?: boolean;
}

export interface BatchFileAPIResponse {
  success: boolean;
  results: BatchFileResult[];
  summary: BatchFileSummary;
  errors: FileAPIError[];
  metadata?: FileAPIMetadata;
}

export interface BatchFileResult {
  id: string;
  success: boolean;
  data?: any;
  error?: FileAPIError;
  duration: number;
}

export interface BatchFileSummary {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  duration: number;
  averageDuration: number;
  totalSize: number;
}

// WebSocket实时API
export interface FileWebSocketMessage {
  type: FileWebSocketMessageType;
  id: string;
  data: any;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export type FileWebSocketMessageType = 
  | 'upload_progress'
  | 'processing_progress'
  | 'upload_completed'
  | 'processing_completed'
  | 'error'
  | 'notification'
  | 'analytics_update'
  | 'system_status'
  | 'queue_update';

export interface UploadProgressMessage {
  sessionId: string;
  fileId: string;
  progress: FileUploadProgress;
  speed: number;
  estimatedTimeRemaining?: number;
}

export interface ProcessingProgressMessage {
  taskId: string;
  fileId: string;
  progress: ProcessingProgress;
  currentOperation: string;
  estimatedTimeRemaining?: number;
}

export interface UploadCompletedMessage {
  sessionId: string;
  results: UploadResult[];
  duration: number;
  analytics: {
    totalSize: number;
    averageSpeed: number;
    compressionRatio?: number;
  };
}

export interface ProcessingCompletedMessage {
  taskId: string;
  fileId: string;
  result: UploadResult;
  duration: number;
  analytics: ProcessingAnalytics;
}

export interface ErrorMessage {
  type: 'upload' | 'processing' | 'system';
  id: string;
  error: FileAPIError;
  recoverable: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface NotificationMessage {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  actions?: NotificationAction[];
  dismissible: boolean;
  duration?: number;
}

export interface NotificationAction {
  label: string;
  action: string;
  url?: string;
  method?: 'GET' | 'POST';
  payload?: Record<string, any>;
}

export interface AnalyticsUpdateMessage {
  fileId: string;
  metrics: Partial<FileAnalytics>;
  timestamp: number;
}

export interface SystemStatusMessage {
  status: 'healthy' | 'degraded' | 'down';
  services: ServiceStatus[];
  metrics: SystemMetrics;
  alerts?: SystemAlert[];
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  errorRate?: number;
  uptime?: number;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: number;
  activeConnections: number;
  queueSize: number;
  processingSpeed: number;
}

export interface SystemAlert {
  type: 'performance' | 'capacity' | 'error' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved?: boolean;
}

export interface QueueUpdateMessage {
  queueName: string;
  size: number;
  processing: number;
  completed: number;
  failed: number;
  averageWaitTime: number;
  estimatedProcessingTime: number;
}