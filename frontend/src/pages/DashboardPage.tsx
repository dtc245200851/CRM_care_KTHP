import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, MessageSquare, TrendingUp,
  ArrowUpRight, Phone, Mail, Video, HeadphonesIcon,
  Calendar, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { dashboardService } from '../services/crmService';
import type { DashboardStats } from '../types';
import { LoadingSpinner, ApiError } from '../components/ui';
import { formatDate, getCustomerStatusClass, CUSTOMER_STATUS_LABELS, INTERACTION_TYPE_LABELS, getInteractionTypeClass } from '../utils/helpers';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e',
  INACTIVE: '#94a3b8',
  PROSPECT: '#3b82f6',
  CHURNED: '#ef4444',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  CALL: <Phone className="w-4 h-4" />,
  EMAIL: <Mail className="w-4 h-4" />,
  MEETING: <Video className="w-4 h-4" />,
  SUPPORT: <HeadphonesIcon className="w-4 h-4" />,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getStats()
      .then(r => setStats(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Đang tải dữ liệu tổng quan..." />;
  if (error) return <ApiError message={error} />;
  if (!stats) return null;

  const { summary, customersByStatus, interactionsByType, interactionsByDay, recentInteractions, recentCustomers } = stats;

  const statCards = [
    {
      label: 'Tổng khách hàng', value: summary.totalCustomers, icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-50 text-blue-600', sub: `+${summary.newCustomers7d} tuần này`, trend: true,
    },
    {
      label: 'Người liên hệ', value: summary.totalContacts, icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-green-50 text-green-600', sub: 'Đang hoạt động', trend: false,
    },
    {
      label: 'Lượt tương tác', value: summary.totalInteractions, icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-purple-50 text-purple-600', sub: 'Tổng cộng', trend: false,
    },
    {
      label: 'Khách hàng mới', value: summary.newCustomers30d, icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-orange-50 text-orange-600', sub: '30 ngày qua', trend: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Tổng quan</h1>
        <p className="section-subtitle">Chào mừng trở lại! Đây là tóm tắt hoạt động của bạn hôm nay.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card card-hover">
            <div className={`stat-icon ${card.color}`}>{card.icon}</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">{card.value.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                {card.trend && <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />}
                <span className="text-xs text-slate-400">{card.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Interactions over time */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Tương tác theo thời gian</h3>
              <p className="text-xs text-slate-400 mt-0.5">30 ngày qua</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          {interactionsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={interactionsByDay}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={v => `Ngày ${v}`} formatter={v => [v, 'Tương tác']} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p className="empty-desc">Chưa có dữ liệu tương tác</p>
            </div>
          )}
        </div>

        {/* Customers by status */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800">Khách hàng theo trạng thái</h3>
            <p className="text-xs text-slate-400 mt-0.5">Phân bố hiện tại</p>
          </div>
          {customersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={customersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="status"
                  paddingAngle={3}
                >
                  {customersByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => CUSTOMER_STATUS_LABELS[value as keyof typeof CUSTOMER_STATUS_LABELS] || value}
                  iconType="circle"
                  iconSize={8}
                />
                <Tooltip formatter={(value, name) => [value, CUSTOMER_STATUS_LABELS[name as keyof typeof CUSTOMER_STATUS_LABELS] || name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p className="empty-desc">Chưa có dữ liệu</p></div>
          )}
        </div>
      </div>

      {/* Interaction types + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Interactions by type */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Loại tương tác</h3>
          {interactionsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={interactionsByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }}
                  tickFormatter={v => INTERACTION_TYPE_LABELS[v as keyof typeof INTERACTION_TYPE_LABELS] || v} width={70} />
                <Tooltip formatter={(v, n) => [v, INTERACTION_TYPE_LABELS[n as keyof typeof INTERACTION_TYPE_LABELS] || n]} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p className="empty-desc">Chưa có dữ liệu</p></div>
          )}
        </div>

        {/* Recent interactions */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between p-5 pb-0">
            <h3 className="font-semibold text-slate-800">Tương tác gần đây</h3>
            <Link to="/interactions" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-5 space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
            {recentInteractions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Chưa có tương tác</p>
            ) : (
              recentInteractions.slice(0, 8).map(interaction => (
                <Link
                  key={interaction.id}
                  to={`/interactions/${interaction.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getInteractionTypeClass(interaction.interactionType)}`}>
                    {TYPE_ICONS[interaction.interactionType] || <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate group-hover:text-primary-700">{interaction.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{interaction.customer?.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(interaction.interactionDate)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Khách hàng mới nhất</h3>
          <Link to="/customers" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Mã KH</th>
                <th>Tên khách hàng</th>
                <th>Công ty</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Liên hệ</th>
              </tr>
            </thead>
            <tbody>
              {recentCustomers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Chưa có khách hàng</td></tr>
              ) : (
                recentCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td className="font-mono text-xs text-slate-500">{customer.customerCode}</td>
                    <td>
                      <Link to={`/customers/${customer.id}`} className="font-medium text-slate-800 hover:text-primary-600 transition-colors">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="text-slate-500">{customer.company || '—'}</td>
                    <td><span className={getCustomerStatusClass(customer.status)}>{CUSTOMER_STATUS_LABELS[customer.status]}</span></td>
                    <td className="text-slate-500 text-sm">{formatDate(customer.createdAt)}</td>
                    <td className="text-slate-500">{customer._count?.contacts || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
