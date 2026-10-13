import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, Eye, X, Mail, Phone, Building2 } from 'lucide-react';
import { contactService, customerService } from '../services/crmService';
import type { Contact, Customer, ContactFormData, Pagination } from '../types';
import { LoadingSpinner, ApiError, ConfirmModal } from '../components/ui';
import PaginationBar from '../components/ui';
import { formatDate, getErrorMessage } from '../utils/helpers';
import { toast } from '../hooks/useToast';

function ContactModal({
  isOpen, onClose, onSave, initial, customers
}: {
  isOpen: boolean; onClose: () => void;
  onSave: (data: ContactFormData) => Promise<void>;
  initial?: Partial<Contact>;
  customers: Customer[];
}) {
  const [form, setForm] = useState<ContactFormData>({
    customerId: initial?.customerId || '',
    name: initial?.name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    position: initial?.position || '',
    department: initial?.department || '',
    notes: initial?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({
      customerId: initial?.customerId || '',
      name: initial?.name || '',
      email: initial?.email || '',
      phone: initial?.phone || '',
      position: initial?.position || '',
      department: initial?.department || '',
      notes: initial?.notes || '',
    });
  }, [isOpen, initial?.id]);

  const set = (k: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); } finally { setLoading(false); }
  }

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-bold text-slate-800">{initial?.id ? 'Chỉnh sửa liên hệ' : 'Thêm người liên hệ'}</h3>
          <button onClick={onClose} className="btn-icon btn-ghost"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Khách hàng <span className="text-red-500">*</span></label>
              <select className="form-select" value={form.customerId} onChange={set('customerId')} required id="contact-customer">
                <option value="">-- Chọn khách hàng --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.customerCode})</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Họ và tên <span className="text-red-500">*</span></label>
              <input className="form-input" value={form.name} onChange={set('name')} required placeholder="Nhập họ và tên" id="contact-name" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email || ''} onChange={set('email')} placeholder="email@example.com" id="contact-email" />
            </div>
            <div>
              <label className="form-label">Số điện thoại</label>
              <input className="form-input" value={form.phone || ''} onChange={set('phone')} placeholder="0912 345 678" id="contact-phone" />
            </div>
            <div>
              <label className="form-label">Chức vụ</label>
              <input className="form-input" value={form.position || ''} onChange={set('position')} placeholder="Ví dụ: Giám đốc IT" id="contact-position" />
            </div>
            <div>
              <label className="form-label">Phòng ban</label>
              <input className="form-input" value={form.department || ''} onChange={set('department')} placeholder="Ví dụ: Phòng CNTT" id="contact-department" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Ghi chú</label>
              <textarea className="form-textarea" rows={3} value={form.notes || ''} onChange={set('notes')} placeholder="Ghi chú thêm..." id="contact-notes" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={loading} id="contact-save">
              {loading ? <><span className="spinner w-4 h-4 border-2 border-white/30 border-t-white" />Đang lưu...</> : (initial?.id ? 'Cập nhật' : 'Tạo liên hệ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [searchParams] = useSearchParams();
  const preCustomerId = searchParams.get('customerId') || '';
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState(preCustomerId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    customerService.getAll({ limit: 200 }).then(r => setCustomers(r.data.data)).catch(() => {});
  }, []);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (customerFilter) params.customerId = customerFilter;
      const res = await contactService.getAll(params);
      setContacts(res.data.data);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [search, customerFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: ContactFormData) => {
    try {
      if (editingContact?.id) {
        await contactService.update(editingContact.id, data);
        toast('success', 'Cập nhật người liên hệ thành công!');
      } else {
        await contactService.create(data);
        toast('success', 'Tạo người liên hệ thành công!');
      }
      setModalOpen(false);
      load();
    } catch (e) { toast('error', getErrorMessage(e)); throw e; }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await contactService.delete(deleteId);
      toast('success', 'Xóa người liên hệ thành công!');
      setDeleteId(null);
      load();
    } catch (e) { toast('error', getErrorMessage(e)); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="section-title">Người liên hệ</h1>
          <p className="section-subtitle">{pagination.total} người liên hệ trong hệ thống</p>
        </div>
        <button id="btn-add-contact" className="btn-primary" onClick={() => { setEditingContact(undefined); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Thêm liên hệ
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="search-wrapper flex-1">
          <Search className="search-icon" />
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, chức vụ..." id="contact-search" />
        </div>
        <select className="form-select w-48" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} id="contact-customer-filter">
          <option value="">Tất cả khách hàng</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : error ? <ApiError message={error} /> : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tên liên hệ</th>
                    <th>Chức vụ / Phòng ban</th>
                    <th>Khách hàng</th>
                    <th>Liên hệ</th>
                    <th>Ngày tạo</th>
                    <th className="text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr><td colSpan={6}>
                      <div className="empty-state">
                        <Building2 className="empty-icon" />
                        <p className="empty-title">Không có người liên hệ</p>
                        <p className="empty-desc">Thêm người liên hệ đầu tiên</p>
                      </div>
                    </td></tr>
                  ) : contacts.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800">{c.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-slate-700">{c.position || '—'}</div>
                        {c.department && <div className="text-xs text-slate-400">{c.department}</div>}
                      </td>
                      <td>
                        {c.customer ? (
                          <Link to={`/customers/${c.customer.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            {c.customer.name}
                          </Link>
                        ) : '—'}
                      </td>
                      <td>
                        {c.email && <div className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</div>}
                        {c.phone && <div className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</div>}
                      </td>
                      <td className="text-slate-400 text-sm">{formatDate(c.createdAt)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditingContact(c); setModalOpen(true); }} className="btn-icon btn-ghost text-slate-400 hover:text-amber-500" title="Chỉnh sửa" id={`btn-edit-contact-${c.id}`}>
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(c.id)} className="btn-icon btn-ghost text-slate-400 hover:text-red-500" title="Xóa" id={`btn-delete-contact-${c.id}`}>
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

      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editingContact} customers={customers} />
      <ConfirmModal isOpen={!!deleteId} title="Xóa người liên hệ"
        message="Bạn có chắc muốn xóa người liên hệ này?"
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)}
        loading={deleteLoading} confirmText="Xóa" />
    </div>
  );
}
