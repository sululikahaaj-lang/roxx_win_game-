export interface User {
  id: string;
  phone: string;
  name: string;
  uid: string;
  vipLevel: number;
  balance: number;
  createdAt: string;
  lastLogin: string;
  avatarUrl?: string;
  invitationCode: string;
  referredBy?: string;
  password?: string;
  claimedDays?: number[];
  lastDailyClaimDate?: string;
  lastDailyClaimTimestamp?: number; // Exact millisecond timestamp for 24h cooldown
  requiredBetToWithdraw?: number; // Need to bet amount before withdrawal
  totalWagered?: number;
}

export type DepositStatus = 'pending' | 'approved' | 'rejected';
export type WithdrawalStatus = 'pending' | 'completed' | 'rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  amount: number;
  channel: string;
  utr: string;
  screenshotUrl?: string;
  status: DepositStatus;
  createdAt: string;
  reviewedAt?: string;
  notes?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  amount: number;
  method: 'UPI' | 'BANK_CARD' | 'USDT';
  accountDetails: {
    upiId?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
    accountHolderName?: string;
    usdtAddress?: string;
  };
  status: WithdrawalStatus;
  createdAt: string;
  reviewedAt?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  referenceId?: string;
}

export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'admin' | 'bot';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  category: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  messages: SupportChatMessage[];
}

export interface AdminSettings {
  upiId: string;
  upiName: string;
  qrImageUrl: string;
  minDeposit: number;
  maxDeposit: number;
  minWithdraw: number;
  maxWithdraw: number;
  supportPhone: string;
  telegramChannel: string;
  botLossRate: number; // e.g. 75 for 75% loss (high loss, low win)
  botDifficulty: 'high_loss' | 'fair';
}

export interface WingoResult {
  period: string;
  number: number;
  color: 'green' | 'red' | 'violet-red' | 'violet-green';
  size: 'big' | 'small';
  timestamp: string;
}

export interface UserBet {
  id: string;
  userId: string;
  game: 'wingo' | 'aviator' | 'mines' | 'cricket' | 'limbo' | 'slots';
  amount: number;
  multiplier?: number;
  winAmount?: number;
  status: 'won' | 'lost' | 'pending';
  betOn?: string;
  period?: string;
  timestamp: string;
}
