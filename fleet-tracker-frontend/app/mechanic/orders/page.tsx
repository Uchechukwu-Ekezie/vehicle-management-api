"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { maintenanceApi } from "@/lib/api";
import { MaintenanceRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function MechanicOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<MaintenanceRecord[]>([]);
  const [filter, setFilter] = useState<
    "All" | "Scheduled" | "InProgress" | "Completed"
  >("All");

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";
      const orders = await maintenanceApi.getAll(token);
      setWorkOrders(orders);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    orderId: number,
    newStatus: MaintenanceRecord["status"]
  ) => {
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";
      const order = workOrders.find((o) => o.id === orderId);
      if (!order) return;

      await maintenanceApi.update(
        orderId,
        {
          ...order,
          status: newStatus,
          completedDate:
            newStatus === "Completed"
              ? new Date().toISOString()
              : order.completedDate,
        },
        token
      );

      await loadWorkOrders();
    } catch {
      alert("Failed to update work order status");
    }
  };

  const getFilteredOrders = () => {
    if (filter === "All") return workOrders;
    return workOrders.filter(
      (order: MaintenanceRecord) => order.status === filter
    );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading work orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
        <p className="text-gray-600 mt-1">
          Manage maintenance tasks and repairs
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2 flex-wrap">
            {(["All", "Scheduled", "InProgress", "Completed"] as const).map(
              (status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  onClick={() => setFilter(status)}
                  className={
                    filter === status ? "bg-orange-600 hover:bg-orange-700" : ""
                  }
                >
                  {status === "InProgress" ? "In Progress" : status}
                  {status === "All" && (
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {workOrders.length}
                    </span>
                  )}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work Orders List */}
      {getFilteredOrders().length > 0 ? (
        <div className="space-y-4">
          {getFilteredOrders().map((order) => (
            <Card
              key={order.id}
              className="border-2 hover:border-orange-200 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {order.maintenanceType}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status === "InProgress"
                          ? "In Progress"
                          : order.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{order.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Vehicle ID</p>
                    <p className="font-semibold text-gray-900">
                      #{order.vehicleId}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700 mb-1">Scheduled Date</p>
                    <p className="font-semibold text-blue-900">
                      {formatDate(order.scheduledDate)}
                    </p>
                  </div>
                  {order.completedDate && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs text-green-700 mb-1">
                        Completed Date
                      </p>
                      <p className="font-semibold text-green-900">
                        {formatDate(order.completedDate)}
                      </p>
                    </div>
                  )}
                  {order.cost && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-xs text-purple-700 mb-1">Cost</p>
                      <p className="font-semibold text-purple-900">
                        ${order.cost.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  {order.status === "Scheduled" && (
                    <Button
                      onClick={() => handleStatusUpdate(order.id, "InProgress")}
                      className="bg-blue-600 hover:bg-blue-700"
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
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Start Work
                    </Button>
                  )}
                  {order.status === "InProgress" && (
                    <Button
                      onClick={() => handleStatusUpdate(order.id, "Completed")}
                      className="bg-green-600 hover:bg-green-700"
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Mark Complete
                    </Button>
                  )}
                  {order.status === "Completed" && (
                    <div className="flex items-center gap-2 text-green-700">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-semibold">Work Completed</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
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
            <p className="text-gray-600 text-lg">No work orders found</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
