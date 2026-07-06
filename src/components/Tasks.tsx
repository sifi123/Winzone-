/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckSquare, 
  Lock, 
  Play, 
  Clock, 
  CheckCircle2, 
  X, 
  ExternalLink,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { User } from '../types';
import { simDb, INVESTMENT_PLANS, TASK_REWARD } from '../utils/simDb';

interface TasksProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onRefreshLogs: () => void;
  setCurrentTab: (tab: string) => void;
}

interface TaskItem {
  id: string;
  title: string;
  platform: 'TikTok' | 'YouTube' | 'Daraz' | 'Facebook' | 'Instagram';
  actionLabel: string;
}

const SAMPLE_TASKS: TaskItem[] = [
  { id: "task-1", title: "Like & Comment on Daraz Merchant Video", platform: "Daraz", actionLabel: "Review Product" },
  { id: "task-2", title: "Subscribe to YouTube Tech Channel", platform: "YouTube", actionLabel: "Subscribe Channel" },
  { id: "task-3", title: "Like TikTok Brand Promotion Video", platform: "TikTok", actionLabel: "Like Video" },
  { id: "task-4", title: "Share Facebook Fintech Portal Page", platform: "Facebook", actionLabel: "Share Post" },
  { id: "task-5", title: "Follow Instagram Lifestyle Influencer", platform: "Instagram", actionLabel: "Follow Profile" },
  { id: "task-6", title: "Watch and Like YouTube Travel Vlog", platform: "YouTube", actionLabel: "Watch & Like" },
  { id: "task-7", title: "Leave 5-Star Review on Daraz Store", platform: "Daraz", actionLabel: "Submit Review" },
  { id: "task-8", title: "Comment on TikTok Fashion Ad", platform: "TikTok", actionLabel: "Comment Video" }
];

export default function Tasks({ user, onUpdateUser, onRefreshLogs, setCurrentTab }: TasksProps) {
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [timer, setTimer] = useState(10);
  const [isEngaging, setIsEngaging] = useState(false);
  const [successReward, setSuccessReward] = useState<number | null>(null);
  const [doubleClickGuard, setDoubleClickGuard] = useState(false);

  // Get active plan info
  const activePlan = useMemo(() => {
    if (user.activePlanId === null) return null;
    return INVESTMENT_PLANS.find(p => p.id === user.activePlanId) || null;
  }, [user.activePlanId]);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isEngaging && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (isEngaging && timer === 0) {
      setIsEngaging(false);
      handleCreditTaskReward();
    }
    return () => clearInterval(interval);
  }, [isEngaging, timer]);

  const handleStartTask = (task: TaskItem) => {
    if (doubleClickGuard) return;
    setDoubleClickGuard(true);

    if (!activePlan) {
      alert("Unlock tasks by subscribing to an Investment Plan.");
      setDoubleClickGuard(false);
      return;
    }

    if (user.todayTasksCompleted >= activePlan.tasksPerDay) {
      alert(`Daily limit of ${activePlan.tasksPerDay} completed! Please return tomorrow.`);
      setDoubleClickGuard(false);
      return;
    }

    // Launch task timer modal
    setActiveTask(task);
    setTimer(10);
    setIsEngaging(true);
    setSuccessReward(null);

    setTimeout(() => {
      setDoubleClickGuard(false);
    }, 1000);
  };

  const handleCreditTaskReward = () => {
    const result = simDb.completeTask(user.id);
    if (result.success && result.user) {
      onUpdateUser(result.user);
      onRefreshLogs();
      setSuccessReward(result.rewardAdded);
    } else {
      alert(result.error || "Failed to complete task.");
      setActiveTask(null);
    }
  };

  const handleCloseModal = () => {
    setIsEngaging(false);
    setActiveTask(null);
    setSuccessReward(null);
  };

  const maxTasks = activePlan ? activePlan.tasksPerDay : 0;
  const tasksRemaining = Math.max(0, maxTasks - user.todayTasksCompleted);

  // Lock panel for Free users
  if (!activePlan) {
    return (
      <div className="space-y-8 animate-fade-in" id="tasks-locked">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center max-w-xl mx-auto space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-100 animate-pulse">
            <Lock size={28} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Premium Tasks Locked</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Free accounts do not have access to social tasks. Please subscribe to an Investment Plan to unlock daily tasks paying <strong>Rs 20 per task</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Plan Advantages:</h4>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Starter: Rs 40/day (2 tasks)
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Bronze: Rs 60/day (3 tasks)
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Silver: Rs 80/day (4 tasks)
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Gold: Rs 120/day (6 tasks)
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Platinum: Rs 180/day (9 tasks)
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Diamond: Rs 400/day (20 tasks)
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={() => setCurrentTab('plans')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3.5 rounded-xl text-xs shadow-md shadow-blue-200 transition-transform hover:scale-103 cursor-pointer"
            >
              <span>Buy Investment Plan</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" id="tasks-tab">
      
      {/* Tracker Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="text-blue-600" />
            Premium Social Engagement Tasks
          </h2>
          <p className="text-slate-500 text-sm">
            Earn Rs {TASK_REWARD} for every social engagement task. You are subscribed to <strong>{activePlan.name}</strong>.
          </p>
        </div>

        {/* Dynamic tasks quota status badge */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center sm:text-left min-w-44 flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today's Balance Log</span>
          <h4 className="text-lg font-black text-slate-800 mt-1">
            {user.todayTasksCompleted} / {maxTasks} Completed
          </h4>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all" 
              style={{ width: `${(user.todayTasksCompleted / maxTasks) * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-blue-600 font-bold mt-1 block">
            {tasksRemaining > 0 ? `Rs ${tasksRemaining * TASK_REWARD} reward remaining today` : "Limit complete! Daily reset at 12:00 AM"}
          </span>
        </div>
      </div>

      {/* Social Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAMPLE_TASKS.map((task) => {
          const isLimitReached = user.todayTasksCompleted >= maxTasks;
          return (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-blue-100 hover:shadow-md transition-all flex items-center justify-between gap-4 group">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    task.platform === 'YouTube' ? 'bg-red-50 text-red-600' :
                    task.platform === 'TikTok' ? 'bg-slate-950 text-white' :
                    task.platform === 'Daraz' ? 'bg-amber-50 text-amber-700' :
                    task.platform === 'Facebook' ? 'bg-blue-50 text-blue-700' :
                    'bg-pink-50 text-pink-600'
                  }`}>
                    {task.platform}
                  </span>
                  <span className="text-xs font-bold text-green-600">
                    Pays Rs {TASK_REWARD}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">
                  {task.title}
                </h3>
                <p className="text-xs text-slate-400">Task type: social engagement click</p>
              </div>

              <button
                disabled={isLimitReached}
                onClick={() => handleStartTask(task)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isLimitReached 
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-102'
                }`}
              >
                <span>{isLimitReached ? 'Done' : 'Do Task'}</span>
                {!isLimitReached && <ChevronRight size={13} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* TASK VERIFICATION MODAL OVERLAY */}
      {activeTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 relative">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Executing task</span>
                <h3 className="font-bold text-slate-800 text-sm truncate max-w-[280px]">{activeTask.title}</h3>
              </div>
              {!isEngaging && (
                <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Simulating Platform Engagement Screen */}
            <div className="bg-slate-950 text-white p-8 text-center relative aspect-video flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-indigo-950/20 to-slate-950"></div>
              
              {isEngaging ? (
                <div className="z-10 space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                    <span className="absolute text-lg font-black">{timer}</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-blue-400">Verifying Social Action...</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Opening temporary {activeTask.platform} link. Engaging anti-fraud sandbox verification.
                    </p>
                  </div>
                </div>
              ) : successReward ? (
                <div className="z-10 space-y-3 animate-bounce">
                  <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-green-900/40">
                    <CheckCircle2 size={30} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-green-400">Action Verified!</h4>
                    <p className="text-xs text-slate-300">Rs {successReward} has been credited to your Tasks Wallet.</p>
                  </div>
                </div>
              ) : (
                <div className="z-10 space-y-2">
                  <span className="text-red-500">⚠️</span>
                  <h4 className="font-bold text-sm">Verification Stopped</h4>
                </div>
              )}
            </div>

            {/* Anti-fraud feedback footer */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <ExternalLink size={14} className="text-blue-500 animate-pulse" />
                Linked to {activeTask.platform}
              </span>
              
              {isEngaging ? (
                <button disabled className="bg-slate-200 text-slate-500 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 cursor-not-allowed">
                  <Clock size={14} className="animate-pulse" />
                  <span>Verifying ({timer}s)</span>
                </button>
              ) : (
                <button onClick={handleCloseModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                  Close & Complete
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
