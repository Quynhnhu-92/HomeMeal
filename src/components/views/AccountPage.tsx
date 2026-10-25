import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, Mail, MapPin, Shield, ChefHat, Check, UserCheck, LogOut } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { currentUser, authUser, authLoading, authError, login, register, logout, updateProfile, currentPath, navigateTo, showToast } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [address, setAddress] = useState(currentUser.address);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pathname = currentPath.split(/[?#]/)[0];
  const isRegister = pathname === '/register';
  const roleHome = (role: string) => role === 'admin' ? '/admin' : role === 'cook' ? '/cook/dashboard' : '/';
  useEffect(() => { setName(currentUser.name); setPhone(currentUser.phone); setAddress(currentUser.address); }, [currentUser.name, currentUser.phone, currentUser.address]);
  useEffect(() => { setPassword(''); setError(''); }, [pathname]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try { await updateProfile({ name, phone, address }); showToast('Đã lưu thông tin tài khoản thành công!'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được thông tin.'); }
    finally { setSubmitting(false); }
  };
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      const user = isRegister ? await register(name, email, password) : await login(email, password);
      const next = new URLSearchParams(window.location.search).get('next');
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : null;
      navigateTo(safeNext || roleHome(user.role));
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể đăng nhập.'); }
    finally { setSubmitting(false); }
  };
  const authInput = 'mt-1.5 w-full rounded-xl border border-border-soft bg-surface-alt px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-accent';
  if (authLoading) return <p role="status" className="px-4 py-16 text-center text-sm text-muted">Đang kiểm tra phiên đăng nhập…</p>;
  if (pathname === '/forgot-password') return <section className="mx-auto my-8 max-w-lg rounded-3xl border border-border-soft bg-surface p-7 shadow-xs"><h1 className="text-xl font-bold text-accent">Hỗ trợ khôi phục tài khoản</h1><p className="my-4 text-sm leading-6 text-muted">Tự đặt lại mật khẩu qua email chưa được cấu hình. Vui lòng liên hệ quản trị viên qua kênh hỗ trợ chính thức; không cung cấp mật khẩu hiện tại của bạn.</p><button onClick={() => navigateTo('/login')} className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-on-brand">Quay lại đăng nhập</button></section>;
  if (!authUser) return <section className="mx-auto max-w-lg px-4 py-8"><div className="rounded-3xl border border-border-soft bg-surface p-6 shadow-xs sm:p-8"><div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-surface-alt p-3 text-accent"><User size={24} /></span><h1 className="text-2xl font-bold text-accent">{isRegister ? 'Tạo tài khoản khách hàng' : 'Đăng nhập HomeMeal'}</h1></div><p className="mb-6 text-sm text-muted">{isRegister ? 'Tài khoản mới có quyền Khách hàng. Quyền Đầu bếp và Quản trị viên do quản trị viên cấp.' : 'Đăng nhập để đặt đầu bếp đến nhà và quản lý dịch vụ của bạn.'}</p>{authError && <p className="mb-4 rounded-xl bg-surface-alt p-3 text-sm text-accent">{authError}</p>}<form onSubmit={handleAuth} className="space-y-4 text-sm">{isRegister && <label className="block font-semibold">Họ và tên<input className={authInput} required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></label>}<label className="block font-semibold">Email<input className={authInput} required type="email" maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label className="block font-semibold">Mật khẩu<input className={authInput} required type="password" minLength={isRegister ? 12 : 1} maxLength={128} autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} /></label>{isRegister && <p className="text-xs text-muted">Mật khẩu cần từ 12 đến 128 ký tự.</p>}{error && <p role="alert" className="rounded-xl bg-surface-alt p-3 text-accent">{error}</p>}<button disabled={submitting} className="w-full rounded-xl bg-brand px-5 py-3 font-bold text-on-brand disabled:opacity-60">{submitting ? 'Đang xử lý…' : isRegister ? 'Đăng ký khách hàng' : 'Đăng nhập'}</button></form><div className="mt-5 flex flex-wrap justify-between gap-3 text-sm text-accent"><button onClick={() => { const next = new URLSearchParams(window.location.search).get('next'); navigateTo((isRegister ? '/login' : '/register') + (next ? '?next=' + encodeURIComponent(next) : '')); }}>{isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</button>{!isRegister && <button onClick={() => navigateTo('/forgot-password')}>Quên mật khẩu?</button>}</div></div></section>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-soft">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand shrink-0 bg-surface-alt">
              <div className="flex h-full items-center justify-center bg-surface-alt text-accent"><User size={28} /></div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-accent">{currentUser.name}</h1>
              <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                <span>Vai trò hiện tại:</span>
                <span className="font-bold text-accent capitalize">
                  {currentUser.role === 'customer' ? 'Khách hàng' : currentUser.role === 'cook' ? 'Đầu bếp gia đình' : 'Quản trị viên'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft py-6">
          <p className="text-xs text-muted">Quyền tài khoản được quản trị viên cấp và kiểm tra trên hệ thống.</p>
          <button onClick={() => { void logout().then(() => navigateTo('/')).catch((e) => setError(e.message)); }} className="flex items-center gap-2 rounded-xl border border-border-soft px-4 py-2 text-sm text-accent"><LogOut size={16} />Đăng xuất</button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-surface-alt p-3 text-sm text-accent">{error}</p>}

        {/* Form Profile */}
        <form onSubmit={handleSave} className="pt-6 space-y-4 text-xs sm:text-sm">
          <h2 className="text-sm font-bold text-accent">Thông tin cá nhân & Địa chỉ lưu sẵn:</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-ink mb-1">Họ và tên:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-alt border border-border-soft rounded-xl focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Số điện thoại:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-alt border border-border-soft rounded-xl focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Địa chỉ nấu ăn mặc định:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-alt border border-border-soft rounded-xl focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
