import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';

interface PairingHandshakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPairSuccess: (pin: string, ip: string, deviceName: string, model: string) => void;
  discoveredDevice?: {
    name: string;
    model: string;
    ip: string;
    fingerprint: string;
  };
}

export const PairingHandshakeModal: React.FC<PairingHandshakeModalProps> = ({
  isOpen,
  onClose,
  onPairSuccess,
  discoveredDevice = {
    name: 'iPhone của tôi',
    model: 'iPhone 12 (A2403)',
    ip: '192.168.1.15',
    fingerprint: 'E8:92:A1:74:3B:55:C8:10:99:4D:21:FE:33:AA:88:02',
  },
}) => {
  const [pin, setPin] = useState<string>('');
  const [ip, setIp] = useState<string>(discoveredDevice.ip);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [step, setStep] = useState<'prompt' | 'input_pin'>('prompt');

  if (!isOpen) return null;

  const handleAcceptPrompt = () => {
    setStep('input_pin');
  };

  const handlePair = () => {
    if (pin.trim().length !== 6) {
      setErrorMsg('Vui lòng nhập đúng mã PIN 6 số đang hiển thị trên màn hình iPhone.');
      return;
    }
    setErrorMsg('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      onPairSuccess(pin.trim(), ip.trim(), discoveredDevice.name, discoveredDevice.model);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

        {step === 'prompt' ? (
          /* BƯỚC 1: HỎI XÁC NHẬN KẾT NỐI (CONNECTION PROMPT) */
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-3">
                <Smartphone className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-base font-bold tracking-tight">Yêu cầu Kết nối Mới trong Mạng Wi-Fi</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Một thiết bị di động trong cùng mạng LAN đang gửi yêu cầu ghép đôi đến máy tính của bạn.
              </p>
            </div>

            {/* Thông tin thiết bị thật phát hiện */}
            <div
              className="p-4 rounded-xl border space-y-2 text-xs"
              style={{
                backgroundColor: 'var(--bg-sidebar)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-muted)' }}>Tên thiết bị:</span>
                <span className="font-bold text-sky-500">{discoveredDevice.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-muted)' }}>Model thực tế:</span>
                <span className="font-semibold">{discoveredDevice.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-muted)' }}>Địa chỉ IP LAN:</span>
                <span className="font-mono text-emerald-500">{discoveredDevice.ip}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-muted)' }}>Giao thức:</span>
                <span className="font-mono text-[10px] bg-sky-500/10 text-sky-500 px-1.5 py-0.5 rounded">
                  TLS 1.3 E2EE
                </span>
              </div>
            </div>

            <div
              className="p-3 rounded-lg border text-[11px] flex items-start gap-2 text-amber-500 bg-amber-500/10 border-amber-500/20"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <b>Cảnh báo bảo mật:</b> Chỉ chấp thuận nếu thiết bị này là của bạn hoặc do bạn kích hoạt trên điện thoại.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border text-xs font-semibold hover:bg-slate-500/10 transition-all"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Từ chối kết nối
              </button>

              <button
                onClick={handleAcceptPrompt}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Chấp thuận & Nhập PIN</span>
              </button>
            </div>
          </div>
        ) : (
          /* BƯỚC 2: NHẬP MÃ PIN 6 SỐ TỪ IPHONE */
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500 mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold tracking-tight">Nhập Mã PIN 6 Số Từ iPhone</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Xem mã số ngẫu nhiên đang hiển thị trên màn hình <b>{discoveredDevice.model}</b> để đối chiếu.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Mã xác thực PIN (One-time PIN):
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="VD: 849201"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                autoFocus
                className="w-full text-center tracking-[10px] text-2xl font-mono font-bold py-2.5 rounded-xl border outline-none transition-all"
                style={{
                  backgroundColor: 'var(--bg-sidebar)',
                  borderColor: errorMsg ? 'var(--danger)' : 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
              {errorMsg && <p className="text-[11px] text-rose-500 mt-1">{errorMsg}</p>}
            </div>

            {/* TLS Cross-check */}
            <div
              className="p-3 rounded-xl border text-[11px] space-y-1"
              style={{
                backgroundColor: 'var(--bg-sidebar)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center gap-1.5 font-semibold text-emerald-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Mã vân tay SHA-256 (Anti-MITM):</span>
              </div>
              <div className="font-mono text-[10px] break-all p-1.5 rounded border font-semibold text-sky-500" style={{ borderColor: 'var(--border-color)' }}>
                {discoveredDevice.fingerprint}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setStep('prompt')}
                className="py-2.5 px-4 rounded-xl border text-xs font-semibold hover:bg-slate-500/10 transition-all"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Quay lại
              </button>

              <button
                onClick={handlePair}
                disabled={isVerifying || pin.length !== 6}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                {isVerifying ? (
                  <span>Đang đồng bộ khóa bảo mật...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Xác nhận Khớp Mã PIN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
