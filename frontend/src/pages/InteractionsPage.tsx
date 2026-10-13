import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Edit3, Trash2, Phone, Mail, Video, HeadphonesIcon,
  Calendar, CheckCircle, Clock, AlertTriangle, XCircle, Filter, X, Building2
} from 'lucide-react';
import { interactionService, customerService, contactService } from '../services/crmService';
import type {
  Interaction, Customer, Contact, InteractionType, InteractionStatus,
  InteractionFormData, Pagination
} from '../types';
import { LoadingSpinner, ApiError, ConfirmModal } from '../components/ui';
import PaginationBar from '../components/ui';
import {
  formatDateTime, formatDateForInput,
  INTERACTION_TYPE_LABELS, INTERACTION_STATUS_LABELS,
  getInteractionTypeClass, getErrorMessage
} from '../utils/helpers';
import { toast } from '../hooks/useToast';

const TYPES: InteractionType[] = ['CALL', 'EMAIL', 'MEETING', 'SUPPORT', 'OTHER'];
const STATUSES: InteractionStatus[] = ['PLANNED', 'COMPLETED', 'FOLLOW_UP', 'CANCELLED'];

export function getInteractionStatusClass(status: InteractionStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'PLANNED':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'FOLLOW_UP':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function getTypeIcon(type: InteractionType) {
  switch (type) {
    case 'CALL':
      return <Phone className="w-4 h-4 text-blue-500" />;
    case 'EMAIL':
      return <Mail className="w-4 h-4 text-emerald-500" />;
    case 'MEETING':
      return <Video className="w-4 h-4 text-purple-500" />;
    case 'SUPPORT':
      return <HeadphonesIcon className="w-4 h-4 text-amber-500" />;
    default:
      return <Clock className="w-4 h-4 text-slate-500" />;
  }
}

function InteractionModal({
  isOpen,
  onClose,
  onSave,
  initial,
  customers,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InteractionFormData) => Promise<void>;
  initial?: Partial<Interaction>;
  customers: Customer[];
}) {
  const [form, setForm] = useState<InteractionFormData>({
    customerId: initial?.customerId || '',
    contactId: initial?.contactId || undefined,
    interactionType: initial?.interactionType || 'CALL',
    title: initial?.title || '',
    content: initial?.content || '',
    interactionDate: initial?.interactionDate
      ? formatDateForInput(initial.interactionDate)
      : formatDateForInput(new Date()),
    status: initial?.status || 'COMPLETED',
  });
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        customerId: initial?.customerId || (customers[0]?.id ?? ''),
        contactId: initial?.contactId || undefined,
        interactionType: initial?.interactionType || 'CALL',
        title: initial?.title || '',
        content: initial?.content || '',
        interactionDate: initial?.interactionDate
          ? formatDateForInput(initial.interactionDate)
          : formatDateForInput(new Date()),
        status: initial?.status || 'COMPLETED',
      });
    }
  }, [isOpen, initial, customers]);

  // Load contacts when customer changes
  useEffect(() => {
    if (form.customerId) {
      setLoadingContacts(true);
      contactService.getAll({ customerId: form.customerId, limit: 100 })
        .then(res => setAvailableContacts(res.data.data))
        .catch(() => setAvailableContacts([]))
        .finally(() => setLoadingContacts(false));
    } else {
      setAvailableContacts([]);
    }
  }, [form.customerId]);

  const handleChange = (
    field: keyof InteractionFormData,
    value: string | undefined
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) {
      toast('error', 'Vui lòng chọn khách hàng');
      return;
    }
    if (!form.title.trim()) {
      toast('error', 'Vui lòng nhập tiêu đề tương tác');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(form);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800">
            {initial?.id ? 'Chỉnh sửa tương tác' : 'Ghi nhận tương tác mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Khách hàng <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.customerId}
              onChange={e => {
                handleChange('customerId', e.target.value);
                handleChange('contactId', undefined);
              }}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Chọn khách hàng --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Người liên hệ đại diện (Tùy chọn)
            </label>
            <select
              value={form.contactId || ''}
              onChange={e => handleChange('contactId', e.target.value)}
              disabled={loadingContacts || !form.customerId}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
            >
              <option value="">-- Không chỉ định --</option>
              {availableContacts.map(ct => (
                <option key={ct.id} value={ct.id}>
                  {ct.name} {ct.position ? `– ${ct.position}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kênh tương tác
              </label>
              <select
                value={form.interactionType}
                onChange={e => handleChange('interactionType', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {TYPES.map(t => (
                  <option key={t} value={t}>
                    {INTERACTION_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Trạng thái
              </label>
              <select
                value={form.status || 'COMPLETED'}
                onChange={e => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {INTERACTION_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Thời gian tương tác
            </label>
            <input
              type="datetime-local"
              value={form.interactionDate}
              onChange={e => handleChange('interactionDate', e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tiêu đề / Chủ đề <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Gọi điện trao đổi báo giá giải pháp CRM"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nội dung chi tiết / Ghi chú
            </label>
            <textarea
              rows={3}
              placeholder="Nội dung thảo luận, yêu cầu của khách, cam kết tiếp theo..."
              value={form.content || ''}
              onChange={e => handleChange('content', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : initial?.id ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InteractionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId') || '';

  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(customerIdParam);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load customers for dropdown
  useEffect(() => {
    customerService.getAll({ limit: 100 })
      .then(res => setCustomers(res.data.data))
      .catch(console.error);
  }, []);

  const fetchInteractions = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = {
        page,
        limit: pagination.limit,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCustomer) params.customerId = selectedCustomer;
      if (selectedType !== 'ALL') params.type = selectedType;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const res = await interactionService.getAll(params);
      setInteractions(res.data.data);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, selectedCustomer, selectedType, selectedStatus, pagination.limit]);

  useEffect(() => {
    fetchInteractions(1);
  }, [fetchInteractions]);

  const handleSaveInteraction = async (data: InteractionFormData) => {
    try {
      if (selectedInteraction) {
        await interactionService.update(selectedInteraction.id, data);
        toast('success', 'Cập nhật tương tác thành công');
      } else {
        await interactionService.create(data);
        toast('success', 'Tạo tương tác mới thành công');
      }
      setModalOpen(false);
      setSelectedInteraction(null);
      fetchInteractions(pagination.page);
    } catch (err) {
      toast('error', getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await interactionService.delete(deletingId);
      toast('success', 'Xóa tương tác thành công');
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      fetchInteractions(pagination.page);
    } catch (err) {
      toast('error', getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Lịch sử Tương tác
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi mọi cuộc gọi, email, buổi họp và hỗ trợ khách hàng
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedInteraction(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 ease-in-out active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận tương tác</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, ghi chú..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Customer filter */}
          <div>
            <select
              value={selectedCustomer}
              onChange={e => {
                setSelectedCustomer(e.target.value);
                if (e.target.value) {
                  setSearchParams({ customerId: e.target.value });
                } else {
                  setSearchParams({});
                }
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Tất cả khách hàng --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">-- Tất cả kênh --</option>
              {TYPES.map(t => (
                <option key={t} value={t}>
                  {INTERACTION_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">-- Tất cả trạng thái --</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {INTERACTION_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(search || selectedCustomer || selectedType !== 'ALL' || selectedStatus !== 'ALL') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Đang lọc:</span>
            {selectedCustomer && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                Khách: {customers.find(c => c.id === selectedCustomer)?.name}
                <button onClick={() => { setSelectedCustomer(''); setSearchParams({}); }}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                </button>
              </span>
            )}
            {selectedType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                Loại: {INTERACTION_TYPE_LABELS[selectedType as InteractionType]}
                <button onClick={() => setSelectedType('ALL')}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                </button>
              </span>
            )}
            {selectedStatus !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                Trạng thái: {INTERACTION_STATUS_LABELS[selectedStatus as InteractionStatus]}
                <button onClick={() => setSelectedStatus('ALL')}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch('');
                setSelectedCustomer('');
                setSelectedType('ALL');
                setSelectedStatus('ALL');
                setSearchParams({});
              }}
              className="text-primary-600 hover:text-primary-700 font-medium ml-auto"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Đang tải lịch sử tương tác..." />
      ) : error ? (
        <ApiError message={error} onRetry={() => fetchInteractions(pagination.page)} />
      ) : interactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-700">Không có tương tác nào</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Chưa có ghi nhận tương tác nào phù hợp với bộ lọc hiện tại.
          </p>
          <button
            onClick={() => {
              setSelectedInteraction(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Tạo tương tác đầu tiên
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Kênh</th>
                  <th className="py-3 px-4">Tiêu đề & Nội dung</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Người liên hệ</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {interactions.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-slate-100 rounded-lg">
                          {getTypeIcon(item.interactionType)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getInteractionTypeClass(item.interactionType)}`}>
                          {INTERACTION_TYPE_LABELS[item.interactionType]}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-900 line-clamp-1">
                        {item.title}
                      </div>
                      {item.content && (
                        <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {item.content}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.customer ? (
                        <Link
                          to={`/customers/${item.customer.id}`}
                          className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          {item.customer.name}
                        </Link>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                      {item.contact ? (
                        item.contact.name
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                      {formatDateTime(item.interactionDate)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getInteractionStatusClass(item.status)}`}>
                        {INTERACTION_STATUS_LABELS[item.status]}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedInteraction(item);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Sửa tương tác"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(item.id);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa tương tác"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationBar
            pagination={pagination}
            onPageChange={page => fetchInteractions(page)}
          />
        </div>
      )}

      {/* Modal create/edit */}
      <InteractionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedInteraction(null);
        }}
        onSave={handleSaveInteraction}
        initial={selectedInteraction || (selectedCustomer ? { customerId: selectedCustomer } : undefined)}
        customers={customers}
      />

      {/* Confirm delete modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Xác nhận xóa tương tác"
        message="Hành động này sẽ xóa vĩnh viễn bản ghi tương tác và không thể hoàn tác. Bạn có chắc chắn muốn xóa?"
        confirmText="Xóa bản ghi"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        }}
      />
    </div>
  );
}
