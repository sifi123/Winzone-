/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowUpCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  DollarSign, 
  Smartphone, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { User, WithdrawRequest } from '../types';
import { simDb, INVESTMENT_PLANS } from '../utils/simDb';

interface WithdrawProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onRefreshLogs: () => void;
  withdrawals: WithdrawRequest[];
  onRefreshWithdrawals: () => void;
}

export default function Withdraw({ user, onUpdateUser, onRefreshLogs, withdrawals, onRefreshWithdrawals }: WithdrawProps) {
  const activePlan = INVESTMENT_PLANS.find(p => p.id === user.activePlanId);
  const maxWithdrawLimit = activePlan ? activePlan.price * 0.3 : 0;

  const [amount, setAmount] = useState<number>(activePlan ? Math.min(100, maxWithdrawLimit) : 100);
  const [method, setMethod] = useState<'JazzCash' | 'Easypaisa'>('JazzCash');
  const [number, setNumber] = useState('');
  
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (user.activePlanId === null || !activePlan) {
      setError("Without an active Investment Plan, you cannot make withdrawals.");
      return;
    }

    if (amount < 100) {
      setError("Minimum withdrawal amount is Rs 100.");
      return;
    }

    if (amount > maxWithdrawLimit) {
      setError(`Maximum withdrawal amount is Rs ${maxWithdrawLimit} (30% of your active ${activePlan.name}'s price of Rs ${activePlan.price}).`);
      return;
    }

    if (user.mainWallet < amount) {
      setError(`Insufficient Main Wallet balance! Available: Rs ${user.mainWallet}`);
      return;
    }

    if (!number || number.length < 10) {
      setError("Please enter a valid mobile account number.");
      return;
    }

    setSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      const result = simDb.requestWithdraw(user.id, amount, method, number);
      if (result.success && result.withdraw) {
        onUpdateUser(simDb.getCurrentUser()!);
        onRefreshLogs();
        onRefreshWithdrawals();
        setSuccess(`Withdrawal request of Rs ${amount} submitted successfully! Your funds will be processed after Admin verification.`);
        setNumber('');
        setAmount(activePlan ? Math.min(100, maxWithdrawLimit) : 100);
      } else {
        setError(result.error || "Withdrawal request failed.");
      }
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="withdraw-tab">
      
      {/* Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowUpCircle className="text-blue-600" />
            Cash Out Earnings
          </h2>
          <p className="text-slate-500 text-sm">
            Withdraw your earnings securely straight to your JazzCash or Easypaisa mobile wallet.
          </p>
        </div>
        <div className="bg-green-50 px-4 py-3 rounded-2xl border border-green-100 text-center md:text-left">
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block">Available to Withdraw</span>
          <p className="font-extrabold text-green-800 text-sm mt-0.5">Main Wallet: Rs {user.mainWallet.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Withdraw Form Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 text-base mb-6">Request Cashout</h3>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-green-50 text-green-800 rounded-xl border border-green-100 text-xs flex items-start gap-2">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-green-600" />
              <span>{success}</span>
            </div>
          )}

          {!activePlan ? (
            <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">Withdrawal Locked</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Without an active Investment Plan, you cannot make withdrawals. Please purchase an investment plan first to unlock cashouts.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[10px] text-amber-600 font-bold bg-amber-100 px-3 py-1.5 rounded-full uppercase tracking-wider block">
                  Active Plan Required
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Active Plan Info */}
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl space-y-1 text-xs">
                <p className="font-bold text-blue-800">Plan Details:</p>
                <p className="text-slate-600 font-medium">Active: <span className="font-bold">{activePlan.name}</span></p>
                <p className="text-slate-600 font-medium">Price: <span className="font-bold">Rs {activePlan.price}</span></p>
                <p className="text-slate-600 font-medium">Max Withdrawal: <span className="font-bold text-blue-700">Rs {maxWithdrawLimit}</span> <span className="text-[10px] text-slate-400">(30% of plan value)</span></p>
              </div>

              {/* Method Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Wallet Gateway</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('JazzCash')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      method === 'JazzCash' 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 font-extrabold ring-2 ring-blue-100' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>JazzCash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('Easypaisa')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      method === 'Easypaisa' 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 font-extrabold ring-2 ring-blue-100' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span>Easypaisa</span>
                  </button>
                </div>
              </div>

              {/* Account Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Smartphone size={16} />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 03363135004"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Withdrawal Amount (Min. 100, Max. {maxWithdrawLimit})
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <DollarSign size={16} />
                  </span>
                  <input
                    type="number"
                    required
                    min="100"
                    max={maxWithdrawLimit}
                    placeholder="Enter amount in Rs"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Rs 0 processing fee applied for preview testing.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                  submitting 
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-wait' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                }`}
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Request Rs {amount} Cashout</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Withdrawal History Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-base">Withdrawal History</h3>
              <span className="text-xs text-slate-400 font-medium">Manual payment processing</span>
            </div>

            {withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-slate-400 font-medium">No payout requests submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {withdrawals.map((item) => {
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            item.method === 'JazzCash' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.method}
                          </span>
                          <span className="text-xs font-bold text-slate-700">Rs {item.amount}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Account: {item.number}</p>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        {item.status === 'Pending' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock size={12} className="animate-pulse" /> Pending
                          </span>
                        ) : item.status === 'Approved' ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-200">
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-200">
                            <XCircle size={12} /> Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
            <HelpCircle size={14} className="text-slate-400 shrink-0" />
            <span>Withdrawals are processed manually. Admin must verify and approve the transaction in the Admin Dashboard before you receive funds.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
