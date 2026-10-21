import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  XCircle,
  QrCode,
  Users,
  CreditCard,
  MessageSquare,
  Lock,
  Upload,
  Search,
  RefreshCw,
  Sliders,
  DollarSign,
  Send,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const {
    isAdmin,
    adminLogin,
    adminLogout,
    adminSettings,
    updateAdminSettings,
    depositRequests,
    withdrawalRequests,
    approveDeposit,
    rejectDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    users,
    supportTickets,
    replyToTicket,
    transactions,
    toast,
  } = useApp();

  const [adminPhoneInput, setAdminPhoneInput] = useState('8910968919');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'qr' | 'users' | 'support' | 'transactions'>('deposits');
  const [userSearch, setUserSearch] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  // Settings form state
  const [editableUpi, setEditableUpi] = useState(adminSettings.upiId);
  const [editableName, setEditableName] = useState(adminSettings.upiName);
  const [editableMinDep, setEditableMinDep] = useState(adminSettings.minDeposit.toString());
  const [editableMaxDep, setEditableMaxDep] = useState(adminSettings.maxDeposit.toString());
  const [editableMinWdr, setEditableMinWdr] = useState(adminSettings.minWithdraw.toString());
  const [editableMaxWdr, setEditableMaxWdr] = useState(adminSettings.maxWithdraw.toString());

  if (!isOpen) return null;

  // Handle Admin Login
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    adminLogin(adminPhoneInput.trim(), passwordInput.trim());
    setPasswordInput('');
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateAdminSettings({ qrImageUrl: reader.result as string });
        toast('New UPI QR scanner image saved and activated!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminSettings({
      upiId: editableUpi.trim(),
      upiName: editableName.trim(),
      minDeposit: Number(editableMinDep) || 100,
      maxDeposit: Number(editableMaxDep) || 20000,
      minWithdraw: Number(editableMinWdr) || 100,
      maxWithdraw: Number(editableMaxWdr) || 200000,
    });
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedTicketId) return;
    replyToTicket(selectedTicketId, adminReplyText.trim(), true);
    setAdminReplyText('');
  };

  // Metrics calculation
  const pendingDeposits = depositRequests.filter((d) => d.status === 'pending');
  const pendingWithdrawals = withdrawalRequests.filter((w) => w.status === 'pending');
  const totalVerifiedDeposits = depositRequests
    .filter((d) => d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0);

  const filteredUsers = users.filter(
    (u) =>
      u.phone.includes(userSearch) ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.uid.includes(userSearch)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#1c0407] rounded-2xl border-2 border-amber-500/50 shadow-2xl text-neutral-100 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#2e090f] via-[#451017] to-[#2e090f] px-5 py-3.5 border-b border-rose-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wider flex items-center space-x-2">
                <span>ROX WIN ADMIN CONTROL PANEL</span>
                <span className="text-[10px] bg-amber-500 text-rose-950 font-black px-1.5 py-0.5 rounded">
                  OFFICIAL
                </span>
              </h2>
              <p className="text-[10px] text-amber-200/80">
                Payment Verification Desk &amp; Platform Controller
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAdmin && (
              <button
                onClick={adminLogout}
                className="px-2.5 py-1 text-xs font-bold text-rose-300 bg-rose-950 border border-rose-800 rounded-lg hover:text-white"
              >
                Lock Session
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* If not logged in as Admin, show login form */}
        {!isAdmin ? (
          <div className="p-8 text-center max-w-sm mx-auto space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-600/60 flex items-center justify-center mx-auto text-rose-400 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Administrator Access Only</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Authorized Admin access only (Phone: 8910968919).
              </p>
            </div>

            <form onSubmit={handleAdminAuth} className="space-y-3 pt-2 text-left text-xs">
              <div>
                <label className="block text-rose-200 mb-1 font-semibold">Admin Mobile Number</label>
                <input
                  type="tel"
                  value={adminPhoneInput}
                  onChange={(e) => setAdminPhoneInput(e.target.value)}
                  placeholder="8910968919"
                  className="w-full px-3.5 py-2.5 bg-[#310a10] border border-rose-800/80 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-rose-200 mb-1 font-semibold">Admin Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Password (jisan321)"
                  className="w-full px-3.5 py-2.5 bg-[#310a10] border border-rose-800/80 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-rose-600 text-rose-950 hover:brightness-110 shadow-lg mt-2"
              >
                Authenticate as Admin
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-[#260509] border-b border-rose-900/40 text-center">
              <div className="p-2 bg-[#36090e] rounded-xl border border-rose-900/60">
                <div className="text-[10px] text-amber-300 font-bold uppercase">Pending Deposits</div>
                <div className="text-lg font-black text-amber-400">{pendingDeposits.length}</div>
              </div>
              <div className="p-2 bg-[#36090e] rounded-xl border border-rose-900/60">
                <div className="text-[10px] text-rose-300 font-bold uppercase">Pending Payouts</div>
                <div className="text-lg font-black text-rose-400">{pendingWithdrawals.length}</div>
              </div>
              <div className="p-2 bg-[#36090e] rounded-xl border border-rose-900/60">
                <div className="text-[10px] text-emerald-300 font-bold uppercase">Total Verified</div>
                <div className="text-lg font-black text-emerald-400">₹{totalVerifiedDeposits.toLocaleString()}</div>
              </div>
              <div className="p-2 bg-[#36090e] rounded-xl border border-rose-900/60">
                <div className="text-[10px] text-neutral-300 font-bold uppercase">Registered Users</div>
                <div className="text-lg font-black text-white">{users.length}</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-rose-900/50 bg-[#2b080e] overflow-x-auto no-scrollbar text-xs font-bold">
              {[
                { id: 'deposits' as const, label: `Deposits (${pendingDeposits.length})`, icon: CreditCard },
                { id: 'withdrawals' as const, label: `Withdrawals (${pendingWithdrawals.length})`, icon: DollarSign },
                { id: 'qr' as const, label: 'QR & UPI Settings', icon: QrCode },
                { id: 'users' as const, label: 'Users & Balances', icon: Users },
                { id: 'support' as const, label: `Support (${supportTickets.length})`, icon: MessageSquare },
                { id: 'transactions' as const, label: 'Ledger Logs', icon: RefreshCw },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2.5 flex items-center space-x-1.5 whitespace-nowrap transition-all border-b-2 ${
                      activeTab === t.id
                        ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                        : 'border-transparent text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
              {/* TAB 1: DEPOSITS REVIEW (VERIFY BEFORE CREDITING) */}
              {activeTab === 'deposits' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-200">
                      Payment Verification Queue (Verify payments before crediting any wallet balance)
                    </span>
                    <span className="text-[11px] text-neutral-400">Total: {depositRequests.length}</span>
                  </div>

                  {depositRequests.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-xs bg-[#240609] rounded-xl border border-rose-900/40">
                      No deposit requests recorded.
                    </div>
                  ) : (
                    depositRequests.map((dep) => (
                      <div
                        key={dep.id}
                        className={`p-3.5 rounded-xl border space-y-2.5 text-xs transition-all ${
                          dep.status === 'pending'
                            ? 'bg-[#3b0f15] border-amber-500/60 shadow-lg'
                            : dep.status === 'approved'
                            ? 'bg-[#21090d] border-emerald-900/60 opacity-80'
                            : 'bg-[#21090d] border-rose-950 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-black text-white">
                              ₹{dep.amount.toLocaleString()}
                            </span>
                            <span className="text-[11px] bg-rose-950 border border-rose-800 px-2 py-0.5 rounded text-neutral-300">
                              {dep.channel}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              dep.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/50'
                                : dep.status === 'rejected'
                                ? 'bg-rose-950 text-rose-400 border border-rose-600/50'
                                : 'bg-amber-950 text-amber-300 border border-amber-500 animate-pulse'
                            }`}
                          >
                            {dep.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300 bg-black/30 p-2.5 rounded-lg">
                          <div>
                            User: <strong className="text-white">{dep.userName}</strong> ({dep.userPhone})
                          </div>
                          <div>
                            UTR Ref: <span className="font-mono text-amber-300 font-bold">{dep.utr}</span>
                          </div>
                          <div>Submitted: {dep.createdAt}</div>
                          {dep.screenshotUrl && (
                            <div>
                              <button
                                onClick={() => setPreviewScreenshot(dep.screenshotUrl!)}
                                className="text-rose-400 underline font-bold flex items-center space-x-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Receipt Proof</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {dep.status === 'pending' && (
                          <div className="flex items-center space-x-2 pt-1">
                            <button
                              onClick={() => approveDeposit(dep.id)}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-1 transition-all"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Verify &amp; Credit Wallet (+₹{dep.amount})</span>
                            </button>
                            <button
                              onClick={() => rejectDeposit(dep.id, 'Invalid or Uncredited UTR')}
                              className="px-4 py-2 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-lg font-bold text-xs flex items-center justify-center space-x-1 transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: WITHDRAWALS REVIEW */}
              {activeTab === 'withdrawals' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-200">
                      Withdrawal Payout Requests
                    </span>
                    <span className="text-[11px] text-neutral-400">Total: {withdrawalRequests.length}</span>
                  </div>

                  {withdrawalRequests.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-xs bg-[#240609] rounded-xl border border-rose-900/40">
                      No withdrawal requests placed yet.
                    </div>
                  ) : (
                    withdrawalRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-xl border border-rose-900/50 bg-[#350d12] space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-white">
                            ₹{req.amount.toLocaleString()} ({req.method})
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              req.status === 'completed'
                                ? 'bg-emerald-950 text-emerald-400'
                                : req.status === 'rejected'
                                ? 'bg-rose-950 text-rose-400'
                                : 'bg-amber-950 text-amber-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <div className="bg-black/30 p-2.5 rounded-lg text-[11px] text-neutral-300 space-y-1">
                          <div>User: {req.userName} ({req.userPhone})</div>
                          {req.method === 'UPI' && (
                            <div>Payee UPI: <strong className="text-amber-300">{req.accountDetails.upiId}</strong></div>
                          )}
                          {req.method === 'BANK_CARD' && (
                            <div>
                              Bank: {req.accountDetails.bankName} • Acc: {req.accountDetails.accountNumber} • IFSC: {req.accountDetails.ifsc}
                            </div>
                          )}
                          {req.method === 'USDT' && (
                            <div>USDT Address: {req.accountDetails.usdtAddress}</div>
                          )}
                          <div className="text-neutral-500">Requested: {req.createdAt}</div>
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex space-x-2 pt-1">
                            <button
                              onClick={() => approveWithdrawal(req.id)}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                            >
                              Confirm Payout Completed
                            </button>
                            <button
                              onClick={() => rejectWithdrawal(req.id, 'Payment declined')}
                              className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-rose-200 font-bold rounded-lg text-xs"
                            >
                              Reject &amp; Refund
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: QR SCANNER IMAGE & UPI SETTINGS (Upload & Replace Option) */}
              {activeTab === 'qr' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#2b080d] border border-amber-500/40 rounded-xl space-y-3">
                    <h3 className="text-sm font-bold text-amber-300 flex items-center space-x-2">
                      <QrCode className="w-4 h-4" />
                      <span>UPI QR Scanner Image Management</span>
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Upload your own UPI QR code image here. All users on the Deposit page will scan this exact QR code to pay you.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                      {/* Current Active QR Image */}
                      <div className="w-48 h-48 bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center border-2 border-rose-500/50">
                        <img
                          src={adminSettings.qrImageUrl}
                          alt="Active QR Scanner"
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>

                      <div className="flex-1 space-y-3 w-full">
                        <div>
                          <span className="text-xs font-semibold text-rose-200 block mb-1">
                            Replace QR Code Image
                          </span>
                          <label className="flex items-center justify-center space-x-2 w-full py-3 bg-[#421219] hover:bg-[#52161f] border-2 border-dashed border-rose-600/70 rounded-xl cursor-pointer text-xs font-bold text-amber-300 transition-all">
                            <Upload className="w-4 h-4" />
                            <span>Click to Browse &amp; Upload New QR Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleQrUpload}
                            />
                          </label>
                        </div>

                        <div className="text-[11px] text-neutral-400 space-y-0.5">
                          <p>• Default image: <span className="font-mono text-neutral-300">IMG_2506_7b474cb2.png</span></p>
                          <p>• Supported formats: PNG, JPG, WebP</p>
                          <p>• Changes apply instantly to all active deposit screens.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Limits & UPI ID Form */}
                  <form onSubmit={handleSaveSettings} className="p-4 bg-[#2b080d] border border-rose-900/50 rounded-xl space-y-3 text-xs">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-rose-400" />
                      <span>UPI ID &amp; Payment Limits</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-rose-200 mb-1 font-semibold">Active UPI ID</label>
                        <input
                          type="text"
                          value={editableUpi}
                          onChange={(e) => setEditableUpi(e.target.value)}
                          className="w-full px-3 py-2 bg-[#3f1016] border border-rose-800 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-rose-200 mb-1 font-semibold">Payee Display Name</label>
                        <input
                          type="text"
                          value={editableName}
                          onChange={(e) => setEditableName(e.target.value)}
                          className="w-full px-3 py-2 bg-[#3f1016] border border-rose-800 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-rose-200 mb-1 font-semibold">Min Deposit (₹)</label>
                        <input
                          type="number"
                          value={editableMinDep}
                          onChange={(e) => setEditableMinDep(e.target.value)}
                          className="w-full px-3 py-2 bg-[#3f1016] border border-rose-800 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-rose-200 mb-1 font-semibold">Max Deposit (₹)</label>
                        <input
                          type="number"
                          value={editableMaxDep}
                          onChange={(e) => setEditableMaxDep(e.target.value)}
                          className="w-full px-3 py-2 bg-[#3f1016] border border-rose-800 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-rose-200 mb-1 font-semibold">Min Withdrawal (₹)</label>
                        <input
                          type="number"
                          value={editableMinWdr}
                          onChange={(e) => setEditableMinWdr(e.target.value)}
                          className="w-full px-3 py-2 bg-[#3f1016] border border-rose-800 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-rose-200 mb-1 font-semibold">Max Withdrawal (₹)</label>
                        <input
                          type="number"
                          value={editableMaxWdr}
                          onChange={(e) => setEditableMaxWdr(e.target.value)}
                          className="w-full px-3 py-2 bg-[#3f1016] border border-rose-800 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    {/* Bot Difficulty & Win/Loss Control */}
                    <div className="p-3 bg-[#3f1016] border border-amber-500/40 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-300">
                          🤖 Game Bot Settings: High Loss / Low Win Rate
                        </label>
                        <span className="text-xs font-black text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                          Active (75% Loss)
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300">
                        Configured for high house edge across WinGo, Aviator, Mines, and Slots.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 text-rose-950 font-bold hover:brightness-105 transition-all"
                    >
                      Save Configuration
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: USERS & BALANCES */}
              {activeTab === 'users' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by phone, UID, or name..."
                        className="w-full pl-9 pr-3 py-2 bg-[#2d090f] border border-rose-900 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-3 bg-[#310c11] border border-rose-900/50 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center space-x-2">
                            <span>{u.name}</span>
                            <span className="text-[10px] bg-rose-950 px-1.5 py-0.2 rounded border border-rose-800 text-rose-300">
                              UID: {u.uid}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            Phone: <span className="text-neutral-200">{u.phone}</span> • Joined: {u.createdAt}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-neutral-400">Wallet Balance</div>
                          <div className="text-base font-black text-amber-300">
                            ₹{u.balance.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SUPPORT TICKETS & CHAT */}
              {activeTab === 'support' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[52vh]">
                  {/* Ticket List */}
                  <div className="overflow-y-auto no-scrollbar space-y-2 pr-1 border-r border-rose-900/40">
                    <div className="text-xs font-bold text-rose-300 mb-1">Inquiries &amp; UTR Queries</div>
                    {supportTickets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTicketId(t.id)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                          selectedTicketId === t.id
                            ? 'bg-[#4a141b] border-amber-400 text-white'
                            : 'bg-[#2b080d] border-rose-900/40 text-neutral-300 hover:bg-[#380e14]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold truncate">{t.userName} ({t.userPhone})</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/40 text-amber-300">
                            {t.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-rose-200 truncate">{t.category}</div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {t.messages[t.messages.length - 1]?.text}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Active Conversation */}
                  <div className="flex flex-col h-full bg-[#230508] p-3 rounded-xl border border-rose-900/50">
                    {selectedTicketId ? (
                      <>
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-2 pr-1">
                          {supportTickets
                            .find((t) => t.id === selectedTicketId)
                            ?.messages.map((m) => (
                              <div
                                key={m.id}
                                className={`flex flex-col ${
                                  m.sender === 'admin' ? 'items-end' : 'items-start'
                                }`}
                              >
                                <span className="text-[9px] text-neutral-500 px-1">
                                  {m.senderName} • {m.timestamp}
                                </span>
                                <div
                                  className={`max-w-[85%] p-2 rounded-xl text-xs ${
                                    m.sender === 'admin'
                                      ? 'bg-amber-500 text-rose-950 font-semibold'
                                      : 'bg-[#3b0f15] text-neutral-200 border border-rose-900/50'
                                  }`}
                                >
                                  {m.text}
                                </div>
                              </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendAdminReply} className="flex space-x-1.5 pt-1">
                          <input
                            type="text"
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                            placeholder="Type admin response..."
                            className="flex-1 px-3 py-1.5 bg-[#3b0f15] border border-rose-800 rounded-lg text-xs text-white"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-rose-950 rounded-lg font-bold text-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-neutral-500">
                        Select an inquiry on the left to review and reply
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: TRANSACTIONS AUDIT */}
              {activeTab === 'transactions' && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-rose-200 mb-1">
                    Financial Audit Ledger
                  </div>
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 bg-[#2b080d] border border-rose-900/40 rounded-xl flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <div className="text-white font-bold">{tx.description}</div>
                        <div className="text-[10px] text-neutral-500">{tx.timestamp}</div>
                      </div>
                      <div
                        className={`font-black text-sm ${
                          tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.amount > 0 ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Screenshot Modal preview */}
        {previewScreenshot && (
          <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#200508] p-3 rounded-2xl border border-rose-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Payment Screenshot Proof</span>
                <button onClick={() => setPreviewScreenshot(null)}>
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <img
                src={previewScreenshot}
                alt="Receipt Proof"
                className="w-full max-h-[60vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
