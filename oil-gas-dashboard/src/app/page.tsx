"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PermitsByYearChart } from "@/components/PermitsByYearChart";
import { EmissionsByYearChart } from "@/components/EmissionsByYearChart";
import { PermitsVsShutdownsChart } from "@/components/PermitsVsShutdownsChart";
import { OilProductionByYearChart } from "@/components/OilProductionByYearChart";
import { GasProductionByYearChart } from "@/components/GasProductionByYearChart";
import { EmissionsByCountyPieChart } from "@/components/EmissionsByCountyPieChart";
import { OilProductionByCountyPieChart } from "@/components/OilProductionByCountyPieChart";
import { GasProductionByCountyPieChart } from "@/components/GasProductionByCountyPieChart";
import { WellTypesChart } from "@/components/WellTypesChart";
import { CountyFilter } from "@/components/CountyFilter";
import { PermitsSinceDateChart } from "@/components/PermitsSinceDateChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Dynamic import for Leaflet map to avoid SSR issues
const WellsMap = dynamic(() => import("@/components/WellsMap"), { ssr: false });

export default function Dashboard() {
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [counties, setCounties] = useState<string[]>([]);

  useEffect(() => {
    // Fetch available counties
    fetch("/api/counties")
      .then((res) => res.json())
      .then((data) => setCounties(data));
  }, []);

  // Counties near Salt Lake City
  const slcNearbyCounties = ["SALT LAKE", "DAVIS", "WEBER", "UTAH", "TOOELE"];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Utah Oil & Gas Wells Dashboard
          </h1>
          <CountyFilter
            counties={counties}
            selectedCounties={selectedCounties}
            onSelectionChange={setSelectedCounties}
            slcNearbyCounties={slcNearbyCounties}
          />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Permits Granted by Year</CardTitle>
              <CardDescription>
                Number of drilling permits granted annually. Switch between
                total view and county breakdown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermitsByYearChart selectedCounties={selectedCounties} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Emissions by Wells by Permit Year</CardTitle>
              <CardDescription>
                Cumulative carbon emissions from wells grouped by the year they
                received permits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmissionsByYearChart selectedCounties={selectedCounties} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Oil Production by Wells by Permit Year</CardTitle>
              <CardDescription>
                Cumulative oil production (barrels) from wells grouped by the
                year they received permits. Choose different distribution
                methods to model production over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OilProductionByYearChart selectedCounties={selectedCounties} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gas Production by Wells by Permit Year</CardTitle>
              <CardDescription>
                Cumulative natural gas production (MCF) from wells grouped by
                the year they received permits. Choose different distribution
                methods to model production over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GasProductionByYearChart selectedCounties={selectedCounties} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Emissions by County</CardTitle>
              <CardDescription>
                Breakdown of total carbon emissions by county. Shows the top 10
                counties by emission volume.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmissionsByCountyPieChart selectedCounties={selectedCounties} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Oil Production by County</CardTitle>
              <CardDescription>
                Breakdown of total oil production by county. Shows the top 10
                counties by production volume.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OilProductionByCountyPieChart
                selectedCounties={selectedCounties}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Gas Production by County</CardTitle>
              <CardDescription>
                Breakdown of total natural gas production by county. Shows the
                top 10 counties by production volume.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GasProductionByCountyPieChart
                selectedCounties={selectedCounties}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Well Status Distribution</CardTitle>
            <CardDescription>
              Distribution of all wells by their current operational status,
              showing the lifecycle and current state of drilling operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WellTypesChart />
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Utah Wells Map & Emission Density</CardTitle>
            <CardDescription>
              Interactive map with two views: individual wells (circle size =
              emissions) and emission density heatmap showing pollution
              concentration per geographic area.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "540px", width: "100%" }}>
              <WellsMap selectedCounties={selectedCounties} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permits vs Shutdowns by Year</CardTitle>
            <CardDescription>
              Shows total permits issued per year (green bars), wells from that
              year currently shut down (red bars), and shutdown percentage
              (orange line). This reveals the lifecycle of wells by their permit
              year.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermitsVsShutdownsChart selectedCounties={selectedCounties} />
          </CardContent>
        </Card>

        {/* New Permit Analysis Sections */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Permit Analysis by Date Range</CardTitle>
            <CardDescription>
              Detailed breakdown of permits issued since specific dates (March
              15, 2022 and 2016), showing operators, permit counts, and
              production data with timeline analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermitsSinceDateChart selectedCounties={selectedCounties} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
