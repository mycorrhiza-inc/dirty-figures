'use client';

import { useRef, forwardRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { exportChartAsSVG } from '@/utils/svgExport';
import { exportDataAsCSV, ExportDataHook } from '@/utils/csvExport';

interface ExportableChartProps {
  filename: string;
  children: (exportDataHook: (hook: ExportDataHook) => void) => React.ReactNode;
  className?: string;
}

const ExportableChart = forwardRef<HTMLDivElement, ExportableChartProps>(
  ({ filename, children, className = '' }, ref) => {
    console.log('ExportableChart render - filename:', filename);

    const internalRef = useRef<HTMLDivElement>(null);
    const chartRef = ref || internalRef;
    const dataExportHookRef = useRef<ExportDataHook | null>(null);
    const [hasHook, setHasHook] = useState(false);

    const handleSVGExport = async () => {
      if ('current' in chartRef && chartRef.current) {
        await exportChartAsSVG(chartRef as React.RefObject<HTMLDivElement>, filename);
      }
    };

    const handleCSVExport = () => {
      if (dataExportHookRef.current) {
        const data = dataExportHookRef.current.getData();
        const metadata = dataExportHookRef.current.getMetadata();
        exportDataAsCSV(data, filename, metadata);
      }
    };

    const registerDataExportHook = useCallback((hook: ExportDataHook) => {
      console.log('registerDataExportHook called - setting new hook');
      // Only update state if we don't already have a hook to prevent infinite renders
      if (!dataExportHookRef.current) {
        setHasHook(true);
      }
      dataExportHookRef.current = hook;
    }, []);

    return (
      <div className={`w-full ${className}`}>
        <div className="mb-4 flex justify-end gap-2">
          <Button
            onClick={handleCSVExport}
            variant="outline"
            size="sm"
            disabled={!hasHook}
          >
            Export Data (CSV)
          </Button>
          <Button
            onClick={handleSVGExport}
            variant="outline"
            size="sm"
          >
            Export Chart (SVG)
          </Button>
        </div>

        <div ref={chartRef} className="w-full">
          {children(registerDataExportHook)}
        </div>
      </div>
    );
  }
);

ExportableChart.displayName = 'ExportableChart';

export { ExportableChart };