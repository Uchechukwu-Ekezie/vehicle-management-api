"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vehiclesApi } from "@/lib/api";
import { Vehicle } from "@/lib/types";

export default function AddEditVehiclePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("id");
  const isEditing = !!vehicleId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    vin: "",
    mileage: 0,
    status: "Available" as Vehicle["status"],
  });

  const loadVehicle = async (id: number) => {
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";
      const vehicle = await vehiclesApi.getById(id, token);
      setFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
        vin: vehicle.vin,
        mileage: vehicle.mileage,
        status: vehicle.status,
      });
    } catch {
      setError("Failed to load vehicle");
    }
  };

  useEffect(() => {
    if (isEditing && vehicleId) {
      const parsedId = parseInt(vehicleId);
      if (!isNaN(parsedId)) {
        loadVehicle(parsedId);
      } else {
        setError("Invalid vehicle ID");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, vehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";

      if (isEditing && vehicleId) {
        const parsedId = parseInt(vehicleId);
        if (!isNaN(parsedId)) {
          await vehiclesApi.update(parsedId, formData, token);
        } else {
          setError("Invalid vehicle ID");
          setLoading(false);
          return;
        }
      } else {
        await vehiclesApi.create(formData, token);
      }

      router.push("/admin/vehicles");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save vehicle";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year" || name === "mileage" ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-10 h-10 p-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing
              ? "Update vehicle information"
              : "Enter details for the new vehicle"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Make */}
              <div className="space-y-2">
                <label
                  htmlFor="make"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Make *
                </label>
                <Input
                  id="make"
                  name="make"
                  type="text"
                  placeholder="e.g., Toyota, Ford"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-12"
                />
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label
                  htmlFor="model"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
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
                  Model *
                </label>
                <Input
                  id="model"
                  name="model"
                  type="text"
                  placeholder="e.g., Camry, F-150"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-12"
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label
                  htmlFor="year"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Year *
                </label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  placeholder="2024"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-12"
                />
              </div>

              {/* Mileage */}
              <div className="space-y-2">
                <label
                  htmlFor="mileage"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
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
                  Current Mileage *
                </label>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  min="0"
                  placeholder="50000"
                  value={formData.mileage}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-12"
                />
              </div>

              {/* License Plate */}
              <div className="space-y-2">
                <label
                  htmlFor="licensePlate"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  License Plate *
                </label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  type="text"
                  placeholder="ABC-1234"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-12"
                />
              </div>

              {/* VIN */}
              <div className="space-y-2">
                <label
                  htmlFor="vin"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
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
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  VIN (Vehicle Identification Number) *
                </label>
                <Input
                  id="vin"
                  name="vin"
                  type="text"
                  placeholder="1HGBH41JXMN109186"
                  value={formData.vin}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-12"
                />
              </div>

              {/* Status */}
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="status"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
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
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full h-12 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="Available">Available</option>
                  <option value="InUse">In Use</option>
                  <option value="UnderMaintenance">Under Maintenance</option>
                  <option value="OutOfService">Out of Service</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
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
                    {isEditing ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <>{isEditing ? "Update Vehicle" : "Create Vehicle"}</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
