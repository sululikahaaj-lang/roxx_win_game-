import React, { useState } from 'react';
import {
  X,
  Headphones,
  Send,
  MessageSquare,
  AlertCircle,
  CreditCard,
  Building,
  Key,
  Bot,
  SendHorizontal,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CustomerCareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerCareModal: React.FC<CustomerCareModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, supportTickets, createSupportTicket, replyToTicket, adminSettings } = useApp();

  const [activeView, setActiveView] = useState<'categories' | 'ticketChat' | 'newTicket'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('Deposit Not Received');
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketMessage, setTicketMessage] = useState<string>('');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState<string>('');

  if (!isOpen) return null;

  const categories = [
    { id: 'Deposit Not Received', label: 'Deposit Not Received', icon: '📥', desc: 'UTR verification delays, uncredited deposits' },
    { id: 'Withdrawal problem', label: 'Withdrawal problem', icon: '📤', desc: 'Pending payouts, bank processing issues' },
    { id: 'IFSC Modification', label: 'IFSC Modification', icon: '🏦', desc: 'Correct IFSC or branch details' },
    { id: 'Change bank name', label: 'Change bank name', icon: '🏛️', desc: 'Update linked bank or UPI address' },
    { id: 'Change ID Login Password', label: 'Change ID Login Password', icon: '🔒', desc: 'Password reset and security' },
    { id: 'Add USDT Address', label: 'Add USDT Address', icon: '₮', desc: 'Bind TRC20/BEP20 crypto address' },
    { id: 'Robot Customer Service', label: 'Robot 24/7 Service', icon: '🤖', desc: 'Instant AI and rule automated answers' },
  ];

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    // Find if user already has an open ticket in this category
    const existing = supportTickets.find(
      (t) => t.category === cat && (t.userId === currentUser?.id || t.userPhone === currentUser?.phone)
    );
    if (existing) {
      setActiveTicketId(existing.id);
      setActiveView('ticketChat');
    } else {
      setTicketSubject(`${cat} Request - ${currentUser?.phone || 'Guest'}`);
      setActiveView('newTicket');
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    const newTicket = createSupportTicket(
      selectedCategory,
      ticketSubject || selectedCategory,
      ticketMessage
    );
    setActiveTicketId(newTicket.id);
    setActiveView('ticketChat');
    setTicketMessage('');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeTicketId) return;

    replyToTicket(activeTicketId, chatInput.trim(), false);
    setChatInput('');
  };

  const currentTicket = supportTickets.find((t) => t.id === activeTicketId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col bg-gradient-to-b from-[#330c11] via-[#240609] to-[#140204] rounded-2xl border border-rose-900/60 shadow-2xl text-neutral-100 overflow-hidden">
        {/* Header matching screenshot IMG_2545 */}
        <div className="bg-[#29070b] border-b border-rose-900/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {activeView !== 'categories' && (
              <button
                onClick={() => setActiveView('categories')}
                className="w-7 h-7 rounded-full bg-[#3d0f14] flex items-center justify-center text-rose-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-bold text-white tracking-wide">
              {activeView === 'categories' && 'Customer Service Center'}
              {activeView === 'newTicket' && `Report: ${selectedCategory}`}
              {activeView === 'ticketChat' && 'Live Support Chat'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#3d0f14] flex items-center justify-center text-rose-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable View Area */}
        <div className="overflow-y-auto no-scrollbar flex-1 p-4 space-y-4">
          {/* CATEGORIES LIST (Matching IMG_2545) */}
          {activeView === 'categories' && (
            <div className="space-y-3">
              {/* Support Banner matching screenshot IMG_2545 */}
              <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 p-4 rounded-xl border border-rose-700/50 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase">
                    Official Care
                  </span>
                  <h3 className="text-sm font-black text-white mt-0.5">
                    Welcome to Self Service Center
                  </h3>
                  <p className="text-[11px] text-rose-200/90 mt-1">
                    24/7 fast support for UTR verifications &amp; withdrawals
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-2xl">
                  🎧
                </div>
              </div>

              {/* Telegram Channel Shortcut (IMG_2547) */}
              <a
                href={adminSettings.telegramChannel}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-[#1e293b]/70 border border-sky-500/50 rounded-xl flex items-center justify-between hover:bg-[#1e293b] transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-white">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sky-200">Official Telegram Channel</div>
                    <div className="text-[10px] text-sky-300/70">Join for daily bonus gift codes &amp; updates</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-sky-400" />
              </a>

              {/* Service Categories list matching IMG_2545 */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-rose-200">Select Issue Category</div>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="w-full p-3 bg-[#380e14] border border-rose-900/50 hover:border-amber-400/50 rounded-xl flex items-center justify-between transition-all hover:bg-[#451219] text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{cat.label}</div>
                        <div className="text-[10px] text-rose-300/70">{cat.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NEW TICKET FORM */}
          {activeView === 'newTicket' && (
            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div className="p-3 bg-[#380e14] border border-rose-900/50 rounded-xl text-xs space-y-1">
                <span className="text-rose-400 font-bold">Category:</span>{' '}
                <span className="text-white">{selectedCategory}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-200 mb-1">
                  Topic / Summary
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Deposit ₹500 UTR verification"
                  required
                  className="w-full px-3 py-2 bg-[#421219] border border-rose-900/60 rounded-xl text-white text-xs focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-200 mb-1">
                  Describe your problem or provide UTR / account details *
                </label>
                <textarea
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Please state:&#10;1. Transaction UTR or Reference&#10;2. Amount&#10;3. Date & time of payment"
                  required
                  className="w-full px-3 py-2.5 bg-[#421219] border border-rose-900/60 rounded-xl text-white text-xs focus:outline-none focus:border-rose-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full font-bold text-xs bg-gradient-to-r from-[#fea076] to-[#ff7360] text-rose-950 shadow-md hover:brightness-105 active:scale-[0.99] transition-all"
              >
                Send to Customer Support
              </button>
            </form>
          )}

          {/* TICKET CHAT VIEW */}
          {activeView === 'ticketChat' && currentTicket && (
            <div className="flex flex-col h-[65vh]">
              {/* Ticket status badge */}
              <div className="p-2.5 bg-[#380e14] border border-rose-900/50 rounded-xl flex items-center justify-between text-xs mb-3">
                <span className="font-bold text-white truncate max-w-[200px]">
                  {currentTicket.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600/40 uppercase">
                  {currentTicket.status}
                </span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
                {currentTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[10px] text-neutral-400 mb-1 px-1">
                      {msg.senderName} • {msg.timestamp}
                    </span>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-rose-700 text-white rounded-tr-none'
                          : msg.sender === 'bot'
                          ? 'bg-[#3b1219] border border-rose-900/60 text-neutral-200 rounded-tl-none'
                          : 'bg-emerald-950 border border-emerald-600/50 text-emerald-100 rounded-tl-none font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="pt-3 flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type message to Customer Support..."
                  className="flex-1 px-3.5 py-2.5 bg-[#421219] border border-rose-900/60 rounded-xl text-white text-xs focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 rounded-xl text-white font-bold text-xs flex items-center justify-center hover:brightness-105"
                >
                  <SendHorizontal className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
