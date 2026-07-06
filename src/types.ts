/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  referralCode: string;
  referredBy?: string;
  profilePic?: string;
  
  // Balances & Earnings
  mainWallet: number; // For Withdrawals/Purchases
  adsWallet: number;  // Earned from watching ads
  tasksWallet: number; // Earned from doing tasks
  referralWallet: number; // Earned from referrals
  
  // Plan details
  activePlanId: number | null; // null if free user
  planStartDate?: string;
  planEndDate?: string;
  
  // Counters for daily limits
  todayAdsWatched: number;
  todayTasksCompleted: number;
  lastAdWatchDate?: string; // For daily limit resets
  lastTaskCompleteDate?: string;
  
  createdAt: string;
}

export interface InvestmentPlan {
  id: number;
  name: string;
  price: number;
  totalReturn: number;
  dailyReturn: number;
  tasksPerDay: number;
  durationDays: number;
}

export interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  transactionId: string;
  screenshot: string; // Base64 or local blob URL
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  expiresAt: string;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  amount: number;
  method: 'JazzCash' | 'Easypaisa';
  number: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface PlatformNotification {
  id: string;
  userId: string;
  message: string;
  type: 'deposit' | 'withdraw' | 'task' | 'ad' | 'referral' | 'system';
  createdAt: string;
  read: boolean;
}

export interface EarningLog {
  id: string;
  userId: string;
  amount: number;
  type: 'ad' | 'task' | 'referral' | 'transfer' | 'investment';
  description: string;
  createdAt: string;
}
