/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, 
  InvestmentPlan, 
  DepositRequest, 
  WithdrawRequest, 
  PlatformNotification, 
  EarningLog 
} from '../types';

// Constants
export const INVESTMENT_PLANS: InvestmentPlan[] = [
  { id: 1, name: "Starter Plan", price: 500, totalReturn: 1800, dailyReturn: 40, tasksPerDay: 2, durationDays: 45 },
  { id: 2, name: "Bronze Plan", price: 1000, totalReturn: 2700, dailyReturn: 60, tasksPerDay: 3, durationDays: 45 },
  { id: 3, name: "Silver Plan", price: 2000, totalReturn: 3600, dailyReturn: 80, tasksPerDay: 4, durationDays: 45 },
  { id: 4, name: "Gold Plan", price: 3000, totalReturn: 5400, dailyReturn: 120, tasksPerDay: 6, durationDays: 45 },
  { id: 5, name: "Platinum Plan", price: 5000, totalReturn: 8100, dailyReturn: 180, tasksPerDay: 9, durationDays: 45 },
  { id: 6, name: "Diamond Plan", price: 10000, totalReturn: 18000, dailyReturn: 400, tasksPerDay: 20, durationDays: 45 }
];

export const RECEIVER_DETAILS = {
  name: "Saifullah",
  number: "03363135004"
};

export const MAX_DAILY_ADS = 5;
export const AD_REWARD = 3; // Rs 3 per ad
export const TASK_REWARD = 20; // Rs 20 per task

// Helpers to read/write storage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Generate UUID
const generateId = (): string => Math.random().toString(36).substring(2, 11);

// Initialize DB with some dummy data if empty
export const initSimDb = () => {
  const users = getStorageItem<User[]>('sim_users', []);
  if (users.length === 0) {
    // Add a default user for testing
    const defaultUser: User = {
      id: "test-user-1",
      name: "Demo User",
      email: "demo@example.com",
      whatsapp: "03001234567",
      referralCode: "DEMO786",
      referredBy: "ADMIN",
      mainWallet: 500, // Starts with Rs 500 so they can try buying a plan instantly!
      adsWallet: 0,
      tasksWallet: 0,
      referralWallet: 0,
      activePlanId: null,
      todayAdsWatched: 0,
      todayTasksCompleted: 0,
      createdAt: new Date().toISOString()
    };
    
    // Save dummy users
    setStorageItem<User[]>('sim_users', [
      { ...defaultUser, email: "saifiking78666@gmail.com", name: "Saifi Admin", referralCode: "SAIFI123", mainWallet: 2500 },
      defaultUser
    ]);
    
    // Add default notifications
    const defaultNotifications: PlatformNotification[] = [
      {
        id: generateId(),
        userId: "test-user-1",
        message: "Welcome to RupeeGrow! Watch ads daily and buy investment plans to unlock tasks.",
        type: "system",
        createdAt: new Date().toISOString(),
        read: false
      }
    ];
    setStorageItem<PlatformNotification[]>('sim_notifications', defaultNotifications);
  }
};

// Reset daily limits if a new day has arrived
export const checkAndResetDailyLimits = (user: User): User => {
  const todayStr = new Date().toDateString();
  let updated = false;
  const updatedUser = { ...user };

  if (user.lastAdWatchDate !== todayStr) {
    updatedUser.todayAdsWatched = 0;
    updatedUser.lastAdWatchDate = todayStr;
    updated = true;
  }

  if (user.lastTaskCompleteDate !== todayStr) {
    updatedUser.todayTasksCompleted = 0;
    updatedUser.lastTaskCompleteDate = todayStr;
    updated = true;
  }

  if (updated) {
    const users = getStorageItem<User[]>('sim_users', []);
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
      setStorageItem('sim_users', users);
    }
  }

  return updatedUser;
};

// Database queries & mutations
export const simDb = {
  // --- AUTH OPERATIONS ---
  getCurrentUser: (): User | null => {
    const user = getStorageItem<User | null>('sim_current_user', null);
    if (user) {
      return checkAndResetDailyLimits(user);
    }
    return null;
  },

  login: (email: string, password: string): { success: boolean; error?: string; user?: User } => {
    const users = getStorageItem<User[]>('sim_users', []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, error: "No account found with this email." };
    }
    
    // In our sim, we check password. To make things simple, we match plain text or any string.
    // If they change their password in Profile, we store it. Let's look up password store or accept default 'password'
    const passwords = getStorageItem<Record<string, string>>('sim_passwords', {});
    const savedPassword = passwords[user.id] || "password"; // Default is 'password'
    
    if (password !== savedPassword) {
      return { success: false, error: "Incorrect password. Default is 'password'." };
    }

    setStorageItem<User>('sim_current_user', user);
    return { success: true, user: checkAndResetDailyLimits(user) };
  },

  resetPassword: (email: string, newPassword: string): { success: boolean; error?: string } => {
    const users = getStorageItem<User[]>('sim_users', []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, error: "No account found with this email address." };
    }
    
    const passwords = getStorageItem<Record<string, string>>('sim_passwords', {});
    passwords[user.id] = newPassword;
    setStorageItem('sim_passwords', passwords);
    
    return { success: true };
  },

  signup: (data: { name: string; email: string; whatsapp: string; referral?: string }): { success: boolean; error?: string; user?: User } => {
    const users = getStorageItem<User[]>('sim_users', []);
    
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists." };
    }

    const userId = generateId();
    const userReferralCode = data.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5) + Math.floor(100 + Math.random() * 900);

    // Referral logic: Link referrer (no sign-up bonus, commission is earned when they purchase a plan)
    let referredByUserId: string | undefined;
    if (data.referral) {
      const referrer = users.find(u => u.referralCode.toLowerCase() === data.referral?.toLowerCase());
      if (referrer) {
        referredByUserId = referrer.id;
        
        // Notify referrer that someone registered
        const notif: PlatformNotification = {
          id: generateId(),
          userId: referrer.id,
          message: `New Referral registered! ${data.name} joined using your link. You will earn a 10% commission once they purchase any Investment Plan.`,
          type: 'referral',
          createdAt: new Date().toISOString(),
          read: false
        };
        const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
        notifs.push(notif);
        setStorageItem('sim_notifications', notifs);
      }
    }

    const newUser: User = {
      id: userId,
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      referralCode: userReferralCode,
      referredBy: referredByUserId,
      mainWallet: 0, // Starts with Rs 0
      adsWallet: 0,
      tasksWallet: 0,
      referralWallet: 0,
      activePlanId: null,
      todayAdsWatched: 0,
      todayTasksCompleted: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    setStorageItem<User[]>('sim_users', users);
    
    // Save default password
    const passwords = getStorageItem<Record<string, string>>('sim_passwords', {});
    passwords[userId] = "password"; // Default password
    setStorageItem('sim_passwords', passwords);

    // Add welcoming notification
    const notifications = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    notifications.push({
      id: generateId(),
      userId: newUser.id,
      message: "Welcome to RupeeGrow! Your account is created. Watch Ads or invest in a plan to earn daily.",
      type: 'system',
      createdAt: new Date().toISOString(),
      read: false
    });
    setStorageItem('sim_notifications', notifications);

    setStorageItem<User>('sim_current_user', newUser);
    return { success: true, user: newUser };
  },

  logout: (): void => {
    localStorage.removeItem('sim_current_user');
  },

  updateProfile: (userId: string, data: { name: string; whatsapp: string; profilePic?: string }): User => {
    const users = getStorageItem<User[]>('sim_users', []);
    const idx = users.findIndex(u => u.id === userId);
    
    if (idx === -1) throw new Error("User not found");
    
    users[idx] = { ...users[idx], ...data };
    setStorageItem('sim_users', users);
    setStorageItem('sim_current_user', users[idx]);
    return users[idx];
  },

  changePassword: (userId: string, oldPass: string, newPass: string): { success: boolean; error?: string } => {
    const passwords = getStorageItem<Record<string, string>>('sim_passwords', {});
    const currentPass = passwords[userId] || "password";

    if (currentPass !== oldPass) {
      return { success: false, error: "Current password does not match." };
    }

    passwords[userId] = newPass;
    setStorageItem('sim_passwords', passwords);
    return { success: true };
  },

  // --- AD WATCHING ---
  watchAd: (userId: string): { success: boolean; error?: string; rewardAdded?: number; user?: User } => {
    const users = getStorageItem<User[]>('sim_users', []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: "User not found" };

    let user = users[idx];
    user = checkAndResetDailyLimits(user);

    if (user.todayAdsWatched >= MAX_DAILY_ADS) {
      return { success: false, error: "Daily Ad Limit (10/10) reached! Please come back tomorrow." };
    }

    // Reward Rs 3
    user.todayAdsWatched += 1;
    user.adsWallet += AD_REWARD;
    user.lastAdWatchDate = new Date().toDateString();

    users[idx] = user;
    setStorageItem('sim_users', users);
    setStorageItem('sim_current_user', user);

    // Earning Log
    const logs = getStorageItem<EarningLog[]>('sim_earning_logs', []);
    logs.push({
      id: generateId(),
      userId,
      amount: AD_REWARD,
      type: 'ad',
      description: `Watched video ad (Earning: Rs ${AD_REWARD})`,
      createdAt: new Date().toISOString()
    });
    setStorageItem('sim_earning_logs', logs);

    // Notification
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    notifs.push({
      id: generateId(),
      userId,
      message: `Video ad watched! Rs ${AD_REWARD} credited to your Ads Wallet.`,
      type: 'ad',
      createdAt: new Date().toISOString(),
      read: false
    });
    setStorageItem('sim_notifications', notifs);

    return { success: true, rewardAdded: AD_REWARD, user };
  },

  // --- TASKS ---
  completeTask: (userId: string): { success: boolean; error?: string; rewardAdded?: number; user?: User } => {
    const users = getStorageItem<User[]>('sim_users', []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: "User not found" };

    let user = users[idx];
    user = checkAndResetDailyLimits(user);

    if (user.activePlanId === null) {
      return { success: false, error: "Buy an Investment Plan to unlock tasks." };
    }

    const plan = INVESTMENT_PLANS.find(p => p.id === user.activePlanId);
    if (!plan) return { success: false, error: "Plan not found" };

    if (user.todayTasksCompleted >= plan.tasksPerDay) {
      return { success: false, error: `Daily limit reached! Plan allows ${plan.tasksPerDay} tasks/day.` };
    }

    // Complete task and reward Rs 20
    user.todayTasksCompleted += 1;
    user.tasksWallet += TASK_REWARD;
    user.lastTaskCompleteDate = new Date().toDateString();

    users[idx] = user;
    setStorageItem('sim_users', users);
    setStorageItem('sim_current_user', user);

    // Earning Log
    const logs = getStorageItem<EarningLog[]>('sim_earning_logs', []);
    logs.push({
      id: generateId(),
      userId,
      amount: TASK_REWARD,
      type: 'task',
      description: `Completed task #${user.todayTasksCompleted} (Earning: Rs ${TASK_REWARD})`,
      createdAt: new Date().toISOString()
    });
    setStorageItem('sim_earning_logs', logs);

    // Notification
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    notifs.push({
      id: generateId(),
      userId,
      message: `Task completed successfully! Rs ${TASK_REWARD} credited to your Tasks Wallet.`,
      type: 'task',
      createdAt: new Date().toISOString(),
      read: false
    });
    setStorageItem('sim_notifications', notifs);

    return { success: true, rewardAdded: TASK_REWARD, user };
  },

  // --- BUY PLAN ---
  buyPlan: (userId: string, planId: number): { success: boolean; error?: string; user?: User } => {
    const users = getStorageItem<User[]>('sim_users', []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: "User not found" };

    const user = users[idx];
    const plan = INVESTMENT_PLANS.find(p => p.id === planId);
    if (!plan) return { success: false, error: "Invalid Investment Plan." };

    if (user.mainWallet < plan.price) {
      return { success: false, error: `Insufficient balance! You need Rs ${plan.price}, but have Rs ${user.mainWallet}. Please deposit first.` };
    }

    // Deduct and activate
    user.mainWallet -= plan.price;
    user.activePlanId = plan.id;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 45); // 45 days

    user.planStartDate = startDate.toISOString();
    user.planEndDate = endDate.toISOString();
    user.todayTasksCompleted = 0; // Reset task count

    users[idx] = user;

    // Earning Log / Transaction Log
    const logs = getStorageItem<EarningLog[]>('sim_earning_logs', []);
    logs.push({
      id: generateId(),
      userId,
      amount: -plan.price,
      type: 'investment',
      description: `Purchased ${plan.name} for Rs ${plan.price}`,
      createdAt: new Date().toISOString()
    });

    // Notification
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    notifs.push({
      id: generateId(),
      userId,
      message: `Plan Activated! You have subscribed to ${plan.name} for 45 days. Start doing ${plan.tasksPerDay} tasks daily to earn Rs ${plan.dailyReturn}/day.`,
      type: 'system',
      createdAt: new Date().toISOString(),
      read: false
    });

    // Referral Commission logic (10% of investment plan value is awarded to referrer)
    if (user.referredBy) {
      const referrerIdx = users.findIndex(u => u.id === user.referredBy);
      if (referrerIdx !== -1) {
        const commissionAmount = Math.round(plan.price * 0.10); // 10% commission
        
        users[referrerIdx].referralWallet += commissionAmount;
        users[referrerIdx].mainWallet += commissionAmount;
        
        // Log commission for referrer
        logs.push({
          id: generateId(),
          userId: user.referredBy,
          amount: commissionAmount,
          type: 'referral',
          description: `10% referral commission on ${user.name}'s purchase of ${plan.name}`,
          createdAt: new Date().toISOString()
        });

        // Notify referrer
        notifs.push({
          id: generateId(),
          userId: user.referredBy,
          message: `Referral Commission! Rs ${commissionAmount} (10% of Rs ${plan.price}) has been added to your Main Wallet as your referral ${user.name} purchased the ${plan.name} plan.`,
          type: 'referral',
          createdAt: new Date().toISOString(),
          read: false
        });
      }
    }

    // Save everything
    setStorageItem('sim_users', users);
    setStorageItem('sim_current_user', user);
    setStorageItem('sim_earning_logs', logs);
    setStorageItem('sim_notifications', notifs);

    return { success: true, user };
  },

  // --- DEPOSIT ---
  createDepositRequest: (userId: string, amount: number, transactionId: string, screenshot: string): DepositRequest => {
    const deposits = getStorageItem<DepositRequest[]>('sim_deposits', []);
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

    const newReq: DepositRequest = {
      id: generateId(),
      userId,
      amount,
      transactionId,
      screenshot,
      status: 'Pending',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    deposits.push(newReq);
    setStorageItem('sim_deposits', deposits);

    // System Notification
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    notifs.push({
      id: generateId(),
      userId,
      message: `Deposit request of Rs ${amount} submitted! Verified manually in 5 minutes.`,
      type: 'deposit',
      createdAt: new Date().toISOString(),
      read: false
    });
    setStorageItem('sim_notifications', notifs);

    return newReq;
  },

  simulateVerifyDeposit: (depositId: string) => {
    const deposits = getStorageItem<DepositRequest[]>('sim_deposits', []);
    const depIdx = deposits.findIndex(d => d.id === depositId && d.status === 'Pending');
    if (depIdx === -1) return;

    const deposit = deposits[depIdx];
    deposit.status = 'Approved';
    deposits[depIdx] = deposit;
    setStorageItem('sim_deposits', deposits);

    // Add balance to user
    const users = getStorageItem<User[]>('sim_users', []);
    const userIdx = users.findIndex(u => u.id === deposit.userId);
    if (userIdx !== -1) {
      users[userIdx].mainWallet += deposit.amount;
      setStorageItem('sim_users', users);

      // Update current user if active session
      const currentSession = getStorageItem<User | null>('sim_current_user', null);
      if (currentSession && currentSession.id === deposit.userId) {
        currentSession.mainWallet += deposit.amount;
        setStorageItem('sim_current_user', currentSession);
      }

      // Notification
      const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
      notifs.push({
        id: generateId(),
        userId: deposit.userId,
        message: `SUCCESS! Your deposit of Rs ${deposit.amount} has been approved. Balance added to Main Wallet.`,
        type: 'deposit',
        createdAt: new Date().toISOString(),
        read: false
      });
      setStorageItem('sim_notifications', notifs);

      // Trigger standard React state updates by dispatching an event
      window.dispatchEvent(new Event('sim_db_updated'));
    }
  },

  // --- WITHDRAWAL ---
  requestWithdraw: (userId: string, amount: number, method: 'JazzCash' | 'Easypaisa', number: string): { success: boolean; error?: string; withdraw?: WithdrawRequest } => {
    const users = getStorageItem<User[]>('sim_users', []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: "User not found" };

    const user = users[idx];
    
    // 1. Check if user has an active investment plan
    if (user.activePlanId === null) {
      return { success: false, error: "Without an active Investment Plan, you cannot make withdrawals." };
    }

    const plan = INVESTMENT_PLANS.find(p => p.id === user.activePlanId);
    if (!plan) {
      return { success: false, error: "Active Investment Plan not found." };
    }

    // 2. Check maximum withdrawal limit (30% of active plan price)
    const maxWithdrawLimit = plan.price * 0.3;
    if (amount > maxWithdrawLimit) {
      return { 
        success: false, 
        error: `Withdrawal limit is 30% of your active plan's price (Max Rs ${maxWithdrawLimit}). Your active plan is ${plan.name} (Price: Rs ${plan.price}).` 
      };
    }

    // 3. Minimum withdrawal check (changed to Rs 100 so Starter Plan users can withdraw Rs 150)
    if (amount < 100) {
      return { success: false, error: "Minimum withdrawal amount is Rs 100." };
    }

    if (user.mainWallet < amount) {
      return { success: false, error: `Insufficient Main Wallet balance! You have Rs ${user.mainWallet}.` };
    }

    // Deduct instantly from Main Wallet
    user.mainWallet -= amount;
    users[idx] = user;
    setStorageItem('sim_users', users);
    setStorageItem('sim_current_user', user);

    // Create withdrawal log
    const withdraws = getStorageItem<WithdrawRequest[]>('sim_withdrawals', []);
    const newReq: WithdrawRequest = {
      id: generateId(),
      userId,
      amount,
      method,
      number,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    withdraws.push(newReq);
    setStorageItem('sim_withdrawals', withdraws);

    // Earning Log
    const logs = getStorageItem<EarningLog[]>('sim_earning_logs', []);
    logs.push({
      id: generateId(),
      userId,
      amount: -amount,
      type: 'transfer',
      description: `Withdrew Rs ${amount} to ${method} (${number})`,
      createdAt: new Date().toISOString()
    });
    setStorageItem('sim_earning_logs', logs);

    // Notification
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    notifs.push({
      id: generateId(),
      userId,
      message: `Withdrawal request of Rs ${amount} via ${method} submitted successfully. Status is Pending and awaiting Admin manual approval.`,
      type: 'withdraw',
      createdAt: new Date().toISOString(),
      read: false
    });
    setStorageItem('sim_notifications', notifs);

    return { success: true, withdraw: newReq };
  },

  simulateVerifyWithdraw: (withdrawId: string) => {
    const withdraws = getStorageItem<WithdrawRequest[]>('sim_withdrawals', []);
    const idx = withdraws.findIndex(w => w.id === withdrawId && w.status === 'Pending');
    if (idx === -1) return;

    // 90% chance to approve, 10% to reject
    const isApproved = Math.random() > 0.1;
    const withdraw = withdraws[idx];
    withdraw.status = isApproved ? 'Approved' : 'Rejected';
    withdraws[idx] = withdraw;
    setStorageItem('sim_withdrawals', withdraws);

    if (!isApproved) {
      // Refund user
      const users = getStorageItem<User[]>('sim_users', []);
      const userIdx = users.findIndex(u => u.id === withdraw.userId);
      if (userIdx !== -1) {
        users[userIdx].mainWallet += withdraw.amount;
        setStorageItem('sim_users', users);

        const currentSession = getStorageItem<User | null>('sim_current_user', null);
        if (currentSession && currentSession.id === withdraw.userId) {
          currentSession.mainWallet += withdraw.amount;
          setStorageItem('sim_current_user', currentSession);
        }
      }
    }

    // Notification
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    notifs.push({
      id: generateId(),
      userId: withdraw.userId,
      message: isApproved 
        ? `Withdrawal of Rs ${withdraw.amount} to your ${withdraw.method} has been APPROVED and sent!`
        : `Withdrawal of Rs ${withdraw.amount} was REJECTED. Rs ${withdraw.amount} has been refunded to your Main Wallet.`,
      type: 'withdraw',
      createdAt: new Date().toISOString(),
      read: false
    });
    setStorageItem('sim_notifications', notifs);

    window.dispatchEvent(new Event('sim_db_updated'));
  },

  // --- TRANSFER WALLET ---
  transferWallet: (userId: string, source: 'ads' | 'tasks' | 'referral', amount: number): { success: boolean; error?: string; user?: User } => {
    const users = getStorageItem<User[]>('sim_users', []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: "User not found" };

    const user = users[idx];
    let sourceLabel = "";

    if (source === 'ads') {
      if (user.adsWallet < amount) return { success: false, error: `Insufficient Ads Wallet balance! Available: Rs ${user.adsWallet}` };
      user.adsWallet -= amount;
      sourceLabel = "Ads Wallet";
    } else if (source === 'tasks') {
      if (user.tasksWallet < amount) return { success: false, error: `Insufficient Tasks Wallet balance! Available: Rs ${user.tasksWallet}` };
      user.tasksWallet -= amount;
      sourceLabel = "Tasks Wallet";
    } else if (source === 'referral') {
      if (user.referralWallet < amount) return { success: false, error: `Insufficient Referral Wallet balance! Available: Rs ${user.referralWallet}` };
      user.referralWallet -= amount;
      sourceLabel = "Referral Wallet";
    } else {
      return { success: false, error: "Invalid source wallet" };
    }

    user.mainWallet += amount;
    users[idx] = user;
    setStorageItem('sim_users', users);
    setStorageItem('sim_current_user', user);

    // Earning Log
    const logs = getStorageItem<EarningLog[]>('sim_earning_logs', []);
    logs.push({
      id: generateId(),
      userId,
      amount,
      type: 'transfer',
      description: `Transferred Rs ${amount} from ${sourceLabel} to Main Wallet`,
      createdAt: new Date().toISOString()
    });
    setStorageItem('sim_earning_logs', logs);

    // Notification
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    notifs.push({
      id: generateId(),
      userId,
      message: `Transferred Rs ${amount} from ${sourceLabel} to Main Wallet successfully!`,
      type: 'system',
      createdAt: new Date().toISOString(),
      read: false
    });
    setStorageItem('sim_notifications', notifs);

    return { success: true, user };
  },

  // --- QUERY HISTORY & DATA ---
  getDeposits: (userId: string): DepositRequest[] => {
    const deposits = getStorageItem<DepositRequest[]>('sim_deposits', []);
    return deposits.filter(d => d.userId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  getWithdraws: (userId: string): WithdrawRequest[] => {
    const withdraws = getStorageItem<WithdrawRequest[]>('sim_withdrawals', []);
    return withdraws.filter(w => w.userId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  getNotifications: (userId: string): PlatformNotification[] => {
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    return notifs.filter(n => n.userId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  getEarningLogs: (userId: string): EarningLog[] => {
    const logs = getStorageItem<EarningLog[]>('sim_earning_logs', []);
    return logs.filter(l => l.userId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  markNotificationsRead: (userId: string): void => {
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    let updated = false;
    const nextNotifs = notifs.map(n => {
      if (n.userId === userId && !n.read) {
        updated = true;
        return { ...n, read: true };
      }
      return n;
    });
    if (updated) {
      setStorageItem('sim_notifications', nextNotifs);
      window.dispatchEvent(new Event('sim_db_updated'));
    }
  },

  // --- ADMIN OPERATIONS ---
  getPendingDeposits: (): DepositRequest[] => {
    const deposits = getStorageItem<DepositRequest[]>('sim_deposits', []);
    return deposits.filter(d => d.status === 'Pending').sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  getPendingWithdrawals: (): WithdrawRequest[] => {
    const withdrawals = getStorageItem<WithdrawRequest[]>('sim_withdrawals', []);
    return withdrawals.filter(w => w.status === 'Pending').sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  approveDepositAdmin: (depositId: string): boolean => {
    const deposits = getStorageItem<DepositRequest[]>('sim_deposits', []);
    const idx = deposits.findIndex(d => d.id === depositId);
    if (idx === -1) return false;
    
    const deposit = deposits[idx];
    if (deposit.status !== 'Pending') return false;
    
    deposit.status = 'Approved';
    deposits[idx] = deposit;
    setStorageItem('sim_deposits', deposits);
    
    // Add balance to user
    const users = getStorageItem<User[]>('sim_users', []);
    const userIdx = users.findIndex(u => u.id === deposit.userId);
    if (userIdx !== -1) {
      users[userIdx].mainWallet += deposit.amount;
      setStorageItem('sim_users', users);
      
      // Update current session if applicable
      const currentSession = getStorageItem<User | null>('sim_current_user', null);
      if (currentSession && currentSession.id === deposit.userId) {
        currentSession.mainWallet += deposit.amount;
        setStorageItem('sim_current_user', currentSession);
      }
      
      // Notify user
      const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
      notifs.push({
        id: Math.random().toString(36).substring(2, 11),
        userId: deposit.userId,
        message: `APPROVED! Your deposit of Rs ${deposit.amount} has been verified and approved by the Admin. Funds added to your Main Wallet.`,
        type: 'deposit',
        createdAt: new Date().toISOString(),
        read: false
      });
      setStorageItem('sim_notifications', notifs);
      
      window.dispatchEvent(new Event('sim_db_updated'));
      return true;
    }
    return false;
  },

  rejectDepositAdmin: (depositId: string): boolean => {
    const deposits = getStorageItem<DepositRequest[]>('sim_deposits', []);
    const idx = deposits.findIndex(d => d.id === depositId);
    if (idx === -1) return false;
    
    const deposit = deposits[idx];
    if (deposit.status !== 'Pending') return false;
    
    deposit.status = 'Rejected';
    deposits[idx] = deposit;
    setStorageItem('sim_deposits', deposits);
    
    // Notify user
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    notifs.push({
      id: Math.random().toString(36).substring(2, 11),
      userId: deposit.userId,
      message: `REJECTED! Your deposit of Rs ${deposit.amount} (TID: ${deposit.transactionId}) was rejected after verification. Please contact support.`,
      type: 'deposit',
      createdAt: new Date().toISOString(),
      read: false
    });
    setStorageItem('sim_notifications', notifs);
    
    window.dispatchEvent(new Event('sim_db_updated'));
    return true;
  },

  approveWithdrawAdmin: (withdrawId: string): boolean => {
    const withdrawals = getStorageItem<WithdrawRequest[]>('sim_withdrawals', []);
    const idx = withdrawals.findIndex(w => w.id === withdrawId);
    if (idx === -1) return false;
    
    const withdraw = withdrawals[idx];
    if (withdraw.status !== 'Pending') return false;
    
    withdraw.status = 'Approved';
    withdrawals[idx] = withdraw;
    setStorageItem('sim_withdrawals', withdrawals);
    
    // Notify user
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    notifs.push({
      id: Math.random().toString(36).substring(2, 11),
      userId: withdraw.userId,
      message: `SUCCESS! Your withdrawal request of Rs ${withdraw.amount} via ${withdraw.method} has been approved and sent by the Admin.`,
      type: 'withdraw',
      createdAt: new Date().toISOString(),
      read: false
    });
    setStorageItem('sim_notifications', notifs);
    
    window.dispatchEvent(new Event('sim_db_updated'));
    return true;
  },

  rejectWithdrawAdmin: (withdrawId: string): boolean => {
    const withdrawals = getStorageItem<WithdrawRequest[]>('sim_withdrawals', []);
    const idx = withdrawals.findIndex(w => w.id === withdrawId);
    if (idx === -1) return false;
    
    const withdraw = withdrawals[idx];
    if (withdraw.status !== 'Pending') return false;
    
    withdraw.status = 'Rejected';
    withdrawals[idx] = withdraw;
    setStorageItem('sim_withdrawals', withdrawals);
    
    // Refund user's wallet
    const users = getStorageItem<User[]>('sim_users', []);
    const userIdx = users.findIndex(u => u.id === withdraw.userId);
    if (userIdx !== -1) {
      users[userIdx].mainWallet += withdraw.amount;
      setStorageItem('sim_users', users);
      
      const currentSession = getStorageItem<User | null>('sim_current_user', null);
      if (currentSession && currentSession.id === withdraw.userId) {
        currentSession.mainWallet += withdraw.amount;
        setStorageItem('sim_current_user', currentSession);
      }
    }
    
    // Notify user
    const notifs = getStorageItem<PlatformNotification[]>('sim_notifications', []);
    notifs.push({
      id: Math.random().toString(36).substring(2, 11),
      userId: withdraw.userId,
      message: `REJECTED! Your withdrawal request of Rs ${withdraw.amount} was rejected by the Admin. The funds have been fully refunded to your Main Wallet.`,
      type: 'withdraw',
      createdAt: new Date().toISOString(),
      read: false
    });
    setStorageItem('sim_notifications', notifs);
    
    window.dispatchEvent(new Event('sim_db_updated'));
    return true;
  }
};
