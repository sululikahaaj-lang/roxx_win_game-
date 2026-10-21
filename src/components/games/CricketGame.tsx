import React, { useState } from 'react';
import { ArrowLeft, Zap, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CricketGameProps {
  onBack: () => void;
  onOpenDeposit: () => void;
}

export const CricketGame: React.FC<CricketGameProps> = ({ onBack, onOpenDeposit }) => {
  const { currentUser, placeGenericBet, settleGenericWin, toast } = useApp();

  const [betAmount, setBetAmount] = useState<number>(50);
  const [bowling, setBowling] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  const handlePlayShot = (shotType: 'defend' | 'drive' | 'loft' | 'helicopter') => {
    if (!currentUser) {
      toast('Please log in first', 'error');
      return;
    }
    const betRes = placeGenericBet('cricket', betAmount);
    if (!betRes.success) {
      if (betRes.error) toast(betRes.error, 'error');
      return;
    }

    setBowling(true);
    setOutcome(null);

    setTimeout(() => {
      setBowling(false);
      const rand = Math.random();

      // Outcomes based on risk
      let runs = 0;
      let mult = 0;

      if (shotType === 'defend') {
        // Low risk: 1 or 2 runs
        if (rand > 0.15) {
          runs = 1;
          mult = 1.3;
        } else {
          runs = 0; // Wicket
        }
      } else if (shotType === 'drive') {
        // Medium risk: 2 or 4 runs
        if (rand > 0.35) {
          runs = 4;
          mult = 2.2;
        } else {
          runs = 0;
        }
      } else {
        // High risk: 6 runs (loft or helicopter)
        if (rand > 0.55) {
          runs = 6;
          mult = 4.5;
        } else {
          runs = 0;
        }
      }

      if (runs > 0) {
        const winAmount = Number((betAmount * mult).toFixed(2));
        setOutcome(`SIXER! ${runs} RUNS SCORED! (+₹${winAmount})`);
        setStreak((s) => s + 1);
        settleGenericWin('cricket', betAmount, winAmount, mult);
      } else {
        setOutcome('OUT! Caught by Fielder at Boundary!');
        setStreak(0);
        toast('Wicket down! Better luck next ball.', 'error');
      }
    }, 900);
  };

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
          <span className="font-black text-rose-400 tracking-wider">CRICKET CASH</span>
          <span className="text-[10px] bg-rose-950 px-1.5 py-0.5 rounded text-rose-300 font-bold border border-rose-800">
            RTP 97.64%
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-neutral-400">Balance: </span>
          <span className="text-xs font-black text-amber-300">
            ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
          </span>
        </div>
      </div>

      {/* Stadium Pitch View */}
      <div className="h-56 w-full bg-gradient-to-b from-[#0c2a12] via-[#143e1d] to-[#0a1f0e] rounded-2xl border border-emerald-700/60 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
        <div className="text-5xl mb-2 animate-bounce">🏏</div>
        <div className="text-lg font-black text-amber-300">
          {bowling ? 'Fast Bowler Running in...' : outcome || 'Ready for the Next Delivery!'}
        </div>
        <div className="text-xs text-emerald-200/80 mt-1">
          Current Boundaries Streak: <span className="font-bold text-amber-400">{streak}</span>
        </div>
      </div>

      {/* Shot Selector */}
      <div className="p-3.5 bg-[#2b080d] rounded-2xl border border-rose-900/60 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-300 font-bold">Stake per Ball</span>
          <div className="flex space-x-1.5">
            {[20, 50, 100, 500].map((b) => (
              <button
                key={b}
                onClick={() => setBetAmount(b)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border ${
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

        <div className="grid grid-cols-3 gap-2">
          <button
            disabled={bowling}
            onClick={() => handlePlayShot('defend')}
            className="p-3 bg-[#3d1117] hover:bg-[#52161f] border border-rose-800 rounded-xl text-center active:scale-95 transition-all"
          >
            <div className="text-sm font-bold text-white">Classic Drive</div>
            <div className="text-[10px] text-emerald-400 font-bold">1.30X (Safe)</div>
          </button>
          <button
            disabled={bowling}
            onClick={() => handlePlayShot('drive')}
            className="p-3 bg-[#3d1117] hover:bg-[#52161f] border border-rose-800 rounded-xl text-center active:scale-95 transition-all"
          >
            <div className="text-sm font-bold text-white">Cover Drive</div>
            <div className="text-[10px] text-amber-400 font-bold">2.20X (4 Runs)</div>
          </button>
          <button
            disabled={bowling}
            onClick={() => handlePlayShot('helicopter')}
            className="p-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 rounded-xl text-center text-rose-950 font-black active:scale-95 transition-all shadow-lg"
          >
            <div className="text-sm">Helicopter</div>
            <div className="text-[10px] text-rose-950">4.50X (6 Runs)</div>
          </button>
        </div>
      </div>
    </div>
  );
};
