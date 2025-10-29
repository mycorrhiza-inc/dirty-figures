'use client';

import { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { YearRangeSelector } from '@/components/YearRangeSelector';

interface PermitsVsShutdownsData {
  year: string;
  total_permits: number;
  shutdown_count: number;
  shutdown_percentage: number;
  county: string;
}

interface ChartData {
  year: string;
  total_permits: number;
  shutdown_count: number;
  shutdown_percentage: number;
}

interface PermitsVsShutdownsChartProps {
  selectedCounties: string[];
}

export function PermitsVsShutdownsChart({ selectedCounties }: PermitsVsShutdownsChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startYear, setStartYear] = useState('1996');
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetch('/api/permits-vs-shutdowns')
      .then(res => res.json())
      .then((rawData: PermitsVsShutdownsData[]) => {
        // Group by year and aggregate
        const yearlyData: { [year: string]: { total_permits: number; shutdown_count: number; total_shutdown_weighted: number } } = {};

        rawData.forEach(item => {
          // Filter by selected counties if any
          if (selectedCounties.length > 0 && !selectedCounties.includes(item.county)) {
            return;
          }

          if (!yearlyData[item.year]) {
            yearlyData[item.year] = { total_permits: 0, shutdown_count: 0, total_shutdown_weighted: 0 };
          }
          yearlyData[item.year].total_permits += item.total_permits;
          yearlyData[item.year].shutdown_count += item.shutdown_count;
          // Weight the percentage by the number of permits for proper averaging
          yearlyData[item.year].total_shutdown_weighted += item.shutdown_percentage * item.total_permits;
        });

        // Filter data based on selected year range
        const startYearInt = parseInt(startYear);
        const endYearInt = parseInt(endYear);
        const allYearsData: { [year: string]: { total_permits: number; shutdown_count: number; total_shutdown_weighted: number } } = {};
        for (let year = startYearInt; year <= endYearInt; year++) {
          const yearStr = year.toString();
          allYearsData[yearStr] = yearlyData[yearStr] || { total_permits: 0, shutdown_count: 0, total_shutdown_weighted: 0 };
        }

        // Convert to chart format
        const chartData: ChartData[] = Object.keys(allYearsData)
          .sort()
          .map(year => {
            const data = allYearsData[year];
            const shutdown_percentage = data.total_permits > 0
              ? Math.round((data.total_shutdown_weighted / data.total_permits) * 10) / 10
              : 0;

            return {
              year,
              total_permits: data.total_permits,
              shutdown_count: data.shutdown_count,
              shutdown_percentage
            };
          });

        setData(chartData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching permits vs shutdowns data:', error);
        setLoading(false);
      });
  }, [selectedCounties, startYear, endYear]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="w-full space-y-4">
      {/* Year Range Selectors */}
      <YearRangeSelector
        startYear={startYear}
        endYear={endYear}
        onStartYearChange={setStartYear}
        onEndYearChange={setEndYear}
      />

      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'Shutdown Percentage') {
                return [`${value}%`, name];
              }
              return [value, name];
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="total_permits"
            fill="#82ca9d"
            name="Total Permits"
          />
          <Bar
            yAxisId="left"
            dataKey="shutdown_count"
            fill="#ff4444"
            name="Shutdown Wells"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="shutdown_percentage"
            stroke="#ff7300"
            strokeWidth={3}
            name="Shutdown Percentage"
          />
        </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}