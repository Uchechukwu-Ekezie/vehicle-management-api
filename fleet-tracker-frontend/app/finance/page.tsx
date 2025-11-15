"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { maintenanceApi } from "@/lib/api";
import { MaintenanceRecord } from "@/lib/types";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function FinanceDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [stats, setStats] = useState({
    totalCost: 0,
    monthlyAverage: 0,
    completedCount: 0,
    pendingCost: 0,
  });

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";
      const records = await maintenanceApi.getAll(token);
      setMaintenanceRecords(records);

      // Calculate stats
      const completedRecords = records.filter(
        (r: MaintenanceRecord) => r.status === "Completed"
      );
      const totalCost = completedRecords.reduce(
        (sum: number, r: MaintenanceRecord) => sum + (r.cost || 0),
        0
      );
      const pendingRecords = records.filter(
        (r: MaintenanceRecord) => r.status !== "Completed"
      );
      const pendingCost = pendingRecords.reduce(
        (sum: number, r: MaintenanceRecord) => sum + (r.cost || 0),
        0
      );

      setStats({
        totalCost,
        monthlyAverage: completedRecords.length > 0 ? totalCost / 12 : 0,
        completedCount: completedRecords.length,
        pendingCost,
      });

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const getCostByMonth = () => {
    const monthlyData: { [key: string]: number } = {};

    maintenanceRecords.forEach((record: MaintenanceRecord) => {
      if (
        record.status === "Completed" &&
        record.completedDate &&
        record.cost
      ) {
        const month = new Date(record.completedDate).toLocaleDateString(
          "en-US",
          { month: "short" }
        );
        monthlyData[month] = (monthlyData[month] || 0) + record.cost;
      }
    });

    return Object.entries(monthlyData).map(([month, cost]) => ({
      month,
      cost,
    }));
  };

  const getCostByType = () => {
    const typeData: { [key: string]: number } = {};

    maintenanceRecords.forEach((record: MaintenanceRecord) => {
      if (record.status === "Completed" && record.cost) {
        typeData[record.maintenanceType] =
          (typeData[record.maintenanceType] || 0) + record.cost;
      }
    });

    return Object.entries(typeData).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getTopExpenses = () => {
    return maintenanceRecords
      .filter((r: MaintenanceRecord) => r.status === "Completed" && r.cost)
      .sort(
        (a: MaintenanceRecord, b: MaintenanceRecord) =>
          (b.cost || 0) - (a.cost || 0)
      )
      .slice(0, 5);
  };

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Track maintenance costs and financial analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Maintenance Cost
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ${stats.totalCost.toLocaleString()}
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
                  Monthly Average
                </p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  ${stats.monthlyAverage.toFixed(0)}
                </p>
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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
                  Completed Tasks
                </p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {stats.completedCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-purple-600"
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

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Costs
                </p>
                <p className="text-3xl font-bold text-orange-900 mt-1">
                  ${stats.pendingCost.toLocaleString()}
                </p>
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Cost Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Cost Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {getCostByMonth().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getCostByMonth()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Cost ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-700">
                No cost data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost by Maintenance Type */}
        <Card>
          <CardHeader>
            <CardTitle>Cost by Maintenance Type</CardTitle>
          </CardHeader>
          <CardContent>
            {getCostByType().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getCostByType()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getCostByType().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-700">
                No type data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Type</CardTitle>
        </CardHeader>
        <CardContent>
          {getCostByType().length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={getCostByType()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="value" fill="#8B5CF6" name="Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-700">
              No breakdown data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Maintenance Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {getTopExpenses().length > 0 ? (
            <div className="space-y-4">
              {getTopExpenses().map((record, index) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-4 rounded-lg border-2 hover:border-purple-200 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">
                      {record.maintenanceType}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {record.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-900">
                      ${record.cost?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700">
                      Vehicle #{record.vehicleId}
                    </p>
                  </div>
                </div>
              ))}
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-gray-600">No expense data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
