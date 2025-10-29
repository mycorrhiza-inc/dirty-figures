'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExportableChart } from '@/components/ExportableChart';
import { createExportMetadata } from '@/utils/csvExport';

interface PermitAnalysisData {
  permit_date: string;
  operator: string;
  permit_count: number;
  total_oil_production: number;
  total_gas_production: number;
  well_count: number;
}

interface PermitsSinceDateChartProps {
  selectedCounties: string[];
}

export function PermitsSinceDateChart({ selectedCounties }: PermitsSinceDateChartProps) {
  const [data, setData] = useState<PermitAnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('permits');
  const [selectedDate, setSelectedDate] = useState('2022-03-15');

  useEffect(() => {
    fetch(`/api/permits-since-date?since=${selectedDate}`)
      .then(res => res.json())
      .then((rawData: PermitAnalysisData[]) => {
        setData(rawData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching permits since date:', error);
        setLoading(false);
      });
  }, [selectedDate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Summary statistics
  const totalPermits = data.reduce((sum, item) => sum + item.permit_count, 0);
  const totalOilProduction = data.reduce((sum, item) => sum + item.total_oil_production, 0);
  const totalGasProduction = data.reduce((sum, item) => sum + item.total_gas_production, 0);
  const uniqueOperators = new Set(data.map(item => item.operator)).size;

  // Group by operator for summary view
  const operatorSummary = data.reduce((acc: { [key: string]: PermitAnalysisData }, item) => {
    if (!acc[item.operator]) {
      acc[item.operator] = {
        permit_date: '',
        operator: item.operator,
        permit_count: 0,
        total_oil_production: 0,
        total_gas_production: 0,
        well_count: 0
      };
    }
    acc[item.operator].permit_count += item.permit_count;
    acc[item.operator].total_oil_production += item.total_oil_production;
    acc[item.operator].total_gas_production += item.total_gas_production;
    acc[item.operator].well_count += item.well_count;
    return acc;
  }, {});

  const operatorData = Object.values(operatorSummary)
    .sort((a, b) => b.permit_count - a.permit_count)
    .slice(0, 15);

  // Monthly aggregation for time series
  const monthlyData = data.reduce((acc: { [key: string]: {
    month: string;
    permit_count: number;
    total_oil_production: number;
    total_gas_production: number;
    well_count: number;
  } }, item) => {
    const month = item.permit_date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = {
        month,
        permit_count: 0,
        total_oil_production: 0,
        total_gas_production: 0,
        well_count: 0
      };
    }
    acc[month].permit_count += item.permit_count;
    acc[month].total_oil_production += item.total_oil_production;
    acc[month].total_gas_production += item.total_gas_production;
    acc[month].well_count += item.well_count;
    return acc;
  }, {});

  const timeSeriesData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="date-select" className="text-sm font-medium">Analysis Since:</label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2022-03-15">March 15, 2022</SelectItem>
              <SelectItem value="2016-01-01">January 1, 2016</SelectItem>
              <SelectItem value="2020-01-01">January 1, 2020</SelectItem>
              <SelectItem value="2021-01-01">January 1, 2021</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-2xl font-bold text-blue-600">{totalPermits.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Permits</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{uniqueOperators}</div>
          <div className="text-sm text-gray-600">Operators</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600">{Math.round(totalOilProduction).toLocaleString()}</div>
          <div className="text-sm text-gray-600">Oil Barrels</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">{Math.round(totalGasProduction).toLocaleString()}</div>
          <div className="text-sm text-gray-600">Gas (MCF)</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="permits">Permits by Operator</TabsTrigger>
          <TabsTrigger value="production">Production by Operator</TabsTrigger>
          <TabsTrigger value="timeline">Timeline Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="permits" className="mt-4">
          <ExportableChart filename={`permits-by-operator-${selectedDate}`}>
            {(registerExportHook) => {
              registerExportHook({
                getData: () => operatorData as unknown as Record<string, unknown>[],
                getMetadata: () => createExportMetadata(
                  `Permits by Operator Since ${selectedDate}`,
                  'Number of permits issued to each operator',
                  selectedCounties
                )
              });

              return (
                <div style={{ width: '100%', height: '500px' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={operatorData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="operator"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
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
                        formatter={(value: number, name: string) => [
                          value.toLocaleString(),
                          name === 'permit_count' ? 'Permits' : name
                        ]}
                      />
                      <Bar dataKey="permit_count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            }}
          </ExportableChart>
        </TabsContent>

        <TabsContent value="production" className="mt-4">
          <ExportableChart filename={`production-by-operator-${selectedDate}`}>
            {(registerExportHook) => {
              registerExportHook({
                getData: () => operatorData as unknown as Record<string, unknown>[],
                getMetadata: () => createExportMetadata(
                  `Production by Operator Since ${selectedDate}`,
                  'Oil and gas production by operator',
                  selectedCounties
                )
              });

              return (
                <div style={{ width: '100%', height: '500px' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={operatorData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="operator"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
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
                        formatter={(value: number, name: string) => [
                          value.toLocaleString(),
                          name === 'Oil Production' ? 'Barrels of Oil' : 'MCF (1000 cubic feet of gas)'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="total_oil_production" fill="#f59e0b" name="Oil Production" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="total_gas_production" fill="#8b5cf6" name="Gas Production" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            }}
          </ExportableChart>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <ExportableChart filename={`permits-timeline-${selectedDate}`}>
            {(registerExportHook) => {
              registerExportHook({
                getData: () => timeSeriesData as unknown as Record<string, unknown>[],
                getMetadata: () => createExportMetadata(
                  `Permits Timeline Since ${selectedDate}`,
                  'Monthly permit issuance and production trends',
                  selectedCounties
                )
              });

              return (
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer>
                    <ComposedChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="permits"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="production"
                        orientation="right"
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
                        formatter={(value: number, name: string) => [
                          value.toLocaleString(),
                          name === 'Permits' ? 'Permits' :
                          name === 'Oil Production' ? 'Barrels of Oil' : 'MCF (1000 cubic feet of gas)'
                        ]}
                      />
                      <Legend />
                      <Bar yAxisId="permits" dataKey="permit_count" fill="#3b82f6" name="Permits" />
                      <Line yAxisId="production" type="monotone" dataKey="total_oil_production" stroke="#f59e0b" name="Oil Production" />
                    </ComposedChart>
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