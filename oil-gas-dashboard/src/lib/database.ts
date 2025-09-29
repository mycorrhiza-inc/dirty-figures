import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'wells.db');
    db = new Database(dbPath, { readonly: true });
  }
  return db;
}

export interface PermitsByYearData {
  year: string;
  permit_count: number;
  county: string;
}

export interface EmissionsByYearData {
  permit_year: string;
  county: string;
  total_emissions: number;
  well_count: number;
}

export interface WellMapData {
  latitude: number;
  longitude: number;
  total_carbon_emissions: number;
  county: string;
  well_name: string;
  operator: string;
}

export interface PermitsVsShutdownsData {
  year: string;
  new_permits: number;
  shutdowns: number;
  county: string;
}

export interface OilProductionByYearData {
  permit_year: string;
  county: string;
  total_oil_production: number;
  well_count: number;
}

export interface GasProductionByYearData {
  permit_year: string;
  county: string;
  total_gas_production: number;
  well_count: number;
}

export function getPermitsByYear(): PermitsByYearData[] {
  const database = getDatabase();
  const query = `
    SELECT
      STRFTIME('%Y', date_approved) as year,
      COUNT(*) as permit_count,
      county
    FROM application_for_permit_drilling_granted
    WHERE date_approved IS NOT NULL
    GROUP BY STRFTIME('%Y', date_approved), county
    ORDER BY year
  `;

  const rawData = database.prepare(query).all() as PermitsByYearData[];
  return fillMissingYears(rawData, 1995, new Date().getFullYear(), { permit_count: 0 });
}

export function getEmissionsByPermitYear(): EmissionsByYearData[] {
  const database = getDatabase();
  const query = `
    SELECT
      STRFTIME('%Y', apd.date_approved) as permit_year,
      w.county,
      SUM(w.total_carbon_emissions) as total_emissions,
      COUNT(w.api_well_number) as well_count
    FROM wells w
    JOIN application_for_permit_drilling_granted apd ON w.api_well_number = apd.api_number
    WHERE apd.date_approved IS NOT NULL AND w.total_carbon_emissions IS NOT NULL
    GROUP BY STRFTIME('%Y', apd.date_approved), w.county
    ORDER BY permit_year
  `;

  return database.prepare(query).all() as EmissionsByYearData[];
}

export function getWellsMapData(): WellMapData[] {
  const database = getDatabase();
  const query = `
    SELECT
      apd.latitude,
      apd.longitude,
      w.total_carbon_emissions,
      w.county,
      w.well_name,
      w.operator
    FROM wells w
    JOIN application_for_permit_drilling_granted apd ON w.api_well_number = apd.api_number
    WHERE apd.latitude IS NOT NULL AND apd.longitude IS NOT NULL
    AND w.total_carbon_emissions IS NOT NULL
    AND w.total_carbon_emissions > 0
  `;

  return database.prepare(query).all() as WellMapData[];
}

export function getPermitsVsShutdowns(): PermitsVsShutdownsData[] {
  const database = getDatabase();
  const query = `
    SELECT
      STRFTIME('%Y', date_approved) as year,
      COUNT(CASE WHEN current_status = 'APPROVED' THEN 1 END) as new_permits,
      COUNT(CASE WHEN current_status IN ('SHUT IN', 'PLUGGED', 'ABANDONED') THEN 1 END) as shutdowns,
      county
    FROM application_for_permit_drilling_granted
    WHERE date_approved IS NOT NULL
    GROUP BY STRFTIME('%Y', date_approved), county
    ORDER BY year
  `;

  const rawData = database.prepare(query).all() as PermitsVsShutdownsData[];
  return fillMissingYears(rawData, 1995, new Date().getFullYear(), { new_permits: 0, shutdowns: 0 });
}

export function getOilProductionByPermitYear(): OilProductionByYearData[] {
  const database = getDatabase();
  const query = `
    SELECT
      STRFTIME('%Y', apd.date_approved) as permit_year,
      w.county,
      SUM(w.cumulative_oil_barrels) as total_oil_production,
      COUNT(w.api_well_number) as well_count
    FROM wells w
    JOIN application_for_permit_drilling_granted apd ON w.api_well_number = apd.api_number
    WHERE apd.date_approved IS NOT NULL AND w.cumulative_oil_barrels IS NOT NULL AND w.cumulative_oil_barrels > 0
    GROUP BY STRFTIME('%Y', apd.date_approved), w.county
    ORDER BY permit_year
  `;

  return database.prepare(query).all() as OilProductionByYearData[];
}

export function getGasProductionByPermitYear(): GasProductionByYearData[] {
  const database = getDatabase();
  const query = `
    SELECT
      STRFTIME('%Y', apd.date_approved) as permit_year,
      w.county,
      SUM(w.cumulative_natural_gas_mcf) as total_gas_production,
      COUNT(w.api_well_number) as well_count
    FROM wells w
    JOIN application_for_permit_drilling_granted apd ON w.api_well_number = apd.api_number
    WHERE apd.date_approved IS NOT NULL AND w.cumulative_natural_gas_mcf IS NOT NULL AND w.cumulative_natural_gas_mcf > 0
    GROUP BY STRFTIME('%Y', apd.date_approved), w.county
    ORDER BY permit_year
  `;

  return database.prepare(query).all() as GasProductionByYearData[];
}

export function getCounties(): string[] {
  const database = getDatabase();
  const query = `SELECT DISTINCT county FROM wells WHERE county IS NOT NULL ORDER BY county`;

  return database.prepare(query).all().map((row: any) => row.county);
}

// Helper function to fill missing years with zero data
export function fillMissingYears<T extends { year: string }>(
  data: T[],
  startYear: number = 1995,
  endYear: number = new Date().getFullYear(),
  fillFields: { [key: string]: number } = {}
): T[] {
  const filledData: T[] = [];
  const existingYears = new Set(data.map(item => item.year));

  for (let year = startYear; year <= endYear; year++) {
    const yearStr = year.toString();
    if (existingYears.has(yearStr)) {
      // Add existing data for this year
      filledData.push(...data.filter(item => item.year === yearStr));
    } else {
      // Create zero-filled entry for missing year
      const counties = getCounties();
      for (const county of counties) {
        const zeroEntry = { year: yearStr, county, ...fillFields } as T;
        filledData.push(zeroEntry);
      }
    }
  }

  return filledData;
}