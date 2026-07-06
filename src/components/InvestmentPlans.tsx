/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  Flame, 
  DollarSign, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { User, InvestmentPlan } from '../types';
import { simDb, INVESTMENT_PLANS } from '../utils/simDb';

interface InvestmentPlansProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onRefreshLogs: () => void;
  setCurrentTab: (tab: string) => void;
}

export default function InvestmentPlans({ user, onUpdateUser, onRefreshLogs, setCurrentTab }: InvestmentPlansProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const handleBuyPlan = (plan: InvestmentPlan) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setBuyingId(plan.id);

    // Simulated network latency
    setTimeout(() => {
      const result = simDb.buyPlan(user.id, plan.id);
      if (result.success && result.user) {
        onUpdateUser(result.user);
        onRefreshLogs();
        setSuccessMsg(`Congratulations! You have successfully activated the "${plan.name}". Check your dashboard and start completing tasks.`);
      } else {
        setErrorMsg(result.error || "Purchase failed.");
      }
      setBuyingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="plans-tab">
      
      {/* Header Overview */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="text-blue-600 animate-pulse" />
            Earning Investment Plans
          </h2>
          <p className="text-slate-500 text-sm">
            Unlock premium tasks by upgrading to our 45-day duration high-yield plans.
          </p>
        </div>
        <div className="bg-blue-50/50 px-4 py-3 rounded-2xl border border-blue-100 text-center md:text-left">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Your Purchase Power</span>
          <p className="font-extrabold text-slate-800 text-sm mt-0.5">Main Wallet: Rs {user.mainWallet.toLocaleString()}</p>
        </div>
      </div>

      {/* Transaction Notifications */}
      {successMsg && (
        <div className="p-4 bg-green-50 text-green-800 rounded-2xl border border-green-100 text-sm flex items-start gap-3 shadow-sm animate-bounce">
          <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold">Plan Purchase Successful!</p>
            <p className="text-xs text-green-700/90 mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-100 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-shake">
          <div className="flex items-start gap-3">
            <span className="shrink-0 text-red-600 font-bold">⚠️</span>
            <div>
              <p className="font-bold">Activation Stopped</p>
              <p className="text-xs text-red-700/90 mt-0.5">{errorMsg}</p>
            </div>
          </div>
          {errorMsg.includes("Insufficient") && (
            <button
              onClick={() => setCurrentTab('deposit')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs shrink-0 self-start sm:self-center cursor-pointer"
            >
              Deposit Now
            </button>
          )}
        </div>
      )}

      {/* Investment Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INVESTMENT_PLANS.map((plan) => {
          const isActive = user.activePlanId === plan.id;
          const isBuying = buyingId === plan.id;
          
          return (
            <div 
              key={plan.id} 
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all hover:shadow-lg ${
                isActive 
                  ? 'border-blue-600 ring-2 ring-blue-100' 
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              {/* Highlight ribbon for top sellers */}
              {plan.id === 3 && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl flex items-center gap-1">
                  <Flame size={10} /> Popular
                </div>
              )}
              {plan.id === 6 && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl flex items-center gap-1">
                  <Sparkles size={10} /> Ultimate
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">{plan.name}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">Valid for {plan.durationDays} days</span>
                </div>

                {/* Pricing / Reward stats display */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Investment Price</span>
                    <span className="font-extrabold text-slate-900 text-sm">Rs {plan.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Daily Return</span>
                    <span className="font-extrabold text-green-600 text-sm">Rs {plan.dailyReturn}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Tasks per Day</span>
                    <span className="font-extrabold text-blue-600 text-sm">{plan.tasksPerDay} Tasks ({plan.tasksPerDay * 20} Rs)</span>
                  </div>
                  <div className="border-t border-slate-200/50 pt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-bold">Total Payout Return</span>
                    <span className="font-black text-slate-900 text-base">Rs {plan.totalReturn}</span>
                  </div>
                </div>

                {/* Key specs bullet list */}
                <ul className="space-y-2 text-xs text-slate-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                    <span>Pays Rs 20 per completed task</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                    <span>Includes 10x free daily video ads (Rs 30)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                    <span>Secured JazzCash/Easypaisa withdrawal</span>
                  </li>
                </ul>
              </div>

              {/* Action purchase buttons */}
              <div className="mt-8">
                {isActive ? (
                  <button 
                    disabled 
                    className="w-full bg-blue-50 border border-blue-200 text-blue-700 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <CheckCircle2 size={14} />
                    <span>Active Subscription</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyPlan(plan)}
                    disabled={isBuying}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 group cursor-pointer ${
                      isBuying 
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-wait' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200/50 hover:shadow-lg'
                    }`}
                  >
                    {isBuying ? (
                      <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Activate for Rs {plan.price}</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Frequently Asked Questions Mini Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-1.5">
          <HelpCircle size={18} className="text-blue-500" />
          Frequently Asked Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-500">
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800">Can I change my active plan?</h4>
            <p>Yes. Buying another investment plan replaces your currently active tier. Your new daily task allowances and 45-day duration countdown activate immediately.</p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800">What is the payout schedule?</h4>
            <p>Each plan runs for 45 full days. Task and Ad earnings are credited instantly to their respective wallets which can be transfered to the Main Wallet with zero fees.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
