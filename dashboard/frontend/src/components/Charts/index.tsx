import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import {
  AreaChartProps,
  PieChartProps,
  ChartDataPoint,
  TimeSeriesData
} from '../../types/charts';

interface CustomLineChartProps {
  data: ChartDataPoint[] | TimeSeriesData[];
  dataKey?: string;
  xAxisDataKey?: string;
  xAxisKey?: string;
  yAxisKeys?: string[];
  formatXAxis?: boolean;
  stroke?: string;
  height?: number;
  title?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

interface CustomAreaChartProps extends Omit<AreaChartProps, 'data'> {
  data: ChartDataPoint[] | TimeSeriesData[];
  dataKey?: string;
  xAxisDataKey?: string;
  formatXAxis?: boolean;
  stroke?: string;
  fill?: string;
  height?: number;
  title?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

interface CustomBarChartProps {
  data: ChartDataPoint[] | TimeSeriesData[];
  dataKey?: string;
  xAxisDataKey?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  fill?: string;
  height?: number;
  title?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

interface CustomPieChartProps extends Omit<PieChartProps, 'data'> {
  data: Array<{ name: string; value: number; color?: string }>;
  dataKey: string;
  nameKey: string;
  height?: number;
  title?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export const CustomLineChart: React.FC<CustomLineChartProps> = ({
  data,
  dataKey = 'value',
  xAxisDataKey = 'date',
  stroke = '#3b82f6',
  height = 300,
  title,
  formatXAxis = true,
  showGrid = true,
  showTooltip = true,
  showLegend = false
}) => {
  const formatXAxisTick = (tickItem: string) => {
    if (!formatXAxis) return tickItem;
    try {
      return format(new Date(tickItem), 'MM/dd');
    } catch {
      return tickItem;
    }
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          )}
          <XAxis
            dataKey={xAxisDataKey}
            tickFormatter={formatXAxisTick}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis className="text-gray-600 dark:text-gray-400" />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(17 24 39)',
                border: '1px solid rgb(55 65 81)',
                borderRadius: '0.5rem'
              }}
              labelStyle={{ color: 'rgb(229 231 235)' }}
              itemStyle={{ color: 'rgb(156 163 175)' }}
            />
          )}
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={2}
            dot={{ fill: stroke, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CustomAreaChart: React.FC<CustomAreaChartProps> = ({
  data,
  dataKey = 'value',
  xAxisDataKey = 'date',
  stroke = '#3b82f6',
  fill = '#3b82f6',
  height = 300,
  title,
  formatXAxis = true,
  showGrid = true,
  showTooltip = true,
  showLegend = false
}) => {
  const formatXAxisTick = (tickItem: string) => {
    if (!formatXAxis) return tickItem;
    try {
      return format(new Date(tickItem), 'MM/dd');
    } catch {
      return tickItem;
    }
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          )}
          <XAxis
            dataKey={xAxisDataKey}
            tickFormatter={formatXAxisTick}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis className="text-gray-600 dark:text-gray-400" />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(17 24 39)',
                border: '1px solid rgb(55 65 81)',
                borderRadius: '0.5rem'
              }}
              labelStyle={{ color: 'rgb(229 231 235)' }}
              itemStyle={{ color: 'rgb(156 163 175)' }}
            />
          )}
          {showLegend && <Legend />}
          <Area type="monotone" dataKey={dataKey} stroke={stroke} fill={fill} fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CustomBarChart: React.FC<CustomBarChartProps> = ({
  data,
  dataKey = 'value',
  xAxisDataKey = 'date',
  fill = '#3b82f6',
  height = 300,
  title,
  showGrid = true,
  showTooltip = true,
  showLegend = false
}) => {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          )}
          <XAxis dataKey={xAxisDataKey} className="text-gray-600 dark:text-gray-400" />
          <YAxis className="text-gray-600 dark:text-gray-400" />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(17 24 39)',
                border: '1px solid rgb(55 65 81)',
                borderRadius: '0.5rem'
              }}
              labelStyle={{ color: 'rgb(229 231 235)' }}
              itemStyle={{ color: 'rgb(156 163 175)' }}
            />
          )}
          {showLegend && <Legend />}
          <Bar dataKey={dataKey} fill={fill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DEFAULT_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#6366f1'
];

export const CustomPieChart: React.FC<CustomPieChartProps> = ({
  data,
  height = 300,
  title,
  showTooltip = true,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80
}) => {
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

    // 类型守卫确保所有必需的属性都存在
    if (cx === undefined || cy === undefined || midAngle === undefined || percent === undefined) {
      return null;
    }

    const cxNum = typeof cx === 'string' ? parseFloat(cx) : cx as number;
    const cyNum = typeof cy === 'string' ? parseFloat(cy) : cy as number;
    const midAngleNum = typeof midAngle === 'string' ? parseFloat(midAngle) : midAngle as number;
    const RADIAN = Math.PI / 180;
    const innerRadiusNum = (innerRadius as number) || 0;
    const outerRadiusNum = (outerRadius as number) || 0;
    const radius = innerRadiusNum + (outerRadiusNum - innerRadiusNum) * 0.5;
    const x = cxNum + radius * Math.cos(-midAngleNum * RADIAN);
    const y = cyNum + radius * Math.sin(-midAngleNum * RADIAN);

    if ((percent as number) < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cxNum ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(((percent as number) * 100)).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(17 24 39)',
                border: '1px solid rgb(55 65 81)',
                borderRadius: '0.5rem'
              }}
              labelStyle={{ color: 'rgb(229 231 235)' }}
              itemStyle={{ color: 'rgb(156 163 175)' }}
            />
          )}
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
