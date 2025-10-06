// Dashboard管理端图表相关类型定义

// 基础图表数据类型
export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
}

// 时间序列数据类型
export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

// 多系列时间序列数据类型
export interface MultiSeriesTimeSeriesData {
  date: string;
  [key: string]: number | string;
}

// 图表基础Props类型
export interface BaseChartProps {
  data: Record<string, unknown>[] | TimeSeriesData[];
  loading?: boolean;
  error?: string;
  height?: number;
  width?: number | string;
  responsive?: boolean;
  title?: string;
  subtitle?: string;
  colors?: string[];
  className?: string;
}

// 折线图Props类型
export interface LineChartProps extends BaseChartProps {
  xAxisKey: string;
  yAxisKeys: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  smooth?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showDots?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
  area?: boolean;
  areaOpacity?: number;
  colors?: string[];
}

// 面积图Props类型
export interface AreaChartProps extends BaseChartProps {
  xAxisKey: string;
  yAxisKeys: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  smooth?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  stacked?: boolean;
  opacity?: number;
  colors?: string[];
}

// 柱状图Props类型
export interface BarChartProps extends BaseChartProps {
  xAxisKey: string;
  yAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  horizontal?: boolean;
  stacked?: boolean;
  barRadius?: number;
  colors?: string[];
}

// 饼图Props类型
export interface PieChartProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  labelPosition?: 'inside' | 'outside';
  startAngle?: number;
  endAngle?: number;
  colors?: string[];
}

// 环形图Props类型
export interface DoughnutChartProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  centerText?: string;
  colors?: string[];
}

// 雷达图Props类型
export interface RadarChartProps extends BaseChartProps {
  dataKey: string;
  angleAxisKey: string;
  radiusAxisKey: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  fillOpacity?: number;
  colors?: string[];
}

// 散点图Props类型
export interface ScatterChartProps extends BaseChartProps {
  xAxisKey: string;
  yAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  pointSize?: number;
  colors?: string[];
}

// 热力图Props类型
export interface HeatmapProps extends BaseChartProps {
  xAxisKey: string;
  yAxisKey: string;
  valueKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  colorScheme?: string;
  colorRange?: [string, string];
}

// 漏斗图Props类型
export interface FunnelChartProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  labelPosition?: 'left' | 'right' | 'center';
  colors?: string[];
}

// 仪表盘Props类型
export interface GaugeProps extends BaseChartProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  showValue?: boolean;
  showLabel?: boolean;
  startAngle?: number;
  endAngle?: number;
  colors?: string[];
  thresholds?: Array<{
    value: number;
    color: string;
  }>;
}

// 进度条Props类型
export interface ProgressProps extends BaseChartProps {
  value: number;
  max?: number;
  showValue?: boolean;
  showLabel?: boolean;
  strokeWidth?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  color?: string;
  backgroundColor?: string;
  gradient?: boolean;
  animation?: boolean;
}

// 统计卡片Props类型
export interface StatCardProps extends BaseChartProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period?: string;
  };
  icon?: React.ReactNode;
  color?: string;
  backgroundColor?: string;
  loading?: boolean;
  error?: string;
}

// 数据表格Props类型
export interface DataTableProps extends BaseChartProps {
  columns: Array<{
    key: string;
    title: string;
    dataIndex: string;
    render?: (value: unknown, record: Record<string, unknown>) => React.ReactNode;
    sorter?: boolean;
    width?: number;
    align?: 'left' | 'center' | 'right';
  }>;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  onRowClick?: (record: Record<string, unknown>) => void;
  selection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[]) => void;
  };
}

// 设备统计Props类型
export interface DeviceStatsProps extends BaseChartProps {
  data: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  colors?: string[];
}

// 地理统计Props类型
export interface GeoStatsProps extends BaseChartProps {
  data: Array<{
    country: string;
    city?: string;
    count: number;
    percentage: number;
  }>;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  colors?: string[];
  mapType?: 'world' | 'china';
}

// 浏览器统计Props类型
export interface BrowserStatsProps extends BaseChartProps {
  data: Array<{
    browser: string;
    version?: string;
    count: number;
    percentage: number;
  }>;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  colors?: string[];
}

// 趋势图Props类型
export interface TrendChartProps extends BaseChartProps {
  data: TimeSeriesData[];
  xAxisKey: string;
  yAxisKey: string;
  showTrend?: boolean;
  showAverage?: boolean;
  showForecast?: boolean;
  forecastPeriod?: number;
  colors?: string[];
}

// 对比图Props类型
export interface ComparisonChartProps extends BaseChartProps {
  data: MultiSeriesTimeSeriesData[];
  xAxisKey: string;
  yAxisKeys: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  colors?: string[];
}

// 实时图表Props类型
export interface RealtimeChartProps extends BaseChartProps {
  data: TimeSeriesData[];
  xAxisKey: string;
  yAxisKey: string;
  updateInterval?: number;
  maxDataPoints?: number;
  showRealtimeIndicator?: boolean;
  colors?: string[];
}

// 自定义图表主题类型
export interface ChartTheme {
  backgroundColor?: string;
  textColor?: string;
  gridColor?: string;
  colors?: string[];
  fontSize?: {
    small?: number;
    medium?: number;
    large?: number;
  };
  fontFamily?: string;
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

// 图表导出Props类型
export interface ChartExportProps {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  filename?: string;
  width?: number;
  height?: number;
  quality?: number;
  backgroundColor?: string;
}

// 图表交互类型
export interface ChartInteraction {
  type: 'click' | 'hover' | 'zoom' | 'pan';
  handler: (data: Record<string, unknown>) => void;
  enabled?: boolean;
}

// 图表配置类型
export interface ChartConfig {
  theme?: ChartTheme;
  animation?: {
    enabled?: boolean;
    duration?: number;
    easing?: string;
  };
  interaction?: ChartInteraction[];
  export?: ChartExportProps;
  responsive?: {
    enabled?: boolean;
    breakpoints?: Array<{
      width: number;
      config: Partial<ChartConfig>;
    }>;
  };
}