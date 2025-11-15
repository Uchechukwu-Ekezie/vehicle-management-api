"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { vehiclesApi } from "@/lib/api";
import { Vehicle } from "@/lib/types";
import { AssignDriverModal } from "@/components/modals/assign-driver-modal";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [error, setError] = useState("");
  const [assignModal, setAssignModal] = useState<{
    show: boolean;
    vehicleId: string;
    vehicleName: string;
    currentDriverName?: string | null;
  }>({
    show: false,
    vehicleId: "",
    vehicleName: "",
  });

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const token =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1] || "";
        const data = await vehiclesApi.getAll(token);
        setVehicles(data);
        setLoading(false);
      } catch {
        setError("Failed to load vehicles");
        setLoading(false);
      }
    };
    loadVehicles();
  }, []);

  useEffect(() => {
    let filtered = vehicles;

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((v) => v.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.make.toLowerCase().includes(term) ||
          v.model.toLowerCase().includes(term) ||
          v.licensePlate.toLowerCase().includes(term) ||
          v.vin.toLowerCase().includes(term)
      );
    }

    // Avoid infinite loop by only updating if different
    if (JSON.stringify(filtered) !== JSON.stringify(filteredVehicles)) {
      setFilteredVehicles(filtered);
    }
  }, [vehicles, searchTerm, statusFilter, filteredVehicles]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";
      await vehiclesApi.delete(id, token);
      setVehicles(vehicles.filter((v) => (v.id || v.vehicleID) !== id));
    } catch {
      alert("Failed to delete vehicle");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 border-green-200";
      case "InUse":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "UnderMaintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "OutOfService":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "InUse":
        return "In Use";
      case "UnderMaintenance":
        return "Maintenance";
      case "OutOfService":
        return "Out of Service";
      default:
        return status;
    }
  };

  const statuses: Array<
    "All" | "Available" | "InUse" | "UnderMaintenance" | "OutOfService"
  > = ["All", "Available", "InUse", "UnderMaintenance", "OutOfService"];

  const getStatusDisplayName = (status: string) => {
    const displayNames: { [key: string]: string } = {
      All: "All",
      Available: "Available",
      InUse: "In Use",
      UnderMaintenance: "Maintenance",
      OutOfService: "Out of Service",
    };
    return displayNames[status] || status;
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === "Available").length,
    inUse: vehicles.filter((v) => v.status === "InUse").length,
    maintenance: vehicles.filter((v) => v.status === "UnderMaintenance").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Vehicles</h1>
          <p className="text-gray-600 mt-1">Manage your vehicle fleet</p>
        </div>
        <Link href="/admin/vehicles/add">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
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
            Add Vehicle
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total Vehicles
                </p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
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
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Available</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {stats.available}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
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
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">In Use</p>
                <p className="text-3xl font-bold text-indigo-900 mt-1">
                  {stats.inUse}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">
                  Maintenance
                </p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">
                  {stats.maintenance}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by make, model, license plate, or VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status)}
                  className={
                    statusFilter === status
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  {getStatusDisplayName(status)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Grid */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-red-800">{error}</CardContent>
        </Card>
      )}

      {filteredVehicles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <p className="text-gray-600 text-lg">No vehicles found</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id || vehicle.vehicleID || vehicle.vin}
              className="hover:shadow-xl transition-shadow duration-200 border-2 hover:border-blue-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-gray-600 text-sm">{vehicle.year}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      vehicle.status
                    )}`}
                  >
                    {getStatusDisplay(vehicle.status)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <span className="text-gray-600">License:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {vehicle.licensePlate}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-gray-600">VIN:</span>
                    <span className="ml-2 font-mono text-xs text-gray-900">
                      {vehicle.vin}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
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
                    <span className="text-gray-600">Mileage:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {vehicle.mileage?.toLocaleString()} miles
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Link
                    href={`/admin/vehicles/${vehicle.id || vehicle.vehicleID}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View
                    </Button>
                  </Link>
                  <Link
                    href={`/admin/vehicles/add?id=${
                      vehicle.id || vehicle.vehicleID
                    }`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() =>
                      handleDelete(vehicle.id || vehicle.vehicleID || "")
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </div>

                {/* Assign Driver Button */}
                <div className="pt-3 border-t mt-3">
                  <Button
                    onClick={() =>
                      setAssignModal({
                        show: true,
                        vehicleId: String(vehicle.id || vehicle.vehicleID),
                        vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
                        currentDriverName: vehicle.assignedDriverName,
                      })
                    }
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {vehicle.assignedDriverName
                      ? "Reassign Driver"
                      : "Assign Driver"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Driver Modal */}
      {assignModal.show && (
        <AssignDriverModal
          vehicleId={assignModal.vehicleId}
          vehicleName={assignModal.vehicleName}
          currentDriverName={assignModal.currentDriverName}
          onClose={() =>
            setAssignModal({ show: false, vehicleId: "", vehicleName: "" })
          }
          onSuccess={() => {
            setAssignModal({ show: false, vehicleId: "", vehicleName: "" });
            // Reload vehicles to show updated assignment
            const loadVehicles = async () => {
              try {
                const token =
                  document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("token="))
                    ?.split("=")[1] || "";
                const data = await vehiclesApi.getAll(token);
                setVehicles(data);
              } catch {
                // Handle silently
              }
            };
            loadVehicles();
          }}
        />
      )}
    </div>
  );
}
