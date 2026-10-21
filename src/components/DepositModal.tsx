import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  History,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomerCare: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onOpenCustomerCare }) => {
  const {
    currentUser,
    adminSettings,
    submitDeposit,
    depositRequests,
    toast,
    updateAdminSettings,
    isAdmin,
  } = useApp();

  const [step, setStep] = useState<'select' | 'checkout' | 'history'>('select');
  const [selectedChannel, setSelectedChannel] = useState('Phonepe_QR');
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [screenshotProof, setScreenshotProof] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);

  if (!isOpen) return null;

  const quickAmounts = [100, 200, 300, 400, 500, 1000, 2000, 3000, 5000, 10000, 20000];

  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(amt.toString());
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setSelectedAmount(num);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(adminSettings.upiId);
    toast(`UPI ID copied: ${adminSettings.upiId}`, 'success');
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotProof(reader.result as string);
        toast('Payment screenshot attached', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Admin QR Code Replace option on-the-fly
  const handleAdminQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateAdminSettings({ qrImageUrl: reader.result as string });
        toast('Deposit QR Code image replaced successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedAmount < adminSettings.minDeposit || selectedAmount > adminSettings.maxDeposit) {
      toast(
        `Amount must be between ₹${adminSettings.minDeposit} and ₹${adminSettings.maxDeposit.toLocaleString()}`,
        'error'
      );
      return;
    }
    setStep('checkout');
  };

  const handleSubmitUtr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.trim().length < 8) {
      toast('Please enter valid 12-digit UTR transaction number', 'error');
      return;
    }

    setSubmitting(true);
    const result = submitDeposit(selectedAmount, selectedChannel, utrNumber, screenshotProof);
    setSubmitting(false);

    if (result.success) {
      setSubmittedRequest(result.request);
      setUtrNumber('');
      setScreenshotProof('');
    } else if (result.error) {
      toast(result.error, 'error');
    }
  };

  const userDeposits = currentUser
    ? depositRequests.filter((d) => d.userId === currentUser.id)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col bg-gradient-to-b from-[#330c11] via-[#240609] to-[#140204] rounded-2xl border border-rose-900/60 shadow-2xl text-neutral-100 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-[#29070b] border-b border-rose-900/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {step !== 'select' && (
              <button
                onClick={() => setStep('select')}
                className="w-7 h-7 rounded-full bg-[#3d0f14] flex items-center justify-center text-rose-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-bold text-white tracking-wide">
              {step === 'select' && 'Deposit'}
              {step === 'checkout' && 'ArUpiPay UPI Scanner'}
              {step === 'history' && 'Deposit History'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStep(step === 'history' ? 'select' : 'history')}
              className="text-xs font-semibold text-rose-300 flex items-center space-x-1 hover:text-white bg-[#3d0f14] px-2.5 py-1 rounded-full border border-rose-800/40"
            >
              <History className="w-3.5 h-3.5" />
              <span>{step === 'history' ? 'New Deposit' : 'History'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#3d0f14] flex items-center justify-center text-rose-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto no-scrollbar flex-1 p-4 space-y-4">
          {/* STEP 1: SELECT CHANNEL & AMOUNT (Matching IMG_2548) */}
          {step === 'select' && (
            <>
              {/* Balance Card matching screenshot */}
              <div className="bg-gradient-to-r from-[#e57f70] to-[#f9b29e] rounded-xl p-3.5 text-rose-950 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold">
                    <span>💼</span>
                    <span>Available Balance</span>
                  </div>
                  <span className="text-xs opacity-75">ROX WIN Wallet</span>
                </div>
                <div className="text-2xl font-black mt-1">
                  ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
                </div>
              </div>

              {/* Payment Methods Grid matching IMG_2548 */}
              <div>
                <label className="text-xs font-bold text-rose-200 block mb-2">
                  Payment Methods
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI x QR', label: 'UPI x QR', sub: 'Fast scan', icon: '⚡' },
                    { id: 'Phonepe_QR', label: 'Phonepe QR', sub: 'Instant UTR', icon: '📱', active: true },
                    { id: 'QR Pay', label: 'Paytm QR', sub: 'Zero fee', icon: '💠' },
                    { id: 'Online Pay', label: 'Online Pay', sub: 'NetBanking', icon: '💳' },
                    { id: 'Now UPI', label: 'Now UPI', sub: 'Express', icon: '🚀' },
                    { id: 'USDT', label: 'USDT', sub: '+2% Extra', icon: '₮', badge: '+2%' },
                  ].map((chan) => (
                    <button
                      key={chan.id}
                      onClick={() => setSelectedChannel(chan.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative ${
                        selectedChannel === chan.id
                          ? 'bg-[#4e161d] border-amber-400 text-white shadow-md'
                          : 'bg-[#350d12] border-rose-900/40 text-neutral-300 hover:bg-[#421219]'
                      }`}
                    >
                      {chan.badge && (
                        <span className="absolute top-1 right-1 bg-amber-500 text-rose-950 text-[9px] font-black px-1 rounded-sm">
                          {chan.badge}
                        </span>
                      )}
                      <div className="text-lg mb-0.5">{chan.icon}</div>
                      <div className="text-xs font-bold truncate">{chan.label}</div>
                      <div className="text-[10px] text-rose-300/70">{chan.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Top-up Coupons card matching screenshot */}
              <div className="p-3 bg-[#380e14] border border-rose-900/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-lg bg-rose-600/30 border border-rose-500/40 flex items-center justify-center font-black text-rose-300 text-xs">
                    5%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-200">Recharge Cashback Bonus</div>
                    <div className="text-[10px] text-neutral-400">Min recharge ₹200 • Max bonus ₹5,899</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  Applied
                </span>
              </div>

              {/* Deposit Amount selector (₹100 to ₹20,000) matching screenshot */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-rose-200">
                    Deposit Amount (₹100 - ₹20,000)
                  </label>
                  <span className="text-[10px] text-amber-300">Fast Auto-Select</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountSelect(amt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedAmount === amt
                          ? 'bg-gradient-to-r from-[#fea076] to-[#ff7360] text-rose-950 border-amber-300 shadow-md font-black scale-105'
                          : 'bg-[#3b0f15] border-rose-900/50 text-neutral-200 hover:bg-[#4d141c]'
                      }`}
                    >
                      ₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  ))}
                </div>

                {/* Custom Amount input */}
                <div className="mt-2.5 relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={adminSettings.minDeposit}
                    max={adminSettings.maxDeposit}
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="Enter custom amount (₹100 - ₹20,000)"
                    className="w-full pl-8 pr-4 py-2.5 bg-[#421219] border border-rose-900/60 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Recharge Instructions */}
              <div className="p-3 bg-[#2d090e] border border-rose-900/40 rounded-xl text-[11px] text-neutral-300 space-y-1.5 leading-relaxed">
                <div className="font-bold text-rose-300 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-rose-400" />
                  <span>Important Instructions</span>
                </div>
                <p>• The transfer amount must match the order amount exactly.</p>
                <p>• Always submit your 12-digit UTR reference number after payment.</p>
                <p>• For safety, wallet balances are credited only after payment verification.</p>
              </div>

              {/* Deposit Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 rounded-full font-black text-sm bg-gradient-to-r from-[#fea076] via-[#ff7360] to-[#ff5b45] text-rose-950 shadow-xl shadow-rose-950/70 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Pay ₹{selectedAmount.toLocaleString()} via UPI QR</span>
                </button>
              </div>
            </>
          )}

          {/* STEP 2: CHECKOUT & QR SCANNER (Matching IMG_2550 & user's QR IMG_2506) */}
          {step === 'checkout' && (
            <div className="space-y-4">
              {submittedRequest ? (
                /* Submitted Confirmation Card */
                <div className="p-4 bg-[#2b080c] border border-amber-500/40 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto text-amber-400">
                    <Clock className="w-6 h-6 animate-spin" />
                  </div>
                  <h3 className="text-base font-bold text-amber-200">
                    Deposit Request Under Review
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    We received your payment submission of{' '}
                    <strong className="text-white">₹{submittedRequest.amount}</strong> with UTR:{' '}
                    <span className="font-mono text-amber-300">{submittedRequest.utr}</span>.
                  </p>
                  <div className="p-2.5 bg-black/40 rounded-xl text-left text-[11px] text-neutral-400 space-y-1">
                    <p>• Status: <span className="text-amber-400 font-bold">Pending Admin Verification</span></p>
                    <p>• Verification Time: Usually 1 - 5 minutes</p>
                    <p>• Balance will be credited immediately once confirmed by accounts desk.</p>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => setStep('history')}
                      className="flex-1 py-2 rounded-xl bg-[#441117] text-white text-xs font-bold hover:bg-[#57171f]"
                    >
                      View in History
                    </button>
                    <button
                      onClick={() => {
                        setSubmittedRequest(null);
                        setStep('select');
                      }}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-rose-950 font-black text-xs hover:brightness-105"
                    >
                      Make Another
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Amount Display & Timer matching IMG_2550 */}
                  <div className="bg-[#380e14] border border-rose-900/60 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-rose-300">Amount to Pay</div>
                      <div className="text-2xl font-black text-white flex items-center space-x-1.5">
                        <span>₹{selectedAmount.toFixed(2)}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedAmount.toString());
                            toast('Amount copied', 'info');
                          }}
                          className="text-neutral-400 hover:text-white"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400">Time Remaining</div>
                      <div className="text-sm font-mono font-bold text-amber-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>14:54</span>
                      </div>
                    </div>
                  </div>

                  {/* UPI Details Bar with Copy Button */}
                  <div className="p-3 bg-[#421219] border border-rose-800/50 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-rose-300">Pay to UPI ID:</div>
                      <div className="text-xs font-bold text-amber-300 font-mono">
                        {adminSettings.upiId}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Payee: {adminSettings.upiName}
                      </div>
                    </div>
                    <button
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy UPI</span>
                    </button>
                  </div>

                  {/* QR SCANNER CONTAINER (Displays User's exact QR screenshot IMG_2506) */}
                  <div className="p-4 bg-[#2b080d] border border-rose-900/60 rounded-2xl text-center space-y-3">
                    <div className="text-xs font-bold text-rose-200">
                      Scan QR Code with Any UPI App
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      (PhonePe, Google Pay, Paytm, BHIM, FamX, Cred)
                    </p>

                    {/* QR Code Image Display */}
                    <div className="w-56 h-56 mx-auto bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden border-2 border-rose-500/40">
                      <img
                        src={adminSettings.qrImageUrl}
                        alt="ROX WIN UPI Deposit QR"
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          // Fallback to sample QR if local image url is relative
                          (e.target as HTMLImageElement).src =
                            '/assets/aistudio/IMG_2506_7b474cb2.png';
                        }}
                      />
                    </div>

                    {/* Admin QR upload/replace shortcut - ONLY for admin 8910968919 */}
                    {isAdmin && currentUser?.phone === '8910968919' && (
                      <div className="pt-1">
                        <label className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-full cursor-pointer hover:bg-amber-900/60">
                          <Upload className="w-3 h-3" />
                          <span>Admin: Replace QR Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAdminQrUpload}
                          />
                        </label>
                      </div>
                    )}

                    <div className="text-[11px] text-neutral-400 space-y-1 pt-1">
                      <p>1. Open your UPI app and scan the QR code above.</p>
                      <p>2. Enter exact amount: <strong>₹{selectedAmount.toFixed(2)}</strong>.</p>
                      <p>3. Note the 12-digit UTR number and submit below.</p>
                    </div>
                  </div>

                  {/* UTR Input Form */}
                  <form onSubmit={handleSubmitUtr} className="space-y-3 bg-[#330c11] p-3.5 rounded-xl border border-rose-900/50">
                    <div>
                      <label className="block text-xs font-bold text-rose-200 mb-1">
                        Enter 12-Digit UTR / Transaction Reference Number *
                      </label>
                      <input
                        type="text"
                        maxLength={18}
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ''))}
                        placeholder="e.g. 429581902847"
                        required
                        className="w-full px-3.5 py-2.5 bg-[#451219] border border-rose-800/60 rounded-xl text-white font-mono text-sm tracking-wider focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[10px] text-neutral-400 mt-0.5 block">
                        Find this in your payment receipt as 'UTR', 'Ref No', or 'UPI Trans ID'.
                      </span>
                    </div>

                    {/* Optional Screenshot proof upload */}
                    <div>
                      <label className="block text-xs font-semibold text-rose-300 mb-1">
                        Upload Payment Screenshot (Optional for faster verification)
                      </label>
                      <label className="flex items-center justify-center space-x-2 w-full py-2 bg-[#451219] border border-dashed border-rose-800/60 rounded-xl cursor-pointer hover:bg-[#52161f] text-xs text-neutral-300">
                        <Upload className="w-3.5 h-3.5 text-rose-400" />
                        <span>{screenshotProof ? 'Screenshot Attached ✓' : 'Attach Receipt Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleScreenshotUpload}
                        />
                      </label>
                    </div>

                    {/* Submit Button matching IMG_2550 */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-full font-black text-sm bg-gradient-to-r from-[#fea076] to-[#ff7360] text-rose-950 shadow-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{submitting ? 'Submitting...' : 'Submit Deposit for Verification'}</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* STEP 3: DEPOSIT HISTORY */}
          {step === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Total Requests: {userDeposits.length}</span>
                <span className="text-rose-300">Live Status Tracking</span>
              </div>

              {userDeposits.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-xs bg-[#2b080d] rounded-2xl border border-rose-900/40">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-rose-500/60" />
                  <p>No deposit requests yet.</p>
                  <button
                    onClick={() => setStep('select')}
                    className="mt-3 px-4 py-1.5 rounded-full bg-rose-600 text-white font-bold text-xs"
                  >
                    Deposit Now
                  </button>
                </div>
              ) : (
                userDeposits.map((item) => (
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
                          item.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/40'
                            : item.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-600/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-600/40'
                        }`}
                      >
                        {item.status === 'approved' && '✓ Verified & Credited'}
                        {item.status === 'rejected' && '✕ Unverified / Rejected'}
                        {item.status === 'pending' && '⏳ Verification In Progress'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-400 font-mono">
                      <div>Channel: <span className="text-neutral-200">{item.channel}</span></div>
                      <div>UTR: <span className="text-amber-300">{item.utr}</span></div>
                      <div>Date: <span className="text-neutral-300">{item.createdAt}</span></div>
                      {item.reviewedAt && (
                        <div>Updated: <span className="text-neutral-300">{item.reviewedAt}</span></div>
                      )}
                    </div>

                    {item.status === 'pending' && (
                      <div className="flex items-center justify-between pt-1 border-t border-rose-900/30 text-[10px] text-amber-300">
                        <span>Payment pending admin review</span>
                        <button
                          onClick={onOpenCustomerCare}
                          className="underline hover:text-white"
                        >
                          Need Help?
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
