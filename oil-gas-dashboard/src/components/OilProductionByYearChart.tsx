'use client';

import { TimeSeriesChart, TimeSeriesConfig } from '@/components/TimeSeriesChart';

interface OilProductionByYearChartProps {
  selectedCounties: string[];
}

export function OilProductionByYearChart({ selectedCounties }: OilProductionByYearChartProps) {
  const config: TimeSeriesConfig = {
    apiEndpoint: '/api/oil-production-by-year',
    title: 'Oil Production by Year',
    description: 'Cumulative oil production from wells grouped by the year they received permits',
    valueKey: 'total_oil_production',
    totalTabLabel: 'Total Oil Production',
    countyTabLabel: 'By County',
    yAxisLabel: 'Oil Production (thousands of barrels)',
    tooltipUnit: 'k barrels',
    tooltipLabel: 'Total Oil Production',
    divideBy: 1000,
    primaryColor: '#ea580c',
    gradientId: 'oilGradient'
  };

  return <TimeSeriesChart selectedCounties={selectedCounties} config={config} />;
}