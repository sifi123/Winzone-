/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Play, 
  Clock, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  Gift,
  ShieldCheck
} from 'lucide-react';
import { User } from '../types';
import { simDb, AD_REWARD, MAX_DAILY_ADS } from '../utils/simDb';

interface AdsWatchProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onRefreshLogs: () => void;
}

interface AdItem {
  id: string;
  title: string;
  sponsor: string;
  category: string;
}

const SAMPLE_ADS: AdItem[] = [
  { id: "ad-1", title: "Earn Cash with Easypaisa Cashback", sponsor: "Telenor Pakistan", category: "Finance" },
  { id: "ad-2", title: "Jazz Super 4G LTE Speed Test", sponsor: "Mobilink Jazz", category: "Telecom" },
  { id: "ad-3", title: "Enjoy Mountain Dew Pakistan Promo", sponsor: "PepsiCo Pakistan", category: "Beverage" },
  { id: "ad-4", title: "Daz Pakistan Online Mega Sale", sponsor: "Daraz.pk", category: "Shopping" },
  { id: "ad-5", title: "Toyota Corolla Pakistan Hybrid Drive", sponsor: "Toyota Indus Motors", category: "Automotive" },
  { id: "ad-6", title: "Foodpanda Rs 300 Discount Voucher", sponsor: "Foodpanda PK", category: "Food Delivery" },
  { id: "ad-7", title: "Tapal Danedar Strong Tea Campaign", sponsor: "Tapal Tea", category: "Consumer Goods" },
  { id: "ad-8", title: "Habib Bank Limited Digital Banking", sponsor: "HBL Bank", category: "Banking" }
];

export default function AdsWatch({ user, onUpdateUser, onRefreshLogs }: AdsWatchProps) {
  const [activeAd, setActiveAd] = useState<AdItem | null>(null);
  const [timer, setTimer] = useState(10);
  const [isWatching, setIsWatching] = useState(false);
  const [successReward, setSuccessReward] = useState<number | null>(null);
  const [doubleClickGuard, setDoubleClickGuard] = useState(false);

  // Countdown timer logic
  useEffect(() => {
    let interval: any = null;
    if (isWatching && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (isWatching && timer === 0) {
      // Completed ad! Trigger credit
      setIsWatching(false);
      handleCreditAdReward();
    }
    return () => clearInterval(interval);
  }, [isWatching, timer]);

  const handleStartWatch = (ad: AdItem) => {
    if (doubleClickGuard) return; // Anti double-click
    setDoubleClickGuard(true);

    if (user.todayAdsWatched >= MAX_DAILY_ADS) {
      alert("Daily Ad Limit (10/10) reached! Please come back tomorrow.");
      setDoubleClickGuard(false);
      return;
    }

    // Launch ad viewer modal
    setActiveAd(ad);
    setTimer(10);
    setIsWatching(true);
    setSuccessReward(null);

    // Reset double-click guard after a short delay
    setTimeout(() => {
      setDoubleClickGuard(false);
    }, 1000);
  };

  const handleCreditAdReward = () => {
    const result = simDb.watchAd(user.id);
    if (result.success && result.user) {
      onUpdateUser(result.user);
      onRefreshLogs();
      setSuccessReward(result.rewardAdded);
    } else {
      alert(result.error || "An error occurred.");
      setActiveAd(null);
    }
  };

  const handleCloseModal = () => {
    setIsWatching(false);
    setActiveAd(null);
    setSuccessReward(null);
  };

  const adsRemaining = MAX_DAILY_ADS - user.todayAdsWatched;

  return (
    <div className="space-y-8 animate-fade-in" id="ads-tab">
      
      {/* Banner overview */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Tv className="text-blue-600" />
            Watch Video Advertisements
          </h2>
          <p className="text-slate-500 text-sm">
            Watch simple 10-second sponsored commercials. Free accounts can earn Rs 3 per ad.
          </p>
        </div>
        
        {/* Ad limit statistics widget */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0 text-center sm:text-left min-w-44 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today's Balance Log</span>
          <h4 className="text-lg font-black text-slate-800 mt-1">
            {user.todayAdsWatched} / {MAX_DAILY_ADS} Watched
          </h4>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all" 
              style={{ width: `${(user.todayAdsWatched / MAX_DAILY_ADS) * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-blue-600 font-bold mt-1 block">
            {adsRemaining > 0 ? `Rs ${adsRemaining * AD_REWARD} reward remaining today` : "Limit complete! Daily reset at 12:00 AM"}
          </span>
        </div>
      </div>

      {/* Ads List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_ADS.map((ad) => {
          const isLimitReached = user.todayAdsWatched >= MAX_DAILY_ADS;
          return (
            <div key={ad.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-blue-100 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {ad.category}
                  </span>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    Pays Rs {AD_REWARD}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                    {ad.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Sponsored by {ad.sponsor}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Clock size={13} /> 10 seconds
                </span>
                <button
                  disabled={isLimitReached}
                  onClick={() => handleStartWatch(ad)}
                  className={`flex items-center gap-1.5 font-bold px-4 py-2 rounded-xl text-xs transition-transform hover:scale-103 cursor-pointer ${
                    isLimitReached 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Play size={12} className="fill-current" />
                  <span>{isLimitReached ? "Limit Reached" : "Watch Video"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AD VIEWER POPUP MODAL */}
      {activeAd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 relative">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Commercial ad</span>
                <h3 className="font-bold text-slate-800 text-sm truncate max-w-xs sm:max-w-md">{activeAd.title}</h3>
              </div>
              {!isWatching && (
                <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Video Canvas Container (SIMULATED PLAYBACK SCREEN) */}
            <div className="aspect-video bg-slate-950 flex flex-col items-center justify-center relative p-6 text-center text-white">
              
              {/* Spinning background art for simulation */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/50 via-slate-950 to-slate-950 opacity-70"></div>
              
              {isWatching ? (
                <div className="z-10 space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    {/* Ring timer loader */}
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                    <span className="absolute text-xl font-black">{timer}</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-blue-400">Loading Video Stream...</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Please keep this window active. Do not click refresh. Anti-fraud engine is monitoring.
                    </p>
                  </div>
                </div>
              ) : successReward ? (
                <div className="z-10 space-y-3 animate-bounce">
                  <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-green-900/40">
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-green-400">Success! Earning Credited</h4>
                    <p className="text-xs text-slate-300">Rs {successReward} has been credited to your Ads Wallet.</p>
                  </div>
                </div>
              ) : (
                <div className="z-10 space-y-2">
                  <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={24} />
                  </div>
                  <h4 className="font-bold text-sm">Ad Interrupted</h4>
                  <p className="text-xs text-slate-400">Please contact support if this continues.</p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <ShieldCheck size={14} className="text-blue-500" />
                Anti Double-Click Active
              </span>
              
              {isWatching ? (
                <button disabled className="bg-slate-200 text-slate-500 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 cursor-not-allowed">
                  <Clock size={14} className="animate-pulse" />
                  <span>Watching ({timer}s)</span>
                </button>
              ) : (
                <button onClick={handleCloseModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                  Collect Reward & Close
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
