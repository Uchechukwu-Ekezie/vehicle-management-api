"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inspectionsApi, vehiclesApi } from "@/lib/api";
import { Inspection, Vehicle } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, Calendar, FileText, AlertCircle } from "lucide-react";

export default function AdminInspectionsPage() {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filterType, setFilterType] = useState<string>("All");
  const [formData, setFormData] = useState({
    vehicleId: "",
    inspectionType: "MOT",
    dueDate: new Date().toISOString().split("T")[0],
    documentLink: "",
    notes: "",
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
      const [inspectionsData, vehiclesData] = await Promise.all([
        inspectionsApi.getAll(token),
        vehiclesApi.getAll(token),
      ]);
      setInspections(inspectionsData);
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

      await inspectionsApi.create(
        {
          vehicleId: formData.vehicleId,
          inspectionType: formData.inspectionType,
          dueDate: new Date(formData.dueDate).toISOString(),
          documentLink: formData.documentLink || undefined,
          notes: formData.notes || undefined,
        },
        token
      );

      setFormData({
        vehicleId: "",
        inspectionType: "MOT",
        dueDate: new Date().toISOString().split("T")[0],
        documentLink: "",
        notes: "",
      });
      setShowForm(false);
      await loadData();
    } catch {
      alert("Failed to create inspection");
    }
  };

  const handleMarkComplete = async (id: string, isCompliant: boolean) => {
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";

      await inspectionsApi.update(
        id,
        {
          completionDate: new Date().toISOString(),
          isCompliant: isCompliant,
        },
        token
      );

      await loadData();
    } catch {
      alert("Failed to update inspection");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inspection?")) return;

    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";

      await inspectionsApi.delete(id, token);
      await loadData();
    } catch {
      alert("Failed to delete inspection");
    }
  };

  const getInspectionTypeColor = (type: string) => {
    switch (type) {
      case "MOT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Insurance":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Tax":
        return "bg-green-100 text-green-800 border-green-200";
      case "Safety":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getFilteredInspections = () => {
    let filtered = inspections;
    if (filterType !== "All") {
      filtered = filtered.filter((i) => i.inspectionType === filterType);
    }
    return filtered.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  };

  const getUpcomingInspections = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return inspections
      .filter(
        (i) =>
          !i.completionDate &&
          new Date(i.dueDate) <= thirtyDaysFromNow &&
          new Date(i.dueDate) >= new Date()
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const getOverdueInspections = () => {
    return inspections
      .filter((i) => !i.completionDate && new Date(i.dueDate) < new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 text-base">Loading inspections...</p>
        </div>
      </div>
    );
  }

  const filteredInspections = getFilteredInspections();
  const upcomingInspections = getUpcomingInspections();
  const overdueInspections = getOverdueInspections();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Inspections</h1>
          <p className="text-gray-700 text-base mt-1">
            Track MOT, Insurance, Tax, and Safety inspections
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {showForm ? "Cancel" : "+ New Inspection"}
        </Button>
      </div>

      {/* Alerts */}
      {(upcomingInspections.length > 0 || overdueInspections.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueInspections.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Overdue Inspections ({overdueInspections.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {overdueInspections.slice(0, 3).map((inspection) => (
                    <li key={inspection.id} className="text-red-700 text-sm">
                      <strong>{inspection.vehicleInfo || "Unknown Vehicle"}:</strong>{" "}
                      {inspection.inspectionType} was due on{" "}
                      {formatDate(inspection.dueDate)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {upcomingInspections.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Inspections ({upcomingInspections.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {upcomingInspections.slice(0, 3).map((inspection) => (
                    <li key={inspection.id} className="text-yellow-700 text-sm">
                      <strong>{inspection.vehicleInfo || "Unknown Vehicle"}:</strong>{" "}
                      {inspection.inspectionType} due in {getDaysUntilDue(inspection.dueDate)} days
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Schedule New Inspection</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Vehicle *
                  </label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleId: e.target.value })
                    }
                    required
                    className="w-full h-12 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-gray-700 bg-transparent"
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
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Inspection Type *
                  </label>
                  <select
                    value={formData.inspectionType}
                    onChange={(e) =>
                      setFormData({ ...formData, inspectionType: e.target.value })
                    }
                    required
                    className="w-full h-12 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-gray-700 bg-transparent"
                  >
                    <option value="MOT">MOT (Ministry of Transport Test)</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Tax">Tax</option>
                    <option value="Safety">Safety Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Due Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    required
                    className="h-12 text-gray-700 bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Document Link (Optional)
                  </label>
                  <Input
                    type="url"
                    value={formData.documentLink}
                    onChange={(e) =>
                      setFormData({ ...formData, documentLink: e.target.value })
                    }
                    placeholder="https://..."
                    className="h-12 text-gray-700 bg-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Additional notes about this inspection..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-gray-700  resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Schedule Inspection
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterType === "All" ? "default" : "outline"}
          onClick={() => setFilterType("All")}
          className={filterType === "All" ? "bg-blue-600 text-white" : ""}
        >
          All
        </Button>
        <Button
          variant={filterType === "MOT" ? "default" : "outline"}
          onClick={() => setFilterType("MOT")}
          className={filterType === "MOT" ? "bg-blue-600 text-white" : ""}
        >
          MOT
        </Button>
        <Button
          variant={filterType === "Insurance" ? "default" : "outline"}
          onClick={() => setFilterType("Insurance")}
          className={filterType === "Insurance" ? "bg-blue-600 text-white" : ""}
        >
          Insurance
        </Button>
        <Button
          variant={filterType === "Tax" ? "default" : "outline"}
          onClick={() => setFilterType("Tax")}
          className={filterType === "Tax" ? "bg-blue-600 text-white" : ""}
        >
          Tax
        </Button>
        <Button
          variant={filterType === "Safety" ? "default" : "outline"}
          onClick={() => setFilterType("Safety")}
          className={filterType === "Safety" ? "bg-blue-600 text-white" : ""}
        >
          Safety
        </Button>
      </div>

      {/* Inspections List */}
      {filteredInspections.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-700 text-lg">No inspections found</p>
            <p className="text-gray-700 text-base mt-2">
              {filterType === "All"
                ? "Create your first inspection to get started"
                : `No ${filterType} inspections found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInspections.map((inspection) => {
            const daysUntil = getDaysUntilDue(inspection.dueDate);
            const isOverdue = !inspection.completionDate && daysUntil < 0;
            const isUpcoming = !inspection.completionDate && daysUntil >= 0 && daysUntil <= 30;

            return (
              <Card
                key={inspection.id}
                className={`${
                  isOverdue
                    ? "border-red-300 bg-red-50"
                    : isUpcoming
                    ? "border-yellow-300 bg-yellow-50"
                    : inspection.isCompliant
                    ? "border-green-300 bg-green-50"
                    : ""
                } hover:shadow-lg transition-shadow`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getInspectionTypeColor(
                            inspection.inspectionType
                          )}`}
                        >
                          {inspection.inspectionType}
                        </span>
                        {inspection.isCompliant && inspection.completionDate && (
                          <span className="flex items-center gap-1 text-green-700 text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            Compliant
                          </span>
                        )}
                        {!inspection.completionDate && isOverdue && (
                          <span className="flex items-center gap-1 text-red-700 text-sm font-semibold">
                            <AlertCircle className="w-4 h-4" />
                            Overdue
                          </span>
                        )}
                        {!inspection.completionDate && isUpcoming && (
                          <span className="flex items-center gap-1 text-yellow-700 text-sm font-semibold">
                            <Calendar className="w-4 h-4" />
                            Due in {daysUntil} days
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {inspection.vehicleInfo || "Unknown Vehicle"}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Due: {formatDate(inspection.dueDate)}
                        </span>
                        {inspection.completionDate && (
                          <span className="flex items-center gap-1 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            Completed: {formatDate(inspection.completionDate)}
                          </span>
                        )}
                      </div>
                      {inspection.notes && (
                        <p className="text-gray-700 text-sm mt-2">{inspection.notes}</p>
                      )}
                      {inspection.documentLink && (
                        <a
                          href={inspection.documentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm mt-2 inline-flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          View Document
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!inspection.completionDate && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleMarkComplete(inspection.id, true)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Compliant
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkComplete(inspection.id, false)}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Mark Non-Compliant
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(inspection.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

