/**
 * 图表组件类型定义
 * 基于 Recharts 库的完整图表类型系统，支持各种数据可视化需求
 */

// =============================================================================
// 基础图表类型
// =============================================================================

// 图表数据点
export interface ChartDataPoint {
  [key: string]: any;
}

// 图表数据集
export interface ChartDataSet {
  name: string;
  data: number[];
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

// 图表通用属性
export interface BaseChartProps {
  width?: number | string;
  height?: number | string;
  data?: ChartDataPoint[];
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  onClick?: (data: any) => void;
  onMouseMove?: (data: any) => void;
  onMouseLeave?: () => void;
}

// =============================================================================
// 线形图类型
// =============================================================================

export interface CustomLineChartProps extends BaseChartProps {
  lines?: LineConfig[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  grid?: GridConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  brush?: BrushConfig;
  referenceLines?: ReferenceLineConfig[];
  cartesianGrid?: boolean;
  animationDuration?: number;
  animationEasing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

export interface LineConfig {
  dataKey: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: DotConfig;
  activeDot?: ActiveDotConfig;
  type?: 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
  connectNulls?: boolean;
  name?: string;
  hide?: boolean;
}

export interface DotConfig {
  r?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fillOpacity?: number;
}

export interface ActiveDotConfig extends DotConfig {
  r?: number;
  onMouseEnter?: (data: any) => void;
  onMouseLeave?: (data: any) => void;
}

// =============================================================================
// 面积图类型
// =============================================================================

export interface CustomAreaChartProps extends BaseChartProps {
  areas?: AreaConfig[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  grid?: GridConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  stackId?: string;
  animationDuration?: number;
}

export interface AreaConfig extends Omit<LineConfig, 'dot' | 'activeDot'> {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  stackId?: string;
  type?: 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
}

// =============================================================================
// 柱状图类型
// =============================================================================

export interface CustomBarChartProps extends BaseChartProps {
  bars?: BarConfig[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  grid?: GridConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  stackId?: string;
  layout?: 'horizontal' | 'vertical';
  barCategoryGap?: string | number;
  barGap?: string | number;
  maxBarSize?: number;
  animationDuration?: number;
}

export interface BarConfig {
  dataKey: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  stackId?: string;
  radius?: number | [number, number, number, number];
  label?: LabelConfig;
  background?: BackgroundConfig;
  name?: string;
  hide?: boolean;
}

export interface LabelConfig {
  position?: 'top' | 'center' | 'bottom' | 'left' | 'right' | 'inside';
  offset?: number;
  angle?: number;
  fill?: string;
  fontSize?: number;
  fontWeight?: string;
  formatter?: (value: any) => string;
}

export interface BackgroundConfig {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fillOpacity?: number;
}

// =============================================================================
// 饼图类型
// =============================================================================

export interface CustomPieChartProps extends BaseChartProps {
  pies?: PieConfig[];
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  label?: PieLabelConfig;
  labelLine?: LabelLineConfig;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  cx?: number | string;
  cy?: number | string;
  animationDuration?: number;
  animationBegin?: number;
}

export interface PieConfig {
  dataKey: string;
  nameKey?: string;
  cx?: number | string;
  cy?: number | string;
  startAngle?: number;
  endAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  cornerRadius?: number;
  paddingAngle?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  blendStroke?: boolean;
  data?: ChartDataPoint[];
  label?: PieLabelConfig;
  labelLine?: LabelLineConfig;
  minAngle?: number;
  animationBegin?: number;
  animationDuration?: number;
  hide?: boolean;
}

export interface PieLabelConfig {
  position?: 'inside' | 'outside' | 'center';
  angle?: number;
  offset?: number;
  fill?: string;
  fontSize?: number;
  fontWeight?: string;
  formatter?: (value: any, data: any) => string;
}

export interface LabelLineConfig {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  fill?: string;
  fillOpacity?: number;
}

// =============================================================================
// 散点图类型
// =============================================================================

export interface CustomScatterChartProps extends BaseChartProps {
  scatters?: ScatterConfig[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  grid?: GridConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  zAxis?: ZAxisConfig;
  animationDuration?: number;
}

export interface ScatterConfig {
  dataKey: string;
  fill?: string;
  line?: ScatterLineConfig;
  shape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
  fillOpacity?: number;
  strokeWidth?: number;
  name?: string;
  hide?: boolean;
}

export interface ScatterLineConfig {
  type?: 'fitting' | 'joint';
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
}

export interface ZAxisConfig {
  type?: 'number' | 'category';
  domain?: [number, number];
  range?: [number, number];
  name?: string;
  unit?: string;
  reversed?: boolean;
}

// =============================================================================
// 雷达图类型
// =============================================================================

export interface CustomRadarChartProps extends BaseChartProps {
  radars?: RadarConfig[];
  polarGrid?: PolarGridConfig;
  polarAngleAxis?: PolarAngleAxisConfig;
  polarRadiusAxis?: PolarRadiusAxisConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  animationDuration?: number;
}

export interface RadarConfig {
  dataKey: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  dot?: DotConfig;
  name?: string;
  hide?: boolean;
}

export interface PolarGridConfig {
  gridType?: 'polygon' | 'circle';
  radialLines?: boolean;
  stroke?: string;
  fill?: string;
  fillOpacity?: number;
}

export interface PolarAngleAxisConfig {
  type?: 'number' | 'category';
  dataKey?: string;
  domain?: [number, number];
  tick?: {
    fill?: string;
    fontSize?: number;
    fontWeight?: string;
  };
  tickCount?: number;
  angleAxisId?: number;
}

export interface PolarRadiusAxisConfig {
  type?: 'number' | 'category';
  domain?: [number, number];
  angleAxisId?: number;
  tick?: {
    fill?: string;
    fontSize?: number;
    fontWeight?: string;
  };
  tickCount?: number;
  axisLine?: boolean;
  orientation?: 'inner' | 'outer';
  radiusAxisId?: number;
}

// =============================================================================
// 坐标轴类型
// =============================================================================

export interface AxisConfig {
  type?: 'number' | 'category';
  dataKey?: string;
  domain?: [number, number] | ['dataMin', 'dataMax'] | ['dataMax', 'dataMin'];
  allowDataOverflow?: boolean;
  allowDecimals?: boolean;
  scale?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'time' | 'band' | 'point';
  ticks?: number;
  tick?: TickConfig;
  tickLine?: TickLineConfig;
  tickFormatter?: (value: any) => string;
  tickCount?: number;
  interval?: number | 'preserveStartEnd' | 'preserveStart';
  reversed?: boolean;
  unit?: string;
  label?: AxisLabelConfig;
  hide?: boolean;
  orientation?: 'top' | 'bottom' | 'left' | 'right';
  padding?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  minTickGap?: number;
  angle?: number;
  textAnchor?: 'start' | 'middle' | 'end';
}

export interface TickConfig {
  fill?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
}

export interface TickLineConfig {
  stroke?: string;
  strokeWidth?: number;
  size?: number;
}

export interface AxisLabelConfig {
  value?: string;
  offset?: number;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  angle?: number;
  fill?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
}

// =============================================================================
// 网格和参考线类型
// =============================================================================

export interface GridConfig {
  horizontal?: boolean;
  vertical?: boolean;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  fill?: string;
  fillOpacity?: number;
}

export interface ReferenceLineConfig {
  x?: number;
  y?: number;
  segment?: [number, number, number, number];
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  label?: string | ReferenceLineLabelConfig;
  ifOverflow?: 'visible' | 'hidden' | 'discard' | 'extendDomain';
  alwaysShow?: boolean;
}

export interface ReferenceLineLabelConfig {
  value?: string;
  position?: 'left' | 'center' | 'right' | 'top' | 'bottom';
  offset?: number;
  fill?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
}

// =============================================================================
// 刷子选择器类型
// =============================================================================

export interface BrushConfig {
  dataKey?: string;
  startIndex?: number;
  endIndex?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  height?: number;
  travellerWidth?: number;
  gap?: number;
  leaveTextOnly?: boolean;
  alwaysShowText?: boolean;
  tickFormatter?: (value: any) => string;
}

// =============================================================================
// 工具提示和图例类型
// =============================================================================

export interface TooltipConfig {
  trigger?: 'hover' | 'click';
  contentStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  cursor?: boolean;
  separator?: string;
  offset?: number;
  wrapperStyle?: React.CSSProperties;
  isAnimationActive?: boolean;
  animationDuration?: number;
  animationEasing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  filterNull?: boolean;
  position?: {
    x?: number;
    y?: number;
  };
  formatter?: (value: any, name: any, props: any) => React.ReactNode;
  labelFormatter?: (label: any) => React.ReactNode;
  content?: React.ComponentType<any>;
}

export interface LegendConfig {
  content?: React.ComponentType<any>;
  iconType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'plainline' | 'simpleline';
  layout?: 'horizontal' | 'vertical';
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  height?: number;
  wrapperStyle?: React.CSSProperties;
  iconSize?: number;
  formatter?: (value: string, entry: any, index: number) => React.ReactNode;
  onClick?: (data: any, index: number) => void;
  onMouseEnter?: (data: any, index: number) => void;
  onMouseLeave?: (data: any, index: number) => void;
  payload?: any[];
}

// =============================================================================
// 复合图表类型
// =============================================================================

export interface ComposedChartProps extends BaseChartProps {
  lines?: LineConfig[];
  areas?: AreaConfig[];
  bars?: BarConfig[];
  scatters?: ScatterConfig[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  grid?: GridConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  brush?: BrushConfig;
  referenceLines?: ReferenceLineConfig[];
  animationDuration?: number;
}

// =============================================================================
// 主题和样式类型
// =============================================================================

export interface ChartTheme {
  colors: string[];
  backgroundColor?: string;
  gridColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  borderRadius?: number;
  borderWidth?: number;
}

export interface ChartStylePreset {
  name: string;
  theme: ChartTheme;
  defaultMargin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  animation: {
    duration: number;
    easing: string;
  };
}

// 预定义的图表样式预设
export const CHART_PRESETS: Record<string, ChartStylePreset> = {
  default: {
    name: 'default',
    theme: {
      colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'],
      backgroundColor: '#ffffff',
      gridColor: '#e0e0e0',
      textColor: '#333333',
      fontSize: 12,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      borderRadius: 4,
      borderWidth: 1
    },
    defaultMargin: {
      top: 5,
      right: 30,
      bottom: 5,
      left: 20
    },
    animation: {
      duration: 1000,
      easing: 'ease-in-out'
    }
  },
  dark: {
    name: 'dark',
    theme: {
      colors: ['#8dd1e1', '#d084d0', '#ffb347', '#82ca9d', '#8884d8', '#ff7c7c'],
      backgroundColor: '#1a1a1a',
      gridColor: '#404040',
      textColor: '#ffffff',
      fontSize: 12,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      borderRadius: 4,
      borderWidth: 1
    },
    defaultMargin: {
      top: 5,
      right: 30,
      bottom: 5,
      left: 20
    },
    animation: {
      duration: 1000,
      easing: 'ease-in-out'
    }
  },
  minimal: {
    name: 'minimal',
    theme: {
      colors: ['#000000', '#666666', '#999999', '#cccccc'],
      backgroundColor: '#ffffff',
      gridColor: '#f0f0f0',
      textColor: '#333333',
      fontSize: 11,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      borderRadius: 2,
      borderWidth: 1
    },
    defaultMargin: {
      top: 2,
      right: 20,
      bottom: 2,
      left: 10
    },
    animation: {
      duration: 500,
      easing: 'ease-out'
    }
  }
};

// =============================================================================
// 图表数据配置类型
// =============================================================================

export interface ChartDataConfig {
  dataSource: string;
  query?: string;
  filters?: ChartFilter[];
  groupBy?: string[];
  aggregations?: ChartAggregation[];
  sortBy?: ChartSortConfig[];
  limit?: number;
  refreshInterval?: number; // 毫秒
  transform?: (data: any[]) => ChartDataPoint[];
}

export interface ChartFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
  value: any;
}

export interface ChartAggregation {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
  alias?: string;
}

export interface ChartSortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// =============================================================================
// 图表交互类型
// =============================================================================

export interface ChartInteractionConfig {
  zoom?: ChartZoomConfig;
  pan?: ChartPanConfig;
  brush?: ChartBrushConfig;
  crosshair?: ChartCrosshairConfig;
  selection?: ChartSelectionConfig;
}

export interface ChartZoomConfig {
  enabled: boolean;
  direction: 'x' | 'y' | 'xy';
  minScale?: number;
  maxScale?: number;
  zoomInKey?: string;
  zoomOutKey?: string;
  resetKey?: string;
}

export interface ChartPanConfig {
  enabled: boolean;
  direction: 'x' | 'y' | 'xy';
  speed?: number;
  boundaries?: 'strict' | 'loose';
}

export interface ChartBrushConfig {
  enabled: boolean;
  mode: 'filter' | 'highlight';
  syncId?: string;
}

export interface ChartCrosshairConfig {
  enabled: boolean;
  vertical?: boolean;
  horizontal?: boolean;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export interface ChartSelectionConfig {
  enabled: boolean;
  mode: 'single' | 'multiple';
  callback?: (selected: ChartDataPoint[]) => void;
}

// =============================================================================
// 图表导出类型
// =============================================================================

export interface ChartExportConfig {
  formats: ('png' | 'jpeg' | 'svg' | 'pdf')[];
  filename?: string;
  quality?: number; // 0-1 for jpeg
  backgroundColor?: string;
  pixelRatio?: number;
  width?: number;
  height?: number;
  scale?: number;
}

export interface ChartExportResult {
  format: string;
  data: string | Blob;
  filename: string;
  size: number;
  timestamp: number;
}

// =============================================================================
// 响应式图表类型
// =============================================================================

export interface ResponsiveChartConfig {
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  configs: {
    xs?: Partial<BaseChartProps>;
    sm?: Partial<BaseChartProps>;
    md?: Partial<BaseChartProps>;
    lg?: Partial<BaseChartProps>;
    xl?: Partial<BaseChartProps>;
  };
}

// =============================================================================
// 图表错误类型
// =============================================================================

export interface ChartError {
  type: 'DATA_ERROR' | 'RENDER_ERROR' | 'CONFIG_ERROR' | 'NETWORK_ERROR';
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
}

// =============================================================================
// 图表事件类型
// =============================================================================

export interface ChartEventHandlers {
  onLoad?: (chart: any) => void;
  onError?: (error: ChartError) => void;
  onDataUpdate?: (data: ChartDataPoint[]) => void;
  onZoom?: (domain: [number, number]) => void;
  onPan?: (offset: [number, number]) => void;
  onSelection?: (selected: ChartDataPoint[]) => void;
  onExport?: (result: ChartExportResult) => void;
}

// =============================================================================
// 图表配置工厂类型
// =============================================================================

export interface ChartConfigFactory {
  createLineChart: (data: ChartDataPoint[], config?: Partial<CustomLineChartProps>) => CustomLineChartProps;
  createAreaChart: (data: ChartDataPoint[], config?: Partial<CustomAreaChartProps>) => CustomAreaChartProps;
  createBarChart: (data: ChartDataPoint[], config?: Partial<CustomBarChartProps>) => CustomBarChartProps;
  createPieChart: (data: ChartDataPoint[], config?: Partial<CustomPieChartProps>) => CustomPieChartProps;
  createScatterChart: (data: ChartDataPoint[], config?: Partial<CustomScatterChartProps>) => CustomScatterChartProps;
  createRadarChart: (data: ChartDataPoint[], config?: Partial<CustomRadarChartProps>) => CustomRadarChartProps;
  createComposedChart: (data: ChartDataPoint[], config?: Partial<ComposedChartProps>) => ComposedChartProps;
}