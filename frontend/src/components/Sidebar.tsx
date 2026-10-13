import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, MessageSquare,
  Settings, User, ChevronLeft, ChevronRight,
  Building2
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Tổng quan', end: true },
  { path: '/customers', icon: <Users className="w-5 h-5" />, label: 'Khách hàng' },
  { path: '/contacts', icon: <UserCheck className="w-5 h-5" />, label: 'Người liên hệ' },
  { path: '/interactions', icon: <MessageSquare className="w-5 h-5" />, label: 'Tương tác' },
];

const bottomItems: NavItem[] = [
  { path: '/profile', icon: <User className="w-5 h-5" />, label: 'Hồ sơ' },
  { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Cài đặt' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-slate-800 text-base leading-tight">CRM Care</div>
            <div className="text-xs text-slate-400 truncate">Customer Management</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={`sidebar-link ${isActive(item.path, item.end) ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors z-10"
        aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> : <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />}
      </button>
    </aside>
  );
}
