export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export type SortOrder = "asc" | "desc";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin";
  lastLoginAt?: string;
}

export interface Session {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
  createdAt: string;
  updatedAt: string;
}

export type DoctorInput = Pick<Doctor, "name" | "specialization" | "hospital" | "phone" | "email">;

export interface DoctorListParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  from?: string;
  to?: string;
  sortBy?: "createdAt" | "name" | "patientCount";
  order?: SortOrder;
}

export interface DoctorFilterOptions {
  specializations: string[];
  hospitals: string[];
}

export const PATIENT_CONDITIONS = ["stable", "critical", "recovering", "under_observation", "discharged"] as const;
export type PatientCondition = (typeof PATIENT_CONDITIONS)[number];

export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  condition: PatientCondition;
  diagnosis?: string;
  doctor: Pick<Doctor, "_id" | "name" | "specialization" | "hospital"> | string;
  admittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientInput {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  condition: PatientCondition;
  diagnosis?: string;
  admittedAt?: string;
}

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: PatientCondition;
  gender?: Gender;
  from?: string;
  to?: string;
  sortBy?: "admittedAt" | "name" | "age" | "createdAt";
  order?: SortOrder;
}

export type DashboardRange = 7 | 30 | 90 | 180 | 365;

export interface DashboardStats {
  range: { from: string; to: string; days: number; granularity: "day" | "month" };
  summary: {
    totalDoctors: number;
    totalPatients: number;
    avgPatientsPerDoctor: number;
    criticalPatients: number;
    newPatients: number;
    newPatientsChange: number;
    newDoctors: number;
  };
  trend: { date: string; patients: number; doctors: number }[];
  patientsPerDoctor: { id: string; name: string; specialization: string; patients: number }[];
  patientsByCondition: { condition: PatientCondition; count: number }[];
  specializations: { specialization: string; doctors: number; patients: number }[];
}
