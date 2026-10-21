import React from 'react';
import { Home, Gift, Diamond, Wallet, User as UserIcon } from 'lucide-react';

export type NavTab = 'home' | 'activity' | 'promotion' | 'wallet' | 'account';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <nav className="w-full max-w-md bg-[#250508]/98 backdrop-blur-lg border-t border-[#441117] px-2 py-1.5 flex items-center justify-around pointer-events-auto shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
        {/* Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-all ${
            activeTab === 'home' ? 'text-rose-400 font-bold scale-105' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Home</span>
        </button>

        {/* Activity */}
        <button
          onClick={() => onChangeTab('activity')}
          className={`flex flex-col items-center justify-center py-1 flex-1 relative transition-all ${
            activeTab === 'activity' ? 'text-rose-400 font-bold scale-105' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="relative">
            <Gift className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </div>
          <span className="text-[11px]">Activity</span>
        </button>

        {/* Central Raised Promotion Diamond Button matching screenshots */}
        <div className="relative -top-5 flex flex-col items-center justify-center">
          <button
            onClick={() => onChangeTab('promotion')}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg border-2 ${
              activeTab === 'promotion'
                ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 border-amber-300 text-white shadow-rose-900/60'
                : 'bg-gradient-to-tr from-rose-700 to-amber-500 border-rose-400/80 text-white shadow-black/80'
            }`}
          >
            <div className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-sm">
              <Diamond className="w-6 h-6 fill-white text-white drop-shadow" />
            </div>
          </button>
          <span
            className={`text-[11px] font-semibold mt-1 transition-colors ${
              activeTab === 'promotion' ? 'text-amber-300' : 'text-neutral-400'
            }`}
          >
            Promotion
          </span>
        </div>

        {/* Wallet */}
        <button
          onClick={() => onChangeTab('wallet')}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-all ${
            activeTab === 'wallet' ? 'text-rose-400 font-bold scale-105' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Wallet</span>
        </button>

        {/* Account */}
        <button
          onClick={() => onChangeTab('account')}
          className={`flex flex-col items-center justify-center py-1 flex-1 relative transition-all ${
            activeTab === 'account' ? 'text-rose-400 font-bold scale-105' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <UserIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Account</span>
        </button>
      </nav>
    </div>
  );
};
