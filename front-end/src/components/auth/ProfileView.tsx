import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Save,
  Building,
  BadgeCheck,
  Clock,
  Smartphone,
  LogOut,
  Camera,
  Check,
} from 'lucide-react';
import { db } from '../../db/dexieDb';
import { UserAccount } from '../../types/pos';

interface ProfileViewProps {
  currentUser: UserAccount;
  onUpdateCurrentUser: (updatedUser: UserAccount) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateCurrentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'INFO' | 'PASSWORD' | 'PIN'>('INFO');

  // Profile Info Form State
  const [fullName, setFullName] = useState<string>(currentUser.fullName || '');
  const [email, setEmail] = useState<string>(currentUser.email || '');
  const [phone, setPhone] = useState<string>(currentUser.phone || '');
  const [department, setDepartment] = useState<string>(currentUser.department || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl || '');
  const [infoSuccess, setInfoSuccess] = useState<string>('');
  const [infoError, setInfoError] = useState<string>('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [passSuccess, setPassSuccess] = useState<string>('');
  const [passError, setPassError] = useState<string>('');

  // PIN Form State
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinSuccess, setPinSuccess] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Save Profile Info
  const handleSaveProfileInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError('');
    setInfoSuccess('');

    if (!fullName.trim()) {
      setInfoError('Full name cannot be empty.');
      return;
    }

    try {
      const updated: UserAccount = {
        ...currentUser,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
        avatarUrl: avatarUrl.trim(),
      };

      await db.users.put(updated);
      onUpdateCurrentUser(updated);
      setInfoSuccess('Profile details saved successfully to IndexedDB!');
      setTimeout(() => setInfoSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setInfoError('Failed to update profile details.');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    // 1. Validate current password
    if (currentPassword !== currentUser.passwordHash) {
      setPassError('Current password is incorrect.');
      return;
    }

    // 2. Validate new password length
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    // 3. Validate confirm password
    if (newPassword !== confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    try {
      const updated: UserAccount = {
        ...currentUser,
        passwordHash: newPassword,
      };

      await db.users.put(updated);
      onUpdateCurrentUser(updated);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setPassSuccess('Password changed successfully! Next login will require your new password.');
      setTimeout(() => setPassSuccess(''), 5000);
    } catch (err) {
      console.error(err);
      setPassError('Failed to update password.');
    }
  };

  // Change PIN
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (currentPin !== currentUser.pin) {
      setPinError('Current PIN is incorrect.');
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setPinError('New PIN must be exactly 4 digits.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('New PIN and Confirm PIN do not match.');
      return;
    }

    try {
      const updated: UserAccount = {
        ...currentUser,
        pin: newPin,
      };

      await db.users.put(updated);
      onUpdateCurrentUser(updated);

      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');

      setPinSuccess('4-Digit Terminal PIN updated successfully!');
      setTimeout(() => setPinSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setPinError('Failed to update PIN.');
    }
  };

  // Preset Avatars
  const presetAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  ];

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passStrength = getPasswordStrength(newPassword);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 z-10">
          <div className="relative group">
            <img
              src={currentUser.avatarUrl || presetAvatars[0]}
              alt={currentUser.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500/50 shadow-lg shadow-orange-500/20"
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Manrope'] font-extrabold text-2xl text-white">
                {currentUser.fullName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>@{currentUser.username}</span>
              <span>•</span>
              <span className="font-mono text-slate-300">
                {currentUser.employeeCode || 'EMP-101'}
              </span>
            </p>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                {currentUser.department || 'Store Management'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Last Login:{' '}
                {currentUser.lastLoginAt
                  ? new Date(currentUser.lastLoginAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Just Now'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('INFO')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'INFO'
              ? 'border-orange-600 text-orange-600 dark:text-orange-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" /> Personal Information
        </button>
        <button
          onClick={() => setActiveTab('PASSWORD')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'PASSWORD'
              ? 'border-orange-600 text-orange-600 dark:text-orange-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" /> Change Password
        </button>
        <button
          onClick={() => setActiveTab('PIN')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'PIN'
              ? 'border-orange-600 text-orange-600 dark:text-orange-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" /> Change Terminal PIN
        </button>
      </div>

      {/* TAB 1: PERSONAL INFORMATION */}
      {activeTab === 'INFO' && (
        <form
          onSubmit={handleSaveProfileInfo}
          className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
        >
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                User Details & Avatar Settings
              </h2>
              <p className="text-xs text-slate-500">
                Update your account details stored in Dexie IndexedDB
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </div>

          {infoSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>{infoSuccess}</span>
            </div>
          )}

          {infoError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-2xl text-xs text-rose-800 dark:text-rose-200 font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{infoError}</span>
            </div>
          )}

          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Choose Profile Avatar
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {presetAvatars.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative ${
                    avatarUrl === url
                      ? 'border-orange-600 scale-105 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  {avatarUrl === url && (
                    <div className="absolute inset-0 bg-orange-600/40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white font-bold" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: CHANGE PASSWORD */}
      {activeTab === 'PASSWORD' && (
        <form
          onSubmit={handleChangePassword}
          className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl"
        >
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
              Change Password
            </h2>
            <p className="text-xs text-slate-500">
              Update your password for staff terminal login authentication
            </p>
          </div>

          {passSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-2xl text-xs text-rose-800 dark:text-rose-200 font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{passError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Meter */}
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Password Strength:</span>
                    <span className="font-extrabold">{passStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all ${
                        passStrength.score >= 1 ? passStrength.color : 'bg-transparent'
                      } flex-1`}
                    />
                    <div
                      className={`h-full transition-all ${
                        passStrength.score >= 2 ? passStrength.color : 'bg-transparent'
                      } flex-1`}
                    />
                    <div
                      className={`h-full transition-all ${
                        passStrength.score >= 3 ? passStrength.color : 'bg-transparent'
                      } flex-1`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Key className="w-4 h-4" /> Update Password
          </button>
        </form>
      )}

      {/* TAB 3: CHANGE PIN */}
      {activeTab === 'PIN' && (
        <form
          onSubmit={handleChangePin}
          className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl"
        >
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
              Terminal Fast Switch PIN
            </h2>
            <p className="text-xs text-slate-500">
              Update your 4-digit cashier / manager security PIN
            </p>
          </div>

          {pinSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>{pinSuccess}</span>
            </div>
          )}

          {pinError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-2xl text-xs text-rose-800 dark:text-rose-200 font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{pinError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Current 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="e.g. 1234"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-mono tracking-widest text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                New 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="New 4 digits"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-mono tracking-widest text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New PIN
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirm 4 digits"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-mono tracking-widest text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Smartphone className="w-4 h-4" /> Update Terminal PIN
          </button>
        </form>
      )}
    </div>
  );
};
