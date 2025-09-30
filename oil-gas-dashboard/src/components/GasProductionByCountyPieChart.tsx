'use client';

import { PieChartComponent, PieChartConfig } from '@/components/PieChart';

interface GasProductionByCountyPieChartProps {
  selectedCounties: string[];
}

export function GasProductionByCountyPieChart({ selectedCounties }: GasProductionByCountyPieChartProps) {
  const config: PieChartConfig = {
    apiEndpoint: '/api/gas-production-by-year',
    title: 'Total Gas Production by County',
    description: 'Total natural gas production breakdown by county',
    valueKey: 'total_gas_production',
    tooltipUnit: 'k MCF',
    tooltipLabel: 'Total Gas Production',
    divideBy: 1000,
    colors: [
      '#10b981', // emerald (primary gas color)
      '#059669', // emerald-600
      '#047857', // emerald-700
      '#065f46', // emerald-800
      '#064e3b', // emerald-900
      '#14b8a6', // teal
      '#0d9488', // teal-600
      '#0f766e', // teal-700
      '#115e59', // teal-800
      '#134e4a', // teal-900
    ]
  };

  return <PieChartComponent selectedCounties={selectedCounties} config={config} />;
}