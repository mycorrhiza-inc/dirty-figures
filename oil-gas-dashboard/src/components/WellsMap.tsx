"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WellMapData {
  latitude: number;
  longitude: number;
  total_carbon_emissions: number;
  county: string;
  well_name: string;
  operator: string;
}

interface WellsMapProps {
  selectedCounties: string[];
}

// Component to fit map bounds to data
function FitBounds({ wells }: { wells: WellMapData[] }) {
  const map = useMap();

  useEffect(() => {
    if (wells.length > 0) {
      const bounds = wells.map(
        (well) => [well.latitude, well.longitude] as [number, number],
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [wells, map]);

  return null;
}

// Heatmap layer component
function HeatmapLayer({ wells, onStatsUpdate }: { wells: WellMapData[], onStatsUpdate: (stats: { maxEmissions: number, minEmissions: number }) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!wells.length) return;

    // Calculate emission statistics
    const emissions = wells.map((w) => w.total_carbon_emissions);
    const maxEmissions = Math.max(...emissions);
    const minEmissions = Math.min(...emissions);

    // Update parent with stats
    onStatsUpdate({ maxEmissions, minEmissions });

    // Use multiple scaling approaches for maximum visibility
    // Try square root scaling first (often works well for emission data)
    const sqrtMax = Math.sqrt(maxEmissions);
    const sqrtMin = Math.sqrt(Math.max(minEmissions, 1));

    console.log('Emission stats:', {
      minEmissions,
      maxEmissions,
      ratio: maxEmissions / minEmissions,
      sqrtMin,
      sqrtMax
    });

    // Prepare heatmap data with square root scaling + percentile clipping
    const heatmapData = wells.map((well) => {
      // Square root scaling
      const sqrtValue = Math.sqrt(Math.max(well.total_carbon_emissions, 1));
      const normalizedSqrt = (sqrtValue - sqrtMin) / (sqrtMax - sqrtMin);

      // Apply some additional transformation to spread out the values more
      let intensity = Math.pow(normalizedSqrt, 0.5); // Power of 0.5 spreads values more evenly

      // Ensure minimum visibility and clamp
      intensity = Math.max(0.1, Math.min(1.0, intensity));

      return [
        well.latitude,
        well.longitude,
        intensity,
      ] as [number, number, number];
    });

    // Create heatmap layer with more visible settings
    const heatmapLayer = (L as any).heatLayer(heatmapData, {
      radius: 35,           // Larger radius for more visibility
      blur: 5,              // Less blur for sharper definition
      maxZoom: 17,
      max: 1.0,
      minOpacity: 0.2,      // Higher minimum opacity
      gradient: {
        0.0: "rgba(0,0,0,0)",         // Transparent
        0.1: "rgba(0,0,139,0.6)",     // Dark blue with opacity
        0.25: "rgba(0,100,255,0.7)",  // Blue
        0.5: "rgba(0,255,255,0.8)",   // Cyan
        0.75: "rgba(255,255,0,0.9)",  // Yellow
        0.9: "rgba(255,100,0,0.95)",  // Orange
        1.0: "rgba(255,0,0,1)",       // Red
      },
    });

    heatmapLayer.addTo(map);

    // Cleanup function
    return () => {
      map.removeLayer(heatmapLayer);
    };
  }, [wells, map, onStatsUpdate]);

  return null;
}

export default function WellsMap({ selectedCounties }: WellsMapProps) {
  const [wells, setWells] = useState<WellMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [heatmapStats, setHeatmapStats] = useState<{ maxEmissions: number, minEmissions: number }>({ maxEmissions: 0, minEmissions: 0 });

  useEffect(() => {
    fetch("/api/wells-map")
      .then((res) => res.json())
      .then((data: WellMapData[]) => {
        // Filter by selected counties if any
        const filteredData =
          selectedCounties.length > 0
            ? data.filter((well) => selectedCounties.includes(well.county))
            : data;

        // Limit to reasonable number for performance
        const limitedData = filteredData.slice(0, 5000);
        setWells(limitedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching wells map data:", error);
        setLoading(false);
      });
  }, [selectedCounties]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        Loading map...
      </div>
    );
  }

  // Calculate emission ranges for sizing
  const emissions = wells.map((w) => w.total_carbon_emissions);
  const maxEmissions = Math.max(...emissions);
  const minEmissions = Math.min(...emissions);

  // Function to calculate circle radius based on emissions
  const getRadius = (emissions: number) => {
    const normalizedEmissions =
      (emissions - minEmissions) / (maxEmissions - minEmissions);
    return Math.max(3, normalizedEmissions * 20 + 5); // Radius between 3 and 25
  };

  // Function to get color based on emissions level
  const getColor = (emissions: number) => {
    const normalizedEmissions =
      (emissions - minEmissions) / (maxEmissions - minEmissions);
    if (normalizedEmissions > 0.8) return "#d32f2f"; // High emissions - red
    if (normalizedEmissions > 0.6) return "#f57c00"; // Medium-high emissions - orange
    if (normalizedEmissions > 0.4) return "#fbc02d"; // Medium emissions - yellow
    if (normalizedEmissions > 0.2) return "#388e3c"; // Low-medium emissions - light green
    return "#1976d2"; // Low emissions - blue
  };

  // Utah center coordinates
  const utahCenter: [number, number] = [39.321, -111.0937];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Tabs defaultValue="wells" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="wells">Individual Wells</TabsTrigger>
          <TabsTrigger value="heatmap">Emission Density</TabsTrigger>
        </TabsList>

        <TabsContent value="wells" className="flex-1 relative">
          <div style={{ height: "100%", width: "100%" }}>
            <MapContainer
              center={utahCenter}
              zoom={7}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitBounds wells={wells} />

              {wells.map((well, index) => (
                <CircleMarker
                  key={index}
                  center={[well.latitude, well.longitude]}
                  radius={getRadius(well.total_carbon_emissions)}
                  fillColor={getColor(well.total_carbon_emissions)}
                  color={getColor(well.total_carbon_emissions)}
                  weight={1}
                  opacity={0.7}
                  fillOpacity={0.5}
                >
                  <Popup>
                    <div>
                      <h3 className="font-bold">{well.well_name}</h3>
                      <p>
                        <strong>Operator:</strong> {well.operator}
                      </p>
                      <p>
                        <strong>County:</strong> {well.county}
                      </p>
                      <p>
                        <strong>Total Emissions:</strong>{" "}
                        {well.total_carbon_emissions.toLocaleString()} units
                      </p>
                      <p>
                        <strong>Location:</strong> {well.latitude.toFixed(4)},{" "}
                        {well.longitude.toFixed(4)}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>

            {/* Wells Legend */}
            <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow-lg z-[1000]">
              <h4 className="font-bold text-sm mb-2">Emissions Level</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-600"></div>
                  <span className="text-xs">Very High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-orange-600"></div>
                  <span className="text-xs">High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-600"></div>
                  <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <span className="text-xs">Very Low</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Circle size = emissions level
                <br />
                Showing {wells.length.toLocaleString()} wells
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="flex-1 relative">
          <div style={{ height: "100%", width: "100%" }}>
            <MapContainer
              center={utahCenter}
              zoom={7}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitBounds wells={wells} />
              <HeatmapLayer wells={wells} onStatsUpdate={setHeatmapStats} />
            </MapContainer>

            {/* Heatmap Legend */}
            <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow-lg z-[1000] max-w-xs">
              <h4 className="font-bold text-sm mb-2">Emission Density</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-900 to-red-600"></div>
                  <span className="text-xs">Square Root Scale</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Shows emission concentration<br/>
                per geographic area<br/>
                Data from {wells.length.toLocaleString()} wells
              </p>

              {/* Emission Range with Log Scale */}
              {heatmapStats.maxEmissions > 0 && (
                <div className="mt-3 text-xs">
                  <div className="font-semibold mb-1">Emission Range (Log Scale):</div>
                  <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800">Min:</span>
                      <span className="font-mono">{heatmapStats.minEmissions.toLocaleString()}</span>
                    </div>

                    {/* Show some reference points */}
                    {heatmapStats.maxEmissions > 1000 && (
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-600">~1K:</span>
                        <span className="font-mono">1,000</span>
                      </div>
                    )}

                    {heatmapStats.maxEmissions > 100000 && (
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-600">~100K:</span>
                        <span className="font-mono">100,000</span>
                      </div>
                    )}

                    {heatmapStats.maxEmissions > 1000000 && (
                      <div className="flex justify-between items-center">
                        <span className="text-orange-600">~1M:</span>
                        <span className="font-mono">1,000,000</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t pt-1">
                      <span className="text-red-600 font-bold">Max:</span>
                      <span className="font-mono font-bold">{heatmapStats.maxEmissions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-2 text-xs text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Low</span>
                  <div className="flex-1 mx-2 h-3 bg-gradient-to-r from-blue-900 via-blue-400 via-cyan-300 via-yellow-400 via-orange-500 to-red-600 rounded"></div>
                  <span>High</span>
                </div>
                <div className="text-center mt-1 text-gray-500">
                  Carbon Emission Units (Square Root Scale)
                </div>
                <div className="text-center mt-1 text-xs bg-yellow-50 p-1 rounded">
                  💡 Square root scaling compresses extreme values
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

