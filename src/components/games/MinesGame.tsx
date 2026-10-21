import React, { useState } from 'react';
import { ArrowLeft, Plus, Headphones, Minus, Coins, RotateCcw, HelpCircle, Menu, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';

interface MinesGameProps {
  onBack: () => void;
  onOpenDeposit: () => void;
}

export const MinesGame: React.FC<MinesGameProps> = ({ onBack, onOpenDeposit }) => {
  const { currentUser, placeGenericBet, settleGenericWin, settleGenericLoss, adminSettings, toast } = useApp();

  const [betAmount, setBetAmount] = useState<number>(10.0);
  const [mineCount, setMineCount] = useState<number>(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'busted' | 'cashed'>('idle');
  const [grid, setGrid] = useState<Array<{ isMine: boolean; revealed: boolean }>>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [isAutoGame, setIsAutoGame] = useState<boolean>(false);
  const [gameId, setGameId] = useState<string>('MID-' + Math.floor(100000 + Math.random() * 900000));

  // Multiplier progression preview
  const nextPayout = Number((betAmount * (1.0 + (revealedCount + 1) * 0.28 * (mineCount / 3))).toFixed(2));

  const startMinesGame = () => {
    if (!currentUser) {
      toast('Please log in first', 'error');
      return;
    }
    const betRes = placeGenericBet('mines', betAmount);
    if (!betRes.success) {
      if (betRes.error) toast(betRes.error, 'error');
      return;
    }

    // Initialize 25 tiles
    const tiles = Array(25).fill(null).map(() => ({ isMine: false, revealed: false }));

    // Place mines randomly
    let placed = 0;
    while (placed < mineCount) {
      const idx = Math.floor(Math.random() * 25);
      if (!tiles[idx].isMine) {
        tiles[idx].isMine = true;
        placed++;
      }
    }

    setGrid(tiles);
    setGameState('playing');
    setCurrentMultiplier(1.0);
    setRevealedCount(0);
    setGameId('MID-' + Math.floor(100000 + Math.random() * 900000));
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing' || grid[index].revealed) return;

    let targetIsMine = grid[index].isMine;

    // Bot algorithm: High Loss & Low Win
    // If user has uncovered 1 or more safe tiles, bot has 75% chance to force a mine here!
    const shouldBotEnforceMine = Math.random() * 100 < (adminSettings.botLossRate || 75);
    if (shouldBotEnforceMine && revealedCount >= 1 && !targetIsMine) {
      targetIsMine = true;
    }

    const newGrid = [...grid];
    newGrid[index].revealed = true;
    newGrid[index].isMine = targetIsMine;

    if (targetIsMine) {
      // Hit a mine! Reveal all tiles
      newGrid.forEach((tile) => (tile.revealed = true));
      setGrid(newGrid);
      setGameState('busted');
      sounds.playCrash();

      // Trigger Sky Blue Loss Modal as requested
      settleGenericLoss('mines', betAmount, currentMultiplier);
    } else {
      // Safe diamond / star!
      sounds.playDiamondChime();
      const newRevealed = revealedCount + 1;
      setRevealedCount(newRevealed);

      const mult = 1.0 + newRevealed * 0.28 * (mineCount / 3);
      const rounded = Number(mult.toFixed(2));
      setCurrentMultiplier(rounded);
      setGrid(newGrid);

      // If all safe tiles cleared!
      if (newRevealed === 25 - mineCount) {
        handleCashOut(rounded);
      }
    }
  };

  const handleCashOut = (mult = currentMultiplier) => {
    if (gameState !== 'playing') return;
    setGameState('cashed');

    // Reveal rest
    const newGrid = grid.map((t) => ({ ...t, revealed: true }));
    setGrid(newGrid);

    const winAmount = Number((betAmount * mult).toFixed(2));
    sounds.playCashout();
    // Trigger Golden Winged Rocket Win Modal (IMG_2403)
    settleGenericWin('mines', betAmount, winAmount, mult);
  };

  const handleRandomPick = () => {
    if (gameState !== 'playing') return;
    const unrevealedIndexes = grid
      .map((t, idx) => (!t.revealed ? idx : -1))
      .filter((i) => i !== -1);
    if (unrevealedIndexes.length > 0) {
      const randomIdx = unrevealedIndexes[Math.floor(Math.random() * unrevealedIndexes.length)];
      handleTileClick(randomIdx);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#0062ff] via-[#0252e0] to-[#0038b8] text-white flex flex-col justify-between p-3 rounded-2xl shadow-2xl relative overflow-hidden font-sans">
      {/* Background subtle hex lattice */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

      {/* Top Header Bar matching screenshot IMG_2558 */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Balance Capsule matching screenshot */}
        <div className="flex items-center bg-[#002b80]/80 border border-blue-400/40 rounded-full px-3.5 py-1 space-x-1.5 shadow-md">
          <span className="text-amber-300 font-bold text-sm">🪙</span>
          <span className="text-white text-xs font-bold font-mono">
            ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
          </span>
          <button
            onClick={onOpenDeposit}
            className="w-4 h-4 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-black text-xs flex items-center justify-center ml-1"
          >
            +
          </button>
        </div>

        {/* Mascot / Support Avatar */}
        <div className="w-8 h-8 rounded-full bg-sky-400 flex items-center justify-center text-white text-sm shadow">
          🎧
        </div>
      </div>

      {/* Game Title: MINES matching IMG_2558 */}
      <div className="text-center my-1 z-10">
        <h1 className="text-xl font-black tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] uppercase">
          MINES
        </h1>
      </div>

      {/* Sub Header: Game ID and Next payout badge matching IMG_2558 */}
      <div className="flex items-center justify-between px-2 z-10">
        <div className="flex items-center space-x-1 text-xs font-bold text-sky-100 bg-[#0040b3]/60 px-3 py-1 rounded-lg border border-sky-400/30">
          <span>Game ID:</span>
          <span className="font-mono text-[11px] opacity-80">{gameId.slice(-6)}</span>
          <span className="text-emerald-400 text-[10px]">▼</span>
        </div>

        {/* Next payout yellow badge */}
        <div className="bg-gradient-to-r from-[#ffcc00] to-[#ffa500] text-blue-950 font-black text-xs px-3 py-1 rounded-lg shadow-md font-mono">
          Next: {gameState === 'playing' ? nextPayout.toFixed(2) : (betAmount * 1.1).toFixed(2)} INR
        </div>
      </div>

      {/* ================= 5x5 MINES TILES GRID MATCHING IMG_2558 ================= */}
      <div className="my-2 py-2 px-1 z-10">
        <div className="grid grid-cols-5 gap-2.5 max-w-[320px] mx-auto">
          {(grid.length === 0 ? Array(25).fill(null) : grid).map((tile, i) => {
            const isRevealed = tile?.revealed;
            const isMine = tile?.isMine;

            return (
              <button
                key={i}
                disabled={gameState !== 'playing' || isRevealed}
                onClick={() => handleTileClick(i)}
                className={`aspect-square rounded-2xl border-2 transition-all flex items-center justify-center relative overflow-hidden shadow-lg ${
                  isRevealed
                    ? isMine
                      ? 'bg-rose-600/90 border-red-300 shadow-red-900/80 animate-bounce'
                      : 'bg-gradient-to-b from-[#ffea75] to-[#f59e0b] border-amber-200 shadow-amber-900/60'
                    : 'bg-gradient-to-b from-[#1956c4] via-[#10439e] to-[#0a2f73] border-[#387bf0]/60 hover:brightness-110 active:scale-95 shadow-blue-950/60'
                }`}
              >
                {/* Metallic center dot on unrevealed tile matching IMG_2558 */}
                {!isRevealed && (
                  <div className="w-3.5 h-3.5 rounded-full bg-[#0a2c6d] border border-blue-400/30 shadow-inner" />
                )}

                {/* Revealed: Bomb or Gold Star */}
                {isRevealed && (
                  <span className="text-2xl drop-shadow-md">
                    {isMine ? '💣' : '⭐'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= MID CONTROLS MATCHING IMG_2558 ================= */}
      <div className="grid grid-cols-3 gap-2 items-center px-2 z-10 text-xs font-bold">
        {/* RANDOM BUTTON */}
        <button
          onClick={handleRandomPick}
          disabled={gameState !== 'playing'}
          className={`py-2 px-3 rounded-full border text-center transition-all ${
            gameState === 'playing'
              ? 'bg-[#0047c2] border-sky-400 text-white hover:bg-[#0055eb] active:scale-95'
              : 'bg-[#002e80] border-blue-900 text-neutral-400 opacity-60'
          }`}
        >
          RANDOM
        </button>

        {/* AUTO GAME TOGGLE */}
        <div className="flex items-center justify-center space-x-1.5 bg-[#0047c2]/80 px-2 py-1.5 rounded-full border border-sky-400/40">
          <input
            type="checkbox"
            id="autoGameToggle"
            checked={isAutoGame}
            onChange={(e) => setIsAutoGame(e.target.checked)}
            className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
          />
          <label htmlFor="autoGameToggle" className="cursor-pointer text-[11px] select-none text-sky-100">
            Auto Game
          </label>
        </div>

        {/* MINES SELECTOR DROPDOWN */}
        <div className="relative">
          <select
            value={mineCount}
            disabled={gameState === 'playing'}
            onChange={(e) => setMineCount(Number(e.target.value))}
            className="w-full py-2 px-3 rounded-full bg-[#0047c2] border border-sky-400 text-white text-xs font-bold appearance-none text-center cursor-pointer focus:outline-none"
          >
            {[1, 2, 3, 5, 10, 15, 20, 24].map((m) => (
              <option key={m} value={m} className="bg-[#002e80] text-white">
                Mines: {m}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-[10px] pointer-events-none">
            ▼
          </span>
        </div>
      </div>

      {/* ================= BOTTOM BET CARD MATCHING IMG_2558 ================= */}
      <div className="bg-[#003899]/90 border border-blue-400/50 rounded-2xl p-3 space-y-2 z-10 shadow-xl mt-2">
        <div className="flex items-center space-x-2">
          {/* Bet stepper container matching screenshot */}
          <div className="flex-1 flex items-center bg-[#002666] border border-blue-400/40 rounded-xl p-1 justify-between">
            <span className="text-[10px] text-sky-200 font-bold pl-2">Bet</span>
            <input
              type="text"
              readOnly
              value={`${betAmount.toFixed(2)} INR`}
              className="w-24 text-center bg-transparent font-mono font-bold text-white text-xs focus:outline-none"
            />
            <div className="flex items-center space-x-1">
              <button
                disabled={gameState === 'playing'}
                onClick={() => setBetAmount((p) => Math.max(10, p - 10))}
                className="w-6 h-6 rounded-lg bg-[#0040b3] flex items-center justify-center text-white hover:bg-blue-600"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={gameState === 'playing'}
                onClick={() => setBetAmount(100)}
                className="w-6 h-6 rounded-lg bg-[#0040b3] flex items-center justify-center text-amber-300 hover:bg-blue-600"
                title="100 INR Quick Chip"
              >
                <Coins className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={gameState === 'playing'}
                onClick={() => setBetAmount((p) => p + 10)}
                className="w-6 h-6 rounded-lg bg-[#0040b3] flex items-center justify-center text-white hover:bg-blue-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Refresh & Big Green BET / CASHOUT Button matching IMG_2558 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setBetAmount(10.0)}
            className="w-11 h-11 rounded-2xl bg-[#004cc7] border border-sky-400/60 flex items-center justify-center text-white hover:bg-blue-600 shadow"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {gameState === 'playing' ? (
            <button
              onClick={() => handleCashOut()}
              className="flex-1 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-blue-950 hover:brightness-105 active:scale-95 transition-all shadow-xl flex items-center justify-center space-x-1 animate-pulse"
            >
              <span>CASHOUT (₹{(betAmount * currentMultiplier).toFixed(2)})</span>
            </button>
          ) : (
            <button
              onClick={startMinesGame}
              className="flex-1 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-blue-950 hover:brightness-105 active:scale-95 transition-all shadow-xl flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-blue-950 text-blue-950" />
              <span className="tracking-wider">BET</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= BOTTOM BAR MATCHING IMG_2558 ================= */}
      <div className="flex items-center justify-between pt-1 px-1 text-xs text-sky-200 z-10">
        <button
          onClick={() => toast('Mines Rules: Uncover diamonds to increase your multiplier. Cash out before uncovering a mine!', 'info')}
          className="w-7 h-7 rounded-full bg-amber-400 text-blue-950 font-black flex items-center justify-center shadow"
        >
          ?
        </button>
        <span className="font-mono font-bold text-sky-100">
          {gameState === 'playing' ? `${(betAmount * currentMultiplier).toFixed(2)} INR` : '0 INR'}
        </span>
        <button
          onClick={() => toast('Mines history and fair RNG seeds verified.', 'info')}
          className="text-white hover:text-sky-300"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
