"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { maintenanceApi, vehiclesApi } from "@/lib/api";
import { MaintenanceRecord, Vehicle } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminMaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState({
    vehicleId: "",
    maintenanceType: "",
    description: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    cost: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";
      const [maintenanceData, vehiclesData] = await Promise.all([
        maintenanceApi.getAll(token),
        vehiclesApi.getAll(token),
      ]);
      setMaintenance(maintenanceData);
      setVehicles(vehiclesData);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";

      // Map frontend fields to backend DTO fields
      // Backend expects camelCase JSON: vehicleID, maintenanceType, scheduledDate, cost, mechanicNotes
      await maintenanceApi.create(
        {
          vehicleID: formData.vehicleId, // UUID as string
          maintenanceType: formData.maintenanceType,
          scheduledDate: new Date(formData.scheduledDate).toISOString(),
          cost: formData.cost,
          mechanicNotes: formData.description, // Map description to mechanicNotes
        },
        token
      );

      setFormData({
        vehicleId: "",
        maintenanceType: "",
        description: "",
        scheduledDate: new Date().toISOString().split("T")[0],
        cost: 0,
      });
      setShowForm(false);
      await loadData();
    } catch {
      alert("Failed to schedule maintenance");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "InProgress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUpcomingMaintenance = () => {
    return maintenance
      .filter((m: MaintenanceRecord) => m.status === "Scheduled")
      .sort(
        (a: MaintenanceRecord, b: MaintenanceRecord) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime()
      );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading maintenance schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Maintenance Scheduling
          </h1>
          <p className="text-gray-600 mt-1">
            Plan and schedule vehicle maintenance
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Schedule Maintenance
          </Button>
        )}
      </div>

      {/* Schedule Form */}
      {showForm && (
        <Card className="border-2 border-blue-200">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Schedule New Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="vehicleId"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Select Vehicle *
                  </label>
                  <select
                    id="vehicleId"
                    value={formData.vehicleId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehicleId: e.target.value, // UUID is a string
                      })
                    }
                    required
                    className="w-full h-12 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-gray-700"
                  >
                    <option value="">Select a vehicle...</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="maintenanceType"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Maintenance Type *
                  </label>
                  <select
                    id="maintenanceType"
                    value={formData.maintenanceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenanceType: e.target.value,
                      })
                    }
                    required
                    className="w-full h-12 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-gray-700"
                  >
                    <option value="">Select type...</option>
                    <option value="Oil Change">Oil Change</option>
                    <option value="Tire Rotation">Tire Rotation</option>
                    <option value="Brake Inspection">Brake Inspection</option>
                    <option value="Engine Service">Engine Service</option>
                    <option value="Transmission Service">
                      Transmission Service
                    </option>
                    <option value="Annual Inspection">Annual Inspection</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="scheduledDate"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Scheduled Date *
                  </label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledDate: e.target.value,
                      })
                    }
                    required
                    className="h-12 text-gray-700 focus:ring-0 focus:border-blue-500 bg-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cost"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Estimated Cost ($)
                  </label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cost: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-12 text-gray-700 bg-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the maintenance work required..."
                    required
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-gray-700 focus:ring-opacity-50 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Schedule Maintenance
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {getUpcomingMaintenance().length > 0 ? (
            <div className="space-y-4">
              {getUpcomingMaintenance().map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-lg border-2 hover:border-blue-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {item.maintenanceType}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Vehicle ID</p>
                      <p className="font-semibold text-gray-900">
                        #{item.vehicleId}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-700 mb-1">
                        Scheduled Date
                      </p>
                      <p className="font-semibold text-blue-900">
                        {formatDate(item.scheduledDate)}
                      </p>
                    </div>
                    {item.cost && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs text-green-700 mb-1">
                          Estimated Cost
                        </p>
                        <p className="font-semibold text-green-900">
                          ${item.cost.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-20 h-20 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-600 text-lg">
                No upcoming maintenance scheduled
              </p>
              <p className="text-gray-700 text-base mt-2">
                Click &quot;Schedule Maintenance&quot; to add a new task
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Maintenance History */}
      <Card>
        <CardHeader>
          <CardTitle>All Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {maintenance.length > 0 ? (
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
                  {maintenance.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
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
                        {record.cost ? `$${record.cost.toLocaleString()}` : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            record.status
                          )}`}
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
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-4"
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
              <p className="text-gray-600">No maintenance records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
