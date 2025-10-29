'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface YearRangeSelectorProps {
  startYear: string;
  endYear: string;
  onStartYearChange: (year: string) => void;
  onEndYearChange: (year: string) => void;
  minYear?: number;
  maxYear?: number;
}

export function YearRangeSelector({
  startYear,
  endYear,
  onStartYearChange,
  onEndYearChange,
  minYear = 1995,
  maxYear = new Date().getFullYear()
}: YearRangeSelectorProps) {
  // Generate year options for dropdowns
  const yearOptions = [];
  for (let year = minYear; year <= maxYear; year++) {
    yearOptions.push(year.toString());
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Start Year:</label>
        <Select value={startYear} onValueChange={onStartYearChange}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">End Year:</label>
        <Select value={endYear} onValueChange={onEndYearChange}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}