'use client';

import { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PermitsVsShutdownsData {
  year: string;
  new_permits: number;
  shutdowns: number;
  county: string;
}

interface ChartData {
  year: string;
  new_permits: number;
  shutdowns: number;
  net_change: number;
}

interface PermitsVsShutdownsChartProps {
  selectedCounties: string[];
}

export function PermitsVsShutdownsChart({ selectedCounties }: PermitsVsShutdownsChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/permits-vs-shutdowns')
      .then(res => res.json())
      .then((rawData: PermitsVsShutdownsData[]) => {
        // Group by year and aggregate
        const yearlyData: { [year: string]: { new_permits: number; shutdowns: number } } = {};

        rawData.forEach(item => {
          // Filter by selected counties if any
          if (selectedCounties.length > 0 && !selectedCounties.includes(item.county)) {
            return;
          }

          if (!yearlyData[item.year]) {
            yearlyData[item.year] = { new_permits: 0, shutdowns: 0 };
          }
          yearlyData[item.year].new_permits += item.new_permits;
          yearlyData[item.year].shutdowns += item.shutdowns;
        });

        // Ensure we have data for all years from 1995 to current year
        const currentYear = new Date().getFullYear();
        const allYearsData: { [year: string]: { new_permits: number; shutdowns: number } } = {};
        for (let year = 1995; year <= currentYear; year++) {
          const yearStr = year.toString();
          allYearsData[yearStr] = yearlyData[yearStr] || { new_permits: 0, shutdowns: 0 };
        }

        // Convert to chart format
        const chartData: ChartData[] = Object.keys(allYearsData)
          .sort()
          .map(year => ({
            year,
            new_permits: allYearsData[year].new_permits,
            shutdowns: allYearsData[year].shutdowns,
            net_change: allYearsData[year].new_permits - allYearsData[year].shutdowns
          }));

        setData(chartData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching permits vs shutdowns data:', error);
        setLoading(false);
      });
  }, [selectedCounties]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="new_permits"
            fill="#82ca9d"
            name="New Permits"
          />
          <Bar
            dataKey="shutdowns"
            fill="#ff7300"
            name="Shutdowns"
          />
          <Line
            type="monotone"
            dataKey="net_change"
            stroke="#8884d8"
            strokeWidth={3}
            name="Net Change"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}