import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  ArrowLeft,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomerCare: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onOpenCustomerCare }) => {
  const { currentUser, adminSettings, submitWithdrawal, withdrawalRequests, toast } = useApp();

  const [tab, setTab] = useState<'form' | 'history'>('form');
  const [method, setMethod] = useState<'UPI' | 'BANK_CARD' | 'USDT'>('UPI');
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');

  // Account details
  const [upiId, setUpiId] = useState(currentUser?.phone ? `${currentUser.phone}@fam` : '8910968919@fam');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('STATE BANK OF INDIA');
  const [accountHolderName, setAccountHolderName] = useState(currentUser?.name || '');
  const [usdtAddress, setUsdtAddress] = useState('');

  if (!isOpen) return null;

  const quickAmounts = [100, 500, 1000, 2000, 3000, 5000, 10000, 20000];

  const handleSelectAmount = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(amt.toString());
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setSelectedAmount(num);
    }
  };

  const handleAllBalance = () => {
    if (currentUser) {
      const balance = Math.floor(currentUser.balance);
      setSelectedAmount(balance);
      setCustomAmount(balance.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast('Please log in first', 'error');
      return;
    }

    if (selectedAmount < adminSettings.minWithdraw || selectedAmount > adminSettings.maxWithdraw) {
      toast(
        `Withdrawal amount must be between ₹${adminSettings.minWithdraw} and ₹${adminSettings.maxWithdraw.toLocaleString()}`,
        'error'
      );
      return;
    }

    if (currentUser.balance < selectedAmount) {
      toast(`Insufficient balance! Available: ₹${currentUser.balance.toFixed(2)}`, 'error');
      return;
    }

    let accountDetails: any = {};
    if (method === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        toast('Please enter a valid UPI ID (e.g. 8910968919@fam)', 'error');
        return;
      }
      accountDetails = { upiId: upiId.trim() };
    } else if (method === 'BANK_CARD') {
      if (!accountNumber || !ifsc || !accountHolderName) {
        toast('Please fill all bank account details', 'error');
        return;
      }
      accountDetails = {
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase(),
        bankName,
        accountHolderName: accountHolderName.trim(),
      };
    } else {
      if (!usdtAddress || usdtAddress.length < 10) {
        toast('Please enter valid USDT TRC20/BEP20 address', 'error');
        return;
      }
      accountDetails = { usdtAddress: usdtAddress.trim() };
    }

    const res = submitWithdrawal(selectedAmount, method, accountDetails);
    if (res.success) {
      setTab('history');
    }
  };

  const userWithdrawals = currentUser
    ? withdrawalRequests.filter((w) => w.userId === currentUser.id)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col bg-gradient-to-b from-[#330c11] via-[#240609] to-[#140204] rounded-2xl border border-rose-900/60 shadow-2xl text-neutral-100 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#29070b] border-b border-rose-900/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {tab === 'history' && (
              <button
                onClick={() => setTab('form')}
                className="w-7 h-7 rounded-full bg-[#3d0f14] flex items-center justify-center text-rose-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-bold text-white tracking-wide">
              {tab === 'form' ? 'Withdraw' : 'Withdrawal History'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTab(tab === 'history' ? 'form' : 'history')}
              className="text-xs font-semibold text-rose-300 flex items-center space-x-1 hover:text-white bg-[#3d0f14] px-2.5 py-1 rounded-full border border-rose-800/40"
            >
              <History className="w-3.5 h-3.5" />
              <span>{tab === 'history' ? 'New Request' : 'History'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#3d0f14] flex items-center justify-center text-rose-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto no-scrollbar flex-1 p-4 space-y-4">
          {tab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Balance Card matching IMG_2551 */}
              <div className="bg-gradient-to-r from-[#e57f70] to-[#f9b29e] rounded-xl p-3.5 text-rose-950 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold">
                    <span>💳</span>
                    <span>Available Balance</span>
                  </div>
                  <span className="text-xs opacity-75">ROX WIN Main</span>
                </div>
                <div className="text-2xl font-black mt-1">
                  ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
                </div>
              </div>

              {/* 100% Turnover / Wagering Requirement Card ("withdraw 100 need to net 100 20000 diposit need to bet able 20000") */}
              {(() => {
                const required = currentUser?.requiredBetToWithdraw || 0;
                const wagered = currentUser?.totalWagered || 0;
                const isLocked = required > 0;
                return (
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      isLocked
                        ? 'bg-[#3d0f14] border-amber-500/80 shadow-md'
                        : 'bg-[#183120] border-emerald-500/70 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm">{isLocked ? '⚠️' : '✅'}</span>
                        <span className="font-bold text-white">Turnover / Wagering Rule</span>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          isLocked ? 'text-amber-300' : 'text-emerald-300'
                        }`}
                      >
                        {isLocked
                          ? `Need to bet ₹${required.toFixed(2)}`
                          : 'Completed (₹0.00)'}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
                      {isLocked
                        ? `100% Deposit Turnover: You must bet ₹${required.toFixed(2)} more before withdrawal unlocks. Every bet on WinGo, Aviator, Mines, or Slots counts!`
                        : 'All turnover requirements completed! You can withdraw your balance anytime.'}
                    </p>

                    {isLocked && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[10px] text-neutral-400">
                          <span>Wagered: ₹{wagered.toFixed(2)}</span>
                          <span className="text-amber-300 font-bold">Remaining: ₹{required.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-rose-950">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  5,
                                  (wagered / Math.max(1, wagered + required)) * 100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Method Cards matching screenshot IMG_2551 */}
              <div>
                <label className="text-xs font-bold text-rose-200 block mb-2">
                  Select Withdrawal Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI' as const, label: 'UPI', sub: 'Instant Bank Pay', icon: '📱' },
                    { id: 'BANK_CARD' as const, label: 'BANK CARD', sub: 'IMPS/NEFT', icon: '🏛️' },
                    { id: 'USDT' as const, label: 'USDT', sub: 'TRC20 Wallet', icon: '₮' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        method === m.id
                          ? 'bg-gradient-to-b from-[#4e161e] to-[#3a0d13] border-amber-400 text-white shadow-md'
                          : 'bg-[#350d12] border-rose-900/40 text-neutral-300 hover:bg-[#421219]'
                      }`}
                    >
                      <div className="text-xl mb-1">{m.icon}</div>
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className="text-[10px] text-rose-300/70">{m.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Input Fields */}
              <div className="bg-[#380e14] p-3.5 rounded-xl border border-rose-900/50 space-y-3">
                {method === 'UPI' && (
                  <div>
                    <label className="block text-xs font-semibold text-rose-200 mb-1">
                      UPI ID for Receiving Payout *
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. 8910968919@fam or name@okaxis"
                      className="w-full px-3 py-2 bg-[#451219] border border-rose-800/60 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                {method === 'BANK_CARD' && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-rose-200 mb-1 font-semibold">Account Holder Name</label>
                      <input
                        type="text"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        placeholder="Full Name as per Passbook"
                        className="w-full px-3 py-2 bg-[#451219] border border-rose-800/60 rounded-xl text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-rose-200 mb-1 font-semibold">Account Number</label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Account Number"
                          className="w-full px-3 py-2 bg-[#451219] border border-rose-800/60 rounded-xl text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-rose-200 mb-1 font-semibold">IFSC Code</label>
                        <input
                          type="text"
                          value={ifsc}
                          onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                          placeholder="SBIN0001234"
                          className="w-full px-3 py-2 bg-[#451219] border border-rose-800/60 rounded-xl text-white font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {method === 'USDT' && (
                  <div>
                    <label className="block text-xs font-semibold text-rose-200 mb-1">
                      USDT Address (TRC20) *
                    </label>
                    <input
                      type="text"
                      value={usdtAddress}
                      onChange={(e) => setUsdtAddress(e.target.value)}
                      placeholder="T..."
                      className="w-full px-3 py-2 bg-[#451219] border border-rose-800/60 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* Amount Selection matching screenshot IMG_2551 */}
              <div>
                <label className="text-xs font-bold text-rose-200 block mb-2">
                  Withdrawal Amount
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedAmount === amt
                          ? 'bg-gradient-to-r from-[#fea076] to-[#ff7360] text-rose-950 border-amber-300 shadow font-black scale-105'
                          : 'bg-[#3b0f15] border-rose-900/50 text-neutral-200 hover:bg-[#4d141c]'
                      }`}
                    >
                      {amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  ))}
                </div>

                {/* Custom Amount input & "All" button matching screenshot */}
                <div className="mt-2.5 relative flex items-center">
                  <span className="absolute left-3.5 text-rose-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={adminSettings.minWithdraw}
                    max={adminSettings.maxWithdraw}
                    value={customAmount}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder="Please enter the amount"
                    className="w-full pl-8 pr-16 py-2.5 bg-[#421219] border border-rose-900/60 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-rose-400"
                  />
                  <button
                    type="button"
                    onClick={handleAllBalance}
                    className="absolute right-2 px-3 py-1 bg-rose-950 border border-rose-700/60 text-rose-300 hover:text-white rounded-lg text-xs font-bold"
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Summary line */}
              <div className="p-3 bg-[#2d090e] border border-rose-900/40 rounded-xl flex items-center justify-between text-xs">
                <span className="text-neutral-400">Net payout to receive:</span>
                <span className="font-bold text-amber-300 text-sm">
                  ₹{selectedAmount ? selectedAmount.toFixed(2) : '0.00'}
                </span>
              </div>

              {/* Action Button */}
              {(() => {
                const required = currentUser?.requiredBetToWithdraw || 0;
                const isLocked = required > 0;
                return (
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-full font-black text-sm shadow-xl active:scale-[0.99] transition-all flex items-center justify-center space-x-2 ${
                      isLocked
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-neutral-900 hover:brightness-110'
                        : 'bg-gradient-to-r from-[#fea076] via-[#ff7360] to-[#ff5b45] text-rose-950 hover:brightness-105'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {isLocked
                        ? `Need to bet ₹${required.toFixed(2)} to withdraw`
                        : `Withdraw ₹${selectedAmount.toLocaleString()}`}
                    </span>
                  </button>
                );
              })()}

              {/* Rule notes matching screenshot IMG_2551 & user specification */}
              <div className="text-[11px] text-neutral-400 space-y-1 pt-1 leading-relaxed">
                <p className="font-bold text-amber-300">
                  ♦ Need to bet ₹{(currentUser?.requiredBetToWithdraw || 0).toFixed(2)} to be able to withdraw
                </p>
                <p>
                  ♦ 100% Deposit Turnover Rule: Any deposit (₹100 - ₹20,000) must be wagered before withdrawal.
                </p>
                <p>♦ Withdraw time: 00:00 - 23:59 (24/7 All time)</p>
                <p>♦ Inday Remaining Withdrawal Times: 3</p>
                <p>♦ Withdrawal amount range: ₹100.00 - ₹200,000.00</p>
                <p>
                  ♦ Please check your registered bank/UPI information carefully before withdrawing.
                </p>
              </div>
            </form>
          ) : (
            /* WITHDRAWAL HISTORY TAB */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Total Requests: {userWithdrawals.length}</span>
                <span className="text-rose-300">Live Status Tracking</span>
              </div>

              {userWithdrawals.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-xs bg-[#2b080d] rounded-2xl border border-rose-900/40">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-rose-500/60" />
                  <p>No withdrawal requests yet.</p>
                  <button
                    onClick={() => setTab('form')}
                    className="mt-3 px-4 py-1.5 rounded-full bg-rose-600 text-white font-bold text-xs"
                  >
                    Withdraw Funds
                  </button>
                </div>
              ) : (
                userWithdrawals.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#380e14] border border-rose-900/50 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        ₹{item.amount.toLocaleString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/40'
                            : item.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-600/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-600/40'
                        }`}
                      >
                        {item.status === 'completed' && '✓ Paid & Completed'}
                        {item.status === 'rejected' && '✕ Rejected / Refunded'}
                        {item.status === 'pending' && '⏳ Processing By Accounts'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-400 font-mono">
                      <div>Method: <span className="text-neutral-200">{item.method}</span></div>
                      <div>
                        Destination:{' '}
                        <span className="text-amber-300 truncate">
                          {item.accountDetails?.upiId ||
                            item.accountDetails?.accountNumber ||
                            item.accountDetails?.usdtAddress}
                        </span>
                      </div>
                      <div>Date: <span className="text-neutral-300">{item.createdAt}</span></div>
                      {item.reviewedAt && (
                        <div>Updated: <span className="text-neutral-300">{item.reviewedAt}</span></div>
                      )}
                    </div>

                    {item.status === 'pending' && (
                      <div className="flex items-center justify-between pt-1 border-t border-rose-900/30 text-[10px] text-amber-300">
                        <span>Withdrawal in queue for admin payout</span>
                        <button
                          onClick={onOpenCustomerCare}
                          className="underline hover:text-white"
                        >
                          Customer Support
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
