import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit3, Trash2, Eye, ArrowUpDown, X, Building2, Phone, Mail } from 'lucide-react';
import { customerService } from '../services/crmService';
import type { Customer, CustomerStatus, CustomerSource, CustomerFormData, Pagination } from '../types';
import { LoadingSpinner, ApiError, ConfirmModal } from '../components/ui';
import PaginationBar from '../components/ui';
import {
  formatDate, getCustomerStatusClass, CUSTOMER_STATUS_LABELS,
  CUSTOMER_SOURCE_LABELS, getErrorMessage
} from '../utils/helpers';
import { toast } from '../hooks/useToast';

const STATUSES: CustomerStatus[] = ['ACTIVE', 'INACTIVE', 'PROSPECT', 'CHURNED'];
const SOURCES: CustomerSource[] = ['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'EMAIL_CAMPAIGN', 'COLD_CALL', 'EVENT', 'OTHER'];

function CustomerModal({
  isOpen, onClose, onSave, initial
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomerFormData) => Promise<void>;
  initial?: Partial<Customer>;
}) {
  const [form, setForm] = useState<CustomerFormData>({
    name: initial?.name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    company: initial?.company || '',
    address: initial?.address || '',
    status: initial?.status || 'PROSPECT',
    source: initial?.source || 'OTHER',
    notes: initial?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: initial?.name || '',
        email: initial?.email || '',
        phone: initial?.phone || '',
        company: initial?.company || '',
        address: initial?.address || '',
        status: initial?.status || 'PROSPECT',
        source: initial?.source || 'OTHER',
        notes: initial?.notes || '',
      });
    }
  }, [isOpen, initial?.id]);

  const set = (k: keyof CustomerFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-bold text-slate-800">
            {initial?.id ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
          </h3>
          <button onClick={onClose} className="btn-icon btn-ghost"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Tên khách hàng <span className="text-red-500">*</span></label>
              <input className="form-input" value={form.name} onChange={set('name')} required placeholder="Nhập tên khách hàng" id="cust-name" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email || ''} onChange={set('email')} placeholder="email@example.com" id="cust-email" />
            </div>
            <div>
              <label className="form-label">Số điện thoại</label>
              <input className="form-input" value={form.phone || ''} onChange={set('phone')} placeholder="0912 345 678" id="cust-phone" />
            </div>
            <div>
              <label className="form-label">Công ty</label>
              <input className="form-input" value={form.company || ''} onChange={set('company')} placeholder="Tên công ty" id="cust-company" />
            </div>
            <div>
              <label className="form-label">Nguồn khách hàng</label>
              <select className="form-select" value={form.source} onChange={set('source')} id="cust-source">
                {SOURCES.map(s => <option key={s} value={s}>{CUSTOMER_SOURCE_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Trạng thái</label>
              <select className="form-select" value={form.status} onChange={set('status')} id="cust-status">
                {STATUSES.map(s => <option key={s} value={s}>{CUSTOMER_STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Địa chỉ</label>
              <input className="form-input" value={form.address || ''} onChange={set('address')} placeholder="Địa chỉ" id="cust-address" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Ghi chú</label>
              <textarea className="form-textarea" rows={3} value={form.notes || ''} onChange={set('notes')} placeholder="Ghi chú thêm..." id="cust-notes" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={loading} id="cust-save">
              {loading ? <><span className="spinner w-4 h-4 border-2 border-white/30 border-t-white" />Đang lưu...</> : (initial?.id ? 'Cập nhật' : 'Tạo khách hàng')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10, sortBy, sortOrder };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await customerService.getAll(params);
      setCustomers(res.data.data);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, sortOrder]);

  useEffect(() => { load(); }, [load]);

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const handleSave = async (data: CustomerFormData) => {
    try {
      if (editingCustomer?.id) {
        await customerService.update(editingCustomer.id, data);
        toast('success', 'Cập nhật khách hàng thành công!');
      } else {
        await customerService.create(data);
        toast('success', 'Tạo khách hàng thành công!');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast('error', getErrorMessage(e));
      throw e;
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await customerService.delete(deleteId);
      toast('success', 'Xóa khách hàng thành công!');
      setDeleteId(null);
      load();
    } catch (e) {
      toast('error', getErrorMessage(e));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Khách hàng</h1>
          <p className="section-subtitle">{pagination.total} khách hàng trong hệ thống</p>
        </div>
        <button id="btn-add-customer" className="btn-primary" onClick={() => { setEditingCustomer(undefined); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Thêm khách hàng
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="search-wrapper flex-1">
          <Search className="search-icon" />
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, công ty, mã KH..."
            id="customer-search"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select className="form-select w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} id="customer-status-filter">
            <option value="">Tất cả trạng thái</option>
            {STATUSES.map(s => <option key={s} value={s}>{CUSTOMER_STATUS_LABELS[s]}</option>)}
          </select>
          {statusFilter && (
            <button onClick={() => setStatusFilter('')} className="btn-icon btn-ghost">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ApiError message={error} />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã KH</th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => handleSort('name')}>
                        Tên khách hàng <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th>Công ty</th>
                    <th>Liên hệ</th>
                    <th>Trạng thái</th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => handleSort('createdAt')}>
                        Ngày tạo <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <Building2 className="empty-icon" />
                          <p className="empty-title">Không có khách hàng</p>
                          <p className="empty-desc">Hãy thêm khách hàng đầu tiên để bắt đầu</p>
                        </div>
                      </td>
                    </tr>
                  ) : customers.map(c => (
                    <tr key={c.id}>
                      <td className="font-mono text-xs text-slate-400">{c.customerCode}</td>
                      <td>
                        <Link to={`/customers/${c.id}`} className="font-semibold text-slate-800 hover:text-primary-600 transition-colors">
                          {c.name}
                        </Link>
                        {c.email && <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{c.email}</div>}
                        {c.phone && <div className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</div>}
                      </td>
                      <td className="text-slate-500">{c.company || '—'}</td>
                      <td>
                        <span className="text-xs text-slate-500">{c._count?.contacts || 0} liên hệ</span>
                      </td>
                      <td><span className={getCustomerStatusClass(c.status)}>{CUSTOMER_STATUS_LABELS[c.status]}</span></td>
                      <td className="text-slate-400 text-sm">{formatDate(c.createdAt)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/customers/${c.id}`} className="btn-icon btn-ghost text-slate-400 hover:text-blue-500" title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => { setEditingCustomer(c); setModalOpen(true); }} className="btn-icon btn-ghost text-slate-400 hover:text-amber-500" title="Chỉnh sửa" id={`btn-edit-${c.id}`}>
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(c.id)} className="btn-icon btn-ghost text-slate-400 hover:text-red-500" title="Xóa" id={`btn-delete-${c.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar pagination={pagination} onPageChange={load} />
          </>
        )}
      </div>

      <CustomerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editingCustomer}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        title="Xóa khách hàng"
        message="Bạn có chắc chắn muốn xóa khách hàng này? Hành động này không thể khôi phục và sẽ xóa tất cả liên hệ, tương tác liên quan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
        confirmText="Xóa"
      />
    </div>
  );
}
