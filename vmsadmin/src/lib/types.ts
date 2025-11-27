export interface User {
  id: string;
  userID?: string;
  username: string;
  email: string;
  fullName?: string;
  role: "Admin";
  token?: string;
}

export interface Vehicle {
  id: string;
  vehicleID?: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  mileage: number;
  currentMileage?: number;
  status: "Available" | "InUse" | "UnderMaintenance" | "OutOfService";
  lastServiceDate?: string;
  nextServiceDue?: string;
  assignedDriverID?: string | null;
  assignedDriverName?: string | null;
  color?: string | null;
  purchaseDate?: string | null;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  startDate: string;
  endDate?: string;
  startMileage: number;
  endMileage?: number;
  fuelUsed?: number;
  purpose: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  maintenanceType: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  mechanicId?: string;
  status: "Scheduled" | "InProgress" | "Completed" | "Cancelled";
}

export interface Inspection {
  id: string;
  inspectionID?: string;
  vehicleId: string;
  vehicleID?: string;
  vehicleInfo?: string;
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
  inspectionID: string;
  vehicleID: string;
  vehicleInfo: string;
  inspectionType: string;
  dueDate: string;
  daysUntilDue: number;
  isOverdue: boolean;
}
