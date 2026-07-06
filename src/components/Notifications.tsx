/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckSquare, 
  Tv, 
  Users, 
  Sparkles,
  Check
} from 'lucide-react';
import { PlatformNotification } from '../types';
import { simDb } from '../utils/simDb';

interface NotificationsProps {
  userId: string;
  notifications: PlatformNotification[];
  onRefreshNotifications: () => void;
}

export default function Notifications({ userId, notifications, onRefreshNotifications }: NotificationsProps) {
  
  const handleMarkAllRead = () => {
    simDb.markNotificationsRead(userId);
    onRefreshNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft size={16} className="text-green-600" />;
      case 'withdraw':
        return <ArrowUpRight size={16} className="text-red-600" />;
      case 'task':
        return <CheckSquare size={16} className="text-indigo-600" />;
      case 'ad':
        return <Tv size={16} className="text-blue-600" />;
      case 'referral':
        return <Users size={16} className="text-purple-600" />;
      default:
        return <Sparkles size={16} className="text-slate-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-green-50 border-green-100';
      case 'withdraw': return 'bg-red-50 border-red-100';
      case 'task': return 'bg-indigo-50 border-indigo-100';
      case 'ad': return 'bg-blue-50 border-blue-100';
      case 'referral': return 'bg-purple-50 border-purple-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="space-y-8 animate-fade-in" id="notifications-tab">
      
      {/* Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="text-blue-600" />
            Alerts & Announcements
          </h2>
          <p className="text-slate-500 text-sm">
            Monitor transaction updates, tasks credits, withdrawals, and plan milestones in real-time.
          </p>
        </div>
        
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors hover:bg-blue-100 cursor-pointer"
          >
            <Check size={14} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm max-w-3xl mx-auto">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Notifications</span>
          <span className="text-xs text-blue-600 font-bold">
            {notifications.filter(n => !n.read).length} unread alerts
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300 border border-slate-100">
              <Bell size={20} />
            </div>
            <p className="text-sm text-slate-400 font-medium">Your notification drawer is empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((item) => {
              return (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-2xl border flex gap-4 transition-all ${
                    item.read 
                      ? 'bg-white border-slate-100 text-slate-600' 
                      : 'bg-blue-50/20 border-blue-100/50 text-slate-900 ring-1 ring-blue-50'
                  }`}
                >
                  {/* Status Indicator circle icon */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getIconBg(item.type)}`}>
                    {getIcon(item.type)}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className={`text-xs leading-relaxed ${item.read ? 'font-medium' : 'font-bold'}`}>
                        {item.message}
                      </p>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" title="Unread alert"></span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
