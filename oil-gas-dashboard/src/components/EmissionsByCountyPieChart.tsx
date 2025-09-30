'use client';

import { PieChartComponent, PieChartConfig } from '@/components/PieChart';

interface EmissionsByCountyPieChartProps {
  selectedCounties: string[];
}

export function EmissionsByCountyPieChart({ selectedCounties }: EmissionsByCountyPieChartProps) {
  const config: PieChartConfig = {
    apiEndpoint: '/api/emissions-by-year',
    title: 'Total Emissions by County',
    description: 'Total carbon emissions breakdown by county',
    valueKey: 'total_emissions',
    tooltipUnit: 'k',
    tooltipLabel: 'Total Emissions',
    divideBy: 1000,
    colors: [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // yellow
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
      '#f97316', // orange
      '#6366f1', // indigo
    ]
  };

  return <PieChartComponent selectedCounties={selectedCounties} config={config} />;
}