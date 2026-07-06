/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Tv, 
  CheckSquare, 
  Wallet, 
  User, 
  Menu
} from 'lucide-react';
import { User as UserType } from '../types';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: any) => void;
  user: UserType;
  unreadCount: number;
  onOpenDrawer: () => void;
}

export default function BottomNav({ currentTab, setCurrentTab, user, unreadCount, onOpenDrawer }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'ads', label: 'Ads', icon: Tv, badge: user.todayAdsWatched < 5 ? `${5 - user.todayAdsWatched}` : null },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, disabled: !user.activePlanId },
    { id: 'wallets', label: 'Wallet', icon: Wallet },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2 flex items-center justify-around z-40 shadow-xl shadow-slate-900/10" id="mobile-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
              isActive 
                ? 'text-blue-600 font-bold scale-105' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              {tab.badge && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
          </button>
        );
      })}

      {/* Profile Shortcut */}
      <button
        onClick={() => setCurrentTab('profile')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
          currentTab === 'profile' 
            ? 'text-blue-600 font-bold scale-105' 
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <User size={20} className={currentTab === 'profile' ? 'stroke-[2.5px]' : 'stroke-2'} />
        <span className="text-[10px] font-medium tracking-wide">Profile</span>
      </button>

      {/* Menu Drawer Toggle */}
      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-slate-600 relative"
      >
        <div className="relative">
          <Menu size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border border-white"></span>
          )}
        </div>
        <span className="text-[10px] font-medium tracking-wide">More</span>
      </button>
    </div>
  );
}
