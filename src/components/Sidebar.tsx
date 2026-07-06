/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Tv, 
  TrendingUp, 
  CheckSquare, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  Bell, 
  User, 
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: any) => void;
  user: UserType;
  onLogout: () => void;
  unreadCount: number;
}

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout, unreadCount }: SidebarProps) {
  const isAdmin = user && (
    user.email.toLowerCase() === 'saifiking78666@gmail.com' ||
    user.email.toLowerCase().includes('admin') ||
    user.name.toLowerCase().includes('admin')
  );

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ads', label: 'Ads Watch', icon: Tv, badge: user.todayAdsWatched < 5 ? `${5 - user.todayAdsWatched} left` : null },
    { id: 'plans', label: 'Investment', icon: TrendingUp },
    { id: 'tasks', label: 'Daily Tasks', icon: CheckSquare, disabled: !user.activePlanId },
    { id: 'wallets', label: 'My Wallets', icon: Wallet },
    { id: 'deposit', label: 'Deposit Cash', icon: ArrowDownCircle },
    { id: 'withdraw', label: 'Withdraw Cash', icon: ArrowUpCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? `${unreadCount}` : null },
    { id: 'profile', label: 'Profile Settings', icon: User },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck, isAction: true }] : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 min-h-screen text-slate-700 sticky top-0" id="desktop-sidebar">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
          <Sparkles size={20} className="animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none">RupeeGrow</h1>
          <span className="text-xs text-blue-600 font-medium tracking-widest uppercase">Earn Platform</span>
        </div>
      </div>

      {/* Mini Profile card */}
      <div className="p-4 mx-4 my-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center border border-blue-200">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-800 truncate">{user.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-[11px] text-slate-500 font-medium">
              {user.activePlanId ? 'Premium Member' : 'Free Account'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600 pl-3' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>{item.label}</span>
              </div>
              
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  item.id === 'notifications' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.badge}
                </span>
              )}

              {item.disabled && !isActive && (
                <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wider font-semibold">
                  Locked
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
