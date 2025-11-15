"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vehiclesApi, tripsApi, maintenanceApi } from "@/lib/api";
import { Vehicle, Trip, MaintenanceRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "fleet" | "trips" | "maintenance" | "financial"
  >("fleet");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";
      const [vehiclesData, tripsData, maintenanceData] = await Promise.all([
        vehiclesApi.getAll(token),
        tripsApi.getAll(token),
        maintenanceApi.getAll(token),
      ]);
      setVehicles(vehiclesData);
      setTrips(tripsData);
      setMaintenance(maintenanceData);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  // Fleet Statistics
  const getFleetStats = () => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.status === "Active").length;
    const maintenanceVehicles = vehicles.filter(
      (v) => v.status === "Maintenance"
    ).length;
    const avgMileage =
      vehicles.reduce((sum, v) => sum + (v.currentMileage || v.mileage || 0), 0) / totalVehicles ||
      0;

    return { totalVehicles, activeVehicles, maintenanceVehicles, avgMileage };
  };

  // Trip Statistics
  const getTripStats = () => {
    const filteredTrips = trips.filter((trip) => {
      const tripDate = new Date(trip.startTime);
      return (
        tripDate >= new Date(dateRange.startDate) &&
        tripDate <= new Date(dateRange.endDate)
      );
    });

    const totalTrips = filteredTrips.length;
    const completedTrips = filteredTrips.filter(
      (t) => t.status === "Completed"
    ).length;
    const totalDistance = filteredTrips
      .filter((t) => t.endMileage && t.startMileage)
      .reduce((sum, t) => sum + (t.endMileage! - t.startMileage), 0);
    const totalFuel = filteredTrips.reduce(
      (sum, t) => sum + (t.fuelUsed || 0),
      0
    );
    const avgEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

    return {
      totalTrips,
      completedTrips,
      totalDistance,
      totalFuel,
      avgEfficiency,
    };
  };

  // Maintenance Statistics
  const getMaintenanceStats = () => {
    const filteredMaintenance = maintenance.filter((m) => {
      const maintenanceDate = new Date(m.scheduledDate);
      return (
        maintenanceDate >= new Date(dateRange.startDate) &&
        maintenanceDate <= new Date(dateRange.endDate)
      );
    });

    const totalMaintenance = filteredMaintenance.length;
    const completed = filteredMaintenance.filter(
      (m) => m.status === "Completed"
    ).length;
    const scheduled = filteredMaintenance.filter(
      (m) => m.status === "Scheduled"
    ).length;
    const inProgress = filteredMaintenance.filter(
      (m) => m.status === "InProgress"
    ).length;
    const totalCost = filteredMaintenance.reduce(
      (sum, m) => sum + (m.cost || 0),
      0
    );

    return { totalMaintenance, completed, scheduled, inProgress, totalCost };
  };

  // Financial Summary
  const getFinancialSummary = () => {
    const filteredMaintenance = maintenance.filter((m) => {
      const maintenanceDate = new Date(m.scheduledDate);
      return (
        maintenanceDate >= new Date(dateRange.startDate) &&
        maintenanceDate <= new Date(dateRange.endDate)
      );
    });

    const maintenanceCost = filteredMaintenance.reduce(
      (sum, m) => sum + (m.cost || 0),
      0
    );
    const completedCost = filteredMaintenance
      .filter((m) => m.status === "Completed")
      .reduce((sum, m) => sum + (m.cost || 0), 0);
    const pendingCost = filteredMaintenance
      .filter((m) => m.status !== "Completed")
      .reduce((sum, m) => sum + (m.cost || 0), 0);

    // Cost by type
    const costByType: { [key: string]: number } = {};
    filteredMaintenance.forEach((m) => {
      costByType[m.maintenanceType] =
        (costByType[m.maintenanceType] || 0) + (m.cost || 0);
    });

    return { maintenanceCost, completedCost, pendingCost, costByType };
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportFleetReport = () => {
    const data = vehicles.map((v) => ({
      ID: v.id || v.vehicleID,
      Make: v.make,
      Model: v.model,
      Year: v.year,
      LicensePlate: v.licensePlate,
      VIN: v.vin,
      Status: v.status,
      CurrentMileage: v.currentMileage || v.mileage || 0,
    }));
    exportToCSV(data, "fleet_report");
  };

  const exportTripReport = () => {
    const filteredTrips = trips.filter((trip) => {
      const tripDate = new Date(trip.startTime);
      return (
        tripDate >= new Date(dateRange.startDate) &&
        tripDate <= new Date(dateRange.endDate)
      );
    });

    const data = filteredTrips.map((t) => ({
      ID: t.id,
      VehicleID: t.vehicleId,
      DriverID: t.driverId,
      StartTime: formatDate(t.startTime),
      EndTime: t.endTime ? formatDate(t.endTime) : "In Progress",
      Distance:
        t.endMileage && t.startMileage ? t.endMileage - t.startMileage : 0,
      FuelUsed: t.fuelUsed || 0,
      Status: t.status,
    }));
    exportToCSV(data, "trip_report");
  };

  const exportMaintenanceReport = () => {
    const filteredMaintenance = maintenance.filter((m) => {
      const maintenanceDate = new Date(m.scheduledDate);
      return (
        maintenanceDate >= new Date(dateRange.startDate) &&
        maintenanceDate <= new Date(dateRange.endDate)
      );
    });

    const data = filteredMaintenance.map((m) => ({
      ID: m.id,
      VehicleID: m.vehicleId,
      Type: m.maintenanceType,
      Description: m.description,
      ScheduledDate: formatDate(m.scheduledDate),
      CompletedDate: m.completedDate
        ? formatDate(m.completedDate)
        : "Not Completed",
      Cost: m.cost || 0,
      Status: m.status,
    }));
    exportToCSV(data, "maintenance_report");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const fleetStats = getFleetStats();
  const tripStats = getTripStats();
  const maintenanceStats = getMaintenanceStats();
  const financialSummary = getFinancialSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-1">
          Comprehensive fleet reports and insights
        </p>
      </div>

      {/* Date Range Filter */}
      <Card className="border-2 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Start Date
              </label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="h-12"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                End Date
              </label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="h-12"
              />
            </div>
            <Button
              onClick={loadReportData}
              className="h-12 bg-blue-600 hover:bg-blue-700 px-8"
            >
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {["fleet", "trips", "maintenance", "financial"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-6 py-3 font-semibold capitalize transition-colors ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab} Report
          </button>
        ))}
      </div>

      {/* Fleet Report */}
      {activeTab === "fleet" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Vehicles</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {fleetStats.totalVehicles}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Active Vehicles</p>
                  <p className="text-4xl font-bold text-green-600">
                    {fleetStats.activeVehicles}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">In Maintenance</p>
                  <p className="text-4xl font-bold text-orange-600">
                    {fleetStats.maintenanceVehicles}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Avg. Mileage</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {Math.round(fleetStats.avgMileage).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">miles</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fleet Overview</CardTitle>
              <Button onClick={exportFleetReport} variant="outline">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                        Vehicle
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                        License Plate
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                        Mileage
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr
                        key={vehicle.id || vehicle.vehicleID}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm font-medium">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {vehicle.licensePlate}
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          {(vehicle.currentMileage || vehicle.mileage || 0).toLocaleString()} mi
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              vehicle.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : vehicle.status === "Maintenance"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {vehicle.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trips Report */}
      {activeTab === "trips" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Trips</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {tripStats.totalTrips}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Completed</p>
                  <p className="text-4xl font-bold text-green-600">
                    {tripStats.completedTrips}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Distance</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {Math.round(tripStats.totalDistance).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">miles</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Fuel Used</p>
                  <p className="text-4xl font-bold text-orange-600">
                    {tripStats.totalFuel.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">gallons</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Avg. Efficiency</p>
                  <p className="text-4xl font-bold text-teal-600">
                    {tripStats.avgEfficiency.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">MPG</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Trip History</CardTitle>
              <Button onClick={exportTripReport} variant="outline">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                        Vehicle
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                        Start Time
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                        Distance
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                        Fuel
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips
                      .filter((trip) => {
                        const tripDate = new Date(trip.startTime);
                        return (
                          tripDate >= new Date(dateRange.startDate) &&
                          tripDate <= new Date(dateRange.endDate)
                        );
                      })
                      .map((trip) => (
                        <tr key={trip.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            Vehicle #{trip.vehicleId}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {formatDate(trip.startTime)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            {trip.endMileage && trip.startMileage
                              ? `${(
                                  trip.endMileage - trip.startMileage
                                ).toFixed(1)} mi`
                              : "-"}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            {trip.fuelUsed
                              ? `${trip.fuelUsed.toFixed(1)} gal`
                              : "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                trip.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {trip.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance Report */}
      {activeTab === "maintenance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Records</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {maintenanceStats.totalMaintenance}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Completed</p>
                  <p className="text-4xl font-bold text-green-600">
                    {maintenanceStats.completed}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">In Progress</p>
                  <p className="text-4xl font-bold text-orange-600">
                    {maintenanceStats.inProgress}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Scheduled</p>
                  <p className="text-4xl font-bold text-yellow-600">
                    {maintenanceStats.scheduled}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Cost</p>
                  <p className="text-4xl font-bold text-purple-600">
                    ${Math.round(maintenanceStats.totalCost).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Maintenance History</CardTitle>
              <Button onClick={exportMaintenanceReport} variant="outline">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                        Vehicle
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                        Scheduled
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                        Cost
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance
                      .filter((m) => {
                        const maintenanceDate = new Date(m.scheduledDate);
                        return (
                          maintenanceDate >= new Date(dateRange.startDate) &&
                          maintenanceDate <= new Date(dateRange.endDate)
                        );
                      })
                      .map((record) => (
                        <tr
                          key={record.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm">
                            Vehicle #{record.vehicleId}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">
                            {record.maintenanceType}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {formatDate(record.scheduledDate)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-semibold">
                            ${(record.cost || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                record.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "InProgress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {record.status === "InProgress"
                                ? "In Progress"
                                : record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Report */}
      {activeTab === "financial" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Total Maintenance Cost
                  </p>
                  <p className="text-4xl font-bold text-purple-600">
                    $
                    {Math.round(
                      financialSummary.maintenanceCost
                    ).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Completed Work Cost
                  </p>
                  <p className="text-4xl font-bold text-green-600">
                    $
                    {Math.round(
                      financialSummary.completedCost
                    ).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Pending Costs</p>
                  <p className="text-4xl font-bold text-orange-600">
                    ${Math.round(financialSummary.pendingCost).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Maintenance Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(financialSummary.costByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, cost], index) => {
                    const percentage =
                      (cost / financialSummary.maintenanceCost) * 100;
                    const colors = [
                      "blue",
                      "green",
                      "orange",
                      "purple",
                      "teal",
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">
                            {type}
                          </span>
                          <span className="text-gray-600">
                            ${cost.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`bg-${color}-500 h-3 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
