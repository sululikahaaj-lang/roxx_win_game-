import React from 'react';
import { Download, Headphones, Crown, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenCustomerService: () => void;
  onOpenAdmin: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack,
  onBack,
  onOpenCustomerService,
  onOpenAdmin,
  onOpenLogin,
}) => {
  const { currentUser, isAdmin } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-[#250508]/95 backdrop-blur-md border-b border-[#3d0f14] px-4 py-2.5 flex items-center justify-between shadow-md">
      {/* Left section: Back button or Logo if no back */}
      <div className="flex items-center space-x-2">
        {showBack ? (
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-[#3d0f14] flex items-center justify-center text-white/90 hover:text-white hover:bg-[#52161d] transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : null}

        {/* Brand Logo matching screenshots */}
        <div className="flex items-center space-x-1.5 cursor-pointer" onClick={() => onBack && onBack()}>
          <div className="relative flex items-center">
            <Crown className="w-4 h-4 text-amber-400 absolute -top-2 left-1 fill-amber-400 animate-pulse" />
            <span className="text-2xl font-black italic metallic-logo-text tracking-tighter">
              ROX
            </span>
            <span className="text-xs font-black text-rose-500 bg-rose-950/60 border border-rose-600/40 px-1 py-0.5 rounded ml-1 tracking-wider shadow">
              .WIN
            </span>
          </div>
        </div>
      </div>

      {/* Center title if provided */}
      {title ? (
        <span className="text-sm font-bold text-amber-100/90 truncate max-w-[120px]">
          {title}
        </span>
      ) : null}

      {/* Right section: Quick actions */}
      <div className="flex items-center space-x-2">
        {/* Admin portal shortcut for authorized admin ONLY */}
        {isAdmin && currentUser?.phone === '8910968919' && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-950/90 border-emerald-500 text-emerald-300 transition-all hover:bg-emerald-900 shadow-md"
            title="Admin Control Center"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin</span>
          </button>
        )}

        {/* Customer Service */}
        <button
          onClick={onOpenCustomerService}
          className="w-8 h-8 rounded-full bg-[#3b0f15] border border-rose-900/60 flex items-center justify-center text-rose-400 hover:text-white hover:bg-[#4d141c] transition-all relative"
          title="Customer Service"
        >
          <Headphones className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
        </button>

        {/* App download */}
        <button
          onClick={() => alert('ROX WIN Official APK download link: https://t.me/raxigame')}
          className="w-8 h-8 rounded-full bg-[#3b0f15] border border-rose-900/60 flex items-center justify-center text-amber-400 hover:text-white hover:bg-[#4d141c] transition-all"
          title="Download App"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* User state / Login prompt */}
        {!currentUser && (
          <button
            onClick={onOpenLogin}
            className="px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow hover:brightness-110 transition-all"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};
