import React from 'react';
import { Heart, Coffee, ExternalLink, X, QrCode } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-500/10">
            <Heart className="w-7 h-7 fill-rose-500/20" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">Ủng Hộ Dự Án Send2All</h2>
          <p className="text-xs text-slate-400 leading-relaxed px-2">
            Send2All là một dự án **mã nguồn mở và hoàn toàn miễn phí 100%**. Nếu ứng dụng giúp bạn tiết kiệm thời gian truyền file không dây, hãy cân nhắc mời tác giả một ly cà phê nhé! ☕
          </p>
        </div>

        {/* Donation Channels */}
        <div className="mt-6 space-y-3">
          {/* Buy Me a Coffee / Ko-fi */}
          <a
            href="https://buymeacoffee.com/antonemore"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300 font-medium text-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <Coffee className="w-5 h-5 text-amber-400" />
              <span>Mời cà phê qua Buy Me a Coffee</span>
            </div>
            <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* GitHub Sponsors */}
          <a
            href="https://github.com/sponsors/Antonemore"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl text-sky-300 font-medium text-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-sky-400" />
              <span>Tài trợ qua GitHub Sponsors</span>
            </div>
            <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* MoMo / Chuyển khoản QR */}
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-medium text-slate-200">Chuyển khoản Ngân hàng / MoMo</p>
                <p className="text-[11px] text-slate-400">Quét mã QR trực tiếp tại README trên GitHub</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium py-1 px-4"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
