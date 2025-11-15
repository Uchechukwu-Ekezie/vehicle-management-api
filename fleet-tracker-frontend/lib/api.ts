import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Auth API calls
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post("/api/Auth/login", { username, password });
    return response.data;
  },
  register: async (data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await api.post("/api/Auth/register", data);
    return response.data;
  },
};

// Helper function to normalize vehicle data from API
// Backend uses camelCase by default in .NET 8 (vehicleID, currentMileage, etc.)
const normalizeVehicle = (vehicle: any) => {
  if (!vehicle) return vehicle;

  return {
    ...vehicle,
    // ID mapping: prioritize camelCase (vehicleID) as that's what .NET 8 returns
    id: vehicle.id ?? vehicle.vehicleID ?? vehicle.VehicleID,
    // Mileage mapping: backend uses currentMileage (camelCase)
    mileage:
      vehicle.mileage ?? vehicle.currentMileage ?? vehicle.CurrentMileage ?? 0,
    // License plate: backend uses LicensePlate but .NET 8 camelCases to licensePlate
    licensePlate: vehicle.licensePlate ?? vehicle.LicensePlate,
    // VIN: backend uses VIN but .NET 8 camelCases to vin
    vin: vehicle.vin ?? vehicle.VIN,
    // Other fields: backend uses PascalCase in DTO but .NET 8 camelCases them
    make: vehicle.make ?? vehicle.Make ?? "",
    model: vehicle.model ?? vehicle.Model ?? "",
    year: vehicle.year ?? vehicle.Year ?? new Date().getFullYear(),
    status: vehicle.status ?? vehicle.Status ?? "Available",
  };
};

// Vehicles API
export const vehiclesApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Vehicles", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const vehicles = Array.isArray(response.data) ? response.data : [];
    return vehicles.map(normalizeVehicle);
  },
  getById: async (id: number, token: string) => {
    const response = await api.get(`/api/Vehicles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeVehicle(response.data);
  },
  create: async (data: any, token: string) => {
    // Map frontend fields to backend DTO fields
    // Backend expects currentMileage (camelCase), frontend uses mileage
    const backendData = {
      ...data,
      currentMileage: data.mileage ?? data.currentMileage ?? 0,
    };
    // Remove frontend-specific fields if they exist
    delete backendData.mileage;
    delete backendData.id;

    const response = await api.post("/api/Vehicles", backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeVehicle(response.data);
  },
  update: async (id: number, data: any, token: string) => {
    // Map frontend fields to backend DTO fields
    const backendData = {
      ...data,
      currentMileage: data.mileage ?? data.currentMileage ?? 0,
    };
    // Remove frontend-specific fields if they exist
    delete backendData.mileage;
    delete backendData.id;

    const response = await api.put(`/api/Vehicles/${id}`, backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeVehicle(response.data);
  },
  delete: async (id: number, token: string) => {
    await api.delete(`/api/Vehicles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  assignDriver: async (vehicleId: string, driverId: string, token: string) => {
    const response = await api.post(
      `/api/Vehicles/${vehicleId}/assign/${driverId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  getDrivers: async (token: string) => {
    const response = await api.get("/api/Users/drivers", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Trips API
export const tripsApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Trips", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  create: async (data: any, token: string) => {
    const response = await api.post("/api/Trips", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Maintenance API
export const maintenanceApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Maintenance", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  create: async (data: any, token: string) => {
    const response = await api.post("/api/Maintenance", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  update: async (id: number, data: any, token: string) => {
    const response = await api.put(`/api/Maintenance/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Issues API
export const issuesApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Issues", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  create: async (data: any, token: string) => {
    const response = await api.post("/api/Issues", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Parts API
export const partsApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Parts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  create: async (data: any, token: string) => {
    const response = await api.post("/api/Parts", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  update: async (id: number, data: any, token: string) => {
    const response = await api.put(`/api/Parts/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Reporting API
export const reportingApi = {
  getCostAnalysis: async (token: string) => {
    const response = await api.get("/api/Reporting/cost-analysis", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  getFuelEfficiency: async (token: string) => {
    const response = await api.get("/api/Reporting/fuel-efficiency", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
