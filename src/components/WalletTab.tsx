import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  History,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface WalletTabProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenCustomerCare: () => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  onOpenDeposit,
  onOpenWithdraw,
  onOpenCustomerCare,
}) => {
  const { currentUser, depositRequests, withdrawalRequests, toast } = useApp();

  const totalDepositAmount = depositRequests
    .filter((d) => d.status === 'approved' && d.userId === currentUser?.id)
    .reduce((sum, d) => sum + d.amount, 0);

  const totalWithdrawalAmount = withdrawalRequests
    .filter((w) => w.status === 'completed' && w.userId === currentUser?.id)
    .reduce((sum, w) => sum + w.amount, 0);

  const currentBalance = currentUser ? currentUser.balance : 0;

  return (
    <div className="space-y-4 pb-28 text-neutral-100">
      {/* Wallet Balance Header matching screenshot IMG_2552 */}
      <div className="bg-gradient-to-r from-[#fea076] to-[#ff7360] rounded-2xl p-4 text-rose-950 shadow-xl space-y-2 text-center">
        <div className="w-10 h-10 rounded-full bg-rose-950/20 flex items-center justify-center mx-auto text-rose-950">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="text-3xl font-black">
          ₹{currentBalance.toFixed(2)}
        </div>
        <div className="text-xs font-bold opacity-80">Total balance</div>

        <div className="grid grid-cols-2 pt-2 border-t border-rose-950/20 text-xs">
          <div>
            <div className="font-black text-sm">
              {totalWithdrawalAmount > 0 ? totalWithdrawalAmount : 0}
            </div>
            <div className="text-[10px] opacity-80">Total Withdrawal Amount</div>
          </div>
          <div>
            <div className="font-black text-sm">
              {totalDepositAmount > 0 ? totalDepositAmount : 0}
            </div>
            <div className="text-[10px] opacity-80">Total deposit amount</div>
          </div>
        </div>
      </div>

      {/* Donut Gauges Card matching screenshot IMG_2552 */}
      <div className="p-4 bg-[#310c12] rounded-2xl border border-rose-900/60 shadow-md space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          {/* Main Wallet 100% */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full border-4 border-rose-500 flex items-center justify-center shadow-lg bg-[#250508]">
              <span className="text-base font-black text-white">100%</span>
            </div>
            <div className="text-xs font-bold text-white mt-2">
              ₹{currentBalance.toFixed(2)}
            </div>
            <div className="text-[10px] text-neutral-400">Main wallet</div>
          </div>

          {/* 3rd Party Wallet 0% */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full border-4 border-neutral-700 flex items-center justify-center bg-[#250508]">
              <span className="text-base font-black text-neutral-400">0%</span>
            </div>
            <div className="text-xs font-bold text-white mt-2">₹0.00</div>
            <div className="text-[10px] text-neutral-400">3rd party wallet</div>
          </div>
        </div>

        {/* Main wallet transfer button matching screenshot IMG_2552 */}
        <button
          onClick={() => toast('All balances automatically synced to Main Wallet!', 'info')}
          className="w-full py-3 rounded-full font-black text-sm bg-gradient-to-r from-[#fea076] to-[#ff7360] text-rose-950 shadow-md hover:brightness-105 active:scale-[0.99] transition-all"
        >
          Main wallet transfer
        </button>
      </div>

      {/* 4 Quick Action Buttons matching screenshot IMG_2552 */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <button
          onClick={onOpenDeposit}
          className="p-3 bg-[#380e14] border border-rose-900/60 rounded-2xl flex flex-col items-center justify-center hover:bg-[#48121a] transition-all"
        >
          <span className="text-2xl mb-1">📥</span>
          <span className="text-[11px] font-bold text-white">Deposit</span>
        </button>

        <button
          onClick={onOpenWithdraw}
          className="p-3 bg-[#380e14] border border-rose-900/60 rounded-2xl flex flex-col items-center justify-center hover:bg-[#48121a] transition-all"
        >
          <span className="text-2xl mb-1">📤</span>
          <span className="text-[11px] font-bold text-white">Withdraw</span>
        </button>

        <button
          onClick={onOpenDeposit}
          className="p-3 bg-[#380e14] border border-rose-900/60 rounded-2xl flex flex-col items-center justify-center hover:bg-[#48121a] transition-all"
        >
          <span className="text-2xl mb-1">📑</span>
          <span className="text-[10px] font-bold text-white leading-tight">Deposit history</span>
        </button>

        <button
          onClick={onOpenWithdraw}
          className="p-3 bg-[#380e14] border border-rose-900/60 rounded-2xl flex flex-col items-center justify-center hover:bg-[#48121a] transition-all"
        >
          <span className="text-2xl mb-1">🗂️</span>
          <span className="text-[10px] font-bold text-white leading-tight">Withdrawal history</span>
        </button>
      </div>

      {/* Game Balance Split Cards matching screenshot IMG_2552 */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="p-3.5 bg-[#2d090f] border border-rose-900/50 rounded-xl">
          <div className="text-sm font-black text-white">0.00</div>
          <div className="text-[10px] text-rose-300 mt-0.5">ARGame</div>
        </div>
        <div className="p-3.5 bg-gradient-to-r from-rose-900/40 to-amber-900/40 border border-amber-500/40 rounded-xl">
          <div className="text-sm font-black text-amber-300">
            {currentBalance.toFixed(2)}
          </div>
          <div className="text-[10px] text-amber-200 mt-0.5">Lottery</div>
        </div>
      </div>
    </div>
  );
};
