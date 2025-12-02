import axios from "axios";

// Fleet Tracker Frontend API Configuration - Points to deployed backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vehicle-management-api-production.up.railway.app";

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
    fullName: string;
    password: string;
    role: string;
  }) => {
    const response = await api.post("/api/Auth/register", data);
    return response.data;
  },
};

// Helper function to normalize vehicle data from API
// Backend uses camelCase by default in .NET 8 (vehicleID, currentMileage, etc.)
// IDs are now UUIDs (Guid) which come as strings in JSON
const normalizeVehicle = (vehicle: any) => {
  if (!vehicle) return vehicle;

  // Convert UUID to string if needed
  const normalizeId = (id: any) => {
    if (id === null || id === undefined) return undefined;
    return typeof id === "string" ? id : id.toString();
  };

  return {
    ...vehicle,
    // ID mapping: prioritize camelCase (vehicleID) as that's what .NET 8 returns, convert to string
    id:
      normalizeId(vehicle.id) ??
      normalizeId(vehicle.vehicleID) ??
      normalizeId(vehicle.VehicleID) ??
      "",
    vehicleID: normalizeId(vehicle.vehicleID) ?? normalizeId(vehicle.VehicleID),
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
    // Assigned driver mapping
    assignedDriverID: vehicle.assignedDriverID
      ? normalizeId(vehicle.assignedDriverID)
      : vehicle.assignedDriverID ??
        (vehicle.assignedDriverId
          ? normalizeId(vehicle.assignedDriverId)
          : vehicle.assignedDriverId),
    assignedDriverName:
      vehicle.assignedDriverName ??
      vehicle.AssignedDriverName ??
      vehicle.assignedDriver?.fullName ??
      vehicle.assignedDriver?.username ??
      "",
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
  getById: async (id: string, token: string) => {
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
  update: async (id: string, data: any, token: string) => {
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
  delete: async (id: string, token: string) => {
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

// Helper function to normalize trip data from API
const normalizeTrip = (trip: any) => {
  if (!trip) return trip;

  const normalizeId = (id: any) => {
    if (id === null || id === undefined) return undefined;
    return typeof id === "string" ? id : id.toString();
  };

  return {
    ...trip,
    id:
      normalizeId(trip.id) ??
      normalizeId(trip.tripID) ??
      normalizeId(trip.TripID) ??
      "",
    tripID: normalizeId(trip.tripID) ?? normalizeId(trip.TripID),
    vehicleId:
      normalizeId(trip.vehicleId) ??
      normalizeId(trip.vehicleID) ??
      normalizeId(trip.VehicleID) ??
      "",
    vehicleID: normalizeId(trip.vehicleID) ?? normalizeId(trip.VehicleID),
    vehicleInfo: trip.vehicleInfo,
    driverId:
      normalizeId(trip.driverId) ??
      normalizeId(trip.driverID) ??
      normalizeId(trip.DriverID) ??
      "",
    driverID: normalizeId(trip.driverID) ?? normalizeId(trip.DriverID),
    driverName: trip.driverName,
    startDate: trip.startDate ?? trip.startTime,
    startTime: trip.startTime ?? trip.startDate,
    endDate: trip.endDate ?? trip.endTime,
    endTime: trip.endTime ?? trip.endDate,
    startMileage: trip.startMileage ?? trip.StartMileage ?? 0,
    endMileage: trip.endMileage ?? trip.EndMileage,
    fuelUsed: trip.fuelUsed ?? trip.FuelUsed,
    fuelEfficiency: trip.fuelEfficiency ?? trip.FuelEfficiency,
    purpose: trip.purpose ?? trip.notes ?? trip.Notes ?? "",
    notes: trip.notes ?? trip.Notes ?? trip.purpose,
  };
};

// Trips API
export const tripsApi = {
  getAll: async (token: string) => {
    // Only Admin and Finance can access this endpoint
    const response = await api.get("/api/Trips", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const trips = Array.isArray(response.data) ? response.data : [];
    return trips.map(normalizeTrip);
  },
  getByDriver: async (driverId: string, token: string) => {
    const response = await api.get(`/api/Trips/driver/${driverId}`, {
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
  create: async (data: any, token: string) => {
    // Backend expects POST to /api/Trips/start
    // Backend extracts driverId from JWT token automatically
    const backendData = {
      vehicleID: data.vehicleID ?? data.vehicleId,
      startTime: data.startTime ?? data.startDate ?? new Date().toISOString(),
      startMileage: data.startMileage ?? 0,
      notes: data.notes ?? data.purpose,
    };

    const response = await api.post("/api/Trips/start", backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeTrip(response.data);
  },
  update: async (id: string, data: any, token: string) => {
    // Backend expects POST to /api/Trips/{id}/end
    const backendData: any = {};
    if (data.endTime) backendData.endTime = data.endTime;
    if (data.endDate) backendData.endTime = data.endDate;
    if (data.endMileage !== undefined) backendData.endMileage = data.endMileage;
    if (data.fuelUsed !== undefined) backendData.fuelUsed = data.fuelUsed;

    const response = await api.post(`/api/Trips/${id}/end`, backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeTrip(response.data);
  },
};

// Helper function to normalize maintenance data from API
const normalizeMaintenance = (record: any) => {
  if (!record) return record;

  const normalizeId = (id: any) => {
    if (id === null || id === undefined) return undefined;
    return typeof id === "string" ? id : id.toString();
  };

  return {
    ...record,
    id:
      normalizeId(record.id) ??
      normalizeId(record.recordID) ??
      normalizeId(record.RecordID) ??
      "",
    recordID: normalizeId(record.recordID) ?? normalizeId(record.RecordID),
    vehicleId:
      normalizeId(record.vehicleId) ??
      normalizeId(record.vehicleID) ??
      normalizeId(record.VehicleID) ??
      "",
    vehicleID: normalizeId(record.vehicleID) ?? normalizeId(record.VehicleID),
    vehicleInfo: record.vehicleInfo,
    maintenanceType: record.maintenanceType ?? record.MaintenanceType ?? "",
    scheduledDate:
      record.scheduledDate ?? record.ScheduledDate ?? record.scheduledTime,
    completedDate:
      record.completedDate ?? record.CompletionDate ?? record.completedTime,
    cost: record.cost ?? record.Cost ?? 0,
    mechanicNotes:
      record.mechanicNotes ?? record.MechanicNotes ?? record.description,
    status: record.status ?? record.Status ?? "Scheduled",
    mileageAtService:
      record.mileageAtService ?? record.MileageAtService ?? undefined,
  };
};

// Maintenance API
export const maintenanceApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Maintenance", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const records = Array.isArray(response.data) ? response.data : [];
    return records.map(normalizeMaintenance);
  },
  create: async (data: any, token: string) => {
    // Backend expects POST to /api/Maintenance/schedule
    const response = await api.post("/api/Maintenance/schedule", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  update: async (id: string, data: any, token: string) => {
    // Backend expects PUT to /api/Maintenance/records/{id} (UUID)
    const response = await api.put(`/api/Maintenance/records/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Helper function to normalize issue data from API
const normalizeIssue = (issue: any) => {
  if (!issue) return issue;

  const normalizeId = (id: any) => {
    if (id === null || id === undefined) return undefined;
    return typeof id === "string" ? id : id.toString();
  };

  return {
    ...issue,
    id:
      normalizeId(issue.id) ??
      normalizeId(issue.issueID) ??
      normalizeId(issue.IssueID) ??
      "",
    issueID: normalizeId(issue.issueID) ?? normalizeId(issue.IssueID),
    vehicleId:
      normalizeId(issue.vehicleId) ??
      normalizeId(issue.vehicleID) ??
      normalizeId(issue.VehicleID) ??
      "",
    vehicleID: normalizeId(issue.vehicleID) ?? normalizeId(issue.VehicleID),
    vehicleInfo: issue.vehicleInfo,
    reportedById:
      normalizeId(issue.reportedById) ??
      normalizeId(issue.reportedByID) ??
      normalizeId(issue.ReportedByID) ??
      "",
    reportedByID:
      normalizeId(issue.reportedByID) ?? normalizeId(issue.ReportedByID),
    reportedBy:
      issue.reportedBy ?? issue.reportedByName ?? issue.ReportedByName ?? "",
    reportedByName: issue.reportedByName ?? issue.ReportedByName,
    reportedDate: issue.reportedDate ?? issue.reportDate ?? issue.ReportDate,
    reportDate: issue.reportDate ?? issue.ReportDate ?? issue.reportedDate,
    description: issue.description ?? issue.Description ?? "",
    status: issue.status ?? issue.Status ?? "Open",
    severity: issue.severity ?? issue.priority ?? issue.Priority ?? "Medium", // Map priority to severity
    priority: issue.priority ?? issue.Priority ?? issue.severity ?? "Medium",
    resolvedDate:
      issue.resolvedDate ?? issue.resolvedDate ?? issue.ResolvedDate,
    resolution: issue.resolution ?? issue.Resolution,
  };
};

// Issues API
export const issuesApi = {
  getAll: async (token: string) => {
    // Only Admin and Mechanic can access this endpoint
    const response = await api.get("/api/Issues", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const issues = Array.isArray(response.data) ? response.data : [];
    return issues.map(normalizeIssue);
  },
  getByVehicle: async (vehicleId: string, token: string) => {
    const response = await api.get(`/api/Issues/vehicle/${vehicleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const issues = Array.isArray(response.data) ? response.data : [];
    return issues.map(normalizeIssue);
  },
  getByReportedBy: async (reportedById: string, token: string) => {
    // Get issues reported by a specific user (for drivers to see their own issues)
    const response = await api.get(`/api/Issues/reported/${reportedById}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const issues = Array.isArray(response.data) ? response.data : [];
    return issues.map(normalizeIssue);
  },
  create: async (data: any, token: string) => {
    // Backend expects CreateIssueRequest: vehicleID, description, priority (optional)
    const backendData = {
      vehicleID: data.vehicleId ?? data.vehicleID,
      description: data.description,
      priority: data.priority ?? data.severity ?? "Medium", // Map severity to priority
    };

    const response = await api.post("/api/Issues", backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeIssue(response.data);
  },
};

// Helper function to normalize inspection data from API
const normalizeInspection = (inspection: any) => {
  if (!inspection) return inspection;

  const normalizeId = (id: any) => {
    if (id === null || id === undefined) return undefined;
    return typeof id === "string" ? id : id.toString();
  };

  return {
    ...inspection,
    id:
      normalizeId(inspection.id) ?? normalizeId(inspection.inspectionID) ?? "",
    inspectionID: normalizeId(inspection.inspectionID),
    vehicleId:
      normalizeId(inspection.vehicleId) ??
      normalizeId(inspection.vehicleID) ??
      "",
    vehicleID: normalizeId(inspection.vehicleID),
    vehicleInfo: inspection.vehicleInfo,
    inspectionType: inspection.inspectionType,
    dueDate: inspection.dueDate,
    completionDate: inspection.completionDate,
    isCompliant: inspection.isCompliant ?? false,
    documentLink: inspection.documentLink,
    notes: inspection.notes,
    createdAt: inspection.createdAt,
    updatedAt: inspection.updatedAt,
  };
};

// Inspections API
export const inspectionsApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Inspections", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const inspections = Array.isArray(response.data) ? response.data : [];
    return inspections.map(normalizeInspection);
  },
  getById: async (id: string, token: string) => {
    const response = await api.get(`/api/Inspections/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeInspection(response.data);
  },
  getByVehicle: async (vehicleId: string, token: string) => {
    const response = await api.get(`/api/Inspections/vehicle/${vehicleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const inspections = Array.isArray(response.data) ? response.data : [];
    return inspections.map(normalizeInspection);
  },
  getByType: async (inspectionType: string, token: string) => {
    const response = await api.get(`/api/Inspections/type/${inspectionType}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const inspections = Array.isArray(response.data) ? response.data : [];
    return inspections.map(normalizeInspection);
  },
  getUpcoming: async (daysAhead: number = 30, token: string) => {
    const response = await api.get(
      `/api/Inspections/upcoming?daysAhead=${daysAhead}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
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
    // Map frontend fields to backend DTO fields
    const backendData: any = {
      vehicleID: data.vehicleId ?? data.vehicleID,
      inspectionType: data.inspectionType,
      dueDate: data.dueDate,
      documentLink: data.documentLink,
      notes: data.notes,
    };
    // Remove frontend-specific fields if they exist
    delete backendData.vehicleId;
    delete backendData.id;
    delete backendData.inspectionID;

    const response = await api.post("/api/Inspections", backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeInspection(response.data);
  },
  update: async (id: string, data: any, token: string) => {
    // Map frontend fields to backend DTO fields
    const backendData: any = {};
    if (data.dueDate) backendData.dueDate = data.dueDate;
    if (data.completionDate) backendData.completionDate = data.completionDate;
    if (data.isCompliant !== undefined)
      backendData.isCompliant = data.isCompliant;
    if (data.documentLink !== undefined)
      backendData.documentLink = data.documentLink;
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

// Helper function to normalize parts inventory data from API
// Backend returns: partID, name, sku, quantityInStock, unitPrice, minimumStockLevel, supplier, description, isLowStock
const normalizePart = (part: any) => {
  if (!part) return part;

  const normalizeId = (id: any) => {
    if (id === null || id === undefined) return undefined;
    return typeof id === "string" ? id : id.toString();
  };

  return {
    ...part,
    id:
      normalizeId(part.id) ??
      normalizeId(part.partID) ??
      normalizeId(part.PartID) ??
      part.sku ??
      "",
    partID: normalizeId(part.partID) ?? normalizeId(part.PartID),
    // Map backend 'name' to frontend 'partName'
    partName: part.partName ?? part.name ?? part.Name ?? "",
    // Map backend 'sku' to frontend 'partNumber'
    partNumber: part.partNumber ?? part.sku ?? part.SKU ?? "",
    // Map backend 'quantityInStock' to frontend 'quantity'
    quantity: part.quantity ?? part.quantityInStock ?? part.QuantityInStock ?? 0,
    // Map backend 'minimumStockLevel' to frontend 'minStockLevel'
    minStockLevel:
      part.minStockLevel ??
      part.minimumStockLevel ??
      part.MinimumStockLevel ??
      0,
    // Map backend 'unitPrice' to frontend 'unitCost'
    unitCost: part.unitCost ?? part.unitPrice ?? part.UnitPrice ?? 0,
    // Include backend fields
    supplier: part.supplier ?? null,
    description: part.description ?? null,
    isLowStock: part.isLowStock ?? false,
  };
};

// Parts API
export const partsApi = {
  getAll: async (token: string) => {
    const response = await api.get("/api/Parts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const parts = Array.isArray(response.data) ? response.data : [];
    return parts.map(normalizePart);
  },
  create: async (data: any, token: string) => {
    // Map frontend fields to backend CreatePartRequest
    const backendData = {
      Name: data.partName ?? data.name ?? "",
      SKU: data.partNumber ?? data.sku ?? "",
      QuantityInStock: data.quantity ?? data.quantityInStock ?? 0,
      UnitPrice: data.unitCost ?? data.unitPrice ?? 0,
      MinimumStockLevel: data.minStockLevel ?? data.minimumStockLevel ?? null,
      Supplier: data.supplier ?? null,
      Description: data.description ?? null,
    };

    const response = await api.post("/api/Parts", backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizePart(response.data);
  },
  update: async (id: string | number, data: any, token: string) => {
    // Map frontend fields to backend UpdatePartRequest
    const backendData: any = {};
    if (data.partName !== undefined) backendData.Name = data.partName;
    if (data.partNumber !== undefined) backendData.SKU = data.partNumber;
    if (data.quantity !== undefined)
      backendData.QuantityInStock = data.quantity;
    if (data.unitCost !== undefined) backendData.UnitPrice = data.unitCost;
    if (data.minStockLevel !== undefined)
      backendData.MinimumStockLevel = data.minStockLevel;
    if (data.supplier !== undefined) backendData.Supplier = data.supplier;
    if (data.description !== undefined)
      backendData.Description = data.description;

    const response = await api.put(`/api/Parts/${id}`, backendData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizePart(response.data);
  },
  delete: async (id: string | number, token: string) => {
    // Backend expects DELETE /api/Parts/{id} where id is a Guid (UUID)
    await api.delete(`/api/Parts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
