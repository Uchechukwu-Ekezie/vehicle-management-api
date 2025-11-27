"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vehiclesApi, tripsApi } from "@/lib/api";
import { getUserFromToken } from "@/lib/auth";
import { Vehicle, Trip } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DriverTripsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState({
    purpose: "",
    startMileage: 0,
    endMileage: 0,
    fuelUsed: 0,
    startDate: new Date().toISOString().split("T")[0],
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
        vehicles.find((v: Vehicle) => v.assignedDriverID === driverId) ||
        vehicles.find((v: Vehicle) => v.status === "InUse");
      setAssignedVehicle(assigned || null);

      // Get driver's trips (not all trips - drivers can only see their own)
      const driverTrips = await tripsApi.getByDriver(driverId, token);
      setTrips(driverTrips);
      setLoading(false);
    } catch (error) {
      console.error("Error loading trips:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedVehicle) return;

    setSubmitting(true);
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";

      if (editingTrip) {
        // End trip - backend expects EndTripRequest: endTime, endMileage, fuelUsed
        await tripsApi.update(
          editingTrip.id,
          {
            endTime: new Date().toISOString(),
            endMileage: formData.endMileage,
            fuelUsed: formData.fuelUsed > 0 ? formData.fuelUsed : undefined,
          },
          token
        );
      } else {
        // Start new trip - backend expects CreateTripRequest: vehicleID, startTime, startMileage, notes
        // Backend extracts driverId from JWT token
        await tripsApi.create(
          {
            vehicleID: assignedVehicle.id,
            startTime: new Date().toISOString(),
            startMileage: formData.startMileage,
            notes: formData.purpose || undefined, // Map purpose to notes
          },
          token
        );
      }

      // Reset form and reload data
      setFormData({
        purpose: "",
        startMileage: 0,
        endMileage: 0,
        fuelUsed: 0,
        startDate: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      setEditingTrip(null);
      await loadData();
    } catch (err) {
      alert("Failed to save trip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      purpose: trip.purpose,
      startMileage: trip.startMileage,
      endMileage: trip.endMileage || trip.startMileage,
      fuelUsed: trip.fuelUsed || 0,
      startDate: trip.startDate.split("T")[0],
    });
    setShowForm(true);
  };

  const calculateFuelEfficiency = (trip: Trip) => {
    if (!trip.endMileage || !trip.fuelUsed || trip.fuelUsed === 0) return null;
    const distance = trip.endMileage - trip.startMileage;
    return (distance / trip.fuelUsed).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-600 mt-1">Log and track your vehicle trips</p>
        </div>
        {assignedVehicle && !showForm && (
          <Button
            onClick={() => {
              setEditingTrip(null);
              setFormData({
                purpose: "",
                startMileage: assignedVehicle.mileage,
                endMileage: 0,
                fuelUsed: 0,
                startDate: new Date().toISOString().split("T")[0],
              });
              setShowForm(true);
            }}
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
            Start New Trip
          </Button>
        )}
      </div>

      {/* Vehicle Info */}
      {assignedVehicle && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-9 h-9 text-white"
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
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {assignedVehicle.make} {assignedVehicle.model}
                  </h3>
                  <p className="text-gray-600">
                    License: {assignedVehicle.licensePlate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Mileage</p>
                <p className="text-2xl font-bold text-blue-900">
                  {assignedVehicle.mileage.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">miles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trip Form */}
      {showForm && assignedVehicle && (
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {editingTrip ? "End Trip" : "Start New Trip"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!editingTrip && (
                  <>
                    <div className="md:col-span-2">
                      <label
                        htmlFor="purpose"
                        className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"
                      >
                        <svg
                          className="w-4 h-4 text-blue-600"
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
                        Trip Purpose *
                      </label>
                      <Input
                        id="purpose"
                        value={formData.purpose}
                        onChange={(e) =>
                          setFormData({ ...formData, purpose: e.target.value })
                        }
                        placeholder="e.g., Delivery to downtown office"
                        required
                        disabled={submitting}
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="startMileage"
                        className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"
                      >
                        <svg
                          className="w-4 h-4 text-blue-600"
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
                        Starting Mileage *
                      </label>
                      <Input
                        id="startMileage"
                        type="number"
                        value={formData.startMileage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startMileage: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Current odometer reading"
                        required
                        disabled={submitting}
                        className="h-12"
                      />
                    </div>
                  </>
                )}

                {editingTrip && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Starting Mileage
                      </label>
                      <Input
                        value={formData.startMileage}
                        disabled
                        className="h-12 bg-gray-50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="endMileage"
                        className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"
                      >
                        <svg
                          className="w-4 h-4 text-blue-600"
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
                        Ending Mileage *
                      </label>
                      <Input
                        id="endMileage"
                        type="number"
                        value={formData.endMileage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endMileage: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Final odometer reading"
                        required
                        disabled={submitting}
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="fuelUsed"
                        className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"
                      >
                        <svg
                          className="w-4 h-4 text-orange-600"
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
                        </svg>
                        Fuel Used (gallons) *
                      </label>
                      <Input
                        id="fuelUsed"
                        type="number"
                        step="0.1"
                        value={formData.fuelUsed}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fuelUsed: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0.0"
                        required
                        disabled={submitting}
                        className="h-12"
                      />
                    </div>

                    {formData.endMileage > formData.startMileage &&
                      formData.fuelUsed > 0 && (
                        <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-3">
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
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-700">
                                Fuel Efficiency
                              </p>
                              <p className="text-2xl font-bold text-green-900">
                                {(
                                  (formData.endMileage -
                                    formData.startMileage) /
                                  formData.fuelUsed
                                ).toFixed(1)}{" "}
                                MPG
                              </p>
                              <p className="text-xs text-green-600">
                                Distance:{" "}
                                {(
                                  formData.endMileage - formData.startMileage
                                ).toLocaleString()}{" "}
                                miles
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTrip(null);
                  }}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : editingTrip ? (
                    "End Trip"
                  ) : (
                    "Start Trip"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Trips List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Trip History</CardTitle>
        </CardHeader>
        <CardContent>
          {trips.length > 0 ? (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-5 rounded-lg border-2 hover:border-blue-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {trip.purpose}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Started: {formatDate(trip.startDate)}
                        {trip.endDate &&
                          ` • Ended: ${formatDate(trip.endDate)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!trip.endDate && (
                        <Button
                          size="sm"
                          onClick={() => handleEndTrip(trip)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          End Trip
                        </Button>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trip.endDate
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {trip.endDate ? "Completed" : "In Progress"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">
                        Start Mileage
                      </p>
                      <p className="font-semibold text-gray-900">
                        {trip.startMileage.toLocaleString()} mi
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">End Mileage</p>
                      <p className="font-semibold text-gray-900">
                        {trip.endMileage
                          ? `${trip.endMileage.toLocaleString()} mi`
                          : "-"}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="text-xs text-orange-700 mb-1">Fuel Used</p>
                      <p className="font-semibold text-orange-900">
                        {trip.fuelUsed
                          ? `${trip.fuelUsed.toFixed(1)} gal`
                          : "-"}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs text-green-700 mb-1">Efficiency</p>
                      <p className="font-semibold text-green-900">
                        {calculateFuelEfficiency(trip)
                          ? `${calculateFuelEfficiency(trip)} MPG`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-20 h-20 text-gray-300 mx-auto mb-4"
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
              <p className="text-gray-600 text-lg">No trips recorded yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Click "Start New Trip" to begin logging your trips
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
