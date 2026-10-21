import React, { useState } from 'react';
import {
  Volume2,
  Trophy,
  Gamepad2,
  Plane,
  Dice5,
  Flame,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Crown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HomeTabProps {
  onSelectGame: (gameId: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenCustomerCare: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onSelectGame,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenCustomerCare,
}) => {
  const { adminSettings, currentUser } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'popular' | 'lottery' | 'mini' | 'slots' | 'sports'>('popular');
  const [showDetailNotice, setShowDetailNotice] = useState(false);

  const categories = [
    { id: 'popular' as const, label: 'Popular', icon: '🏆', color: 'from-blue-600 to-indigo-700' },
    { id: 'lottery' as const, label: 'Lottery', icon: '🎱', color: 'from-cyan-600 to-blue-700' },
    { id: 'mini' as const, label: 'Mini games', icon: '✈️', color: 'from-amber-600 to-orange-700' },
    { id: 'slots' as const, label: 'Slots', icon: '🎰', color: 'from-rose-600 to-red-700' },
    { id: 'sports' as const, label: 'Sports', icon: '⚽', color: 'from-emerald-600 to-green-700' },
  ];

  return (
    <div className="space-y-4 pb-28 text-neutral-100">
      {/* HERO BANNER matching screenshot IMG_2535 */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-rose-900/60 bg-gradient-to-r from-[#3e0b12] via-[#63141f] to-[#3e0b12]">
        <div className="p-5 flex flex-col justify-between min-h-[140px] relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/40">
              OFFICIAL CHANNEL • EXCLUSIVE BONUS
            </span>
            <span className="text-xs font-black text-rose-400">ROX WIN</span>
          </div>

          <div className="my-2">
            <h1 className="text-2xl font-black italic tracking-tight text-white drop-shadow-md">
              JOIN NOW &amp; WIN
            </h1>
            <p className="text-[11px] font-mono text-amber-200 mt-0.5">
              HTTPS://T.ME/RAXIGAME
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={adminSettings.telegramChannel}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-rose-950 font-black text-xs shadow-lg active:scale-95 transition-all flex items-center space-x-1"
            >
              <span>JOIN NOW</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onOpenDeposit}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 text-white font-black text-xs shadow-lg active:scale-95 transition-all"
            >
              RECHARGE 5%
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* ANNOUNCEMENT TICKER matching screenshot IMG_2535 */}
      <div className="flex items-center space-x-2 bg-[#2d090f] border border-rose-900/60 px-3 py-2 rounded-xl text-xs shadow-sm">
        <Volume2 className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee text-[11px] text-rose-200">
            Dear User, welcome to ROX WIN! ROX WIN is a brand-new premium entertainment platform with instant UPI deposits, 24/7 withdrawals, and verified fairness.
          </div>
        </div>
        <button
          onClick={() => setShowDetailNotice(true)}
          className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-rose-600 text-rose-950 font-bold text-[10px] rounded-lg shadow shrink-0"
        >
          Detail
        </button>
      </div>

      {/* CATEGORY SELECTOR PILLS matching screenshots IMG_2535 & IMG_2537 */}
      <div className="grid grid-cols-5 gap-1.5">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
              selectedCategory === c.id
                ? 'bg-gradient-to-b from-[#fea076] to-[#ff7360] text-rose-950 font-black shadow-lg shadow-rose-950/60 scale-105'
                : 'bg-[#2b080e] border border-rose-900/40 text-neutral-300 hover:bg-[#380e14]'
            }`}
          >
            <span className="text-xl mb-0.5">{c.icon}</span>
            <span className="text-[10px] truncate max-w-full">{c.label}</span>
          </button>
        ))}
      </div>

      {/* SECTION: PLATFORM RECOMMENDATIONS (Matching IMG_2535 & IMG_2536) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm">⭐</span>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Platform recommendation
            </h2>
            <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800 px-1.5 py-0.2 rounded font-bold">
              ALL 6
            </span>
          </div>
        </div>

        {/* Game Cards Grid matching screenshots */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* AVIATOR (Matching screenshot card) */}
          <div
            onClick={() => onSelectGame('aviator')}
            className="cursor-pointer group relative bg-gradient-to-b from-[#6b1420] to-[#380c12] rounded-2xl p-2.5 border border-rose-700/60 shadow-lg hover:border-amber-400 transition-all active:scale-95 flex flex-col justify-between aspect-[3/4]"
          >
            <div className="h-20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              ✈️
            </div>
            <div>
              <div className="text-xs font-black text-white tracking-wide truncate">
                AVIATOR
              </div>
              <div className="text-[9px] font-bold text-rose-300 bg-black/40 px-1.5 py-0.5 rounded mt-1 inline-block">
                RTP 97.36%
              </div>
            </div>
          </div>

          {/* CRICKET (Matching screenshot card) */}
          <div
            onClick={() => onSelectGame('cricket')}
            className="cursor-pointer group relative bg-gradient-to-b from-[#1b5e20] to-[#123816] rounded-2xl p-2.5 border border-emerald-600/60 shadow-lg hover:border-amber-400 transition-all active:scale-95 flex flex-col justify-between aspect-[3/4]"
          >
            <div className="h-20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              🏏
            </div>
            <div>
              <div className="text-xs font-black text-white tracking-wide truncate">
                CRICKET
              </div>
              <div className="text-[9px] font-bold text-emerald-300 bg-black/40 px-1.5 py-0.5 rounded mt-1 inline-block">
                RTP 97.64%
              </div>
            </div>
          </div>

          {/* FORTUNE GEMS / JILI SLOTS (Matching screenshot IMG_2559) */}
          <div
            onClick={() => onSelectGame('slots')}
            className="cursor-pointer group relative bg-gradient-to-b from-[#854d0e] to-[#451a03] rounded-2xl p-2.5 border border-amber-600/60 shadow-lg hover:border-amber-300 transition-all active:scale-95 flex flex-col justify-between aspect-[3/4]"
          >
            <div className="h-20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              🛕
            </div>
            <div>
              <div className="text-xs font-black text-white tracking-wide truncate">
                FORTUNE GEMS
              </div>
              <div className="text-[9px] font-bold text-amber-300 bg-black/40 px-1.5 py-0.5 rounded mt-1 inline-block">
                JILI SLOTS
              </div>
            </div>
          </div>

          {/* WINGO LOTTERY (Matching screenshot IMG_2537) */}
          <div
            onClick={() => onSelectGame('wingo')}
            className="cursor-pointer group relative bg-gradient-to-b from-[#7e22ce] to-[#4c1d95] rounded-2xl p-2.5 border border-purple-600/60 shadow-lg hover:border-amber-300 transition-all active:scale-95 flex flex-col justify-between aspect-[3/4]"
          >
            <div className="h-20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              🎱
            </div>
            <div>
              <div className="text-xs font-black text-white tracking-wide truncate">
                WINGO 30S / 1M
              </div>
              <div className="text-[9px] font-bold text-purple-200 bg-black/40 px-1.5 py-0.5 rounded mt-1 inline-block">
                HOT LOTTERY
              </div>
            </div>
          </div>

          {/* JILI MINES (Matching screenshot IMG_2558) */}
          <div
            onClick={() => onSelectGame('mines')}
            className="cursor-pointer group relative bg-gradient-to-b from-[#0050e6] to-[#002680] rounded-2xl p-2.5 border border-blue-500/60 shadow-lg hover:border-sky-300 transition-all active:scale-95 flex flex-col justify-between aspect-[3/4]"
          >
            <div className="h-20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              💎
            </div>
            <div>
              <div className="text-xs font-black text-white tracking-wide truncate">
                JILI MINES
              </div>
              <div className="text-[9px] font-bold text-sky-200 bg-black/40 px-1.5 py-0.5 rounded mt-1 inline-block">
                RTP 97.29%
              </div>
            </div>
          </div>

          {/* LIMBO ROCKET (Matching screenshot card) */}
          <div
            onClick={() => onSelectGame('limbo')}
            className="cursor-pointer group relative bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] rounded-2xl p-2.5 border border-rose-600/60 shadow-lg hover:border-amber-300 transition-all active:scale-95 flex flex-col justify-between aspect-[3/4]"
          >
            <div className="h-20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              🚀
            </div>
            <div>
              <div className="text-xs font-black text-white tracking-wide truncate">
                LIMBO ROCKET
              </div>
              <div className="text-[9px] font-bold text-rose-200 bg-black/40 px-1.5 py-0.5 rounded mt-1 inline-block">
                RTP 97.00%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPULAR LOTTERY MINI CARDS (Matching IMG_2537) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm">🎲</span>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Lottery &amp; Speed Games
            </h2>
          </div>
          <span className="text-[10px] text-amber-300">Live Draws</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectGame('wingo')}
            className="p-3 bg-[#380e14] hover:bg-[#48121b] border border-rose-900/60 rounded-xl flex items-center space-x-3 text-left transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-600/40 flex items-center justify-center text-xl">
              🎯
            </div>
            <div>
              <div className="text-xs font-bold text-white">WinGo 30s</div>
              <div className="text-[10px] text-rose-300">High speed 30-sec cycle</div>
            </div>
          </button>

          <button
            onClick={() => onSelectGame('wingo')}
            className="p-3 bg-[#380e14] hover:bg-[#48121b] border border-rose-900/60 rounded-xl flex items-center space-x-3 text-left transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center text-xl">
              🎲
            </div>
            <div>
              <div className="text-xs font-bold text-white">TRX WinGo</div>
              <div className="text-[10px] text-rose-300">Blockchain Hash Match</div>
            </div>
          </button>
        </div>
      </div>

      {/* FLOATING DESKTOP APP PROMPT matching screenshot IMG_2535 */}
      <div className="p-3 bg-gradient-to-r from-[#fea076] to-[#ff7360] rounded-2xl text-rose-950 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-950 flex items-center justify-center font-black text-rose-300 text-xs">
            ROX
          </div>
          <div>
            <div className="text-xs font-black">Get ₹13 Bonus</div>
            <div className="text-[10px] font-semibold opacity-90">Add ROX WIN to Desktop / Homescreen</div>
          </div>
        </div>
        <button
          onClick={() => alert('Tap your browser share menu and choose "Add to Home Screen" to install ROX WIN!')}
          className="px-3 py-1.5 bg-rose-950 text-rose-200 rounded-xl text-xs font-black shadow hover:text-white"
        >
          Add
        </button>
      </div>

      {/* DETAIL MODAL NOTICE */}
      {showDetailNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#28080d] p-5 rounded-2xl border border-rose-800 space-y-3">
            <h3 className="text-base font-bold text-amber-300">ROX WIN Official Notice</h3>
            <div className="text-xs text-neutral-300 space-y-2 leading-relaxed">
              <p>Welcome to ROX WIN, India's premier entertainment gaming platform.</p>
              <p>• All new registered users start with ₹0.00 wallet balance.</p>
              <p>• Deposits are verified by accounts before wallet crediting to guarantee safety.</p>
              <p>• 24/7 withdrawals supported directly to your UPI ID or Bank account.</p>
              <p>• For any inquiries, reach our customer service desk directly.</p>
            </div>
            <button
              onClick={() => setShowDetailNotice(false)}
              className="w-full py-2 bg-rose-600 rounded-xl font-bold text-xs text-white"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
