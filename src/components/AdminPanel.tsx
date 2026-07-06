/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  DollarSign, 
  User as UserIcon, 
  Smartphone,
  AlertCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { User, DepositRequest, WithdrawRequest } from '../types';
import { simDb } from '../utils/simDb';

interface AdminPanelProps {
  onActionCompleted: () => void;
}

export default function AdminPanel({ onActionCompleted }: AdminPanelProps) {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'deposits' | 'withdrawals'>('deposits');
  const [sysUsers, setSysUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load all system data
  const loadAdminData = () => {
    setDeposits(simDb.getPendingDeposits());
    setWithdrawals(simDb.getPendingWithdrawals());
    
    // Read from localStorage to show global stats
    const users = JSON.parse(localStorage.getItem('sim_users') || '[]');
    setSysUsers(users);
  };

  useEffect(() => {
    loadAdminData();
    
    // Listen for custom DB updates
    const handleUpdate = () => {
      loadAdminData();
    };
    window.addEventListener('sim_db_updated', handleUpdate);
    return () => window.removeEventListener('sim_db_updated', handleUpdate);
  }, []);

  const handleApproveDeposit = (id: string, amount: number) => {
    const success = simDb.approveDepositAdmin(id);
    if (success) {
      setMessage({ text: `Deposit of Rs ${amount} successfully approved and credited!`, type: 'success' });
      loadAdminData();
      onActionCompleted();
    } else {
      setMessage({ text: "Failed to approve deposit request.", type: 'error' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleRejectDeposit = (id: string, amount: number) => {
    const success = simDb.rejectDepositAdmin(id);
    if (success) {
      setMessage({ text: `Deposit of Rs ${amount} was rejected.`, type: 'success' });
      loadAdminData();
      onActionCompleted();
    } else {
      setMessage({ text: "Failed to reject deposit request.", type: 'error' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleApproveWithdrawal = (id: string, amount: number) => {
    const success = simDb.approveWithdrawAdmin(id);
    if (success) {
      setMessage({ text: `Withdrawal request of Rs ${amount} successfully marked as Sent!`, type: 'success' });
      loadAdminData();
      onActionCompleted();
    } else {
      setMessage({ text: "Failed to approve withdrawal request.", type: 'error' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleRejectWithdrawal = (id: string, amount: number) => {
    const success = simDb.rejectWithdrawAdmin(id);
    if (success) {
      setMessage({ text: `Withdrawal request of Rs ${amount} was rejected and refunded to the user's Main Wallet.`, type: 'success' });
      loadAdminData();
      onActionCompleted();
    } else {
      setMessage({ text: "Failed to reject withdrawal request.", type: 'error' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  // Helper to find username by ID
  const getUserName = (userId: string) => {
    const u = sysUsers.find(user => user.id === userId);
    return u ? u.name : 'Unknown User';
  };

  // Helper to find user WhatsApp by ID
  const getUserWhatsApp = (userId: string) => {
    const u = sysUsers.find(user => user.id === userId);
    return u ? u.whatsapp : 'No number';
  };

  // Totals for stats cards
  const totalPendingDepositsVal = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalPendingWithdrawVal = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in" id="admin-panel-tab">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 text-white shadow-xl relative overflow-hidden">
        {/* Background blobs for premium editorial look */}
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-purple-600/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-blue-500/30">
                <ShieldCheck size={12} /> Live Audit Gateway
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Admin Approval & Verification</h2>
            <p className="text-slate-400 text-xs max-w-xl">
              Verify manual deposits and process withdrawal cashouts. As requested, all user deposit balances are held securely until approved here.
            </p>
          </div>
          <div className="shrink-0 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 flex flex-col justify-center text-center">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Sys Users</span>
            <span className="text-2xl font-black text-blue-400 mt-0.5">{sysUsers.length} Users</span>
          </div>
        </div>
      </div>

      {/* Download Source Code Section for Mobile/Desktop Access */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="space-y-1.5 z-10">
          <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10 inline-flex items-center gap-1">
            <Sparkles size={11} className="animate-pulse" /> Developer Toolkit
          </span>
          <h3 className="font-extrabold text-lg tracking-tight">Download Full Source Code!</h3>
          <p className="text-blue-50 text-xs max-w-xl leading-relaxed">
            We've compiled and zipped your entire modified workspace (referral changes + forgot password code) into a standard, light-weight archive. You can easily download it directly to your mobile phone storage below.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0 z-10">
          <a
            href="/project.zip"
            download="RupeeGrow_Source_Code.zip"
            className="bg-white hover:bg-slate-50 text-blue-700 font-black text-xs px-6 py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowDownCircle size={14} />
            <span>Download ZIP Archive</span>
          </a>
          <a
            href="/project.tar.gz"
            download="RupeeGrow_Source_Code.tar.gz"
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-6 py-4 rounded-xl border border-blue-500/30 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowDownCircle size={14} />
            <span>Download TAR.GZ</span>
          </a>
        </div>
      </div>

      {/* Admin Quick Notification message */}
      {message && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-bounce ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-100 text-green-800' 
            : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          <Info size={16} className={message.type === 'success' ? 'text-green-600' : 'text-red-500'} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Deposit counter card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
            <ArrowDownCircle size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pending Deposits</span>
            <p className="text-xl font-extrabold text-slate-800 mt-0.5">{deposits.length} Requests</p>
            <span className="text-[10px] font-semibold text-amber-600">PKR {totalPendingDepositsVal.toLocaleString()} Value</span>
          </div>
        </div>

        {/* Withdrawal counter card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
            <ArrowUpCircle size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pending Cashouts</span>
            <p className="text-xl font-extrabold text-slate-800 mt-0.5">{withdrawals.length} Requests</p>
            <span className="text-[10px] font-semibold text-blue-600">PKR {totalPendingWithdrawVal.toLocaleString()} Value</span>
          </div>
        </div>

        {/* Deposit helper box */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4 col-span-1 md:col-span-2">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Admin Controls Status</span>
            <p className="text-xs font-bold text-slate-700 mt-0.5">Automated auto-verification has been disabled.</p>
            <span className="text-[10px] text-slate-400 leading-none">You must manually verify the screenshot matches the transaction ID here.</span>
          </div>
        </div>
      </div>

      {/* Main Request lists layout */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Navigation sub-tabs */}
        <div className="border-b border-slate-50 flex items-center justify-between p-4 bg-slate-50/50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('deposits')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'deposits'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowDownCircle size={14} />
              <span>Verify Deposits ({deposits.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('withdrawals')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'withdrawals'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowUpCircle size={14} />
              <span>Verify Withdrawals ({withdrawals.length})</span>
            </button>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">RupeeGrow sandbox audit</span>
        </div>

        {/* Tabs Content */}
        <div className="p-6">
          
          {/* DEPOSITS LIST */}
          {activeSubTab === 'deposits' && (
            <div className="space-y-4">
              {deposits.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-100">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm">All caught up!</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    No pending deposits are waiting for approval. New users' manual cash deposits will appear here instantly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {deposits.map((item) => (
                    <div key={item.id} className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[9px] uppercase font-extrabold text-blue-600 tracking-wider">Pending Deposit Verification</span>
                            <h4 className="font-extrabold text-slate-800 text-base mt-0.5">PKR {item.amount.toLocaleString()}</h4>
                          </div>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Clock size={11} className="animate-pulse" /> Pending
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-white p-3.5 rounded-xl border border-slate-100">
                          <div className="space-y-0.5">
                            <span className="text-slate-400 text-[10px] font-normal block">User Name</span>
                            <p className="truncate text-slate-800">{getUserName(item.userId)}</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-slate-400 text-[10px] font-normal block">WhatsApp Number</span>
                            <p className="truncate text-slate-800">{getUserWhatsApp(item.userId)}</p>
                          </div>
                          <div className="space-y-0.5 col-span-2 border-t border-slate-50 pt-2 mt-2">
                            <span className="text-slate-400 text-[10px] font-normal block">Transaction ID (TID)</span>
                            <p className="font-mono text-xs text-blue-600 font-bold select-all">{item.transactionId}</p>
                          </div>
                        </div>

                        <div className="space-y-1 bg-slate-100 p-3 rounded-xl">
                          <span className="text-slate-400 text-[10px] font-semibold block">Attached Receipt Screenshot</span>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                              IMG
                            </div>
                            <div className="min-w-0">
                              <p className="text-slate-700 text-xs font-bold truncate">{item.screenshot || "deposit_receipt.png"}</p>
                              <span className="text-[9px] text-slate-400">Verifiable manual uploaded payload file</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-3 border-t border-slate-100/50 mt-3">
                        <button
                          onClick={() => handleApproveDeposit(item.id, item.amount)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <CheckCircle size={14} />
                          <span>Approve & Credit</span>
                        </button>
                        <button
                          onClick={() => handleRejectDeposit(item.id, item.amount)}
                          className="flex-1 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WITHDRAWALS LIST */}
          {activeSubTab === 'withdrawals' && (
            <div className="space-y-4">
              {withdrawals.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-100">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm">All caught up!</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    No pending cashouts are waiting for approval. User payouts will appear here for audit and dispatching.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {withdrawals.map((item) => (
                    <div key={item.id} className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[9px] uppercase font-extrabold text-blue-600 tracking-wider">Pending Payout Request</span>
                            <h4 className="font-extrabold text-slate-800 text-base mt-0.5">PKR {item.amount.toLocaleString()}</h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            item.method === 'JazzCash' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.method}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-white p-3.5 rounded-xl border border-slate-100">
                          <div className="space-y-0.5">
                            <span className="text-slate-400 text-[10px] font-normal block">User Name</span>
                            <p className="truncate text-slate-800">{getUserName(item.userId)}</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-slate-400 text-[10px] font-normal block">User WhatsApp</span>
                            <p className="truncate text-slate-800">{getUserWhatsApp(item.userId)}</p>
                          </div>
                          <div className="space-y-0.5 col-span-2 border-t border-slate-50 pt-2 mt-2">
                            <span className="text-slate-400 text-[10px] font-normal block">Payout Account Number</span>
                            <p className="font-mono text-xs text-slate-900 font-bold flex items-center gap-1">
                              <Smartphone size={13} className="text-slate-400" />
                              <span className="select-all">{item.number}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-3 border-t border-slate-100/50 mt-3">
                        <button
                          onClick={() => handleApproveWithdrawal(item.id, item.amount)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <CheckCircle size={14} />
                          <span>Approve & Send</span>
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(item.id, item.amount)}
                          className="flex-1 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <XCircle size={14} />
                          <span>Reject & Refund</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
