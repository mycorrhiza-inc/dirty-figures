'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportableChart } from '@/components/ExportableChart';
import { createExportMetadata } from '@/utils/csvExport';

interface PermitsByYearData {
  year: string;
  permit_count: number;
  county: string;
}

interface AggregatedData extends Record<string, unknown> {
  year: string;
  total_permits: number;
}

interface PermitsByYearChartProps {
  selectedCounties: string[];
}

export function PermitsByYearChart({ selectedCounties }: PermitsByYearChartProps) {
  const [data, setData] = useState<PermitsByYearData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('total');

  useEffect(() => {
    fetch('/api/permits-by-year')
      .then(res => res.json())
      .then((rawData: PermitsByYearData[]) => {
        setData(rawData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching permits data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Filter data based on selected counties
  const filteredData = selectedCounties.length > 0
    ? data.filter(item => selectedCounties.includes(item.county))
    : data;

  // Aggregate total permits by year
  const aggregatedData = filteredData.reduce((acc: { [key: string]: number }, item) => {
    acc[item.year] = (acc[item.year] || 0) + item.permit_count;
    return acc;
  }, {});

  // Ensure we have data for all years from 1995 to current year
  const currentYear = new Date().getFullYear();
  const allYears: { [key: string]: number } = {};
  for (let year = 1995; year <= currentYear; year++) {
    allYears[year.toString()] = aggregatedData[year.toString()] || 0;
  }

  const chartData: AggregatedData[] = Object.entries(allYears)
    .map(([year, total_permits]) => ({ year, total_permits }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // Get top counties for detailed view
  const countyTotals = filteredData.reduce((acc: { [key: string]: number }, item) => {
    acc[item.county] = (acc[item.county] || 0) + item.permit_count;
    return acc;
  }, {});

  const topCounties = Object.entries(countyTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([county]) => county);

  // Create county-specific chart data
  const countyChartData = chartData.map(yearData => {
    const countyData: Record<string, string | number> = { year: yearData.year };
    topCounties.forEach(county => {
      const countyItem = filteredData.find(item => item.year === yearData.year && item.county === county);
      countyData[county] = countyItem ? countyItem.permit_count : 0;
    });
    return countyData;
  });

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="total">Total Permits</TabsTrigger>
          <TabsTrigger value="by-county">By County</TabsTrigger>
        </TabsList>

        <TabsContent value="total" className="mt-4">
          <ExportableChart filename={`permits-total-${new Date().toISOString().split('T')[0]}`}>
            {(registerExportHook) => {
              registerExportHook({
                getData: () => chartData,
                getMetadata: () => createExportMetadata(
                  'Total Permits by Year',
                  'Number of drilling permits granted annually',
                  selectedCounties
                )
              });

              return (
                <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="year"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Permits']}
                  />
                  <Bar
                    dataKey="total_permits"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
                </div>
              );
            }}
          </ExportableChart>
        </TabsContent>

        <TabsContent value="by-county" className="mt-4">
          <ExportableChart filename={`permits-by-county-${new Date().toISOString().split('T')[0]}`}>
            {(registerExportHook) => {
              registerExportHook({
                getData: () => countyChartData,
                getMetadata: () => createExportMetadata(
                  'Permits by Year and County',
                  'Number of drilling permits granted annually by county',
                  selectedCounties
                )
              });

              return (
                <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer>
                <BarChart data={countyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="year"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  {topCounties.map((county, index) => (
                    <Bar
                      key={county}
                      dataKey={county}
                      stackId="counties"
                      fill={COLORS[index % COLORS.length]}
                      radius={index === topCounties.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
                </div>
              );
            }}
          </ExportableChart>
        </TabsContent>
      </Tabs>
    </div>
  );
}