"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vehiclesApi, issuesApi } from "@/lib/api";
import { getUserFromToken } from "@/lib/auth";
import { Vehicle } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Issue {
  id: number;
  vehicleId: number;
  reportedBy: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  status: "Open" | "InProgress" | "Resolved";
  reportedDate: string;
  resolvedDate?: string;
}

export default function DriverIssuesPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    severity: "Medium" as Issue["severity"],
    description: "",
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

      // Get driver's reported issues (not all issues - drivers can only see their own)
      const driverIssues = await issuesApi.getByReportedBy(driverId, token);
      setIssues(driverIssues);
      setLoading(false);
    } catch (error) {
      console.error("Error loading issues:", error);
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

      // Backend expects CreateIssueRequest: vehicleID, description, priority
      // Backend extracts reportedById from JWT token automatically
      await issuesApi.create(
        {
          vehicleId: assignedVehicle.id,
          description: formData.description,
          priority: formData.severity, // Map severity to priority (Low, Medium, High, Critical)
        },
        token
      );

      // Reset form and reload data
      setFormData({
        severity: "Medium",
        description: "",
      });
      setShowForm(false);
      await loadData();
    } catch {
      alert("Failed to report issue");
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "InProgress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "InProgress":
        return "In Progress";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report Issues</h1>
          <p className="text-gray-600 mt-1">
            Report vehicle problems and track their resolution
          </p>
        </div>
        {assignedVehicle && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700"
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Report New Issue
          </Button>
        )}
      </div>

      {/* No Vehicle Warning */}
      {!assignedVehicle && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-yellow-900">
                  No Vehicle Assigned
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You need an assigned vehicle to report issues. Please contact
                  your administrator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Info */}
      {assignedVehicle && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
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
                  License: {assignedVehicle.licensePlate} • Mileage:{" "}
                  {assignedVehicle.mileage.toLocaleString()} mi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issue Form */}
      {showForm && assignedVehicle && (
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <svg
                className="w-5 h-5 text-red-600"
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
              Report New Issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="severity"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"
                >
                  <svg
                    className="w-4 h-4 text-red-600"
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
                  Severity Level *
                </label>
                <select
                  id="severity"
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      severity: e.target.value as Issue["severity"],
                    })
                  }
                  required
                  disabled={submitting}
                  className="w-full h-12 px-3 rounded-md border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  <option value="Low">Low - Minor issue, not urgent</option>
                  <option value="Medium">Medium - Needs attention soon</option>
                  <option value="High">
                    High - Important, needs quick attention
                  </option>
                  <option value="Critical">
                    Critical - Vehicle unsafe to operate
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"
                >
                  <svg
                    className="w-4 h-4 text-red-600"
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
                  Issue Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the issue in detail... (e.g., Strange noise from engine when accelerating, Check engine light is on, Brake pedal feels soft)"
                  required
                  disabled={submitting}
                  rows={6}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Be as detailed as possible to help mechanics diagnose the
                  problem
                </p>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ severity: "Medium", description: "" });
                  }}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
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
                      Submitting...
                    </span>
                  ) : (
                    "Submit Issue Report"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>Issue History</CardTitle>
        </CardHeader>
        <CardContent>
          {issues.length > 0 ? (
            <div className="space-y-4">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-5 rounded-lg border-2 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
                            issue.severity
                          )}`}
                        >
                          {issue.severity}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            issue.status
                          )}`}
                        >
                          {getStatusDisplay(issue.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Reported: {formatDate(issue.reportedDate)}
                        {issue.resolvedDate &&
                          ` • Resolved: ${formatDate(issue.resolvedDate)}`}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {issue.description}
                    </p>
                  </div>

                  {issue.status === "Resolved" && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-600 shrink-0"
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
                      <p className="text-sm text-green-800">
                        This issue has been resolved
                      </p>
                    </div>
                  )}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 text-lg">No issues reported yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Great! Your vehicle is running smoothly
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
