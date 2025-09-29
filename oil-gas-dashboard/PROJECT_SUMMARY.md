# Utah Oil & Gas Wells Dashboard

A Next.js web application for visualizing Utah oil and gas well data, including permits, emissions, and geographic distribution.

## Features

### Visualizations

1. **Permits Granted by Year** - Bar chart showing number of permits granted annually, broken down by county
2. **Total Emissions by Wells by Permit Year** - Line chart showing cumulative emissions from wells by the year they were permitted
3. **Utah Wells Map** - Interactive map showing all wells with circle sizes proportional to emissions levels
4. **Permits vs Shutdowns** - Combined chart showing new permits vs wells transitioning to shutdown status

### County Filtering

- Filter all visualizations by specific counties
- Quick filter for Salt Lake City area counties (Salt Lake, Davis, Weber, Utah, Tooele)
- Visual indicators for SLC-area counties in the filter interface

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Maps**: Leaflet with React-Leaflet
- **Database**: SQLite with better-sqlite3
- **Data Processing**: Server-side API routes

## Database Schema

The application uses `wells.db` with the following key tables:
- `wells` - Well information including emissions data
- `application_for_permit_drilling_granted` - Permit applications with approval dates
- `permit_file_data` - Permit file submissions
- `historical_well_metadata` - Historical well events

## API Endpoints

- `/api/counties` - List of available counties
- `/api/permits-by-year` - Permits granted by year and county
- `/api/emissions-by-year` - Emissions data by permit year and county
- `/api/wells-map` - Geographic and emissions data for map visualization
- `/api/permits-vs-shutdowns` - New permits vs shutdown data by year

## Running the Application

```bash
npm install
npm run dev
```

The application will be available at http://localhost:3000

## Data Notes

- Emissions data represents total carbon emissions from wells
- Permit year refers to when the well was originally approved, not when emissions occurred
- Map visualization is limited to 5,000 wells for performance reasons
- Circle sizes and colors on the map are normalized to the visible dataset