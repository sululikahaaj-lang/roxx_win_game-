import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Headphones, Menu, Minus, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';

interface AviatorGameProps {
  onBack: () => void;
  onOpenDeposit: () => void;
}

interface SimulatedBet {
  avatar: string;
  user: string;
  bet: number;
  cashoutMult?: number;
  win?: number;
}

export const AviatorGame: React.FC<AviatorGameProps> = ({ onBack, onOpenDeposit }) => {
  const { currentUser, placeGenericBet, settleGenericWin, settleGenericLoss, adminSettings, toast } = useApp();

  const [gameState, setGameState] = useState<'idle' | 'flying' | 'crashed'>('idle');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(2.35);
  const [pastMultipliers, setPastMultipliers] = useState<number[]>([1.45, 2.35, 1.12, 5.84, 1.95, 2.40, 1.08, 3.15]);

  // Dual bet panel 1
  const [bet1Amount, setBet1Amount] = useState(10.0);
  const [bet1Active, setBet1Active] = useState(false);
  const [bet1Cashed, setBet1Cashed] = useState(false);
  const [bet1Mode, setBet1Mode] = useState<'bet' | 'auto'>('bet');

  // Dual bet panel 2
  const [bet2Amount, setBet2Amount] = useState(10.0);
  const [bet2Active, setBet2Active] = useState(false);
  const [bet2Cashed, setBet2Cashed] = useState(false);
  const [bet2Mode, setBet2Mode] = useState<'bet' | 'auto'>('bet');

  const [activeBottomTab, setActiveBottomTab] = useState<'all' | 'previous' | 'top'>('all');

  const startTimeRef = useRef<number>(0);
  const flightTimerRef = useRef<any>(null);

  // Simulated active bets matching screenshot (914/1031 Bets)
  const [simulatedBets, setSimulatedBets] = useState<SimulatedBet[]>([
    { avatar: '🏀', user: '1***2', bet: 8000.0, cashoutMult: 1.85, win: 14800.0 },
    { avatar: '🚗', user: '4***7', bet: 500.0, cashoutMult: 2.1, win: 1050.0 },
    { avatar: '👤', user: '9***1', bet: 1200.0, cashoutMult: 1.4, win: 1680.0 },
    { avatar: '⚡', user: '3***6', bet: 250.0, cashoutMult: 2.05, win: 512.5 },
    { avatar: '🔥', user: '7***8', bet: 50.0, cashoutMult: 1.25, win: 62.5 },
    { avatar: '💎', user: '2***5', bet: 2000.0, cashoutMult: 1.9, win: 3800.0 },
  ]);

  const handleBet1 = () => {
    if (gameState === 'flying') {
      // Cashout!
      if (bet1Active && !bet1Cashed) {
        setBet1Cashed(true);
        const win = Number((bet1Amount * multiplier).toFixed(2));
        settleGenericWin('aviator', bet1Amount, win, multiplier);
        sounds.playCashout();
      }
      return;
    }

    if (!currentUser) {
      toast('Please log in first', 'error');
      return;
    }
    const res = placeGenericBet('aviator', bet1Amount);
    if (!res.success) {
      if (res.error) toast(res.error, 'error');
      return;
    }
    setBet1Active(true);
    setBet1Cashed(false);
    startRoundIfNeeded();
  };

  const handleBet2 = () => {
    if (gameState === 'flying') {
      if (bet2Active && !bet2Cashed) {
        setBet2Cashed(true);
        const win = Number((bet2Amount * multiplier).toFixed(2));
        settleGenericWin('aviator', bet2Amount, win, multiplier);
        sounds.playCashout();
      }
      return;
    }

    if (!currentUser) {
      toast('Please log in first', 'error');
      return;
    }
    const res = placeGenericBet('aviator', bet2Amount);
    if (!res.success) {
      if (res.error) toast(res.error, 'error');
      return;
    }
    setBet2Active(true);
    setBet2Cashed(false);
    startRoundIfNeeded();
  };

  const startRoundIfNeeded = () => {
    if (gameState === 'idle' || gameState === 'crashed') {
      // High Loss / Low Win Bot Logic:
      // ~75% chance of early crash between 1.05x and 1.65x
      const isHighLoss = Math.random() * 100 < (adminSettings.botLossRate || 75);
      let calculatedCrash: number;

      if (isHighLoss) {
        calculatedCrash = Number((1.05 + Math.random() * 0.6).toFixed(2)); // early crash 1.05x - 1.65x
      } else {
        const rand = Math.random();
        if (rand > 0.8) {
          calculatedCrash = Number((3.0 + Math.random() * 8.0).toFixed(2)); // high flight
        } else {
          calculatedCrash = Number((1.7 + Math.random() * 1.5).toFixed(2));
        }
      }

      setCrashPoint(calculatedCrash);
      setMultiplier(1.0);
      setGameState('flying');
      startTimeRef.current = Date.now();
    }
  };

  // Flying loop
  useEffect(() => {
    if (gameState === 'flying') {
      flightTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const currentM = 1.0 + Math.pow(elapsed * 0.7, 1.55);
        const rounded = Number(currentM.toFixed(2));

        // Engine sound modulation
        if (Math.random() < 0.25) {
          sounds.playJetEngine(rounded);
        }

        if (rounded >= crashPoint) {
          setMultiplier(crashPoint);
          setGameState('crashed');
          sounds.playCrash();
          setPastMultipliers((prev) => [crashPoint, ...prev.slice(0, 8)]);
          clearInterval(flightTimerRef.current);

          // If user bet and didn't cash out, record loss
          if (bet1Active && !bet1Cashed) {
            settleGenericLoss('aviator', bet1Amount, crashPoint);
          }
          if (bet2Active && !bet2Cashed) {
            settleGenericLoss('aviator', bet2Amount, crashPoint);
          }
          setBet1Active(false);
          setBet2Active(false);

          // Reset to idle after 3.5 seconds
          setTimeout(() => {
            setGameState('idle');
            setMultiplier(1.0);
            setBet1Cashed(false);
            setBet2Cashed(false);
          }, 3500);
        } else {
          setMultiplier(rounded);
        }
      }, 50);

      return () => clearInterval(flightTimerRef.current);
    }
  }, [gameState, crashPoint, bet1Active, bet1Cashed, bet2Active, bet2Cashed, bet1Amount, bet2Amount]);

  // Plane position calculation on curved trajectory
  const progressRatio = Math.min(1, (multiplier - 1) / Math.max(0.5, crashPoint - 1));
  const planeX = 15 + progressRatio * 70; // 15% to 85%
  const planeY = 75 - Math.pow(progressRatio, 0.7) * 55; // 75% down to 20%

  return (
    <div className="space-y-2 pb-24 text-neutral-100 font-sans">
      {/* Top Header matching screenshot IMG_2557 */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-[#1f0507] rounded-xl border border-rose-950">
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

        {/* Customer Care Mascot */}
        <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs shadow">
          🎧
        </div>
      </div>

      {/* Aviator subheader matching IMG_2557 */}
      <div className="flex items-center justify-between px-2 py-0.5">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black italic tracking-tighter text-[#ff0033] drop-shadow-[0_0_10px_rgba(255,0,51,0.6)]">
            Aviator
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-black text-emerald-400 font-mono">0.00 INR</span>
          <button className="text-neutral-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Past multipliers strip */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5 px-1">
        {pastMultipliers.map((m, i) => (
          <span
            key={i}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono whitespace-nowrap shadow-sm ${
              m >= 2.0
                ? 'bg-purple-950 text-purple-300 border border-purple-700/60'
                : 'bg-[#29070b] text-sky-300 border border-rose-900/60'
            }`}
          >
            {m.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* ================= MAIN FLIGHT CANVAS MATCHING IMG_2557 ================= */}
      <div className="relative h-64 w-full bg-black rounded-2xl border-2 border-rose-950 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
        {/* Radial Crimson Burst / Spotlight from bottom-left */}
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            background:
              'radial-gradient(circle at 10% 90%, rgba(180, 0, 40, 0.75) 0%, rgba(80, 0, 20, 0.4) 40%, rgba(10, 0, 10, 0.95) 80%)',
          }}
        />

        {/* Speed rays effect radiating from bottom-left */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'repeating-conic-gradient(from 0deg at 10% 90%, #ff1a40 0deg 8deg, transparent 8deg 16deg)',
          }}
        />

        {/* Dynamic Curved Red Motion Trail */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d={`M 15 220 Q ${planeX * 2.8} ${planeY * 2.2 + 20} ${planeX * 3.6} ${planeY * 2.5}`}
            fill="none"
            stroke="#ff0033"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_8px_rgba(255,0,51,0.9)]"
          />
        </svg>

        {/* SOARING RED STUNT JET PLANE */}
        <div
          className="absolute transition-all duration-75 pointer-events-none"
          style={{
            left: `${planeX}%`,
            top: `${planeY}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {gameState === 'crashed' ? (
            <div className="text-3xl animate-ping">💥</div>
          ) : (
            <div className="relative filter drop-shadow-[0_0_12px_rgba(255,50,50,0.9)]">
              {/* Red Jet Plane Icon styled matching screenshot */}
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                <path
                  d="M12 40 L34 24 L52 20 C56 19 60 21 60 24 C60 27 57 29 53 30 L36 34 L32 50 L26 49 L28 36 L16 38 L14 44 L8 44 L10 37 L2 36 L4 31 L12 32 Z"
                  fill="#ff0033"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
                <circle cx="50" cy="22" r="3" fill="#ffeb3b" />
                <path d="M4 31 L14 18 L18 19 L12 32 Z" fill="#b70024" />
              </svg>
            </div>
          )}
        </div>

        {/* Multiplier Display matching screenshot IMG_2557 */}
        <div className="z-10 text-center select-none">
          {gameState === 'crashed' && (
            <div className="text-rose-500 text-xs font-black uppercase tracking-widest mb-1 animate-pulse">
              FLEW AWAY!
            </div>
          )}
          <div
            className={`font-black tracking-tight text-5xl md:text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] ${
              gameState === 'crashed' ? 'text-rose-500' : 'text-white'
            }`}
          >
            {multiplier.toFixed(2)}x
          </div>
        </div>

        {/* Active Player Stack badge in bottom right (matching IMG_2557) */}
        <div className="absolute bottom-2.5 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-white/20 z-10 text-xs font-bold text-neutral-300">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-[10px] flex items-center justify-center">🏀</span>
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-[10px] flex items-center justify-center">🚗</span>
            <span className="w-4 h-4 rounded-full bg-sky-500 text-[10px] flex items-center justify-center">👤</span>
          </div>
          <span>506</span>
        </div>
      </div>

      {/* ================= DUAL BETTING PANELS MATCHING IMG_2557 ================= */}
      {/* PANEL 1 */}
      <div className="p-2.5 bg-[#1b0407] rounded-2xl border border-rose-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex p-0.5 bg-black/50 rounded-full text-xs font-bold border border-rose-950">
            <button
              onClick={() => setBet1Mode('bet')}
              className={`px-4 py-0.5 rounded-full transition-all ${
                bet1Mode === 'bet' ? 'bg-[#330c11] text-white' : 'text-neutral-400'
              }`}
            >
              Bet
            </button>
            <button
              onClick={() => setBet1Mode('auto')}
              className={`px-4 py-0.5 rounded-full transition-all ${
                bet1Mode === 'auto' ? 'bg-[#330c11] text-white' : 'text-neutral-400'
              }`}
            >
              Auto
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Controls: - Amount + and chips */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-rose-950">
              <button
                onClick={() => setBet1Amount((p) => Math.max(10, p - 10))}
                className="w-7 h-7 rounded-lg bg-[#2f080e] flex items-center justify-center text-white font-bold hover:bg-[#400c14]"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 text-center font-bold text-white text-xs font-mono">
                {bet1Amount.toFixed(2)}
              </div>
              <button
                onClick={() => setBet1Amount((p) => p + 10)}
                className="w-7 h-7 rounded-lg bg-[#2f080e] flex items-center justify-center text-white font-bold hover:bg-[#400c14]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick chips matching IMG_2557 */}
            <div className="grid grid-cols-4 gap-1">
              {[10, 100, 500, 1000].map((c) => (
                <button
                  key={c}
                  onClick={() => setBet1Amount(c)}
                  className={`py-1 rounded-lg text-[10px] font-bold border ${
                    bet1Amount === c
                      ? 'bg-rose-900 border-amber-400 text-white'
                      : 'bg-[#29070b] border-rose-900/50 text-neutral-300'
                  }`}
                >
                  {c.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Big Green Bet / Cashout Button */}
          <button
            onClick={handleBet1}
            disabled={gameState === 'crashed' || (gameState === 'flying' && (!bet1Active || bet1Cashed))}
            className={`w-36 h-18 rounded-2xl font-black text-center transition-all flex flex-col items-center justify-center shadow-lg active:scale-95 ${
              gameState === 'flying' && bet1Active && !bet1Cashed
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white hover:brightness-105'
            }`}
          >
            {gameState === 'flying' && bet1Active && !bet1Cashed ? (
              <>
                <span className="text-xs uppercase tracking-wider">Cash Out</span>
                <span className="text-base font-mono">₹{(bet1Amount * multiplier).toFixed(2)}</span>
              </>
            ) : bet1Cashed ? (
              <span className="text-xs">Cashed Out ✓</span>
            ) : (
              <>
                <span className="text-sm">Bet</span>
                <span className="text-[11px] font-mono">{bet1Amount.toFixed(2)} INR</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PANEL 2 (Dual Bet Panel matching IMG_2557) */}
      <div className="p-2.5 bg-[#1b0407] rounded-2xl border border-rose-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex p-0.5 bg-black/50 rounded-full text-xs font-bold border border-rose-950">
            <button
              onClick={() => setBet2Mode('bet')}
              className={`px-4 py-0.5 rounded-full transition-all ${
                bet2Mode === 'bet' ? 'bg-[#330c11] text-white' : 'text-neutral-400'
              }`}
            >
              Bet
            </button>
            <button
              onClick={() => setBet2Mode('auto')}
              className={`px-4 py-0.5 rounded-full transition-all ${
                bet2Mode === 'auto' ? 'bg-[#330c11] text-white' : 'text-neutral-400'
              }`}
            >
              Auto
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-rose-950">
              <button
                onClick={() => setBet2Amount((p) => Math.max(10, p - 10))}
                className="w-7 h-7 rounded-lg bg-[#2f080e] flex items-center justify-center text-white font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 text-center font-bold text-white text-xs font-mono">
                {bet2Amount.toFixed(2)}
              </div>
              <button
                onClick={() => setBet2Amount((p) => p + 10)}
                className="w-7 h-7 rounded-lg bg-[#2f080e] flex items-center justify-center text-white font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {[10, 100, 500, 1000].map((c) => (
                <button
                  key={c}
                  onClick={() => setBet2Amount(c)}
                  className={`py-1 rounded-lg text-[10px] font-bold border ${
                    bet2Amount === c
                      ? 'bg-rose-900 border-amber-400 text-white'
                      : 'bg-[#29070b] border-rose-900/50 text-neutral-300'
                  }`}
                >
                  {c.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleBet2}
            disabled={gameState === 'crashed' || (gameState === 'flying' && (!bet2Active || bet2Cashed))}
            className={`w-36 h-18 rounded-2xl font-black text-center transition-all flex flex-col items-center justify-center shadow-lg active:scale-95 ${
              gameState === 'flying' && bet2Active && !bet2Cashed
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white hover:brightness-105'
            }`}
          >
            {gameState === 'flying' && bet2Active && !bet2Cashed ? (
              <>
                <span className="text-xs uppercase tracking-wider">Cash Out</span>
                <span className="text-base font-mono">₹{(bet2Amount * multiplier).toFixed(2)}</span>
              </>
            ) : bet2Cashed ? (
              <span className="text-xs">Cashed Out ✓</span>
            ) : (
              <>
                <span className="text-sm">Bet</span>
                <span className="text-[11px] font-mono">{bet2Amount.toFixed(2)} INR</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= ALL BETS LIVE FEED MATCHING IMG_2557 ================= */}
      <div className="p-3 bg-[#170305] rounded-2xl border border-rose-950 space-y-2">
        {/* Tabs: All Bets, Previous, Top */}
        <div className="flex items-center space-x-2 border-b border-rose-950 pb-2">
          {[
            { id: 'all' as const, label: 'All Bets' },
            { id: 'previous' as const, label: 'Previous' },
            { id: 'top' as const, label: 'Top' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveBottomTab(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeBottomTab === tab.id
                  ? 'bg-[#3b0f15] text-white border border-rose-900'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats counter matching screenshot */}
        <div className="flex items-center justify-between text-[11px] px-1 text-neutral-400">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs">🏀</span>
            <span>914/1031 Bets</span>
          </div>
          <div>
            Total win INR: <span className="text-white font-mono font-bold">88,471.97</span>
          </div>
        </div>

        {/* Bets Table */}
        <div className="space-y-1 text-xs">
          <div className="grid grid-cols-4 text-[10px] text-neutral-400 font-bold px-2 py-0.5">
            <span>Player</span>
            <span className="text-center">Bet INR</span>
            <span className="text-center">X</span>
            <span className="text-right">Win INR</span>
          </div>

          {simulatedBets.map((b, i) => (
            <div
              key={i}
              className="grid grid-cols-4 items-center bg-[#240609] px-2 py-1.5 rounded-lg border border-rose-950/40 text-[11px]"
            >
              <div className="flex items-center space-x-1">
                <span>{b.avatar}</span>
                <span className="text-neutral-300 font-mono">{b.user}</span>
              </div>
              <div className="text-center font-mono text-neutral-200">{b.bet.toFixed(2)}</div>
              <div className="text-center">
                <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 font-mono text-[10px] font-bold border border-purple-800/40">
                  {b.cashoutMult?.toFixed(2)}x
                </span>
              </div>
              <div className="text-right font-mono font-bold text-emerald-400">
                {b.win?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
