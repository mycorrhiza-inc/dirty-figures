'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportableChart } from '@/components/ExportableChart';
import { createExportMetadata } from '@/utils/csvExport';

interface StateLandPermitData {
  permit_year: string;
  permit_count: number;
  total_oil_production: number;
  total_gas_production: number;
  county: string;
}

interface StateLandPermitsChartProps {
  selectedCounties: string[];
}

export function StateLandPermitsChart({ selectedCounties }: StateLandPermitsChartProps) {
  const [data, setData] = useState<StateLandPermitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('permits');

  useEffect(() => {
    fetch('/api/state-land-permits')
      .then(res => res.json())
      .then((rawData: StateLandPermitData[]) => {
        setData(rawData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching state land permits:', error);
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

  // Aggregate by year for time series
  const yearlyData = filteredData.reduce((acc: { [key: string]: {
    permit_year: string;
    permit_count: number;
    total_oil_production: number;
    total_gas_production: number;
  } }, item) => {
    if (!acc[item.permit_year]) {
      acc[item.permit_year] = {
        permit_year: item.permit_year,
        permit_count: 0,
        total_oil_production: 0,
        total_gas_production: 0
      };
    }
    acc[item.permit_year].permit_count += item.permit_count;
    acc[item.permit_year].total_oil_production += item.total_oil_production;
    acc[item.permit_year].total_gas_production += item.total_gas_production;
    return acc;
  }, {});

  const timeSeriesData = Object.values(yearlyData)
    .sort((a, b) => parseInt(a.permit_year) - parseInt(b.permit_year));

  // Get top counties for detailed view
  const countyTotals = filteredData.reduce((acc: { [key: string]: {
    county: string;
    permit_count: number;
    total_oil_production: number;
    total_gas_production: number;
  } }, item) => {
    if (!acc[item.county]) {
      acc[item.county] = {
        county: item.county,
        permit_count: 0,
        total_oil_production: 0,
        total_gas_production: 0
      };
    }
    acc[item.county].permit_count += item.permit_count;
    acc[item.county].total_oil_production += item.total_oil_production;
    acc[item.county].total_gas_production += item.total_gas_production;
    return acc;
  }, {});

  const countyData = Object.values(countyTotals)
    .sort((a, b) => b.permit_count - a.permit_count)
    .slice(0, 10);

  // Summary statistics
  const totalPermits = filteredData.reduce((sum, item) => sum + item.permit_count, 0);
  const totalOilProduction = filteredData.reduce((sum, item) => sum + item.total_oil_production, 0);
  const totalGasProduction = filteredData.reduce((sum, item) => sum + item.total_gas_production, 0);
  const uniqueCounties = new Set(filteredData.map(item => item.county)).size;

  return (
    <div className="w-full space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-2xl font-bold text-blue-600">{totalPermits.toLocaleString()}</div>
          <div className="text-sm text-gray-600">State Land Permits</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{uniqueCounties}</div>
          <div className="text-sm text-gray-600">Counties</div>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="permits">Permits by Year</TabsTrigger>
          <TabsTrigger value="production">Production by Year</TabsTrigger>
          <TabsTrigger value="counties">By County</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="permits" className="mt-4">
          <ExportableChart filename={`state-land-permits-by-year`}>
            {(registerExportHook) => {
              registerExportHook({
                getData: () => timeSeriesData as unknown as Record<string, unknown>[],
                getMetadata: () => createExportMetadata(
                  'State Land Permits by Year',
                  'Number of permits issued on state land by year',
                  selectedCounties
                )
              });

              return (
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer>
                    <BarChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="permit_year"
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
                      <Bar dataKey="permit_count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            }}
          </ExportableChart>
        </TabsContent>

        <TabsContent value="production" className="mt-4">
          <ExportableChart filename={`state-land-production-by-year`}>
            {(registerExportHook) => {
              registerExportHook({
                getData: () => timeSeriesData as unknown as Record<string, unknown>[],
                getMetadata: () => createExportMetadata(
                  'State Land Production by Year',
                  'Oil and gas production on state land by year',
                  selectedCounties
                )
              });

              return (
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer>
                    <ComposedChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="permit_year"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="oil"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="gas"
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
                          name === 'Oil Production' ? 'Barrels of Oil' : 'MCF (1000 cubic feet of gas)'
                        ]}
                      />
                      <Legend />
                      <Bar yAxisId="oil" dataKey="total_oil_production" fill="#f59e0b" name="Oil Production" />
                      <Line yAxisId="gas" type="monotone" dataKey="total_gas_production" stroke="#8b5cf6" name="Gas Production" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              );
            }}
          </ExportableChart>
        </TabsContent>

        <TabsContent value="counties" className="mt-4">
          <ExportableChart filename={`state-land-permits-by-county`}>
            {(registerExportHook) => {
              registerExportHook({
                getData: () => countyData as unknown as Record<string, unknown>[],
                getMetadata: () => createExportMetadata(
                  'State Land Permits by County',
                  'Number of permits and production on state land by county',
                  selectedCounties
                )
              });

              return (
                <div style={{ width: '100%', height: '500px' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={countyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="county"
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
                          name === 'Permits' ? 'Permits' : 'Other'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="permit_count" fill="#3b82f6" name="Permits" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            }}
          </ExportableChart>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Year</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">County</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Permits</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Oil Production (barrels)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Gas Production (MCF)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData
                  .sort((a, b) => parseInt(b.permit_year) - parseInt(a.permit_year) || b.permit_count - a.permit_count)
                  .slice(0, 50)
                  .map((item, index) => (
                    <tr key={`${item.permit_year}-${item.county}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2">{item.permit_year}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.county}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.permit_count.toLocaleString()}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{Math.round(item.total_oil_production).toLocaleString()}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{Math.round(item.total_gas_production).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}