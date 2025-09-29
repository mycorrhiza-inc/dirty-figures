'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CountyFilterProps {
  counties: string[];
  selectedCounties: string[];
  onSelectionChange: (counties: string[]) => void;
  slcNearbyCounties: string[];
}

export function CountyFilter({
  counties,
  selectedCounties,
  onSelectionChange,
  slcNearbyCounties
}: CountyFilterProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCountyToggle = (county: string) => {
    const updatedSelection = selectedCounties.includes(county)
      ? selectedCounties.filter(c => c !== county)
      : [...selectedCounties, county];
    onSelectionChange(updatedSelection);
  };

  const handleSLCNearbyFilter = () => {
    onSelectionChange(slcNearbyCounties.filter(c => counties.includes(c)));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          onClick={() => setShowDropdown(!showDropdown)}
          variant="default"
        >
          Filter by County ({selectedCounties.length} selected)
        </Button>
        <Button
          onClick={handleSLCNearbyFilter}
          variant="secondary"
        >
          SLC Area Counties
        </Button>
        <Button
          onClick={handleClearAll}
          variant="outline"
        >
          Clear All
        </Button>
      </div>

      {showDropdown && (
        <div className="bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {counties.map(county => (
              <label key={county} className="flex items-center space-x-2 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={selectedCounties.includes(county)}
                  onChange={() => handleCountyToggle(county)}
                  className="rounded"
                />
                <span className={`text-sm ${
                  slcNearbyCounties.includes(county) ? 'font-bold text-green-700' : ''
                }`}>
                  {county}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selectedCounties.length > 0 && (
        <div className="mt-2">
          <span className="text-sm text-gray-600">Selected: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedCounties.map(county => (
              <span
                key={county}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
              >
                {county}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}