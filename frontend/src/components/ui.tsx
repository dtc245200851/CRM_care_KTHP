import { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pagination } from '../types';

interface PaginationProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export default function PaginationBar({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100">
      <p className="text-sm text-slate-500">
        Hiển thị <span className="font-medium">{start}–{end}</span> trong <span className="font-medium">{total}</span> bản ghi
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn-icon btn-sm btn-ghost disabled:opacity-40"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages[0] > 1 && (
          <>
            <PageBtn n={1} current={page} onClick={onPageChange} />
            {pages[0] > 2 && <span className="px-1 text-slate-400">…</span>}
          </>
        )}

        {pages.map(n => <PageBtn key={n} n={n} current={page} onClick={onPageChange} />)}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
            <PageBtn n={totalPages} current={page} onClick={onPageChange} />
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="btn-icon btn-sm btn-ghost disabled:opacity-40"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PageBtn({ n, current, onClick }: { n: number; current: number; onClick: (n: number) => void }) {
  return (
    <button
      onClick={() => onClick(n)}
      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
        n === current
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {n}
    </button>
  );
}

// Loading component
export function LoadingSpinner({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="spinner w-10 h-10 border-3" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isDanger?: boolean;
}

export function ConfirmModal({
  isOpen, title, message, onConfirm, onCancel, loading, confirmText = 'Xác nhận', cancelText = 'Hủy', variant = 'danger', isDanger
}: ConfirmModalProps) {
  if (!isOpen) return null;
  const isDangerMode = isDanger || variant === 'danger';
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <div className="modal-body">
          <p className="text-slate-600 text-sm">{message}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={isDangerMode ? 'btn-danger' : 'btn-primary'}
          >
            {loading ? <><span className="spinner w-4 h-4 border-2 border-white/30 border-t-white" />{confirmText}...</> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Error message component
export function ApiError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
        <span className="text-3xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-700">Không thể kết nối</h3>
      <p className="text-sm text-slate-500 max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-2">
          Thử lại
        </button>
      )}
    </div>
  );
}
