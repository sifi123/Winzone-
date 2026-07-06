/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowRightLeft, 
  Tv, 
  CheckSquare, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';
import { User } from '../types';
import { simDb } from '../utils/simDb';

interface WalletsProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onRefreshLogs: () => void;
}

export default function Wallets({ user, onUpdateUser, onRefreshLogs }: WalletsProps) {
  const [source, setSource] = useState<'ads' | 'tasks' | 'referral'>('ads');
  const [amount, setAmount] = useState<number>(0);
  
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get active source balance
  const activeSourceBalance = React.useMemo(() => {
    if (source === 'ads') return user.adsWallet;
    if (source === 'tasks') return user.tasksWallet;
    return user.referralWallet;
  }, [source, user]);

  const handleTransferAll = () => {
    setAmount(activeSourceBalance);
    setError(null);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (amount <= 0) {
      setError("Please enter a valid transfer amount greater than Rs 0.");
      return;
    }

    if (activeSourceBalance < amount) {
      setError(`Insufficient funds in your selected wallet! Available: Rs ${activeSourceBalance}`);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = simDb.transferWallet(user.id, source, amount);
      if (result.success && result.user) {
        onUpdateUser(result.user);
        onRefreshLogs();
        setSuccess(`Transferred Rs ${amount.toLocaleString()} from ${
          source === 'ads' ? 'Ads Wallet' : source === 'tasks' ? 'Tasks Wallet' : 'Referral Wallet'
        } to Main Wallet successfully!`);
        setAmount(0);
      } else {
        setError(result.error || "Transfer failed.");
      }
      setLoading(false);
    }, 800);
  };

  // Wallets data
  const walletsList = [
    {
      id: "main",
      title: "Main Wallet",
      balance: user.mainWallet,
      description: "Withdrawable or used to buy plans",
      icon: Wallet,
      color: "from-blue-600 to-indigo-600 border-none text-white shadow-md shadow-blue-100"
    },
    {
      id: "ads",
      title: "Ads Wallet",
      balance: user.adsWallet,
      description: "Daily ad watching revenue",
      icon: Tv,
      color: "bg-white border border-slate-100 text-slate-800"
    },
    {
      id: "tasks",
      title: "Tasks Wallet",
      balance: user.tasksWallet,
      description: "Premium completed tasks revenue",
      icon: CheckSquare,
      color: "bg-white border border-slate-100 text-slate-800"
    },
    {
      id: "referral",
      title: "Referral Wallet",
      balance: user.referralWallet,
      description: "Referral sign-up commissions",
      icon: Users,
      color: "bg-white border border-slate-100 text-slate-800"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="wallets-tab">
      
      {/* Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="text-blue-600" />
            Wallet & Fund Transfers
          </h2>
          <p className="text-slate-500 text-sm">
            Consolidate your earnings. Transfer funds from your earning wallets into your withdrawable Main Wallet.
          </p>
        </div>
      </div>

      {/* Grid of balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {walletsList.map((wall) => {
          const Icon = wall.icon;
          return (
            <div 
              key={wall.id} 
              className={`rounded-2xl p-6 flex flex-col justify-between h-36 ${wall.color}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${wall.id === 'main' ? 'text-blue-100' : 'text-slate-400'}`}>
                  {wall.title}
                </span>
                <span className={`p-2 rounded-xl ${wall.id === 'main' ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-500'}`}>
                  <Icon size={18} />
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">Rs {wall.balance.toLocaleString()}</h3>
                <p className={`text-[10px] mt-1 leading-none ${wall.id === 'main' ? 'text-blue-100/80' : 'text-slate-400'}`}>
                  {wall.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transfer Funds Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-6 flex items-center gap-1.5">
              <ArrowRightLeft size={18} className="text-blue-600" />
              Transfer Earnings to Main Wallet
            </h3>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 p-3.5 bg-green-50 text-green-800 rounded-xl border border-green-100 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="text-green-600" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              
              {/* Select Source Wallet */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Source Wallet</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => { setSource('ads'); setAmount(0); setError(null); }}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      source === 'ads' 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-100' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Tv size={14} />
                    <span>Ads Wallet (Rs {user.adsWallet})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSource('tasks'); setAmount(0); setError(null); }}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      source === 'tasks' 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-100' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <CheckSquare size={14} />
                    <span>Tasks Wallet (Rs {user.tasksWallet})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSource('referral'); setAmount(0); setError(null); }}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      source === 'referral' 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-100' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Users size={14} />
                    <span>Referral (Rs {user.referralWallet})</span>
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount to Transfer</label>
                  <button
                    type="button"
                    onClick={handleTransferAll}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Transfer Max (Rs {activeSourceBalance})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <ArrowRightLeft size={16} />
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    max={activeSourceBalance}
                    placeholder="Enter PKR amount"
                    value={amount || ''}
                    onChange={(e) => {
                      setAmount(Number(e.target.value));
                      setError(null);
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || activeSourceBalance === 0}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                  loading || activeSourceBalance === 0
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Initiate Wallet Transfer</span>
                )}
              </button>

            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
            Consolidated funds in your Main Wallet are eligible for immediate withdrawals. Transfers are instantaneous and secure under RupeeGrow sandbox protocols.
          </div>
        </div>

        {/* Transfer Info guidelines */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Transfer Guidelines</h3>
            
            <div className="space-y-4 text-xs text-slate-500">
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <p>Choose which wallet balance you want to move. Daily earnings accumulate in Ads and Tasks Wallets.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <p>Transfer minimum amount is Rs 1. Move any balance freely to consolidate assets.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <p>Once funds are in the Main Wallet, you can withdraw them via JazzCash/Easypaisa or use them to purchase a higher investment tier.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-400 flex items-start gap-2">
            <TrendingDown size={16} className="text-blue-500 shrink-0" />
            <span>Audit trail is maintained for every transaction. Refer to the dashboard Activity Log for audit statements.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
