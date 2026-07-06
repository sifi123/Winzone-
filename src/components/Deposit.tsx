/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowDownCircle, 
  Copy, 
  Check, 
  Clock, 
  Upload, 
  Image as ImageIcon, 
  DollarSign, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';
import { User, DepositRequest } from '../types';
import { simDb, RECEIVER_DETAILS } from '../utils/simDb';

interface DepositProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onRefreshLogs: () => void;
  deposits: DepositRequest[];
  onRefreshDeposits: () => void;
}

export default function Deposit({ user, onUpdateUser, onRefreshLogs, deposits, onRefreshDeposits }: DepositProps) {
  // Deposit Steps: 'amount' -> 'instructions' -> 'success'
  const [step, setStep] = useState<'amount' | 'instructions' | 'success'>('amount');
  const [amount, setAmount] = useState<number>(500);
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<string>('');
  
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes (600 seconds)
  const [timerActive, setTimerActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
      setError("Payment window expired. Please initiate a new deposit.");
      setStep('amount');
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(RECEIVER_DETAILS.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAmountNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setError(null);
    setCountdown(600); // Reset to 10 mins
    setTimerActive(true);
    setStep('instructions');
  };

  // Drag and Drop files or manual uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!transactionId || transactionId.trim().length < 8) {
      setError("Please enter a valid 11-digit or 12-digit Transaction ID.");
      return;
    }

    if (!screenshot) {
      setError("Please select/upload a screenshot image of your payment confirmation.");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      // Create request in LocalDb
      simDb.createDepositRequest(user.id, amount, transactionId, screenshot);
      onRefreshLogs();
      onRefreshDeposits();
      
      setTimerActive(false);
      setStep('success');
      setSubmitting(false);
    }, 1200);
  };

  // Format countdown string MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResetDeposit = () => {
    setStep('amount');
    setAmount(500);
    setTransactionId('');
    setScreenshot('');
    setError(null);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="deposit-tab">
      
      {/* Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowDownCircle className="text-blue-600 animate-pulse" />
            Deposit Funds
          </h2>
          <p className="text-slate-500 text-sm">
            Fund your Main Wallet to purchase Investment Plans and unlock daily social tasks.
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-3 rounded-2xl border border-blue-100 text-center md:text-left shrink-0">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block font-sans">Current Assets</span>
          <p className="font-extrabold text-slate-800 text-sm mt-0.5">Main Wallet: Rs {user.mainWallet.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Flow Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          
          {/* STEP 1: AMOUNT SELECTION */}
          {step === 'amount' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Select Funding Amount</h3>
                <p className="text-xs text-slate-400 mt-0.5">Enter the amount of PKR you wish to deposit.</p>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAmountNext} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount in PKR</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <DollarSign size={16} />
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 500, 1000, 5000"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* Popular amount shortcuts */}
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 3000, 5000].map((shortcut) => (
                    <button
                      key={shortcut}
                      type="button"
                      onClick={() => setAmount(shortcut)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        amount === shortcut 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      PKR {shortcut}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1 group cursor-pointer shadow-md shadow-blue-100"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: INSTRUCTIONS & UPLOAD */}
          {step === 'instructions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between gap-4 border-b border-slate-50 pb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Make Mobile Account Transfer</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Please transfer PKR {amount} within the countdown.</p>
                </div>
                {/* Countdown display */}
                <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shrink-0 animate-pulse">
                  <Clock size={14} />
                  <span>{formatTime(countdown)}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Account details */}
              <div className="bg-blue-50/50 rounded-2xl border border-blue-100/50 p-4 space-y-3">
                <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider">Receiver Mobile Account</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-normal">Account Holder Name</span>
                    <p className="font-bold text-slate-800 text-sm">{RECEIVER_DETAILS.name}</p>
                  </div>
                  <div className="space-y-0.5 relative">
                    <span className="text-slate-400 font-normal">Account Phone Number</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-bold text-slate-800 text-sm">{RECEIVER_DETAILS.number}</p>
                      <button
                        onClick={handleCopy}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Copy account number"
                      >
                        {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload screenshot and entry fields */}
              <form onSubmit={handleDepositSubmit} className="space-y-5">
                
                {/* Drag and Drop Screenshot Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Proof Screenshot</label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 min-h-36 ${
                      screenshot 
                        ? 'border-blue-500 bg-blue-50/10' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {screenshot ? (
                      <div className="space-y-2">
                        <img 
                          src={screenshot} 
                          alt="Deposit screenshot proof" 
                          className="max-h-24 mx-auto rounded-lg border border-slate-200 object-contain shadow-sm"
                        />
                        <span className="text-[10px] text-green-600 font-bold flex items-center justify-center gap-1">
                          <Check size={12} /> Click to replace image proof
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Upload size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">Drag & drop or Click to upload</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Supports: PNG, JPG, JPEG (Max 5MB)</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Transaction ID input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Hash size={13} className="text-blue-500" />
                    Transaction ID (TID) from SMS
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 11 or 12 digit TID number"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetDeposit}
                    className="py-3 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                      submitting 
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-wait' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                    }`}
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>Submit Proof (PKR {amount})</span>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="space-y-6 py-6 text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto border border-green-100">
                <CheckCircle2 size={30} />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-800 text-lg">Deposit Submitted Successfully!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your payment verification of Rs <strong>{amount}</strong> has been received. Your funds will reflect in your Main Wallet inside <strong>5 minutes</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs max-w-sm mx-auto">
                <p className="font-medium text-slate-600">Verification in progress...</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2 relative">
                  <div className="bg-green-500 h-full rounded-full w-2/3 animate-pulse"></div>
                </div>
              </div>

              <div>
                <button
                  onClick={handleResetDeposit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs cursor-pointer shadow-md shadow-blue-100"
                >
                  Deposit Another Amount
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Deposit History Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-6">Deposit Request History</h3>
            
            {deposits.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-slate-400 font-medium">No deposits logged yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {deposits.map((item) => {
                  return (
                    <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">PKR {item.amount}</span>
                          <span className="text-[10px] text-slate-400 truncate">TID: {item.transactionId}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="shrink-0">
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
            <span>PKR cash verification is manual. The Admin must verify your Transaction ID (TID) in the Admin Dashboard before balance is added.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
