/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  initSimDb, 
  simDb 
} from './utils/simDb';
import { 
  User, 
  DepositRequest, 
  WithdrawRequest, 
  PlatformNotification, 
  EarningLog 
} from './types';

// Components
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import AdsWatch from './components/AdsWatch';
import InvestmentPlans from './components/InvestmentPlans';
import Tasks from './components/Tasks';
import Withdraw from './components/Withdraw';
import Deposit from './components/Deposit';
import Wallets from './components/Wallets';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';

// Icons
import { 
  Sparkles, 
  Bell, 
  X, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  LogOut,
  User as UserIcon,
  HelpCircle,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Layout routing
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'ads' | 'plans' | 'tasks' | 'withdraw' | 'deposit' | 'wallets' | 'notifications' | 'profile' | 'admin'
  >('dashboard');

  // History & auxiliary data states
  const [logs, setLogs] = useState<EarningLog[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);

  // Mobile drawer visibility
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Check if current user is admin
  const isAdmin = useMemo(() => {
    if (!user) return false;
    return (
      user.email.toLowerCase() === 'saifiking78666@gmail.com' ||
      user.email.toLowerCase().includes('admin') ||
      user.name.toLowerCase().includes('admin')
    );
  }, [user]);

  // Initialize DB & load user session
  useEffect(() => {
    initSimDb();
    const sessionUser = simDb.getCurrentUser();
    if (sessionUser) {
      setUser(sessionUser);
      loadAllUserData(sessionUser.id);
    }
    setInitialized(true);
  }, []);

  // Sync data dynamically on global simulation changes (like background approval ticks!)
  useEffect(() => {
    const handleDbSync = () => {
      const updated = simDb.getCurrentUser();
      if (updated) {
        setUser(updated);
        loadAllUserData(updated.id);
      }
    };
    window.addEventListener('sim_db_updated', handleDbSync);
    return () => window.removeEventListener('sim_db_updated', handleDbSync);
  }, []);

  const loadAllUserData = (uid: string) => {
    setLogs(simDb.getEarningLogs(uid));
    setDeposits(simDb.getDeposits(uid));
    setWithdrawals(simDb.getWithdraws(uid));
    setNotifications(simDb.getNotifications(uid));
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    loadAllUserData(authenticatedUser.id);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    simDb.logout();
    setUser(null);
    setDrawerOpen(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    loadAllUserData(updatedUser.id);
  };

  const handleRefreshLogs = () => {
    if (user) {
      setLogs(simDb.getEarningLogs(user.id));
    }
  };

  const handleRefreshDeposits = () => {
    if (user) {
      setDeposits(simDb.getDeposits(user.id));
    }
  };

  const handleRefreshWithdrawals = () => {
    if (user) {
      setWithdrawals(simDb.getWithdraws(user.id));
    }
  };

  const handleRefreshNotifications = () => {
    if (user) {
      setNotifications(simDb.getNotifications(user.id));
    }
  };

  // Compute unread alert counters
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">RupeeGrow is loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in: Show auth container page
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row text-slate-600 font-sans antialiased pb-20 md:pb-0" id="app-shell">
      
      {/* SIDEBAR NAVIGATION (Desktop/Tablets only) */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setDrawerOpen(false);
        }} 
        user={user} 
        onLogout={handleLogout}
        unreadCount={unreadCount}
      />

      {/* MAIN CONTAINER PAGE AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        
        {/* TOP HEADER STATUS BAR */}
        <header className="sticky top-0 bg-white border-b border-slate-100 h-16 px-6 flex items-center justify-between z-30 shadow-sm" id="top-header">
          {/* Mobile title */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow">
              <Sparkles size={16} />
            </div>
            <span className="font-extrabold text-sm text-slate-900">RupeeGrow</span>
          </div>

          {/* Desktop welcome status trail */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span>Admin Gateway Ready</span>
            <span>/</span>
            <span className="text-blue-600 uppercase tracking-widest text-[10px]">{currentTab}</span>
          </div>

          {/* Alerts & Quick actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentTab('notifications')}
              className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all relative cursor-pointer"
              title="Notifications Drawer"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <div className="h-8 w-[1px] bg-slate-100 hidden sm:block"></div>

            {/* Quick avatar click redirects to profile */}
            <button 
              onClick={() => setCurrentTab('profile')}
              className="flex items-center gap-2 text-left cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 border border-blue-200">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">{user.name}</span>
            </button>
          </div>
        </header>

        {/* ACTIVE SECTION ROUTER PANEL */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard 
              user={user} 
              setCurrentTab={setCurrentTab} 
              logs={logs} 
            />
          )}

          {currentTab === 'ads' && (
            <AdsWatch 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onRefreshLogs={handleRefreshLogs} 
            />
          )}

          {currentTab === 'plans' && (
            <InvestmentPlans 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onRefreshLogs={handleRefreshLogs} 
              setCurrentTab={setCurrentTab} 
            />
          )}

          {currentTab === 'tasks' && (
            <Tasks 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onRefreshLogs={handleRefreshLogs} 
              setCurrentTab={setCurrentTab} 
            />
          )}

          {currentTab === 'withdraw' && (
            <Withdraw 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onRefreshLogs={handleRefreshLogs} 
              withdrawals={withdrawals}
              onRefreshWithdrawals={handleRefreshWithdrawals}
            />
          )}

          {currentTab === 'deposit' && (
            <Deposit 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onRefreshLogs={handleRefreshLogs} 
              deposits={deposits}
              onRefreshDeposits={handleRefreshDeposits}
            />
          )}

          {currentTab === 'wallets' && (
            <Wallets 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onRefreshLogs={handleRefreshLogs} 
            />
          )}

          {currentTab === 'notifications' && (
            <Notifications 
              userId={user.id} 
              notifications={notifications} 
              onRefreshNotifications={handleRefreshNotifications} 
            />
          )}

          {currentTab === 'profile' && (
            <Profile 
              user={user} 
              onUpdateUser={handleUpdateUser} 
            />
          )}

          {currentTab === 'admin' && isAdmin && (
            <AdminPanel 
              onActionCompleted={() => {
                if (user) loadAllUserData(user.id);
              }}
            />
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <BottomNav 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        user={user} 
        unreadCount={unreadCount}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end" id="mobile-drawer-overlay">
          <div className="w-80 max-w-[85vw] bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow">
                    <Sparkles size={16} />
                  </div>
                  <span className="font-extrabold text-sm text-slate-800">RupeeGrow</span>
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="space-y-3">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Gateway Actions</span>
                <button
                  onClick={() => { setCurrentTab('deposit'); setDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    currentTab === 'deposit' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownCircle size={16} />
                  <span>Deposit Cash</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('withdraw'); setDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    currentTab === 'withdraw' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpCircle size={16} />
                  <span>Withdraw Cash</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('notifications'); setDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    currentTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell size={16} />
                    <span>Alert Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setCurrentTab('profile'); setDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    currentTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <UserIcon size={16} />
                  <span>Profile Settings</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { setCurrentTab('admin'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      currentTab === 'admin' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    <span>Admin Dashboard</span>
                  </button>
                )}
              </div>
            </div>

            {/* Logout drawer footer */}
            <div className="border-t border-slate-50 pt-4">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Support Button */}
      {user && (
        <a
          href="https://wa.me/923363135004?text=Hello%20RupeeGrow%20Support!%20I%20need%20assistance."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 md:bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          id="floating-whatsapp"
        >
          <MessageCircle size={22} className="animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-xs font-black whitespace-nowrap">
            WhatsApp Support
          </span>
        </a>
      )}

    </div>
  );
}
