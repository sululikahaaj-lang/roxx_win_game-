import React from 'react';
import { Copy, Users, ChevronRight, Share2, Award, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PromotionTab: React.FC = () => {
  const { currentUser, toast } = useApp();

  const inviteCode = currentUser?.invitationCode || '77843528774';
  const inviteLink = `${window.location.origin}?ref=${inviteCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast(`Invitation code copied: ${inviteCode}`, 'success');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast('Invitation link copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-4 pb-28 text-neutral-100">
      {/* Commission Header Card matching screenshot IMG_2544 */}
      <div className="bg-gradient-to-r from-[#fea076] to-[#ff7360] rounded-2xl p-4 text-rose-950 text-center shadow-xl space-y-2">
        <div className="text-3xl font-black">0</div>
        <div className="inline-block bg-rose-950 text-rose-200 text-xs font-bold px-3 py-1 rounded-full">
          Yesterday's total commission
        </div>
        <div className="text-[11px] font-semibold opacity-90">
          Upgrade the level to increase commission income
        </div>
      </div>

      {/* Subordinates Table matching screenshot IMG_2544 */}
      <div className="rounded-2xl overflow-hidden border border-rose-900/60 shadow-lg">
        {/* Table Header */}
        <div className="grid grid-cols-2 bg-gradient-to-r from-[#ff5b65] to-[#f43f5e] p-2.5 text-center text-xs font-black text-rose-950">
          <div>Direct subordinates</div>
          <div>Team subordinates</div>
        </div>

        {/* Table Content */}
        <div className="grid grid-cols-2 bg-[#310c12] divide-x divide-rose-900/60 text-center text-xs p-3">
          {/* Direct Subordinates column */}
          <div className="space-y-3 pr-2">
            <div>
              <div className="text-sm font-black text-white">0</div>
              <div className="text-[10px] text-neutral-400">Number of register</div>
            </div>
            <div>
              <div className="text-sm font-black text-white">0</div>
              <div className="text-[10px] text-neutral-400">Deposit number</div>
            </div>
            <div>
              <div className="text-sm font-black text-white">0</div>
              <div className="text-[10px] text-neutral-400">Deposit amount</div>
            </div>
            <div>
              <div className="text-sm font-black text-white">0</div>
              <div className="text-[10px] text-neutral-400 leading-tight">
                Number of people making first deposit
              </div>
            </div>
          </div>

          {/* Team Subordinates column */}
          <div className="space-y-3 pl-2">
            <div>
              <div className="text-sm font-black text-white">0</div>
              <div className="text-[10px] text-neutral-400">Number of register</div>
            </div>
            <div>
              <div className="text-sm font-black text-white">0</div>
              <div className="text-[10px] text-neutral-400">Deposit number</div>
            </div>
            <div>
              <div className="text-sm font-black text-white">0</div>
              <div className="text-[10px] text-neutral-400">Deposit amount</div>
            </div>
            <div>
              <div className="text-sm font-black text-white">0</div>
              <div className="text-[10px] text-neutral-400 leading-tight">
                Number of people making first deposit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BIG INVITATION LINK BUTTON matching screenshot IMG_2544 */}
      <button
        onClick={handleCopyLink}
        className="w-full py-3.5 rounded-full font-black text-sm bg-gradient-to-r from-[#fea076] via-[#ff7360] to-[#ff5b45] text-rose-950 shadow-xl shadow-rose-950/60 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
      >
        <Share2 className="w-4 h-4" />
        <span>INVITATION LINK</span>
      </button>

      {/* COPY INVITATION CODE matching screenshot IMG_2544 */}
      <div className="p-3.5 bg-[#380e14] border border-rose-900/60 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="text-xl">📥</span>
          <span className="text-xs font-bold text-white">Copy invitation code</span>
        </div>
        <button
          onClick={handleCopyCode}
          className="flex items-center space-x-1.5 font-mono text-xs font-bold text-amber-300 hover:text-white"
        >
          <span>{inviteCode}</span>
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Additional Menu Items matching screenshot IMG_2544 */}
      <div className="space-y-2">
        {[
          { label: 'Subordinate data', icon: '📅' },
          { label: 'Commission detail', icon: '💲' },
          { label: 'Invitation rules', icon: '📕' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => toast(`${item.label} detail updated daily at 00:00.`, 'info')}
            className="w-full p-3.5 bg-[#380e14] border border-rose-900/60 rounded-xl flex items-center justify-between text-xs font-bold text-white hover:bg-[#451219] transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        ))}
      </div>
    </div>
  );
};
