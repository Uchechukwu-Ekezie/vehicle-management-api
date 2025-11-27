"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vehiclesApi, tripsApi, maintenanceApi, issuesApi } from "@/lib/api";
import { getUserFromToken } from "@/lib/auth";
import { Vehicle, Trip, MaintenanceRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DriverDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<
    MaintenanceRecord[]
  >([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalMileage: 0,
    averageFuelConsumption: 0,
    issuesReported: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const token =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1] || "";

        // Get user info from token to get driver ID
        const user = getUserFromToken(token);
        if (!user || !user.id) {
          setLoading(false);
          return;
        }

        const driverId = user.id as string;

        // Get driver's assigned vehicle (match by assignedDriverID, fallback to status)
        const vehicles = await vehiclesApi.getAll(token);
        const assigned =
          vehicles.find(
            (v: Vehicle) => v.assignedDriverID === driverId
          ) || vehicles.find((v: Vehicle) => v.status === "InUse");
        setAssignedVehicle(assigned || null);

        // Get driver's trips (not all trips - drivers can only see their own)
        const trips = await tripsApi.getByDriver(driverId, token);
        setRecentTrips(trips.slice(0, 5)); // Get last 5 trips

        // Calculate stats from completed trips only (those with an endMileage)
        const totalTrips = trips.length;
        const completedTrips = trips.filter(
          (t: Trip) => t.endMileage !== undefined && t.endMileage !== null
        );
        const totalMileage = completedTrips.reduce(
          (sum: number, t: Trip) =>
            sum + (((t.endMileage as number) || 0) - t.startMileage),
          0
        );
        const tripsWithFuel = completedTrips.filter(
          (t: Trip) => t.fuelUsed && t.fuelUsed > 0
        );
        const avgFuel =
          tripsWithFuel.length > 0
            ? tripsWithFuel.reduce(
                (sum: number, t: Trip) => sum + (t.fuelUsed || 0),
                0
              ) / tripsWithFuel.length
            : 0;

        // Get driver's reported issues count
        const driverIssues = await issuesApi.getByReportedBy(driverId, token);

        setStats({
          totalTrips,
          totalMileage,
          averageFuelConsumption: avgFuel,
          issuesReported: Array.isArray(driverIssues)
            ? driverIssues.length
            : 0,
        });

        // Get upcoming maintenance (if assigned vehicle)
        if (assigned) {
          const maintenance = await maintenanceApi.getAll(token);
          const upcoming = maintenance.filter(
            (m: MaintenanceRecord) =>
              m.vehicleId === assigned.id && m.status === "Scheduled"
          );
          setUpcomingMaintenance(upcoming.slice(0, 3));
        }

        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitor your trips and vehicle status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalTrips}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Mileage
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalMileage.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">miles</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Fuel</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.averageFuelConsumption.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">gallons/trip</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Issues Reported
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.issuesReported}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Vehicle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              My Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedVehicle ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {assignedVehicle.make} {assignedVehicle.model}
                    </h3>
                    <p className="text-gray-600">{assignedVehicle.year}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    In Use
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">License Plate</p>
                    <p className="font-semibold text-gray-900">
                      {assignedVehicle.licensePlate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Mileage</p>
                    <p className="font-semibold text-gray-900">
                      {assignedVehicle.mileage.toLocaleString()} mi
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600">No vehicle currently assigned</p>
                <p className="text-sm text-gray-500 mt-1">
                  Contact your admin for vehicle assignment
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Upcoming Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMaintenance.length > 0 ? (
              <div className="space-y-3">
                {upcomingMaintenance.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border hover:border-orange-200 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.maintenanceType}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {formatDate(item.scheduledDate)}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        Scheduled
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600">No upcoming maintenance</p>
                <p className="text-sm text-gray-500 mt-1">
                  Vehicle is in good condition
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Recent Trips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTrips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Purpose
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                      Start Mileage
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                      End Mileage
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                      Fuel Used
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((trip) => (
                    <tr key={trip.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {formatDate(trip.startDate)}
                      </td>
                      <td className="py-3 px-4 text-sm">{trip.purpose}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        {trip.startMileage.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        {trip.endMileage
                          ? trip.endMileage.toLocaleString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        {trip.fuelUsed
                          ? `${trip.fuelUsed.toFixed(1)} gal`
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            trip.endDate
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {trip.endDate ? "Completed" : "In Progress"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-gray-600">No trips recorded yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Start logging your trips from the My Trips page
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
