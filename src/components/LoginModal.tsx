import React, { useState } from 'react';
import { Eye, EyeOff, X, Phone, Mail, CheckSquare, Square, Crown } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomerService: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenCustomerService }) => {
  const { login, register } = useApp();
  const [tab, setTab] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const targetIdentifier = tab === 'phone' ? phone : email;
    if (!targetIdentifier.trim()) {
      setError(tab === 'phone' ? 'Please enter mobile number' : 'Please enter email address');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (isRegisterMode) {
      const res = register(targetIdentifier, password);
      if (res.success) {
        onClose();
      } else if (res.error) {
        setError(res.error);
      }
    } else {
      const res = login(targetIdentifier, password);
      if (res.success) {
        onClose();
      } else if (res.error) {
        setError(res.error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-gradient-to-b from-[#380e14] via-[#240508] to-[#140204] rounded-2xl border border-rose-900/60 shadow-2xl overflow-hidden text-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header matching screenshot IMG_2534 */}
        <div className="bg-gradient-to-r from-rose-500/30 via-amber-500/20 to-transparent p-4 pb-5 border-b border-rose-900/40 relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-rose-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 mb-2">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xl font-black metallic-logo-text tracking-tighter">ROX</span>
            <span className="text-[11px] font-black text-rose-500 bg-rose-950 border border-rose-600/40 px-1 py-0.5 rounded">.WIN</span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-wide">
            {isRegisterMode ? 'Register New Account' : 'Log in'}
          </h2>
          <p className="text-[11px] text-rose-200/80 mt-1 leading-relaxed">
            {isRegisterMode ? (
              <>🎁 New accounts receive <strong className="text-amber-300">₹3.00 Welcome Bonus</strong> instantly! (1 phone number can register once)</>
            ) : (
              <>Please log in with your mobile number and password.</>
            )}
          </p>
        </div>

        {/* Tab switch matching IMG_2534 */}
        <div className="flex border-b border-rose-900/40 text-sm font-semibold">
          <button
            onClick={() => setTab('phone')}
            className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all relative ${
              tab === 'phone' ? 'text-rose-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Phone Number</span>
            {tab === 'phone' && (
              <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab('email')}
            className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all relative ${
              tab === 'email' ? 'text-rose-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
            {tab === 'email' && (
              <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-600/60 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {tab === 'phone' ? (
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 mb-1.5 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Phone number</span>
              </label>
              <div className="flex space-x-2">
                <div className="w-20 px-2.5 py-2.5 bg-[#421219] border border-rose-900/60 rounded-xl text-neutral-200 text-xs font-bold flex items-center justify-between">
                  <span>+91</span>
                  <span className="text-[10px] text-neutral-400">▼</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter mobile number"
                  className="flex-1 px-3 py-2.5 bg-[#421219] border border-rose-900/60 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 mb-1.5 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                <span>Email address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2.5 bg-[#421219] border border-rose-900/60 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-rose-200/80 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-[#421219] border border-rose-900/60 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember password & Forgot password */}
          <div className="flex items-center justify-between text-xs pt-1 text-neutral-400">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center space-x-1.5 hover:text-rose-200"
            >
              {rememberMe ? (
                <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Square className="w-3.5 h-3.5 text-neutral-500" />
              )}
              <span>Remember password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCustomerService();
              }}
              className="text-rose-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Action Buttons matching IMG_2534 */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              className="w-full py-2.5 rounded-full font-bold text-sm bg-gradient-to-r from-[#fea076] to-[#ff7360] text-rose-950 shadow-lg shadow-rose-950/60 hover:brightness-105 active:scale-[0.99] transition-all"
            >
              {isRegisterMode ? 'Complete Registration' : 'Log in'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError('');
              }}
              className="w-full py-2.5 rounded-full font-bold text-sm border border-rose-600/80 text-rose-400 bg-transparent hover:bg-rose-950/40 active:scale-[0.99] transition-all"
            >
              {isRegisterMode ? 'Already have an account? Log in' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
