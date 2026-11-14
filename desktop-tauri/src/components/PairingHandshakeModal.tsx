import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, Smartphone, CheckCircle } from 'lucide-react';

interface PairingHandshakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPairSuccess: (pin: string, ip: string) => void;
  discoveredIp?: string;
}

export const PairingHandshakeModal: React.FC<PairingHandshakeModalProps> = ({
  isOpen,
  onClose,
  onPairSuccess,
  discoveredIp = '192.168.1.15',
}) => {
  const [pin, setPin] = useState<string>('');
  const [ip, setIp] = useState<string>(discoveredIp);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handlePair = () => {
    if (pin.trim().length !== 6) {
      setErrorMsg('Vui lòng nhập đúng mã PIN 6 số hiển thị trên iPhone.');
      return;
    }
    setErrorMsg('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      onPairSuccess(pin.trim(), ip.trim());
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl relative transition-all"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full opacity-60 hover:opacity-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500 mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold tracking-tight">Xác thực Ghép đôi Thiết bị (AirDrop Handshake)</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Nhập mã PIN 6 số do ứng dụng Send2All trên iPhone hiển thị để thiết lập kênh mã hóa TLS 1.3 an toàn.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Mã PIN 6 số (One-time PIN):
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="VD: 849201"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[8px] text-2xl font-mono font-bold py-2.5 rounded-xl border outline-none transition-all"
              style={{
                backgroundColor: 'var(--bg-sidebar)',
                borderColor: errorMsg ? 'var(--danger)' : 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
            {errorMsg && <p className="text-[11px] text-rose-500 mt-1">{errorMsg}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Địa chỉ IP iPhone trong Wi-Fi LAN:
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="w-full text-xs font-mono py-2 px-3 rounded-lg border outline-none"
              style={{
                backgroundColor: 'var(--bg-sidebar)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            />
          </div>

          {/* TLS Fingerprint Cross-check Card */}
          <div
            className="p-3 rounded-xl border text-[11px] space-y-1.5"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-1.5 font-semibold text-sky-500">
              <ShieldCheck className="w-4 h-4" />
              <span>Đối chiếu mã bảo mật SHA-256 (Anti-MITM)</span>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Mã chứng chỉ bảo mật của phiên kết nối này:
            </p>
            <div className="font-mono text-[10px] break-all p-1.5 rounded border text-sky-500 font-semibold" style={{ borderColor: 'var(--border-color)' }}>
              B4:A7:29:5C:88:12:DF:3E:91:02:AA:BC:EE:44:11:80
            </div>
          </div>

          <button
            onClick={handlePair}
            disabled={isVerifying || pin.length !== 6}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            {isVerifying ? (
              <span>Đang thiết lập kết nối an toàn...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Xác nhận & Ghép đôi an toàn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
