// ─── User Types ───────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Customer Types ────────────────────────────────────────────────────────────
export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'CHURNED';
export type CustomerSource = 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'EMAIL_CAMPAIGN' | 'COLD_CALL' | 'EVENT' | 'OTHER';

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  status: CustomerStatus;
  source: CustomerSource;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    contacts: number;
    interactions: number;
  };
  contacts?: Contact[];
  interactions?: Interaction[];
}

// ─── Contact Types ─────────────────────────────────────────────────────────────
export interface Contact {
  id: string;
  customerId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    company?: string | null;
    customerCode: string;
  };
  _count?: {
    interactions: number;
  };
}

// ─── Interaction Types ─────────────────────────────────────────────────────────
export type InteractionType = 'CALL' | 'EMAIL' | 'MEETING' | 'SUPPORT' | 'OTHER';
export type InteractionStatus = 'PLANNED' | 'COMPLETED' | 'CANCELLED' | 'FOLLOW_UP';

export interface Interaction {
  id: string;
  customerId: string;
  contactId?: string | null;
  userId: string;
  interactionType: InteractionType;
  title: string;
  content?: string | null;
  interactionDate: string;
  status: InteractionStatus;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    company?: string | null;
    customerCode: string;
  };
  contact?: {
    id: string;
    name: string;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// ─── API Response Types ────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Dashboard Types ───────────────────────────────────────────────────────────
export interface DashboardStats {
  summary: {
    totalCustomers: number;
    totalContacts: number;
    totalInteractions: number;
    newCustomers30d: number;
    newCustomers7d: number;
  };
  customersByStatus: Array<{ status: CustomerStatus; count: number }>;
  interactionsByType: Array<{ type: InteractionType; count: number }>;
  interactionsByDay: Array<{ date: string; count: number }>;
  recentInteractions: Interaction[];
  recentCustomers: Customer[];
}

// ─── Form Types ────────────────────────────────────────────────────────────────
export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  status?: CustomerStatus;
  source?: CustomerSource;
  notes?: string;
}

export interface ContactFormData {
  customerId: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  notes?: string;
}

export interface InteractionFormData {
  customerId: string;
  contactId?: string;
  interactionType: InteractionType;
  title: string;
  content?: string;
  interactionDate: string;
  status?: InteractionStatus;
}
