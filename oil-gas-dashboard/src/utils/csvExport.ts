export interface ExportMetadata {
  title: string;
  description?: string;
  source?: string;
  generatedAt: string;
  filters?: string[];
}

export interface ExportDataHook {
  getData: () => any[];
  getMetadata: () => ExportMetadata;
}

export function exportDataAsCSV(
  data: any[],
  filename: string,
  metadata?: ExportMetadata
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  let csvContent = '';

  // Add metadata as comments at the top
  if (metadata) {
    csvContent += `# ${metadata.title}\n`;
    if (metadata.description) {
      csvContent += `# ${metadata.description}\n`;
    }
    if (metadata.source) {
      csvContent += `# Source: ${metadata.source}\n`;
    }
    csvContent += `# Generated: ${metadata.generatedAt}\n`;
    if (metadata.filters && metadata.filters.length > 0) {
      csvContent += `# Filters: ${metadata.filters.join(', ')}\n`;
    }
    csvContent += '#\n';
  }

  // Infer columns from data
  const columns = inferColumnsFromData(data);

  // Add header row
  csvContent += columns.map(col => escapeCSVValue(col)).join(',') + '\n';

  // Add data rows
  data.forEach(row => {
    const values = columns.map(col => {
      const value = row[col];
      return escapeCSVValue(value);
    });
    csvContent += values.join(',') + '\n';
  });

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function inferColumnsFromData(data: any[]): string[] {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  return Object.keys(firstRow);
}

function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

// Helper function to create common metadata
export function createExportMetadata(
  title: string,
  description?: string,
  selectedCounties?: string[]
): ExportMetadata {
  const filters = [];
  if (selectedCounties && selectedCounties.length > 0) {
    filters.push(`Counties: ${selectedCounties.join(', ')}`);
  }

  return {
    title,
    description,
    source: 'Utah Oil & Gas Wells Dashboard',
    generatedAt: new Date().toISOString(),
    filters: filters.length > 0 ? filters : undefined
  };
}