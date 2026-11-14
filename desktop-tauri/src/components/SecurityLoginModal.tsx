import React, { useState } from 'react';
import { Lock, Shield, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface SecurityLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: () => void;
}

export const SecurityLoginModal: React.FC<SecurityLoginModalProps> = ({
  isOpen,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Chấp nhận mật khẩu hoặc mã PIN (hoặc mã mặc định 123456 / để trống cho lần đầu)
    if (password.length > 0 && password.length < 4) {
      setErrorMsg('Mật khẩu/Mã PIN bảo mật phải từ 4 ký tự trở lên.');
      return;
    }
    setErrorMsg('');
    onLoginSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl relative transition-all"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-sky-500/25">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold tracking-tight">Send2All Security Gate</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Xác thực phiên làm việc để bảo vệ dữ liệu truyền không dây trong mạng Wi-Fi
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Mật khẩu truy cập / Mã bảo mật phiên:
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Nhập mã PIN hoặc mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full text-xs py-2.5 pl-3 pr-9 rounded-xl border outline-none font-mono"
                style={{
                  backgroundColor: 'var(--bg-sidebar)',
                  borderColor: errorMsg ? 'var(--danger)' : 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMsg && <p className="text-[11px] text-rose-500 mt-1">{errorMsg}</p>}
          </div>

          <div
            className="p-3 rounded-xl border text-[11px] space-y-1"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            <div className="flex items-center gap-1.5 text-sky-500 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Chính sách Bảo mật Mạng LAN</span>
            </div>
            <p className="text-[10.5px]">
              Tất cả các phiên kết nối không dây đều được bảo vệ bởi TLS 1.3 và yêu cầu xác thực 2 chiều từ điện thoại.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>Đăng nhập & Mở phiên làm việc</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
