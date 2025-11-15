import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vehiclesApi, maintenanceApi } from "@/lib/api";
import { Car, Wrench, AlertCircle, CheckCircle } from "lucide-react";

async function getDashboardData(token: string) {
  try {
    const [vehicles, maintenance] = await Promise.all([
      vehiclesApi.getAll(token),
      maintenanceApi.getAll(token),
    ]);

    const vehicleStats = {
      total: vehicles.length,
      available: vehicles.filter(
        (v: { status: string }) => v.status === "Available"
      ).length,
      inUse: vehicles.filter((v: { status: string }) => v.status === "InUse")
        .length,
      maintenance: vehicles.filter(
        (v: { status: string }) => v.status === "UnderMaintenance"
      ).length,
    };

    const maintenanceStats = {
      scheduled: maintenance.filter(
        (m: { status: string }) => m.status === "Scheduled"
      ).length,
      inProgress: maintenance.filter(
        (m: { status: string }) => m.status === "InProgress"
      ).length,
      completed: maintenance.filter(
        (m: { status: string }) => m.status === "Completed"
      ).length,
    };

    // Predictive maintenance alerts
    const alerts = vehicles
      .filter((v: { mileage: number; lastServiceDate: string | null }) => {
        if (!v.lastServiceDate) return true;
        const daysSinceService = Math.floor(
          (Date.now() - new Date(v.lastServiceDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return v.mileage > 50000 || daysSinceService > 180;
      })
      .map(
        (v: {
          id: string;
          vehicleID?: string;
          make: string;
          model: string;
          licensePlate: string;
        }) => ({
          id: v.id || v.vehicleID || "",
          vehicle: `${v.make} ${v.model} (${v.licensePlate})`,
          message: "Service recommended",
        })
      );

    return { vehicleStats, maintenanceStats, alerts };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      vehicleStats: { total: 0, available: 0, inUse: 0, maintenance: 0 },
      maintenanceStats: { scheduled: 0, inProgress: 0, completed: 0 },
      alerts: [],
    };
  }
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const { vehicleStats, maintenanceStats, alerts } = await getDashboardData(
    token
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <svg
              className="w-7 h-7"
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
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100 mt-1">
              Welcome back! Here&apos;s your fleet overview
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">
              Total Vehicles
            </CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Car className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {vehicleStats.total}
            </div>
            <p className="text-xs text-gray-500 mt-2">Fleet size</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">
              Available
            </CardTitle>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {vehicleStats.available}
            </div>
            <p className="text-xs text-gray-500 mt-2">Ready for use</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">
              In Use
            </CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Car className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {vehicleStats.inUse}
            </div>
            <p className="text-xs text-gray-500 mt-2">Currently deployed</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">
              Maintenance
            </CardTitle>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Wrench className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {vehicleStats.maintenance}
            </div>
            <p className="text-xs text-gray-500 mt-2">Being serviced</p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Statistics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Wrench className="h-6 w-6 text-blue-600" />
          Maintenance Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
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
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {maintenanceStats.scheduled}
              </div>
              <p className="text-sm text-gray-500 mt-2">Upcoming tasks</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-yellow-600"
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
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600">
                {maintenanceStats.inProgress}
              </div>
              <p className="text-sm text-gray-500 mt-2">Currently working</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {maintenanceStats.completed}
              </div>
              <p className="text-sm text-gray-500 mt-2">This month</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Predictive Maintenance Alerts */}
      {alerts.length > 0 && (
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <span className="text-gray-900">Maintenance Alerts</span>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  {alerts.length}{" "}
                  {alerts.length === 1
                    ? "vehicle requires"
                    : "vehicles require"}{" "}
                  attention
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {alerts.map(
                (
                  alert: { id: number; vehicle: string; message: string },
                  index: number
                ) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-l-4 border-red-500 hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Car className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {alert.vehicle}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 font-medium rounded-lg transition-colors border border-red-200 hover:border-red-300">
                      Schedule
                    </button>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
