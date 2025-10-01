# Utah Oil & Gas Wells Dashboard

A comprehensive web dashboard for exploring and analyzing Utah's oil and gas industry data. This interactive tool provides insights into drilling activity, well lifecycles, production patterns, environmental impacts, and geographic distribution across Utah counties.

## Features

### 📊 Interactive Data Visualizations
- **Permits by Year**: Track drilling permit approvals over time with county breakdowns
- **Well Lifecycle Analysis**: Permits vs shutdowns showing operational status by permit year with percentage analysis
- **Production Analytics**: Oil and gas production trends with multiple distribution models
- **Environmental Impact**: Carbon emissions tracking by permit year and county
- **Well Status Distribution**: Comprehensive pie chart of current well operational states
- **County-based Pie Charts**: Emissions, oil, and gas production breakdowns by county

### 🗺️ Geographic Analysis
- **Interactive Wells Map**: Explore individual well locations with emission data
- **Density Heatmaps**: Visualize pollution concentration across geographic areas
- **County-based Analysis**: Filter and compare data across Utah's counties

### 🎛️ Advanced Filtering & Controls
- **County Selection**: Focus analysis on specific regions including Salt Lake City area
- **Multi-chart Synchronization**: All visualizations respond to county filters
- **Responsive Design**: Optimized for desktop and mobile viewing

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript and React
- **Data Visualization**: Recharts library for interactive charts
- **Mapping**: Leaflet with OpenStreetMap tiles
- **Database**: SQLite with better-sqlite3 for data queries
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel-ready configuration

## Data Sources

The dashboard uses Utah oil and gas well data including:
- Application for Permit to Drill (APD) records
- Well production data (oil and natural gas)
- Environmental emissions data
- Geographic coordinates and county information
- Well status and operational lifecycle data

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Ensure the `wells.db` SQLite database file is in the project root

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the dashboard

### Project Structure

```
src/
├── app/
│   ├── api/           # API routes for data fetching
│   └── page.tsx       # Main dashboard page
├── components/        # React components for charts and UI
├── lib/              # Database utilities and data processing
└── styles/           # Global styles and Tailwind config
```

### Key Components

- **PermitsByYearChart**: Annual drilling permit approvals
- **PermitsVsShutdownsChart**: Well lifecycle analysis with shutdown percentages
- **WellTypesChart**: Distribution of wells by operational status
- **EmissionsByYearChart**: Environmental impact over time
- **Production Charts**: Oil and gas production analytics
- **WellsMap**: Interactive geographic visualization
- **County Pie Charts**: Regional breakdowns for various metrics

## Data Insights

The dashboard reveals key trends in Utah's oil and gas industry:
- Permit activity patterns over time
- Well shutdown rates by permit vintage
- Production trends and regional concentration
- Environmental impact distribution
- Geographic clustering of drilling activity

## Deployment

The application is optimized for deployment on Vercel:

```bash
npm run build
```

The dashboard can also be deployed on other platforms supporting Next.js applications.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is open source and available under the MIT License.