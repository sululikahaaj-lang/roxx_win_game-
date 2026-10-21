import React, { useState } from 'react';
import { ArrowLeft, Rocket, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LimboGameProps {
  onBack: () => void;
  onOpenDeposit: () => void;
}

export const LimboGame: React.FC<LimboGameProps> = ({ onBack, onOpenDeposit }) => {
  const { currentUser, placeGenericBet, settleGenericWin, toast } = useApp();

  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.0);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [rolledValue, setRolledValue] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [hasWon, setHasWon] = useState<boolean | null>(null);

  const handleRoll = () => {
    if (!currentUser) {
      toast('Please log in first', 'error');
      return;
    }
    const betRes = placeGenericBet('limbo', betAmount);
    if (!betRes.success) {
      if (betRes.error) toast(betRes.error, 'error');
      return;
    }

    setRolling(true);
    setHasWon(null);

    setTimeout(() => {
      // Limbo algorithm (house edge ~3%)
      const rand = Math.random();
      const outcome = Number((0.97 / (1 - rand)).toFixed(2));
      const cappedOutcome = Math.min(100.0, Math.max(1.0, outcome));

      setRolledValue(cappedOutcome);
      setRolling(false);

      if (cappedOutcome >= targetMultiplier) {
        setHasWon(true);
        const winAmount = Number((betAmount * targetMultiplier).toFixed(2));
        settleGenericWin('limbo', betAmount, winAmount, targetMultiplier);
      } else {
        setHasWon(false);
        toast(`Rolled ${cappedOutcome.toFixed(2)}x (Target was ${targetMultiplier.toFixed(2)}x)`, 'error');
      }
    }, 500);
  };

  const winProbability = Number(((97 / targetMultiplier)).toFixed(1));

  return (
    <div className="space-y-3 pb-24 text-neutral-100">
      <div className="flex items-center justify-between bg-[#2a070b] p-3 rounded-xl border border-rose-900/50">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="w-7 h-7 rounded-full bg-[#3d0f14] flex items-center justify-center text-rose-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-black text-rose-400 tracking-wider">LIMBO ROCKET</span>
          <span className="text-[10px] bg-rose-950 px-1.5 py-0.5 rounded text-rose-300 font-bold border border-rose-800">
            RTP 97.00%
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-neutral-400">Balance: </span>
          <span className="text-xs font-black text-amber-300">
            ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
          </span>
        </div>
      </div>

      {/* Rocket Limbo Display */}
      <div className="h-56 w-full bg-gradient-to-b from-[#1b0407] to-[#2d090f] rounded-2xl border border-rose-900/60 p-6 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
        <Rocket className={`w-12 h-12 text-rose-500 mb-2 ${rolling ? 'animate-bounce' : ''}`} />
        <div
          className={`font-mono text-5xl font-black ${
            rolling
              ? 'text-neutral-400'
              : hasWon === true
              ? 'text-emerald-400'
              : hasWon === false
              ? 'text-rose-500'
              : 'text-white'
          }`}
        >
          {rolling ? '...' : rolledValue !== null ? `${rolledValue.toFixed(2)}x` : `${targetMultiplier.toFixed(2)}x`}
        </div>
        <div className="text-xs text-neutral-400 mt-1">
          Win Chance: <span className="text-amber-300 font-bold">{winProbability}%</span>
        </div>
      </div>

      {/* Target & Bet Controls */}
      <div className="p-3.5 bg-[#2b080d] rounded-2xl border border-rose-900/60 space-y-3 text-xs">
        <div>
          <span className="text-neutral-300 font-bold block mb-1">Target Multiplier</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[1.5, 2.0, 5.0, 10.0].map((t) => (
              <button
                key={t}
                onClick={() => setTargetMultiplier(t)}
                className={`py-2 rounded-lg font-bold border ${
                  targetMultiplier === t
                    ? 'bg-amber-500 text-rose-950 border-amber-300 font-black'
                    : 'bg-[#3d1117] text-neutral-300 border-rose-900'
                }`}
              >
                {t.toFixed(1)}x
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-neutral-300 font-bold block mb-1">Bet Amount</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[20, 50, 100, 500].map((b) => (
              <button
                key={b}
                onClick={() => setBetAmount(b)}
                className={`py-2 rounded-lg font-bold border ${
                  betAmount === b
                    ? 'bg-amber-500 text-rose-950 border-amber-300 font-black'
                    : 'bg-[#3d1117] text-neutral-300 border-rose-900'
                }`}
              >
                ₹{b}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={rolling}
          onClick={handleRoll}
          className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 active:scale-95 text-white shadow-xl flex items-center justify-center space-x-2"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>{rolling ? 'LAUNCHING...' : `LAUNCH ROCKET (BET ₹${betAmount})`}</span>
        </button>
      </div>
    </div>
  );
};
