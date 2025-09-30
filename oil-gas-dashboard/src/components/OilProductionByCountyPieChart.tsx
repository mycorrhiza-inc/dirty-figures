'use client';

import { PieChartComponent, PieChartConfig } from '@/components/PieChart';

interface OilProductionByCountyPieChartProps {
  selectedCounties: string[];
}

export function OilProductionByCountyPieChart({ selectedCounties }: OilProductionByCountyPieChartProps) {
  const config: PieChartConfig = {
    apiEndpoint: '/api/oil-production-by-year',
    title: 'Total Oil Production by County',
    description: 'Total oil production breakdown by county',
    valueKey: 'total_oil_production',
    tooltipUnit: 'k barrels',
    tooltipLabel: 'Total Oil Production',
    divideBy: 1000,
    colors: [
      '#ea580c', // orange (primary oil color)
      '#dc2626', // red
      '#d97706', // amber
      '#ca8a04', // yellow
      '#65a30d', // lime
      '#16a34a', // green
      '#059669', // emerald
      '#0891b2', // cyan
      '#0284c7', // sky
      '#2563eb', // blue
    ]
  };

  return <PieChartComponent selectedCounties={selectedCounties} config={config} />;
}