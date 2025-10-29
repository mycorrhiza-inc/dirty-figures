'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExportableChart } from '@/components/ExportableChart';
import { createExportMetadata } from '@/utils/csvExport';

interface TopProducerData {
  operator: string;
  permit_count: number;
  total_oil_production: number;
  total_gas_production: number;
  permit_dates: string[];
}

interface TopProducersChartProps {
  selectedCounties: string[];
}

export function TopProducersChart({ selectedCounties }: TopProducersChartProps) {
  const [data5, setData5] = useState<TopProducerData[]>([]);
  const [data10, setData10] = useState<TopProducerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('top5-2022');
  const [selectedLimit, setSelectedLimit] = useState(5);
  const [selectedDate, setSelectedDate] = useState('2022-03-15');

  useEffect(() => {
    // Fetch both top 5 and top 10 data
    Promise.all([
      fetch(`/api/top-producers?since=${selectedDate}&limit=5`).then(res => res.json()),
      fetch(`/api/top-producers?since=${selectedDate}&limit=10`).then(res => res.json())
    ])
    .then(([top5Data, top10Data]) => {
      setData5(top5Data);
      setData10(top10Data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching top producers:', error);
      setLoading(false);
    });
  }, [selectedDate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const currentData = selectedLimit === 5 ? data5 : data10;
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Time Period:</label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2022-03-15">Since March 15, 2022</SelectItem>
              <SelectItem value="2016-01-01">Since 2016</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Show:</label>
          <Select value={selectedLimit.toString()} onValueChange={(value) => setSelectedLimit(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="permits">Permit Count</TabsTrigger>
          <TabsTrigger value="oil">Oil Production</TabsTrigger>
          <TabsTrigger value="gas">Gas Production</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="permits" className="mt-4">
          <ExportableChart filename={`top-${selectedLimit}-permits-${selectedDate}`}>
            {(registerExportHook) => {
              registerExportHook({
                getData: () => currentData as unknown as Record<string, unknown>[],
                getMetadata: () => createExportMetadata(
                  `Top ${selectedLimit} Producers by Permit Count Since ${selectedDate}`,
                  'Operators ranked by number of permits issued',
                  selectedCounties
                )
              });

              return (
                <div style={{ width: '100%', height: '500px' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={currentData}
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

        <TabsContent value="oil" className="mt-4">
          <ExportableChart filename={`top-${selectedLimit}-oil-${selectedDate}`}>
            {(registerExportHook) => {
              registerExportHook({
                getData: () => currentData as unknown as Record<string, unknown>[],
                getMetadata: () => createExportMetadata(
                  `Top ${selectedLimit} Producers by Oil Production Since ${selectedDate}`,
                  'Operators ranked by cumulative oil production (barrels)',
                  selectedCounties
                )
              });

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div style={{ width: '100%', height: '400px' }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={currentData}
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
                          formatter={(value: number) => [value.toLocaleString(), 'Barrels of Oil']}
                        />
                        <Bar dataKey="total_oil_production" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ width: '100%', height: '400px' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={currentData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="total_oil_production"
                        >
                          {currentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Barrels of Oil']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            }}
          </ExportableChart>
        </TabsContent>

        <TabsContent value="gas" className="mt-4">
          <ExportableChart filename={`top-${selectedLimit}-gas-${selectedDate}`}>
            {(registerExportHook) => {
              registerExportHook({
                getData: () => currentData as unknown as Record<string, unknown>[],
                getMetadata: () => createExportMetadata(
                  `Top ${selectedLimit} Producers by Gas Production Since ${selectedDate}`,
                  'Operators ranked by cumulative gas production (MCF)',
                  selectedCounties
                )
              });

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div style={{ width: '100%', height: '400px' }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={currentData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                        layout="horizontal"
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          type="number"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="operator"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          width={150}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value: number) => [value.toLocaleString(), 'MCF (1000 cubic feet of gas)']}
                        />
                        <Bar dataKey="total_gas_production" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ width: '100%', height: '400px' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={currentData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="total_gas_production"
                        >
                          {currentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [value.toLocaleString(), 'MCF (1000 cubic feet of gas)']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
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
                  <th className="border border-gray-300 px-4 py-2 text-left">Operator</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Permits</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Oil Production (barrels)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Gas Production (MCF)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">First Permit Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Latest Permit Date</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((producer, index) => (
                  <tr key={producer.operator} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2">{producer.operator}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{producer.permit_count.toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{Math.round(producer.total_oil_production).toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{Math.round(producer.total_gas_production).toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-2">{producer.permit_dates.length > 0 ? producer.permit_dates[0] : 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-2">{producer.permit_dates.length > 0 ? producer.permit_dates[producer.permit_dates.length - 1] : 'N/A'}</td>
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