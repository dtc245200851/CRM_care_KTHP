import { Bell, LogOut, Search, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700',
      MANAGER: 'bg-orange-100 text-orange-700',
      STAFF: 'bg-blue-100 text-blue-700',
    };
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      MANAGER: 'Manager',
      STAFF: 'Staff',
    };
    return { cls: map[role] || '', label: labels[role] || role };
  };

  const { cls, label } = getRoleBadge(user?.role || '');

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="btn-icon text-slate-500 md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="relative hidden sm:block">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="search-input w-64 text-sm py-2"
            aria-label="Tìm kiếm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="btn-icon text-slate-500 relative" aria-label="Thông báo">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</div>
            <span className={`badge text-xs ${cls}`}>{label}</span>
          </div>
          <button
            onClick={logout}
            className="btn-icon text-slate-400 hover:text-red-500 ml-1"
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
