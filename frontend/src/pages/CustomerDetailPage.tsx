import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit3, Trash2, Mail, Phone, Building2, MapPin,
  MessageSquare, UserCheck, Calendar, Globe, Plus
} from 'lucide-react';
import { customerService, interactionService } from '../services/crmService';
import type { Customer } from '../types';
import { LoadingSpinner, ApiError, ConfirmModal } from '../components/ui';
import {
  formatDate, formatDateTime, getCustomerStatusClass, CUSTOMER_STATUS_LABELS,
  CUSTOMER_SOURCE_LABELS, getInteractionTypeClass, INTERACTION_TYPE_LABELS,
  INTERACTION_STATUS_LABELS, getErrorMessage
} from '../utils/helpers';
import { toast } from '../hooks/useToast';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'interactions'>('contacts');

  useEffect(() => {
    if (!id) return;
    customerService.getById(id)
      .then(r => setCustomer(r.data.data))
      .catch(e => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await customerService.delete(id);
      toast('success', 'Xóa khách hàng thành công!');
      navigate('/customers');
    } catch (e) {
      toast('error', getErrorMessage(e));
      setDeleteLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải thông tin khách hàng..." />;
  if (error) return <ApiError message={error} />;
  if (!customer) return <ApiError message="Không tìm thấy khách hàng" />;

  return (
    <div className="space-y-5">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link to="/customers" className="btn-ghost text-slate-500">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Link>
        <div className="flex items-center gap-2">
          <Link to={`/customers/${id}/edit`} className="btn-secondary">
            <Edit3 className="w-4 h-4" /> Chỉnh sửa
          </Link>
          <button onClick={() => setDeleteOpen(true)} className="btn-danger btn-sm">
            <Trash2 className="w-4 h-4" /> Xóa
          </button>
        </div>
      </div>

      {/* Main info */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="card p-6 xl:col-span-1">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-gradient-brand rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
              {customer.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{customer.name}</h2>
            <p className="text-slate-500 text-sm mt-1">{customer.company || 'Không có công ty'}</p>
            <div className="mt-3">
              <span className={getCustomerStatusClass(customer.status)}>{CUSTOMER_STATUS_LABELS[customer.status]}</span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded font-medium">{customer.customerCode}</span>
              <span className="text-slate-400">Mã khách hàng</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <a href={`mailto:${customer.email}`} className="hover:text-primary-600 truncate">{customer.email}</a>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <a href={`tel:${customer.phone}`} className="hover:text-primary-600">{customer.phone}</a>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{customer.address}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-600">
              <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{CUSTOMER_SOURCE_LABELS[customer.source]}</span>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Ghi chú</p>
              <p className="text-sm text-slate-600 leading-relaxed">{customer.notes}</p>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-800">{customer._count?.contacts || 0}</p>
              <p className="text-xs text-slate-400">Liên hệ</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{customer._count?.interactions || 0}</p>
              <p className="text-xs text-slate-400">Tương tác</p>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Ngày tạo</span>
              <span className="font-medium">{formatDate(customer.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cập nhật</span>
              <span className="font-medium">{formatDate(customer.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Tabs: Contacts + Interactions */}
        <div className="card xl:col-span-2">
          {/* Tab header */}
          <div className="flex items-center border-b border-slate-100 px-5">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'contacts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Người liên hệ ({customer._count?.contacts || 0})
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'interactions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Tương tác ({customer._count?.interactions || 0})
            </button>
            <div className="ml-auto py-3">
              <Link
                to={activeTab === 'contacts' ? `/contacts?customerId=${id}` : `/interactions?customerId=${id}`}
                className="btn-primary btn-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm mới
              </Link>
            </div>
          </div>

          {/* Tab content */}
          <div className="p-5">
            {activeTab === 'contacts' && (
              <div className="space-y-3">
                {!customer.contacts || customer.contacts.length === 0 ? (
                  <div className="empty-state">
                    <UserCheck className="empty-icon" />
                    <p className="empty-title">Chưa có người liên hệ</p>
                    <p className="empty-desc">Thêm người liên hệ đầu tiên cho khách hàng này</p>
                  </div>
                ) : customer.contacts.map(c => (
                  <div key={c.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800">{c.name}</p>
                      {c.position && <p className="text-sm text-slate-500">{c.position} {c.department ? `· ${c.department}` : ''}</p>}
                      {c.email && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</p>}
                      {c.phone && <p className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>}
                    </div>
                    <Link to={`/contacts/${c.id}`} className="btn-ghost btn-sm text-primary-600">Chi tiết</Link>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'interactions' && (
              <div className="space-y-3">
                {!customer.interactions || customer.interactions.length === 0 ? (
                  <div className="empty-state">
                    <MessageSquare className="empty-icon" />
                    <p className="empty-title">Chưa có tương tác</p>
                    <p className="empty-desc">Ghi lại tương tác đầu tiên với khách hàng này</p>
                  </div>
                ) : customer.interactions.map(interaction => (
                  <Link
                    key={interaction.id}
                    to={`/interactions/${interaction.id}`}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors block"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getInteractionTypeClass(interaction.interactionType)}`}>
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800">{interaction.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={getInteractionTypeClass(interaction.interactionType)}>
                          {INTERACTION_TYPE_LABELS[interaction.interactionType]}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDateTime(interaction.interactionDate)}
                        </span>
                      </div>
                      {interaction.user && (
                        <p className="text-xs text-slate-400 mt-1">Phụ trách: {(interaction as any).user.name}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        title="Xóa khách hàng"
        message={`Bạn có chắc chắn muốn xóa khách hàng "${customer.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteLoading}
        confirmText="Xóa"
      />
    </div>
  );
}
