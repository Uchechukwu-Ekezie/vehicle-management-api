import axios from "axios";

// Admin Frontend API Configuration - Independent, no shared config
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vehicle-management-api-production.up.railway.app";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to normalize IDs
const normalizeId = (id: any) => {
  if (id === null || id === undefined) return undefined;
  return typeof id === "string" ? id : id.toString();
};

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post("/api/Auth/login", { username, password });
    return response.data;
  },
};

// Helper function to normalize vehicle data
const normalizeVehicle = (vehicle: any) => {
  if (!vehicle) return vehicle;
  return {
    ...vehicle,
    id: normalizeId(vehicle.id) ?? normalizeId(vehicle.vehicleID) ?? "",
    vehicleID: normalizeId(vehicle.vehicleID),
    mileage: vehicle.mileage ?? vehicle.currentMileage ?? 0,
    licensePlate: vehicle.licensePlate ?? vehicle.LicensePlate,
    vin: vehicle.vin ?? vehicle.VIN,
    make: vehicle.make ?? vehicle.Make ?? "",
    model: vehicle.model ?? vehicle.Model ?? "",
    year: vehicle.year ?? vehicle.Year ?? new Date().getFullYear(),
    status: vehicle.status ?? vehicle.Status ?? "Available",
    assignedDriverID: vehicle.assignedDriverID ? normalizeId(vehicle.assignedDriverID) : null,
    assignedDriverName: vehicle.assignedDriverName ?? vehicle.AssignedDriverName ?? "",
  };
};

// Vehicles API - Admin has full CRUD access
export const vehiclesApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Vehicles", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const vehicles = Array.isArray(response.data) ? response.data : [];
    return vehicles.map(normalizeVehicle);
  },
  getById: async (id: string, token: string) => {
    const response = await api.get(`/api/Vehicles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeVehicle(response.data);
  },
  create: async (data: any, token: string) => {
    const backendData = { ...data, currentMileage: data.mileage ?? 0 };
    delete backendData.mileage;
    delete backendData.id;
    const response = await api.post("/api/Vehicles", backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeVehicle(response.data);
  },
  update: async (id: string, data: any, token: string) => {
    const backendData = { ...data, currentMileage: data.mileage ?? 0 };
    delete backendData.mileage;
    delete backendData.id;
    const response = await api.put(`/api/Vehicles/${id}`, backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeVehicle(response.data);
  },
  delete: async (id: string, token: string) => {
    await api.delete(`/api/Vehicles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  assignDriver: async (vehicleId: string, driverId: string, token: string) => {
    const response = await api.post(`/api/Vehicles/${vehicleId}/assign/${driverId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Users API - Admin only
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

// Helper function to normalize trip data
const normalizeTrip = (trip: any) => {
  if (!trip) return trip;
  return {
    ...trip,
    id: normalizeId(trip.id) ?? normalizeId(trip.tripID) ?? "",
    vehicleId: normalizeId(trip.vehicleId) ?? normalizeId(trip.vehicleID) ?? "",
    driverId: normalizeId(trip.driverId) ?? normalizeId(trip.driverID) ?? "",
    startDate: trip.startDate ?? trip.startTime,
    endDate: trip.endDate ?? trip.endTime,
    startMileage: trip.startMileage ?? 0,
    endMileage: trip.endMileage,
    fuelUsed: trip.fuelUsed,
    purpose: trip.purpose ?? trip.notes ?? "",
    status: trip.status,
  };
};

// Trips API - Admin has access to all trips
export const tripsApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Trips", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const trips = Array.isArray(response.data) ? response.data : [];
    return trips.map(normalizeTrip);
  },
  getByVehicle: async (vehicleId: string, token: string) => {
    const response = await api.get(`/api/Trips/vehicle/${vehicleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const trips = Array.isArray(response.data) ? response.data : [];
    return trips.map(normalizeTrip);
  },
};

// Helper function to normalize maintenance data
const normalizeMaintenance = (record: any) => {
  if (!record) return record;
  return {
    ...record,
    id: normalizeId(record.id) ?? normalizeId(record.recordID) ?? "",
    vehicleId: normalizeId(record.vehicleId) ?? normalizeId(record.vehicleID) ?? "",
    maintenanceType: record.maintenanceType ?? record.MaintenanceType ?? "",
    scheduledDate: record.scheduledDate ?? record.ScheduledDate,
    completedDate: record.completedDate ?? record.CompletionDate,
    cost: record.cost ?? record.Cost ?? 0,
    status: record.status ?? record.Status ?? "Scheduled",
  };
};

// Maintenance API - Admin has full access
export const maintenanceApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Maintenance", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const records = Array.isArray(response.data) ? response.data : [];
    return records.map(normalizeMaintenance);
  },
  create: async (data: any, token: string) => {
    const response = await api.post("/api/Maintenance/schedule", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  update: async (id: string, data: any, token: string) => {
    const response = await api.put(`/api/Maintenance/records/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Helper function to normalize inspection data
const normalizeInspection = (inspection: any) => {
  if (!inspection) return inspection;
  return {
    ...inspection,
    id: normalizeId(inspection.id) ?? normalizeId(inspection.inspectionID) ?? "",
    vehicleId: normalizeId(inspection.vehicleId) ?? normalizeId(inspection.vehicleID) ?? "",
    vehicleInfo: inspection.vehicleInfo,
    inspectionType: inspection.inspectionType,
    dueDate: inspection.dueDate,
    completionDate: inspection.completionDate,
    isCompliant: inspection.isCompliant ?? false,
    documentLink: inspection.documentLink,
    notes: inspection.notes,
  };
};

// Inspections API - Admin only
export const inspectionsApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Inspections", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const inspections = Array.isArray(response.data) ? response.data : [];
    return inspections.map(normalizeInspection);
  },
  getAlerts: async (token: string) => {
    const response = await api.get("/api/Inspections/alerts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  create: async (data: any, token: string) => {
    const backendData: any = {
      vehicleID: data.vehicleId ?? data.vehicleID,
      inspectionType: data.inspectionType,
      dueDate: data.dueDate,
      documentLink: data.documentLink,
      notes: data.notes,
    };
    delete backendData.vehicleId;
    delete backendData.id;
    const response = await api.post("/api/Inspections", backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeInspection(response.data);
  },
  update: async (id: string, data: any, token: string) => {
    const backendData: any = {};
    if (data.dueDate) backendData.dueDate = data.dueDate;
    if (data.completionDate) backendData.completionDate = data.completionDate;
    if (data.isCompliant !== undefined) backendData.isCompliant = data.isCompliant;
    if (data.documentLink !== undefined) backendData.documentLink = data.documentLink;
    if (data.notes !== undefined) backendData.notes = data.notes;
    const response = await api.put(`/api/Inspections/${id}`, backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeInspection(response.data);
  },
  delete: async (id: string, token: string) => {
    await api.delete(`/api/Inspections/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// Reporting API - Admin has access
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
