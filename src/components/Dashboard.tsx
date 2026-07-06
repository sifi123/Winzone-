/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Tv, 
  CheckSquare, 
  Users, 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { User, InvestmentPlan } from '../types';
import { INVESTMENT_PLANS, AD_REWARD, TASK_REWARD, MAX_DAILY_ADS } from '../utils/simDb';

interface DashboardProps {
  user: User;
  setCurrentTab: (tab: string) => void;
  logs: any[];
}

export default function Dashboard({ user, setCurrentTab, logs }: DashboardProps) {
  // Aggregate Balance
  const totalBalance = useMemo(() => {
    return user.mainWallet + user.adsWallet + user.tasksWallet + user.referralWallet;
  }, [user]);

  // Find Active Plan
  const activePlan = useMemo(() => {
    if (user.activePlanId === null) return null;
    return INVESTMENT_PLANS.find(p => p.id === user.activePlanId) || null;
  }, [user.activePlanId]);

  // Remaining Days & Dates
  const remainingDays = useMemo(() => {
    if (!user.planEndDate) return 0;
    const end = new Date(user.planEndDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [user.planEndDate]);

  const formattedStartDate = useMemo(() => {
    if (!user.planStartDate) return '';
    return new Date(user.planStartDate).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [user.planStartDate]);

  const formattedEndDate = useMemo(() => {
    if (!user.planEndDate) return '';
    return new Date(user.planEndDate).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [user.planEndDate]);

  // Earnings summary calculations
  const todayAdsEarnings = user.todayAdsWatched * AD_REWARD;
  const todayTasksEarnings = user.todayTasksCompleted * TASK_REWARD;
  const todayTotalEarnings = todayAdsEarnings + todayTasksEarnings;

  const maxPossibleTasks = activePlan ? activePlan.tasksPerDay : 0;
  const maxPossibleAds = MAX_DAILY_ADS;
  const maxPossibleEarning = (maxPossibleAds * AD_REWARD) + (maxPossibleTasks * TASK_REWARD);

  const dailyProgressPercent = maxPossibleEarning > 0 
    ? Math.min(100, Math.round((todayTotalEarnings / maxPossibleEarning) * 100)) 
    : 0;

  // Stats cards configuration
  const stats = [
    {
      title: "Total Balance",
      value: `Rs ${totalBalance.toLocaleString()}`,
      description: "Sum of all wallets",
      icon: DollarSign,
      color: "from-blue-600 to-indigo-600",
      text: "text-white"
    },
    {
      title: "Ads Wallet",
      value: `Rs ${user.adsWallet.toLocaleString()}`,
      description: "Earned watching videos",
      icon: Tv,
      color: "bg-white",
      text: "text-slate-900 border border-slate-100"
    },
    {
      title: "Tasks Wallet",
      value: `Rs ${user.tasksWallet.toLocaleString()}`,
      description: "Earned doing tasks",
      icon: CheckSquare,
      color: "bg-white",
      text: "text-slate-900 border border-slate-100"
    },
    {
      title: "Referral Earning",
      value: `Rs ${user.referralWallet.toLocaleString()}`,
      description: "Earned from network",
      icon: Users,
      color: "bg-white",
      text: "text-slate-900 border border-slate-100"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-tab">
      
      {/* Dynamic Greetings Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/30 text-blue-200 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-400/20">
              {activePlan ? `${activePlan.name} Activated` : 'Free Tier'}
            </span>
            <span className="text-xs text-blue-100/80">• Rs {user.mainWallet} in Main Wallet</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome back, {user.name}!</h2>
          <p className="text-blue-100 text-sm font-medium">
            {activePlan 
              ? `Your active plan is paying Rs ${activePlan.dailyReturn} daily. Maximize your tasks!`
              : "Upgrade your plan today to unlock premium tasks and earn up to Rs 400+ daily!"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setCurrentTab('deposit')}
            className="bg-white text-blue-700 font-bold px-5 py-3 rounded-xl text-xs transition-transform hover:scale-102 cursor-pointer shadow-md shadow-blue-800/10"
          >
            Deposit Cash
          </button>
          <button 
            onClick={() => setCurrentTab('withdraw')}
            className="bg-blue-500 hover:bg-blue-500/80 text-white font-bold px-5 py-3 rounded-xl text-xs border border-blue-400/30 transition-transform hover:scale-102 cursor-pointer"
          >
            Withdraw Balance
          </button>
        </div>
      </div>

      {/* Grid of Earning Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className={`rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36 ${stat.text} ${
                stat.color.startsWith('from-') ? `bg-gradient-to-tr ${stat.color} shadow-lg shadow-blue-100` : stat.color
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${stat.color.startsWith('from-') ? 'text-blue-100' : 'text-slate-400'}`}>
                  {stat.title}
                </span>
                <span className={`p-2 rounded-xl ${stat.color.startsWith('from-') ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-500'}`}>
                  <Icon size={18} />
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                <p className={`text-[11px] mt-1 ${stat.color.startsWith('from-') ? 'text-blue-100/80' : 'text-slate-400'}`}>
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Plan Dashboard Card & Earning progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Plan Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Active Subscription Info</h3>
              {activePlan ? (
                <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-200">
                  <ShieldCheck size={14} /> Active
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                  Free Member
                </span>
              )}
            </div>

            {activePlan ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
                    {activePlan.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{activePlan.name}</h4>
                    <p className="text-xs text-slate-500">Plan price: Rs {activePlan.price} • Pays Rs {activePlan.totalReturn} total</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Start Date</span>
                    <p className="font-semibold text-sm text-slate-800 flex items-center gap-1">
                      <Calendar size={14} className="text-slate-400" />
                      {formattedStartDate}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">End Date</span>
                    <p className="font-semibold text-sm text-slate-800 flex items-center gap-1">
                      <Calendar size={14} className="text-slate-400" />
                      {formattedEndDate}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Remaining</span>
                    <p className="font-extrabold text-sm text-blue-600 flex items-center gap-1">
                      <Clock size={14} />
                      {remainingDays} Days Left
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Daily Earning</span>
                    <p className="font-extrabold text-sm text-green-600">
                      Rs {activePlan.dailyReturn}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  You are currently earning as a free tier member. Buy an investment plan to unlock daily tasks that pay up to <strong>Rs 400 per day!</strong>
                </p>
                <button
                  onClick={() => setCurrentTab('plans')}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <span>Explore Plans</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {activePlan && (
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
              <span>Standard 45-day duration applied</span>
              <span>Daily limits reset at 12:00 AM</span>
            </div>
          )}
        </div>

        {/* Today's Earning Summary & Progress bar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-4">Today's Earnings Tracker</h3>
            
            <div className="space-y-4">
              {/* Stats progress */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Daily Target Reached</span>
                <span className="text-xs text-blue-600 font-bold">{dailyProgressPercent}%</span>
              </div>
              
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${dailyProgressPercent}%` }}
                ></div>
              </div>

              {/* Breakdowns */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Tv size={16} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700">Video Ads Watched</span>
                  </div>
                  <span className="text-xs text-slate-800 font-bold">{user.todayAdsWatched} / {MAX_DAILY_ADS} ads</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700">Tasks Completed</span>
                  </div>
                  <span className="text-xs text-slate-800 font-bold">
                    {user.todayTasksCompleted} / {maxPossibleTasks} tasks
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Today's Earned Reward</span>
            <h4 className="text-2xl font-black text-blue-700 mt-1">Rs {todayTotalEarnings}</h4>
            <p className="text-[10px] text-blue-500 font-medium mt-0.5">Potential Limit: Rs {maxPossibleEarning}</p>
          </div>
        </div>

      </div>

      {/* WhatsApp Community Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100/50 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="space-y-1.5 z-10">
          <span className="bg-emerald-500/30 text-emerald-100 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10 inline-flex items-center gap-1">
            Official Community
          </span>
          <h3 className="font-extrabold text-lg tracking-tight">Join Our Active WhatsApp Community!</h3>
          <p className="text-emerald-50 text-xs max-w-xl leading-relaxed">
            Get daily payment proofs, quick help from our team, and live chat with Saifullah and other successful earners. Never miss any important announcement.
          </p>
        </div>
        <a
          href="https://wa.me/923363135004?text=Hello%20RupeeGrow%20Support!%20I%20want%20to%20join%20the%20official%20earning%20group."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white hover:bg-slate-50 text-emerald-700 font-black text-xs px-6 py-4 rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 z-10 cursor-pointer"
        >
          <span>Join WhatsApp Group</span>
          <ArrowRight size={14} className="animate-pulse" />
        </a>
      </div>

      {/* Recent Earning Activities Logs */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 text-base">Recent Activity Log</h3>
          <span className="text-xs text-blue-600 font-semibold">Real-time simulator stats</span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400 font-medium">No activity logged yet. Start watching ads or complete tasks!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {logs.slice(0, 10).map((log) => {
              const isDebit = log.amount < 0;
              return (
                <div key={log.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      log.type === 'ad' ? 'bg-blue-50 text-blue-600' :
                      log.type === 'task' ? 'bg-indigo-50 text-indigo-600' :
                      log.type === 'referral' ? 'bg-green-50 text-green-600' :
                      log.type === 'investment' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {log.type === 'ad' ? <Tv size={14} /> :
                       log.type === 'task' ? <CheckSquare size={14} /> :
                       log.type === 'referral' ? <Users size={14} /> :
                       log.type === 'investment' ? <TrendingUp size={14} /> :
                       <DollarSign size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{log.description}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-black shrink-0 ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                    {isDebit ? '-' : '+'} Rs {Math.abs(log.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
