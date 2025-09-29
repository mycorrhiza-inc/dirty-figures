'use client';

import { TimeSeriesChart, TimeSeriesConfig } from '@/components/TimeSeriesChart';

interface EmissionsByYearChartProps {
  selectedCounties: string[];
}

export function EmissionsByYearChart({ selectedCounties }: EmissionsByYearChartProps) {
  const config: TimeSeriesConfig = {
    apiEndpoint: '/api/emissions-by-year',
    title: 'Emissions by Year',
    description: 'Cumulative carbon emissions from wells grouped by the year they received permits',
    valueKey: 'total_emissions',
    totalTabLabel: 'Total Emissions',
    countyTabLabel: 'By County',
    yAxisLabel: 'Emissions (thousands)',
    tooltipUnit: 'k',
    tooltipLabel: 'Total Emissions',
    divideBy: 1000,
    primaryColor: '#3b82f6',
    gradientId: 'emissionsGradient'
  };

  return <TimeSeriesChart selectedCounties={selectedCounties} config={config} />;
}