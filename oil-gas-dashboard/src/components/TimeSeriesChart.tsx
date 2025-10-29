'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { YearRangeSelector } from '@/components/YearRangeSelector';
import { ExportableChart } from '@/components/ExportableChart';
import { createExportMetadata } from '@/utils/csvExport';

// Generic interfaces for time series data
export interface TimeSeriesDataPoint {
  permit_year: string;
  county: string;
  well_count: number;
  [key: string]: string | number; // Allow additional fields (total_emissions, total_oil_production, etc.)
}

export interface AggregatedDataPoint extends Record<string, unknown> {
  year: string;
  [key: string]: string | number; // The main value field will be dynamic
}

export type CalculationMethod = 'permit_year' | 'constant' | 'exponential_decay';

export interface TimeSeriesConfig {
  // Data fetching
  apiEndpoint: string;

  // Chart configuration
  title: string;
  description: string;
  valueKey: string; // e.g., 'total_emissions', 'total_oil_production'
  totalTabLabel: string; // e.g., 'Total Emissions', 'Total Oil Production'
  countyTabLabel: string; // e.g., 'By County'

  // Display formatting
  yAxisLabel: string;
  tooltipUnit: string; // e.g., 'k', 'k barrels', 'k MCF'
  tooltipLabel: string; // e.g., 'Total Emissions', 'Total Oil Production'
  divideBy?: number; // Convert to thousands, etc. Default: 1000

  // Colors
  primaryColor: string;
  gradientId: string;
}

interface TimeSeriesChartProps {
  selectedCounties: string[];
  config: TimeSeriesConfig;
}

export function TimeSeriesChart({ selectedCounties, config }: TimeSeriesChartProps) {
  console.log('TimeSeriesChart render - config:', config.title, 'selectedCounties:', selectedCounties);

  const [data, setData] = useState<TimeSeriesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethod>('permit_year');
  const [halfLife, setHalfLife] = useState(2);
  const [activeTab, setActiveTab] = useState('total');
  const [startYear, setStartYear] = useState('1996');
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetch(config.apiEndpoint)
      .then(res => res.json())
      .then((rawData: TimeSeriesDataPoint[]) => {
        setData(rawData);
        setLoading(false);
      })
      .catch(error => {
        console.error(`Error fetching ${config.title.toLowerCase()} data:`, error);
        setLoading(false);
      });
  }, [config.apiEndpoint, config.title]);

  // Helper functions for calculations
  const getCurrentYear = () => new Date().getFullYear();

  const calculateConstantValue = (totalValue: number, permitYear: number) => {
    const currentYear = getCurrentYear();
    const yearsActive = currentYear - permitYear + 1;
    return totalValue / yearsActive;
  };

  const calculateExponentialDecayValue = (totalValue: number, permitYear: number, halfLifeYears: number) => {
    const currentYear = getCurrentYear();
    const yearsActive = currentYear - permitYear + 1;
    const decayConstant = Math.log(2) / halfLifeYears;

    const integralValue = (1 - Math.exp(-decayConstant * yearsActive)) / decayConstant;
    const initialRate = totalValue / integralValue;

    return initialRate;
  };

  const distributeValues = (item: TimeSeriesDataPoint, method: CalculationMethod) => {
    const permitYear = parseInt(item.permit_year);
    const currentYear = getCurrentYear();
    const startYear = Math.max(1995, permitYear);
    const yearlyValues: { [year: number]: number } = {};
    const totalValue = item[config.valueKey] as number;

    switch (method) {
      case 'permit_year':
        yearlyValues[permitYear] = totalValue;
        break;

      case 'constant':
        const constantRate = calculateConstantValue(totalValue, permitYear);
        for (let year = startYear; year <= currentYear; year++) {
          yearlyValues[year] = constantRate;
        }
        break;

      case 'exponential_decay':
        const initialRate = calculateExponentialDecayValue(totalValue, permitYear, halfLife);
        const decayConstant = Math.log(2) / halfLife;
        for (let year = startYear; year <= currentYear; year++) {
          const yearsElapsed = year - permitYear;
          yearlyValues[year] = initialRate * Math.exp(-decayConstant * yearsElapsed);
        }
        break;
    }

    return yearlyValues;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Filter data based on selected counties
  const filteredData = selectedCounties.length > 0
    ? data.filter(item => selectedCounties.includes(item.county))
    : data;

  // Aggregate data by year based on calculation method
  const aggregatedData = filteredData.reduce((acc: { [key: string]: number }, item) => {
    const yearlyValues = distributeValues(item, calculationMethod);

    Object.entries(yearlyValues).forEach(([year, value]) => {
      acc[year] = (acc[year] || 0) + value;
    });

    return acc;
  }, {});

  // Filter data based on selected year range
  const startYearInt = parseInt(startYear);
  const endYearInt = parseInt(endYear);
  const allYears: { [key: string]: number } = {};
  for (let year = startYearInt; year <= endYearInt; year++) {
    allYears[year.toString()] = aggregatedData[year.toString()] || 0;
  }

  const divideBy = config.divideBy || 1000;
  const chartData: AggregatedDataPoint[] = Object.entries(allYears)
    .map(([year, value]) => ({
      year,
      [config.valueKey]: Math.round(value / divideBy)
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // Get top counties for detailed view
  const countyTotals = filteredData.reduce((acc: { [key: string]: number }, item) => {
    acc[item.county] = (acc[item.county] || 0) + (item[config.valueKey] as number);
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
      const countyFilteredData = filteredData.filter(item => item.county === county);
      const countyValue = countyFilteredData.reduce((sum, item) => {
        const yearlyValues = distributeValues(item, calculationMethod);
        return sum + (yearlyValues[parseInt(yearData.year)] || 0);
      }, 0);
      countyData[county] = Math.round(countyValue / divideBy);
    });
    return countyData;
  });

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  const methodLabels = {
    permit_year: `All ${config.valueKey.replace('total_', '').replace('_', ' ')} counted in permit year`,
    constant: 'Spread evenly over active years',
    exponential_decay: 'With half-life parameter'
  };

  return (
    <div className="w-full space-y-4">
      {/* Year Range Selectors */}
      <YearRangeSelector
        startYear={startYear}
        endYear={endYear}
        onStartYearChange={setStartYear}
        onEndYearChange={setEndYear}
      />

      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="calculation-method">Calculation Method</Label>
          <Select value={calculationMethod} onValueChange={(value: CalculationMethod) => setCalculationMethod(value)}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select calculation method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="permit_year">Permit Year ({methodLabels.permit_year})</SelectItem>
              <SelectItem value="constant">Constant Distribution ({methodLabels.constant})</SelectItem>
              <SelectItem value="exponential_decay">Exponential Decay ({methodLabels.exponential_decay})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {calculationMethod === 'exponential_decay' && (
          <div className="flex flex-col space-y-2">
            <Label htmlFor="half-life">Half-life (years)</Label>
            <Input
              id="half-life"
              type="number"
              value={halfLife}
              onChange={(e) => setHalfLife(Number(e.target.value))}
              min="0.1"
              max="50"
              step="0.1"
              className="w-32"
            />
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="total">{config.totalTabLabel}</TabsTrigger>
          <TabsTrigger value="by-county">{config.countyTabLabel}</TabsTrigger>
        </TabsList>

        <TabsContent value="total" className="mt-4">
          <ExportableChart filename={`${config.valueKey}-total-${calculationMethod}-${new Date().toISOString().split('T')[0]}`}>
            {(registerExportHook) => {
              console.log('Total tab render prop called - registerExportHook type:', typeof registerExportHook);

              // This is the problem! We can't use hooks inside a render prop
              // Let's just call registerExportHook directly for now to see what happens
              registerExportHook({
                getData: () => {
                  console.log('getData called for total tab, chartData length:', chartData.length);
                  return chartData;
                },
                getMetadata: () => {
                  console.log('getMetadata called for total tab');
                  return createExportMetadata(
                    config.totalTabLabel,
                    `${config.description} using ${calculationMethod} calculation method`,
                    selectedCounties
                  );
                }
              });

              return (
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={config.primaryColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={config.primaryColor} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
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
                        label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: number) => [`${value.toLocaleString()}${config.tooltipUnit}`, config.tooltipLabel]}
                      />
                      <Area
                        type="monotone"
                        dataKey={config.valueKey}
                        stroke={config.primaryColor}
                        strokeWidth={2}
                        fill={`url(#${config.gradientId})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              );
            }}
          </ExportableChart>
        </TabsContent>

        <TabsContent value="by-county" className="mt-4">
          <ExportableChart filename={`${config.valueKey}-by-county-${calculationMethod}-${new Date().toISOString().split('T')[0]}`}>
            {(registerExportHook) => {
              console.log('County tab render prop called - registerExportHook type:', typeof registerExportHook);

              registerExportHook({
                getData: () => {
                  console.log('getData called for county tab, countyChartData length:', countyChartData.length);
                  return countyChartData;
                },
                getMetadata: () => {
                  console.log('getMetadata called for county tab');
                  return createExportMetadata(
                    `${config.title} by County`,
                    `${config.description} by county using ${calculationMethod} calculation method`,
                    selectedCounties
                  );
                }
              });

              return (
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer>
                    <AreaChart data={countyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        {topCounties.map((county, index) => (
                          <linearGradient key={county} id={`${config.gradientId}-${county}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.3}/>
                          </linearGradient>
                        ))}
                      </defs>
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
                        label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: number, name: string) => [`${value.toLocaleString()}${config.tooltipUnit}`, name]}
                      />
                      <Legend />
                      {topCounties.map((county, index) => (
                        <Area
                          key={county}
                          type="monotone"
                          dataKey={county}
                          stackId="1"
                          stroke={COLORS[index % COLORS.length]}
                          fill={`url(#${config.gradientId}-${county})`}
                        />
                      ))}
                    </AreaChart>
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