'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ExportableChart } from '@/components/ExportableChart';
import { createExportMetadata } from '@/utils/csvExport';

export interface PieChartDataPoint {
  county: string;
  value: number;
}

export interface PieChartConfig {
  apiEndpoint: string;
  title: string;
  description: string;
  valueKey: string; // e.g., 'total_emissions', 'total_oil_production', 'total_gas_production'
  tooltipUnit: string; // e.g., 'k', 'k barrels', 'k MCF'
  tooltipLabel: string; // e.g., 'Total Emissions', 'Total Oil Production'
  divideBy?: number; // Convert to thousands, etc. Default: 1000
  colors: string[];
}

interface PieChartProps {
  selectedCounties: string[];
  config: PieChartConfig;
}

export function PieChartComponent({ selectedCounties, config }: PieChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(config.apiEndpoint)
      .then(res => res.json())
      .then((rawData: any[]) => {
        setData(rawData);
        setLoading(false);
      })
      .catch(error => {
        console.error(`Error fetching ${config.title.toLowerCase()} data:`, error);
        setLoading(false);
      });
  }, [config.apiEndpoint, config.title]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Filter data based on selected counties
  const filteredData = selectedCounties.length > 0
    ? data.filter(item => selectedCounties.includes(item.county))
    : data;

  // Aggregate data by county and calculate totals
  const countyTotals = filteredData.reduce((acc: { [key: string]: number }, item) => {
    acc[item.county] = (acc[item.county] || 0) + (item[config.valueKey] as number);
    return acc;
  }, {});

  const divideBy = config.divideBy || 1000;

  // Convert to pie chart format and sort by value (descending)
  const pieData: PieChartDataPoint[] = Object.entries(countyTotals)
    .map(([county, value]) => ({
      county,
      value: Math.round(value / divideBy)
    }))
    .sort((a, b) => b.value - a.value);

  // Take top 10 counties to avoid overcrowding
  const topCounties = pieData.slice(0, 10);

  // Prepare export data
  const exportData = topCounties.map(item => ({
    County: item.county,
    [config.tooltipLabel]: item.value
  }));

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is > 2% to avoid clutter
    if (percent < 0.02) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ExportableChart filename={`${config.valueKey}-by-county-${new Date().toISOString().split('T')[0]}`}>
      {(registerExportHook) => {
        registerExportHook({
          getData: () => exportData,
          getMetadata: () => createExportMetadata(
            config.title,
            config.description,
            selectedCounties
          )
        });

        return (
          <div style={{ width: '100%', height: '500px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={topCounties}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="county"
                >
                  {topCounties.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={config.colors[index % config.colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()}${config.tooltipUnit}`,
                    `${name} ${config.tooltipLabel}`
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      }}
    </ExportableChart>
  );
}