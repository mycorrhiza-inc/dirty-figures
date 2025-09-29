'use client';

import { TimeSeriesChart, TimeSeriesConfig } from '@/components/TimeSeriesChart';

interface GasProductionByYearChartProps {
  selectedCounties: string[];
}

export function GasProductionByYearChart({ selectedCounties }: GasProductionByYearChartProps) {
  const config: TimeSeriesConfig = {
    apiEndpoint: '/api/gas-production-by-year',
    title: 'Gas Production by Year',
    description: 'Cumulative natural gas production from wells grouped by the year they received permits',
    valueKey: 'total_gas_production',
    totalTabLabel: 'Total Gas Production',
    countyTabLabel: 'By County',
    yAxisLabel: 'Gas Production (thousands of MCF)',
    tooltipUnit: 'k MCF',
    tooltipLabel: 'Total Gas Production',
    divideBy: 1000,
    primaryColor: '#059669',
    gradientId: 'gasGradient'
  };

  return <TimeSeriesChart selectedCounties={selectedCounties} config={config} />;
}