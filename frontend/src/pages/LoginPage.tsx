import { useState, FormEvent } from 'react';
import { Building2, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../utils/helpers';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@crmcare.local');
  const [password, setPassword] = useState('Admin@CRM2024!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-900/50">
            <Building2 className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">CRM Care</h1>
          <p className="text-primary-300 text-sm">Customer Relationship Management</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Đăng nhập</h2>
            <p className="text-primary-300 text-sm mt-1">Nhập thông tin tài khoản để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-200 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40
                             text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-200 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40
                             text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="w-full py-3 bg-primary-500 hover:bg-primary-400 active:bg-primary-600 text-white font-semibold
                         rounded-xl transition-all duration-200 text-sm shadow-lg shadow-primary-900/50
                         disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs font-semibold text-primary-300 uppercase tracking-wide mb-2.5">Tài khoản demo</p>
            <div className="space-y-1.5 text-xs text-primary-200">
              {[
                ['Admin', 'admin@crmcare.local', 'Admin@CRM2024!'],
                ['Manager', 'manager@crmcare.local', 'Manager@CRM2024!'],
                ['Staff', 'staff@crmcare.local', 'Staff@CRM2024!'],
              ].map(([role, email, pwd]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setEmail(email); setPassword(pwd); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="font-medium">{role}:</span> {email}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
