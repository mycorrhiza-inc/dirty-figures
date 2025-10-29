'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type SurfaceOwnership = 'All' | 'Federal' | 'Fee' | 'State' | 'Tribal';

interface SurfaceOwnershipFilterProps {
  value: SurfaceOwnership;
  onValueChange: (value: SurfaceOwnership) => void;
}

export function SurfaceOwnershipFilter({ value, onValueChange }: SurfaceOwnershipFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">Surface Owner:</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="Federal">Federal</SelectItem>
          <SelectItem value="Fee">Fee</SelectItem>
          <SelectItem value="State">State</SelectItem>
          <SelectItem value="Tribal">Tribal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}