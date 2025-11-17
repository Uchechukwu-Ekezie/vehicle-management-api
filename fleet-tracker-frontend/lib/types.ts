export interface User {
  id: string; // UUID as string
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
  fullName: string;
  password: string;
  role: string;
}

export interface Vehicle {
  id: string; // UUID as string
  vehicleID?: string; // API may return this (UUID)
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
  assignedDriverID?: string | null; // UUID as string
  assignedDriverName?: string | null;
  color?: string | null;
  purchaseDate?: string | null;
}

export interface Trip {
  id: string; // UUID as string
  vehicleId: string; // UUID as string
  driverId: string; // UUID as string
  startDate: string;
  endDate?: string;
  startMileage: number;
  endMileage?: number;
  fuelUsed?: number;
  purpose: string;
}

export interface MaintenanceRecord {
  id: string; // UUID as string
  vehicleId: string; // UUID as string
  maintenanceType: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  mechanicId?: string; // UUID as string
  status: "Scheduled" | "InProgress" | "Completed" | "Cancelled";
}

export interface Issue {
  id: string; // UUID as string
  vehicleId: string; // UUID as string
  reportedById: string; // UUID as string
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "InProgress" | "Resolved" | "Closed";
  reportedDate: string;
  resolvedDate?: string;
}

export interface PartsInventory {
  id: string; // UUID as string
  partName: string;
  partNumber: string;
  quantity: number;
  minStockLevel: number;
  unitCost: number;
  supplierId?: string; // UUID as string
}

export interface Inspection {
  id: string; // UUID as string
  inspectionID?: string; // API may return this (UUID)
  vehicleId: string; // UUID as string
  vehicleID?: string; // API may return this (UUID)
  vehicleInfo?: string; // API may return this (Make Model - LicensePlate)
  inspectionType: "MOT" | "Insurance" | "Tax" | "Safety";
  dueDate: string;
  completionDate?: string;
  isCompliant: boolean;
  documentLink?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InspectionAlert {
  inspectionID: string; // UUID as string
  vehicleID: string; // UUID as string
  vehicleInfo: string;
  inspectionType: string;
  dueDate: string;
  daysUntilDue: number;
  isOverdue: boolean;
}
