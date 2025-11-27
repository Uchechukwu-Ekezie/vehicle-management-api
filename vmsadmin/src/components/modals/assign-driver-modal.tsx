"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usersApi, vehiclesApi } from "@/lib/api";

interface AssignDriverModalProps {
  vehicleId: string;
  vehicleName: string;
  currentDriverName?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignDriverModal({
  vehicleId,
  vehicleName,
  currentDriverName,
  onClose,
  onSuccess,
}: AssignDriverModalProps) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";
      const data = await usersApi.getDrivers(token);
      setDrivers(data);
      setLoading(false);
    } catch {
      setError("Failed to load drivers");
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDriverId) {
      setError("Please select a driver");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";

      await vehiclesApi.assignDriver(vehicleId, selectedDriverId, token);
      onSuccess();
    } catch (err) {
      setError("Failed to assign driver. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-600"
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
              Assign Driver
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-semibold">Vehicle</p>
            <p className="text-lg font-bold text-gray-900">{vehicleName}</p>
            {currentDriverName && (
              <p className="text-sm text-gray-600 mt-1">
                Currently assigned to:{" "}
                <span className="font-semibold">{currentDriverName}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-2 text-sm">Loading drivers...</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No drivers available</p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Select Driver *
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full h-12 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              >
                <option value="">Choose a driver...</option>
                {drivers.map((driver) => (
                  <option
                    key={driver.userID || driver.id}
                    value={driver.userID || driver.id}
                  >
                    {driver.fullName || driver.username} ({driver.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={submitting || !selectedDriverId || drivers.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? "Assigning..." : "Assign Driver"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
