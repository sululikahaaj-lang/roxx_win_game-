import React, { useState } from 'react';
import {
  RotateCcw,
  Copy,
  ChevronRight,
  Settings,
  FileText,
  Volume2,
  Headphones,
  BookOpen,
  Info,
  LogOut,
  ShieldCheck,
  CreditCard,
  History,
  TrendingUp,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AccountTabProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenCustomerCare: () => void;
  onOpenAdmin: () => void;
  onOpenLogin: () => void;
}

export const AccountTab: React.FC<AccountTabProps> = ({
  onOpenDeposit,
  onOpenWithdraw,
  onOpenCustomerCare,
  onOpenAdmin,
  onOpenLogin,
}) => {
  const { currentUser, logout, refreshUserBalance, toast, isAdmin } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopyUid = () => {
    if (currentUser) {
      navigator.clipboard.writeText(currentUser.uid);
      toast(`UID copied: ${currentUser.uid}`, 'success');
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshUserBalance();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-4 pb-28 text-neutral-100">
      {/* Profile Header matching screenshot IMG_2542 */}
      <div className="bg-gradient-to-r from-[#fea076] to-[#ff7360] rounded-2xl p-4 text-rose-950 shadow-xl">
        <div className="flex items-center space-x-3">
          <img
            src={
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
            }
            alt="User Avatar"
            className="w-14 h-14 rounded-full border-2 border-white object-cover shadow-md"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-black text-sm text-rose-950 truncate max-w-[140px]">
                {currentUser ? currentUser.name : 'Guest User'}
              </span>
              <span className="text-[10px] bg-rose-950 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-300/40">
                ⭐ VIP{currentUser?.vipLevel || 0}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 mt-1 text-xs">
              <span className="opacity-75">UID:</span>
              <span className="font-mono font-bold">{currentUser?.uid || '------'}</span>
              <button onClick={handleCopyUid} className="opacity-75 hover:opacity-100">
                <Copy className="w-3 h-3" />
              </button>
            </div>

            <div className="text-[10px] opacity-75 mt-0.5">
              Last login: {currentUser?.lastLogin || 'Just now'}
            </div>
          </div>
        </div>
      </div>

      {/* Balance Card matching screenshot IMG_2542 */}
      <div className="p-4 bg-[#3b1016] rounded-2xl border border-rose-900/60 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400">Total balance</div>
            <div className="text-2xl font-black text-white mt-0.5 flex items-center space-x-2">
              <span>₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}</span>
              <button
                onClick={handleRefresh}
                className={`text-rose-400 hover:text-white transition-transform ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenDeposit}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-rose-950 font-black text-xs shadow hover:brightness-105"
            >
              Deposit
            </button>
            <button
              onClick={onOpenWithdraw}
              className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* 4 Actions Row matching screenshot IMG_2542 */}
        <div className="grid grid-cols-4 gap-2 pt-4 mt-3 border-t border-rose-900/40 text-center text-xs">
          <button
            onClick={() => toast('ARWallet synced with Main balance.', 'info')}
            className="flex flex-col items-center hover:opacity-80"
          >
            <span className="text-xl mb-1">👛</span>
            <span className="text-[11px] text-neutral-300">ARWallet</span>
          </button>
          <button onClick={onOpenDeposit} className="flex flex-col items-center hover:opacity-80">
            <span className="text-xl mb-1">💰</span>
            <span className="text-[11px] text-neutral-300">Deposit</span>
          </button>
          <button onClick={onOpenWithdraw} className="flex flex-col items-center hover:opacity-80">
            <span className="text-xl mb-1">💳</span>
            <span className="text-[11px] text-neutral-300">Withdraw</span>
          </button>
          <button
            onClick={() => toast('VIP Level Upgrade: Continue playing to level up to VIP1!', 'info')}
            className="flex flex-col items-center hover:opacity-80"
          >
            <span className="text-xl mb-1">💎</span>
            <span className="text-[11px] text-neutral-300">VIP</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Grid: Game History, Transaction, Deposit history, Withdraw history (IMG_2542) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={() => toast('Game history: WinGo bets and crash games logged.', 'info')}
          className="p-3 bg-[#380e14] border border-rose-900/60 rounded-xl text-left flex items-center space-x-2.5 hover:bg-[#48121b] transition-all"
        >
          <span className="text-2xl">📊</span>
          <div>
            <div className="font-bold text-white">Game History</div>
            <div className="text-[10px] text-neutral-400">My game history</div>
          </div>
        </button>

        <button
          onClick={() => toast('Transaction log: All wallet records maintained in ledger.', 'info')}
          className="p-3 bg-[#380e14] border border-rose-900/60 rounded-xl text-left flex items-center space-x-2.5 hover:bg-[#48121b] transition-all"
        >
          <span className="text-2xl">📝</span>
          <div>
            <div className="font-bold text-white">Transaction</div>
            <div className="text-[10px] text-neutral-400">My transaction history</div>
          </div>
        </button>

        <button
          onClick={onOpenDeposit}
          className="p-3 bg-[#380e14] border border-rose-900/60 rounded-xl text-left flex items-center space-x-2.5 hover:bg-[#48121b] transition-all"
        >
          <span className="text-2xl">📥</span>
          <div>
            <div className="font-bold text-white">Deposit</div>
            <div className="text-[10px] text-neutral-400">My deposit history</div>
          </div>
        </button>

        <button
          onClick={onOpenWithdraw}
          className="p-3 bg-[#380e14] border border-rose-900/60 rounded-xl text-left flex items-center space-x-2.5 hover:bg-[#48121b] transition-all"
        >
          <span className="text-2xl">📤</span>
          <div>
            <div className="font-bold text-white">Withdraw</div>
            <div className="text-[10px] text-neutral-400">My withdraw history</div>
          </div>
        </button>
      </div>

      {/* Account Settings List matching screenshot IMG_2542 & IMG_2543 */}
      <div className="bg-[#380e14] rounded-2xl border border-rose-900/60 divide-y divide-rose-900/40 text-xs font-semibold">
        <button
          onClick={() => toast('You have 2 new platform announcements.', 'info')}
          className="w-full p-3.5 flex items-center justify-between text-neutral-200 hover:text-white"
        >
          <div className="flex items-center space-x-2.5">
            <span className="text-base">✉️</span>
            <span>Notification</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>
        </button>

        <button
          onClick={() => toast('Check Activity tab for daily gift codes.', 'info')}
          className="w-full p-3.5 flex items-center justify-between text-neutral-200 hover:text-white"
        >
          <div className="flex items-center space-x-2.5">
            <span className="text-base">🎁</span>
            <span>Gifts</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </button>

        <button
          onClick={() => toast('5% Recharge Cashback coupon is active on your account!', 'info')}
          className="w-full p-3.5 flex items-center justify-between text-neutral-200 hover:text-white"
        >
          <div className="flex items-center space-x-2.5">
            <span className="text-base">🎟️</span>
            <span>My Top-Up Coupons</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
              1
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>
        </button>

        <button
          onClick={() => toast('Game statistics: All RTP and payouts verified.', 'info')}
          className="w-full p-3.5 flex items-center justify-between text-neutral-200 hover:text-white"
        >
          <div className="flex items-center space-x-2.5">
            <span className="text-base">📈</span>
            <span>Game statistics</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </button>

        <div className="w-full p-3.5 flex items-center justify-between text-neutral-200">
          <div className="flex items-center space-x-2.5">
            <span className="text-base">🌐</span>
            <span>Language</span>
          </div>
          <div className="flex items-center space-x-1.5 text-neutral-400">
            <span>English</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* SERVICE CENTER matching screenshot IMG_2543 */}
      <div className="p-4 bg-[#380e14] rounded-2xl border border-rose-900/60 space-y-3">
        <h3 className="text-xs font-bold text-white">Service center</h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <button
            onClick={() => toast('System settings: Sound and notification enabled.', 'info')}
            className="p-2.5 bg-[#2d090f] rounded-xl hover:bg-[#451219]"
          >
            <span className="text-xl block mb-1">⚙️</span>
            <span className="text-[11px] text-neutral-300">Settings</span>
          </button>
          <button
            onClick={onOpenCustomerCare}
            className="p-2.5 bg-[#2d090f] rounded-xl hover:bg-[#451219]"
          >
            <span className="text-xl block mb-1">📋</span>
            <span className="text-[11px] text-neutral-300">Feedback</span>
          </button>
          <button
            onClick={() => toast('Latest announcement: UPI payments and deposit verification operational.', 'info')}
            className="p-2.5 bg-[#2d090f] rounded-xl hover:bg-[#451219]"
          >
            <span className="text-xl block mb-1">📢</span>
            <span className="text-[11px] text-neutral-300">Announcement</span>
          </button>
          <button
            onClick={onOpenCustomerCare}
            className="p-2.5 bg-[#2d090f] rounded-xl hover:bg-[#451219]"
          >
            <span className="text-xl block mb-1">🎧</span>
            <span className="text-[11px] text-neutral-300">Customer Service</span>
          </button>
          <button
            onClick={() => toast('Beginner guide: Recharge via PhonePe QR, submit 12-digit UTR, and start playing!', 'info')}
            className="p-2.5 bg-[#2d090f] rounded-xl hover:bg-[#451219]"
          >
            <span className="text-xl block mb-1">📖</span>
            <span className="text-[11px] text-neutral-300">Beginner's Guide</span>
          </button>
          <button
            onClick={() => toast('ROX WIN - Official Gaming Platform. 2026 Licensed.', 'info')}
            className="p-2.5 bg-[#2d090f] rounded-xl hover:bg-[#451219]"
          >
            <span className="text-xl block mb-1">📦</span>
            <span className="text-[11px] text-neutral-300">About us</span>
          </button>
        </div>
      </div>

      {/* Admin Panel Entry - ONLY for authorized admin 8910968919 */}
      {isAdmin && currentUser?.phone === '8910968919' && (
        <div className="pt-1">
          <button
            onClick={onOpenAdmin}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600/30 to-amber-500/20 border border-amber-500/60 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 shadow hover:bg-amber-600/40 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Open Administrator Management Panel</span>
          </button>
        </div>
      )}

      {/* Log out button matching screenshot IMG_2543 */}
      <div className="pt-1">
        {currentUser ? (
          <button
            onClick={logout}
            className="w-full py-3 rounded-full border border-rose-600/80 text-rose-400 bg-transparent hover:bg-rose-950/60 text-sm font-bold flex items-center justify-center space-x-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white text-sm font-bold shadow-lg"
          >
            Log in / Register
          </button>
        )}
      </div>
    </div>
  );
};
