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
  const authInput = 'mt-1.5 w-full rounded-xl border border-[#E5ECE7] bg-[#FFFDF7] px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#285E56]';
  if (authLoading) return <p role="status" className="px-4 py-16 text-center text-sm text-[#738078]">Đang kiểm tra phiên đăng nhập…</p>;
  if (pathname === '/forgot-password') return <section className="mx-auto my-8 max-w-lg rounded-3xl border border-[#E5ECE7] bg-white p-7 shadow-xs"><h1 className="text-xl font-bold text-[#263B35]">Hỗ trợ khôi phục tài khoản</h1><p className="my-4 text-sm leading-6 text-[#738078]">Tự đặt lại mật khẩu qua email chưa được cấu hình. Vui lòng liên hệ quản trị viên qua kênh hỗ trợ chính thức; không cung cấp mật khẩu hiện tại của bạn.</p><button onClick={() => navigateTo('/login')} className="rounded-xl bg-[#285E56] px-5 py-2.5 text-sm font-semibold text-white">Quay lại đăng nhập</button></section>;
  if (!authUser) return <section className="mx-auto max-w-lg px-4 py-8"><div className="rounded-3xl border border-[#E5ECE7] bg-white p-6 shadow-xs sm:p-8"><div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-[#E7F5EF] p-3 text-[#285E56]"><User size={24} /></span><h1 className="text-2xl font-bold text-[#263B35]">{isRegister ? 'Tạo tài khoản khách hàng' : 'Đăng nhập HomeMeal'}</h1></div><p className="mb-6 text-sm text-[#738078]">{isRegister ? 'Tài khoản mới có quyền Khách hàng. Quyền Đầu bếp và Quản trị viên do quản trị viên cấp.' : 'Đăng nhập để đặt đầu bếp đến nhà và quản lý dịch vụ của bạn.'}</p>{authError && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{authError}</p>}<form onSubmit={handleAuth} className="space-y-4 text-sm">{isRegister && <label className="block font-semibold">Họ và tên<input className={authInput} required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></label>}<label className="block font-semibold">Email<input className={authInput} required type="email" maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label className="block font-semibold">Mật khẩu<input className={authInput} required type="password" minLength={isRegister ? 12 : 1} maxLength={128} autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} /></label>{isRegister && <p className="text-xs text-[#738078]">Mật khẩu cần từ 12 đến 128 ký tự.</p>}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}<button disabled={submitting} className="w-full rounded-xl bg-[#285E56] px-5 py-3 font-bold text-white disabled:opacity-60">{submitting ? 'Đang xử lý…' : isRegister ? 'Đăng ký khách hàng' : 'Đăng nhập'}</button></form><div className="mt-5 flex flex-wrap justify-between gap-3 text-sm text-[#285E56]"><button onClick={() => { const next = new URLSearchParams(window.location.search).get('next'); navigateTo((isRegister ? '/login' : '/register') + (next ? '?next=' + encodeURIComponent(next) : '')); }}>{isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</button>{!isRegister && <button onClick={() => navigateTo('/forgot-password')}>Quên mật khẩu?</button>}</div></div></section>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-3xl border border-[#E5ECE7] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5ECE7]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#B8E4D3] shrink-0 bg-stone-100">
              <div className="flex h-full items-center justify-center bg-[#E7F5EF] text-[#285E56]"><User size={28} /></div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#263B35]">{currentUser.name}</h1>
              <p className="text-xs text-[#738078] flex items-center gap-1.5 mt-0.5">
                <span>Vai trò hiện tại:</span>
                <span className="font-bold text-[#285E56] capitalize">
                  {currentUser.role === 'customer' ? 'Khách hàng' : currentUser.role === 'cook' ? 'Đầu bếp gia đình' : 'Quản trị viên'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5ECE7] py-6">
          <p className="text-xs text-[#738078]">Quyền tài khoản được quản trị viên cấp và kiểm tra trên hệ thống.</p>
          <button onClick={() => { void logout().then(() => navigateTo('/')).catch((e) => setError(e.message)); }} className="flex items-center gap-2 rounded-xl border border-[#E5ECE7] px-4 py-2 text-sm text-[#285E56]"><LogOut size={16} />Đăng xuất</button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {/* Form Profile */}
        <form onSubmit={handleSave} className="pt-6 space-y-4 text-xs sm:text-sm">
          <h2 className="text-sm font-bold text-[#263B35]">Thông tin cá nhân & Địa chỉ lưu sẵn:</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#263B35] mb-1">Họ và tên:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl focus:ring-2 focus:ring-[#285E56]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#263B35] mb-1">Số điện thoại:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl focus:ring-2 focus:ring-[#285E56]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#263B35] mb-1">Địa chỉ giao nhận / Nấu ăn mặc định:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl focus:ring-2 focus:ring-[#285E56]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#285E56] hover:bg-[#1f4b44] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
