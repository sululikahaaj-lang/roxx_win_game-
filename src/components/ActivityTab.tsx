import React, { useState } from 'react';
import { Gift, Calendar, Trophy, Percent, Sparkles, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ActivityTab: React.FC = () => {
  const { currentUser, claimDailyLoginBonus, toast } = useApp();
  const [giftCode, setGiftCode] = useState('');

  const dailyAmounts = [2, 3, 4, 4, 5, 5, 7]; // Total ₹30.00

  const handleRedeemGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCode.trim()) return;

    if (giftCode.toUpperCase() === 'ROXWIN100' || giftCode.toUpperCase() === 'BONUS2026') {
      toast('🎉 Gift code redeemed successfully! +₹50.00 bonus added.', 'success');
      setGiftCode('');
    } else {
      toast('Invalid or expired gift code. Check Telegram channel for daily drops!', 'error');
    }
  };

  const handleClaimAttendance = (day: number) => {
    const res = claimDailyLoginBonus(day);
    if (!res.success && res.error) {
      toast(res.error, 'info');
    }
  };

  const userClaimed = currentUser?.claimedDays || [];

  return (
    <div className="space-y-4 pb-28 text-neutral-100">
      {/* Header Bonus Card matching screenshot IMG_2541 */}
      <div className="bg-gradient-to-r from-[#fea076] to-[#ff7360] rounded-2xl p-4 text-rose-950 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-rose-950/20">
          <div>
            <div className="text-[11px] font-bold opacity-80">New Member Welcome</div>
            <div className="text-2xl font-black">₹3.00</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold opacity-80">7 Days Login Streak</div>
            <div className="text-2xl font-black">₹30.00</div>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={() => handleClaimAttendance(userClaimed.length + 1)}
            className="px-6 py-1.5 rounded-full bg-rose-950 text-amber-300 font-bold text-xs shadow hover:text-white transition-all active:scale-95"
          >
            Claim Today's Bonus
          </button>
        </div>
      </div>

      {/* 5 Icons Row matching screenshot IMG_2541 */}
      <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
        {[
          { label: 'Activity Award', icon: '🎖️' },
          { label: 'Invitation bonus', icon: '👥' },
          { label: 'Betting rebate', icon: '💰' },
          { label: 'Super Jackpot', icon: '🏆' },
          { label: '₹3 Welcome', icon: '🎁' },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => toast(`${item.label} feature active. Complete games to earn!`, 'info')}
            className="p-2 bg-[#2d090f] border border-rose-900/50 rounded-2xl flex flex-col items-center justify-center hover:bg-[#3d0f16] transition-all"
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-[10px] text-neutral-300 leading-tight truncate w-full">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Gifts Redemption Card matching screenshot IMG_2541 */}
      <div className="p-4 bg-gradient-to-r from-[#3e0f16] to-[#2b080d] rounded-2xl border border-rose-900/60 shadow-md space-y-3">
        <div className="flex items-center space-x-2">
          <Gift className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Gifts</h3>
        </div>
        <p className="text-[11px] text-neutral-300">
          Enter the redemption code to receive gift rewards from Telegram &amp; live promotions.
        </p>

        <form onSubmit={handleRedeemGift} className="flex space-x-2">
          <input
            type="text"
            value={giftCode}
            onChange={(e) => setGiftCode(e.target.value)}
            placeholder="Please enter gift code (e.g. ROXWIN100)"
            className="flex-1 px-3.5 py-2 bg-[#48141d] border border-rose-800 rounded-xl text-white text-xs uppercase placeholder-neutral-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 text-rose-950 font-black rounded-xl text-xs shadow hover:brightness-105"
          >
            Receive
          </button>
        </form>
      </div>

      {/* 7 DAYS ATTENDANCE BONUS (₹30 TOTAL BONUS) matching screenshot IMG_2541 */}
      <div className="p-4 bg-gradient-to-r from-[#3e0f16] to-[#2b080d] rounded-2xl border border-rose-900/60 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">7 Days Sign-in Bonus (₹30.00 Total)</h3>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
            Consecutive 7 Days
          </span>
        </div>
        <p className="text-[11px] text-neutral-300">
          Log in daily to claim your ₹30 total bonus! Funds are credited directly to your playable wallet balance.
        </p>

        {/* 7 Days streak pills */}
        <div className="grid grid-cols-7 gap-1.5 pt-1 text-center">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
            const isClaimed = userClaimed.includes(d);
            const reward = dailyAmounts[d - 1];
            return (
              <button
                key={d}
                onClick={() => handleClaimAttendance(d)}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                  isClaimed
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 font-black shadow-inner'
                    : 'bg-[#48141d] border-rose-800 text-neutral-200 hover:border-amber-400 active:scale-95'
                }`}
              >
                <div>Day {d}</div>
                <div className={`mt-0.5 text-xs font-black ${isClaimed ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {isClaimed ? '✓' : `₹${reward}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
