'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface WellTypeData {
  well_type: string;
  count: number;
}

interface ChartData extends WellTypeData {
  percentage: number;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#0000ff',
  '#800080', '#008000', '#ffa500', '#a52a2a', '#808080'
];

export function WellTypesChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/well-types')
      .then(res => res.json())
      .then((rawData: WellTypeData[]) => {
        const total = rawData.reduce((sum, item) => sum + item.count, 0);

        const chartData: ChartData[] = rawData.map(item => ({
          ...item,
          percentage: Math.round((item.count / total) * 100 * 10) / 10
        }));

        setData(chartData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching well types data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [
              `${value} wells (${props.payload.percentage}%)`,
              props.payload.well_type
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}