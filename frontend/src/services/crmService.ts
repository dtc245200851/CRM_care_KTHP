import api from './api';
import type { ApiResponse, Customer, CustomerFormData, Contact, ContactFormData, Interaction, InteractionFormData, DashboardStats, User } from '../types';

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password }),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customerService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<Customer[]>>('/customers', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Customer>>(`/customers/${id}`),
  create: (data: CustomerFormData) =>
    api.post<ApiResponse<Customer>>('/customers', data),
  update: (id: string, data: Partial<CustomerFormData>) =>
    api.put<ApiResponse<Customer>>(`/customers/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/customers/${id}`),
};

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const contactService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<Contact[]>>('/contacts', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Contact>>(`/contacts/${id}`),
  create: (data: ContactFormData) =>
    api.post<ApiResponse<Contact>>('/contacts', data),
  update: (id: string, data: Partial<ContactFormData>) =>
    api.put<ApiResponse<Contact>>(`/contacts/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/contacts/${id}`),
};

// ─── Interactions ─────────────────────────────────────────────────────────────
export const interactionService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<Interaction[]>>('/interactions', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Interaction>>(`/interactions/${id}`),
  create: (data: InteractionFormData) =>
    api.post<ApiResponse<Interaction>>('/interactions', data),
  update: (id: string, data: Partial<InteractionFormData>) =>
    api.put<ApiResponse<Interaction>>(`/interactions/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/interactions/${id}`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardService = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
};
