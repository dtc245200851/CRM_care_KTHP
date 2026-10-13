import type { CustomerStatus, CustomerSource, InteractionType, InteractionStatus } from '../types';

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Không hoạt động',
  PROSPECT: 'Tiềm năng',
  CHURNED: 'Đã rời bỏ',
};

export const CUSTOMER_SOURCE_LABELS: Record<CustomerSource, string> = {
  WEBSITE: 'Website',
  REFERRAL: 'Giới thiệu',
  SOCIAL_MEDIA: 'Mạng xã hội',
  EMAIL_CAMPAIGN: 'Email marketing',
  COLD_CALL: 'Gọi điện trực tiếp',
  EVENT: 'Sự kiện',
  OTHER: 'Khác',
};

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  CALL: 'Gọi điện',
  EMAIL: 'Email',
  MEETING: 'Gặp mặt',
  SUPPORT: 'Hỗ trợ',
  OTHER: 'Khác',
};

export const INTERACTION_STATUS_LABELS: Record<InteractionStatus, string> = {
  PLANNED: 'Đã lên kế hoạch',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  FOLLOW_UP: 'Cần theo dõi',
};

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateForInput(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || 'Đã có lỗi xảy ra';
  }
  if (error instanceof Error) return error.message;
  return 'Đã có lỗi xảy ra';
}

export const getCustomerStatusClass = (status: CustomerStatus): string => {
  const map: Record<CustomerStatus, string> = {
    ACTIVE: 'status-active',
    INACTIVE: 'status-inactive',
    PROSPECT: 'status-prospect',
    CHURNED: 'status-churned',
  };
  return map[status] || 'badge bg-slate-100 text-slate-600';
};

export const getInteractionTypeClass = (type: InteractionType): string => {
  const map: Record<InteractionType, string> = {
    CALL: 'type-call',
    EMAIL: 'type-email',
    MEETING: 'type-meeting',
    SUPPORT: 'type-support',
    OTHER: 'type-other',
  };
  return map[type] || 'badge bg-slate-100 text-slate-600';
};
