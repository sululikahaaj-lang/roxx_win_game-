import React, { useState } from 'react';
import { ArrowLeft, Settings, RotateCcw, Zap, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';

interface SlotsGameProps {
  onBack: () => void;
  onOpenDeposit: () => void;
}

interface SlotSymbol {
  id: string;
  name: string;
  icon: string;
  color: string;
  payout: number;
}

export const SlotsGame: React.FC<SlotsGameProps> = ({ onBack, onOpenDeposit }) => {
  const { currentUser, placeGenericBet, settleGenericWin, settleGenericLoss, adminSettings, toast } = useApp();

  const symbols: SlotSymbol[] = [
    { id: 'garuda', name: 'Garuda Wild', icon: '👑', color: 'from-amber-400 to-yellow-500', payout: 25 },
    { id: 'ruby', name: 'Ruby', icon: '🔴', color: 'from-red-500 to-rose-700', payout: 15 },
    { id: 'sapphire', name: 'Sapphire', icon: '🔷', color: 'from-blue-500 to-indigo-700', payout: 12 },
    { id: 'emerald', name: 'Emerald', icon: '🟢', color: 'from-emerald-400 to-teal-700', payout: 10 },
    { id: 'A', name: 'Ace', icon: '🅰️', color: 'from-amber-200 to-amber-400', payout: 6 },
    { id: 'K', name: 'King', icon: '👑', color: 'from-amber-300 to-orange-400', payout: 5 },
    { id: 'J', name: 'Jack', icon: '💠', color: 'from-cyan-300 to-blue-500', payout: 4 },
  ];

  const multipliers = [1, 2, 3, 5, 10, 15];

  const [reels, setReels] = useState<SlotSymbol[]>([symbols[0], symbols[4], symbols[1]]);
  const [multiplierReel, setMultiplierReel] = useState<number>(1);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState<number>(3);
  const [winAmount, setWinAmount] = useState<number>(0);

  const handleSpin = () => {
    if (spinning) return;
    if (!currentUser) {
      toast('Please log in first', 'error');
      return;
    }
    const betRes = placeGenericBet('slots', betAmount);
    if (!betRes.success) {
      if (betRes.error) toast(betRes.error, 'error');
      return;
    }

    setSpinning(true);
    setWinAmount(0);

    let counter = 0;
    const interval = setInterval(() => {
      sounds.playSlotTick();
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
      setMultiplierReel(multipliers[Math.floor(Math.random() * multipliers.length)]);
      counter++;

      if (counter > 14) {
        clearInterval(interval);
        setSpinning(false);

        // Bot Algorithm: High loss & Low win
        const shouldBotForceLoss = Math.random() * 100 < (adminSettings.botLossRate || 75);

        let finalR1: SlotSymbol;
        let finalR2: SlotSymbol;
        let finalR3: SlotSymbol;
        let finalMult = multipliers[Math.floor(Math.random() * multipliers.length)];

        if (shouldBotForceLoss) {
          // Force a non-matching spin
          finalR1 = symbols[1];
          finalR2 = symbols[4];
          finalR3 = symbols[2];
          finalMult = 1;
        } else {
          // Lucky spin!
          const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
          finalR1 = winSymbol;
          finalR2 = winSymbol;
          finalR3 = winSymbol;
        }

        setReels([finalR1, finalR2, finalR3]);
        setMultiplierReel(finalMult);

        if (finalR1.id === finalR2.id && finalR2.id === finalR3.id) {
          // Triple match!
          const payout = Number((betAmount * finalR1.payout * finalMult).toFixed(2));
          setWinAmount(payout);
          settleGenericWin('slots', betAmount, payout, finalMult);
        } else {
          // Loss
          settleGenericLoss('slots', betAmount, finalMult);
        }
      }
    }, 80);
  };

  return (
    <div className="space-y-2 pb-24 text-neutral-100 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-[#1f0507] p-2.5 rounded-xl border border-rose-950">
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Balance Capsule */}
        <div className="flex items-center bg-[#2e090f] border border-rose-800/60 rounded-full px-3 py-1 space-x-1.5">
          <span className="text-amber-400 font-bold text-sm">🪙</span>
          <span className="text-white text-xs font-bold font-mono">
            ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
          </span>
          <button
            onClick={onOpenDeposit}
            className="w-4 h-4 rounded-full bg-amber-500 text-rose-950 font-black text-[10px] flex items-center justify-center ml-1"
          >
            +
          </button>
        </div>

        <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs shadow">
          🎧
        </div>
      </div>

      {/* ================= TEMPLE RUINS SUNSET BACKGROUND (IMG_2559) ================= */}
      <div className="relative rounded-3xl border-2 border-amber-600/70 overflow-hidden shadow-2xl bg-gradient-to-b from-[#2a1306] via-[#1c0803] to-[#0d0301]">
        {/* Glowing Sunset Temple Header Artwork */}
        <div className="relative h-32 w-full bg-gradient-to-b from-[#ff8c00] via-[#c2410c] to-[#431407] flex flex-col items-center justify-center overflow-hidden">
          {/* Temple Silhouette Artwork */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-orange-600 to-transparent" />
          <div className="text-5xl opacity-30 select-none">🛕 ⛩️ 🛕</div>

          {/* 3D Curved Golden Logo: Fortune Gems matching screenshot IMG_2559 */}
          <div className="z-10 text-center">
            <h1 className="text-2xl font-black italic tracking-wider text-amber-200 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] uppercase">
              Fortune Gems
            </h1>
          </div>

          {/* JILI Golden Medallion Badge on Left matching IMG_2559 */}
          <div className="absolute left-2 top-2 bg-gradient-to-r from-amber-400 to-amber-600 text-rose-950 font-black text-[10px] px-2 py-0.5 rounded-r shadow border-y border-amber-300">
            JILI
          </div>
        </div>

        {/* ================= 3 REELS + 4th MULTIPLIER REEL ================= */}
        <div className="p-3 bg-[#180503] border-t-2 border-amber-700/60">
          <div className="grid grid-cols-4 gap-2 bg-[#2d0b06] p-2.5 rounded-2xl border border-amber-600/50 shadow-inner">
            {/* Reels 1, 2, 3: Symbols */}
            {reels.map((symbol, i) => (
              <div
                key={i}
                className={`aspect-[3/4] bg-gradient-to-b from-[#4d140a] via-[#330c05] to-[#1c0502] rounded-xl border-2 border-amber-500/70 flex flex-col items-center justify-center p-1 shadow-lg transition-all ${
                  spinning ? 'animate-pulse scale-95' : ''
                }`}
              >
                <span className="text-3xl mb-1 drop-shadow-md select-none">{symbol.icon}</span>
                <span className="text-[10px] font-black text-amber-200 uppercase tracking-tighter truncate w-full text-center">
                  {symbol.name}
                </span>
              </div>
            ))}

            {/* 4th Reel: WIN MULTIPLIER REEL matching IMG_2559 */}
            <div className="aspect-[3/4] bg-gradient-to-b from-[#6b1e0d] to-[#3a0d04] rounded-xl border-2 border-yellow-400 flex flex-col items-center justify-center p-1 shadow-lg relative overflow-hidden">
              <span className="text-[9px] font-black text-amber-300 uppercase tracking-tighter text-center">
                WIN MULT
              </span>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 border-2 border-white flex items-center justify-center shadow-lg my-0.5">
                <span className="text-sm font-black text-rose-950 font-mono">
                  {multiplierReel}x
                </span>
              </div>
            </div>
          </div>

          {/* Win Status Banner matching screenshot */}
          <div className="text-center py-2">
            <span className="text-xs font-bold text-amber-300 tracking-wider">WIN </span>
            <span className="text-lg font-black text-white font-mono">
              ₹{winAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ================= BOTTOM CONTROL DECK MATCHING IMG_2559 ================= */}
        <div className="bg-[#120301] p-3 flex items-center justify-between border-t border-amber-900/60">
          {/* Settings */}
          <button
            onClick={() => toast('Fortune Gems sound and turbo settings enabled.', 'info')}
            className="w-10 h-10 rounded-full bg-[#360e06] border border-amber-700/60 flex items-center justify-center text-amber-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Bet Stepper */}
          <button
            onClick={() => {
              const amounts = [3, 9, 30, 90, 300];
              const nextIdx = (amounts.indexOf(betAmount) + 1) % amounts.length;
              setBetAmount(amounts[nextIdx]);
            }}
            className="px-3 py-2 rounded-xl bg-[#360e06] border border-amber-700/60 text-xs font-bold text-amber-300"
          >
            <div>Bet</div>
            <div className="text-white font-black font-mono">₹{betAmount}</div>
          </button>

          {/* CENTRAL CIRCULAR JILI SPIN BUTTON matching IMG_2559 */}
          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 border-4 border-amber-200 shadow-[0_0_20px_rgba(255,180,0,0.8)] flex flex-col items-center justify-center text-rose-950 hover:brightness-110 active:scale-95 transition-all ${
              spinning ? 'animate-spin' : ''
            }`}
          >
            <span className="text-[10px] font-black tracking-tighter">JILI</span>
            <RotateCcw className="w-5 h-5 text-rose-950" />
          </button>

          {/* Autoplay */}
          <button
            onClick={() => toast('Tap JILI to spin. Autoplay set to 10 rounds.', 'info')}
            className="w-10 h-10 rounded-full bg-[#360e06] border border-amber-700/60 flex items-center justify-center text-amber-400 hover:text-white"
            title="Autoplay"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Turbo */}
          <button
            onClick={() => toast('Turbo speed active for instant reel stop!', 'info')}
            className="w-10 h-10 rounded-full bg-[#360e06] border border-amber-700/60 flex items-center justify-center text-amber-400 hover:text-white"
            title="Turbo"
          >
            <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
