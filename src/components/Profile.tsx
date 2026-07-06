/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User as UserIcon, 
  MessageSquare, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Share2, 
  Gift, 
  ShieldCheck,
  Check,
  Smartphone
} from 'lucide-react';
import { User } from '../types';
import { simDb } from '../utils/simDb';

interface ProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

// Available profile avatars for quick premium simulation choice!
const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
];

export default function Profile({ user, onUpdateUser }: ProfileProps) {
  // Profile form states
  const [name, setName] = useState(user.name);
  const [whatsapp, setWhatsapp] = useState(user.whatsapp);
  const [selectedPic, setSelectedPic] = useState(user.profilePic || AVATAR_OPTIONS[0]);

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications feedback
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!name || !whatsapp) {
      setProfileError("Profile name and WhatsApp number cannot be empty.");
      return;
    }

    setSavingProfile(true);

    setTimeout(() => {
      try {
        const updatedUser = simDb.updateProfile(user.id, { 
          name, 
          whatsapp, 
          profilePic: selectedPic 
        });
        onUpdateUser(updatedUser);
        setProfileSuccess("Profile settings updated successfully!");
      } catch (err) {
        setProfileError("Failed to update profile.");
      }
      setSavingProfile(false);
    }, 800);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError("All password fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    setSavingPass(true);

    setTimeout(() => {
      const result = simDb.changePassword(user.id, oldPassword, newPassword);
      if (result.success) {
        setPassSuccess("Password updated successfully!");
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassError(result.error || "Password update failed.");
      }
      setSavingPass(false);
    }, 800);
  };

  const handleCopyReferral = () => {
    const shareLink = `${window.location.origin}/?ref=${user.referralCode}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedJoinDate = React.useMemo(() => {
    return new Date(user.createdAt).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [user.createdAt]);

  return (
    <div className="space-y-8 animate-fade-in" id="profile-tab">
      
      {/* Banner info */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserIcon className="text-blue-600" />
            My Profile Account
          </h2>
          <p className="text-slate-500 text-sm">
            Configure your personal specifications, secure credentials, and copy your network invite link.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar selector & Referral details */}
        <div className="space-y-6">
          
          {/* Main User Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center space-y-4">
            <div className="relative inline-block">
              <img 
                src={selectedPic} 
                alt={user.name} 
                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-50"
              />
              <span className="absolute bottom-0 right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center" title="Online session"></span>
            </div>
            
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">{user.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            </div>

            <div className="pt-3 border-t border-slate-50 flex justify-around text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Calendar size={13} /> Joined {formattedJoinDate}
              </span>
            </div>
          </div>

          {/* Referral Link Card */}
          <div className="bg-gradient-to-br from-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-md shadow-blue-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <Gift size={16} /> Earn Referral Bonuses
              </h3>
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">10% Commission</span>
            </div>
            
            <p className="text-xs text-blue-100 leading-relaxed">
              Invite your friends to register on RupeeGrow. Get an instant 10% commission credited straight to your withdrawable Main Wallet whenever your referred friend purchases any Investment Plan!
            </p>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider block">Your Invite Referral link</span>
              <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                <span className="text-xs font-mono truncate">{user.referralCode}</span>
                <button
                  onClick={handleCopyReferral}
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copied ? <Check size={12} className="text-green-600" /> : <Share2 size={12} />}
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Profile settings forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Profile Info Form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-6">Personal Account Details</h3>

            {profileError && (
              <div className="mb-5 p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-5 p-3.5 bg-green-50 text-green-800 rounded-xl border border-green-100 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="text-green-600" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              
              {/* Profile Avatar choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose Profile Avatar</label>
                <div className="flex gap-3">
                  {AVATAR_OPTIONS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPic(avatar)}
                      className={`relative w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedPic === avatar ? 'border-blue-600 ring-2 ring-blue-100 scale-105' : 'border-slate-150'
                      }`}
                    >
                      <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                      {selectedPic === avatar && (
                        <span className="absolute inset-0 bg-blue-600/30 flex items-center justify-center text-white font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Profile Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <UserIcon size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Smartphone size={16} />
                    </span>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-blue-100"
                >
                  {savingProfile ? "Saving Details..." : "Save Details"}
                </button>
              </div>

            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-6">Change Security Password</h3>

            {passError && (
              <div className="mb-5 p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="mb-5 p-3.5 bg-green-50 text-green-800 rounded-xl border border-green-100 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="text-green-600" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Enter current account password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password (Min. 6 chars)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPass}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-blue-100"
                >
                  {savingPass ? "Saving Password..." : "Update Password"}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
