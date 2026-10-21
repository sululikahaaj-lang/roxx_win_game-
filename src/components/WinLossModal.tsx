import React, { useEffect, useState } from 'react';
import { X, Rocket, Frown, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

export interface WinLossResultData {
  type: 'win' | 'loss';
  gameName: string;
  amount: number;
  period?: string;
  results?: {
    color?: string;
    number?: number | string;
    size?: string;
    multiplier?: number;
  };
}

interface WinLossModalProps {
  data: WinLossResultData | null;
  onClose: () => void;
}

export const WinLossModal: React.FC<WinLossModalProps> = ({ data, onClose }) => {
  const [autoCloseSeconds, setAutoCloseSeconds] = useState(3);
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(true);

  useEffect(() => {
    if (!data) return;
    setAutoCloseSeconds(3);

    // Play appropriate audio
    if (data.type === 'win') {
      sounds.playWin();
    } else {
      sounds.playLoss();
    }

    if (!autoCloseEnabled) return;

    const interval = setInterval(() => {
      setAutoCloseSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data, autoCloseEnabled, onClose]);

  if (!data) return null;

  const isWin = data.type === 'win';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xs flex flex-col items-center">
        {/* Floating Confetti / Particle effects on win */}
        {isWin && (
          <div className="absolute -top-12 inset-x-0 flex justify-between pointer-events-none px-4 text-2xl animate-bounce">
            <span>✨</span>
            <span>🎉</span>
            <span>🎊</span>
            <span>✨</span>
          </div>
        )}

        {isWin ? (
          /* ================== WIN MODAL MATCHING SCREENSHOT IMG_2403 ================== */
          <div className="w-full bg-gradient-to-b from-[#ff8c42] via-[#ff6b35] to-[#f44336] rounded-3xl p-5 pt-12 shadow-2xl relative border-2 border-amber-300 text-center overflow-hidden">
            {/* Top Wings & Rocket Badge (matching IMG_2403) */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <div className="relative flex items-center justify-center">
                {/* Golden wings */}
                <div className="w-28 h-10 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 rounded-full shadow-lg -rotate-12 absolute -left-7" />
                <div className="w-28 h-10 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 rounded-full shadow-lg rotate-12 absolute -right-7" />
                {/* Center Rocket Medallion */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-4 border-white shadow-xl flex items-center justify-center z-10 text-rose-950">
                  <Rocket className="w-8 h-8 fill-rose-950 text-rose-950 rotate-45" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-white tracking-wide mt-2 drop-shadow-md">
              Congratulations
            </h2>

            {/* Lottery Results Badges if available */}
            {data.results && (
              <div className="flex items-center justify-center space-x-2 my-3">
                <span className="text-[11px] text-amber-100 font-semibold">Lottery results</span>
                {data.results.color && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold text-white shadow capitalize ${
                      data.results.color.includes('green') ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    {data.results.color.replace('violet-', '')}
                  </span>
                )}
                {data.results.number !== undefined && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shadow">
                    {data.results.number}
                  </span>
                )}
                {data.results.size && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold text-white bg-amber-600 shadow capitalize">
                    {data.results.size}
                  </span>
                )}
                {data.results.multiplier && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold text-white bg-purple-700 shadow">
                    {data.results.multiplier.toFixed(2)}x
                  </span>
                )}
              </div>
            )}

            {/* Parchment / Bonus Scroll Card matching IMG_2403 */}
            <div className="bg-[#fff3e0] rounded-2xl p-4 shadow-inner border border-amber-200 my-2">
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Bonus
              </div>
              <div className="text-3xl font-black text-[#e53935] tracking-tight my-0.5">
                +₹{data.amount.toFixed(2)}
              </div>
              <div className="text-[10px] text-neutral-500 font-medium truncate mt-1">
                {data.period ? `Period ${data.gameName} ${data.period}` : `${data.gameName} Payout`}
              </div>
            </div>

            {/* Auto Close Checkbox */}
            <div className="flex items-center justify-center space-x-1.5 text-xs text-white/90 pt-2 font-medium">
              <input
                type="checkbox"
                id="autoCloseWin"
                checked={autoCloseEnabled}
                onChange={(e) => setAutoCloseEnabled(e.target.checked)}
                className="accent-white rounded cursor-pointer"
              />
              <label htmlFor="autoCloseWin" className="cursor-pointer select-none">
                {autoCloseSeconds > 0 && autoCloseEnabled
                  ? `${autoCloseSeconds} seconds auto close`
                  : 'Auto close'}
              </label>
            </div>
          </div>
        ) : (
          /* ================== LOSS MODAL: SKY BLUE THEME AS REQUESTED ================== */
          <div className="w-full bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#075985] rounded-3xl p-5 pt-10 shadow-2xl relative border-2 border-sky-300 text-center text-white overflow-hidden">
            {/* Sky Blue Crest Icon */}
            <div className="w-16 h-16 rounded-full bg-sky-100 border-4 border-sky-400 shadow-xl flex items-center justify-center mx-auto mb-2 text-sky-700">
              <Frown className="w-8 h-8 text-sky-700" />
            </div>

            <h2 className="text-xl font-black text-white tracking-wide drop-shadow">
              Better Luck Next Time
            </h2>
            <p className="text-xs text-sky-100/90 mt-0.5">
              Keep playing to hit the mega jackpot!
            </p>

            {/* Lottery Results Badges if available */}
            {data.results && (
              <div className="flex items-center justify-center space-x-2 my-3">
                <span className="text-[11px] text-sky-200 font-semibold">Draw results</span>
                {data.results.color && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold text-white shadow capitalize ${
                      data.results.color.includes('green') ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    {data.results.color.replace('violet-', '')}
                  </span>
                )}
                {data.results.number !== undefined && (
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center shadow">
                    {data.results.number}
                  </span>
                )}
                {data.results.size && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold text-white bg-sky-900 shadow capitalize">
                    {data.results.size}
                  </span>
                )}
              </div>
            )}

            {/* Loss Amount Card */}
            <div className="bg-sky-950/70 rounded-2xl p-3 border border-sky-400/40 my-2">
              <div className="text-[11px] text-sky-300 uppercase tracking-wider font-bold">
                Round Loss
              </div>
              <div className="text-2xl font-black text-white tracking-tight my-0.5">
                -₹{data.amount.toFixed(2)}
              </div>
              <div className="text-[10px] text-sky-300/70 truncate">
                {data.period ? `Period: ${data.period}` : `${data.gameName}`}
              </div>
            </div>

            {/* Auto Close Checkbox */}
            <div className="flex items-center justify-center space-x-1.5 text-xs text-sky-100 pt-1 font-medium">
              <input
                type="checkbox"
                id="autoCloseLoss"
                checked={autoCloseEnabled}
                onChange={(e) => setAutoCloseEnabled(e.target.checked)}
                className="accent-sky-300 rounded cursor-pointer"
              />
              <label htmlFor="autoCloseLoss" className="cursor-pointer select-none">
                {autoCloseSeconds > 0 && autoCloseEnabled
                  ? `${autoCloseSeconds} seconds auto close`
                  : 'Auto close'}
              </label>
            </div>
          </div>
        )}

        {/* Circular X Close Button Below matching screenshot */}
        <button
          onClick={onClose}
          className="mt-4 w-9 h-9 rounded-full bg-black/60 border border-white/60 text-white flex items-center justify-center hover:bg-black/90 active:scale-95 transition-all shadow-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
