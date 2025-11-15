export interface User {
  id: number;
  userID?: string; // UUID from backend
  username: string;
  email: string;
  fullName?: string;
  role: "Admin" | "Driver" | "Mechanic" | "Finance";
  token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface Vehicle {
  id: number;
  vehicleID?: number; // API may return this
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  mileage: number;
  currentMileage?: number; // API may return this instead of mileage
  status: "Available" | "InUse" | "UnderMaintenance" | "OutOfService";
  lastServiceDate?: string;
  nextServiceDue?: string;
  assignedDriverID?: number | null;
  assignedDriverName?: string | null;
  color?: string | null;
  purchaseDate?: string | null;
}

export interface Trip {
  id: number;
  vehicleId: number;
  driverId: number;
  startDate: string;
  endDate?: string;
  startMileage: number;
  endMileage?: number;
  fuelUsed?: number;
  purpose: string;
}

export interface MaintenanceRecord {
  id: number;
  vehicleId: number;
  maintenanceType: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  mechanicId?: number;
  status: "Scheduled" | "InProgress" | "Completed" | "Cancelled";
}

export interface Issue {
  id: number;
  vehicleId: number;
  reportedById: number;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "InProgress" | "Resolved" | "Closed";
  reportedDate: string;
  resolvedDate?: string;
}

export interface PartsInventory {
  id: number;
  partName: string;
  partNumber: string;
  quantity: number;
  minStockLevel: number;
  unitCost: number;
  supplierId?: number;
}
