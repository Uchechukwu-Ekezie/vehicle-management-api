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

  const loadVehicle = async (id: string) => {
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
      loadVehicle(vehicleId);
    }
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
        await vehiclesApi.update(vehicleId, formData, token);
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
          <CardTitle className="text-gray-900">Vehicle Information</CardTitle>
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
                  className="h-12 text-gray-700 bg-transparent"
                />
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label
                  htmlFor="model"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
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
                  className="h-12 text-gray-700 bg-transparent"
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label
                  htmlFor="year"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
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
                  className="h-12 text-gray-700 bg-transparent"
                />
              </div>

              {/* Mileage */}
              <div className="space-y-2">
                <label
                  htmlFor="mileage"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
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
                  className="h-12 text-gray-700 bg-transparent"
                />
              </div>

              {/* License Plate */}
              <div className="space-y-2">
                <label
                  htmlFor="licensePlate"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
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
                  className="h-12 text-gray-700 bg-transparent"
                />
              </div>

              {/* VIN */}
              <div className="space-y-2">
                <label
                  htmlFor="vin"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
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
                  className="h-12 text-gray-700 bg-transparent"
                />
              </div>

              {/* Status */}
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="status"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full h-12 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-gray-700 bg-transparent"
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