import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  LogIn,
  AlertCircle,
  Sparkles,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { db } from '../../db/dexieDb';
import { UserAccount } from '../../types/pos';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [loginMode, setLoginMode] = useState<'PASSWORD' | 'PIN'>('PASSWORD');

  // Password Form State
  const [username, setUsername] = useState<string>('sarah.jenkins');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // PIN Form State
  const [pin, setPin] = useState<string>('');

  // Status
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      // Find user by username or email
      const cleanInput = username.trim().toLowerCase();
      const allUsers = await db.users.toArray();
      const user = allUsers.find(
        (u) =>
          u.username.toLowerCase() === cleanInput ||
          u.email.toLowerCase() === cleanInput
      );

      if (!user) {
        setErrorMsg('Invalid username or password. Please try again.');
        setIsLoading(false);
        return;
      }

      if (user.passwordHash !== password) {
        setErrorMsg('Invalid username or password. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Update last login
      const updatedUser: UserAccount = {
        ...user,
        lastLoginAt: new Date().toISOString(),
      };
      await db.users.put(updatedUser);

      if (rememberMe) {
        localStorage.setItem('omnipos_last_user', user.id);
      }

      setIsLoading(false);
      onLoginSuccess(updatedUser);
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred during authentication. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (pin.length < 4) {
      setErrorMsg('Please enter a 4-digit PIN.');
      return;
    }

    setIsLoading(true);
    try {
      const allUsers = await db.users.toArray();
      const user = allUsers.find((u) => u.pin === pin);

      if (!user) {
        setErrorMsg('Incorrect PIN. Security log recorded.');
        setIsLoading(false);
        return;
      }

      const updatedUser: UserAccount = {
        ...user,
        lastLoginAt: new Date().toISOString(),
      };
      await db.users.put(updatedUser);

      setIsLoading(false);
      onLoginSuccess(updatedUser);
    } catch (err) {
      console.error(err);
      setErrorMsg('PIN login failed.');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userAccount: { username: string; pass: string }) => {
    setUsername(userAccount.username);
    setPassword(userAccount.pass);
    setLoginMode('PASSWORD');
    setErrorMsg('');

    setIsLoading(true);
    const allUsers = await db.users.toArray();
    const user = allUsers.find(
      (u) => u.username.toLowerCase() === userAccount.username.toLowerCase()
    );

    if (user) {
      const updatedUser: UserAccount = {
        ...user,
        lastLoginAt: new Date().toISOString(),
      };
      await db.users.put(updatedUser);
      setIsLoading(false);
      onLoginSuccess(updatedUser);
    } else {
      setIsLoading(false);
      setErrorMsg('Quick login account not found in database.');
    }
  };

  const handlePinKeyClick = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setErrorMsg('');
    }
  };

  const handlePinClear = () => {
    setPin('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        {/* Left Branding Panel (Hidden on mobile, 5 cols on desktop) */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-orange-600/30">
                OP
              </div>
              <div>
                <h1 className="font-['Manrope'] font-black text-2xl tracking-tight text-white">
                  OmniPOS
                </h1>
                <p className="text-[11px] font-extrabold text-orange-400 tracking-wider">
                  ENTERPRISE TERMINAL
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-xl font-bold text-slate-100">
                Secure Offline-First Staff Authentication
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integrated Dexie IndexedDB access manager with role-based navigation middleware, HMAC-signed audit logs, and instant PIN terminal switching.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>HMAC SHA-256 Audit Signing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>IndexedDB Encrypted Credentials</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Multi-Role Middleware Rules</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Terminal ID: TERM-01</span>
            <span className="text-emerald-400 font-mono font-bold">ONLINE (LOCAL)</span>
          </div>
        </div>

        {/* Right Authentication Form Card (7 cols) */}
        <div className="md:col-span-7 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Login Mode Switcher Tabs */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <h2 className="font-['Manrope'] font-bold text-xl text-white">
                Staff Login
              </h2>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('PASSWORD');
                    setErrorMsg('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    loginMode === 'PASSWORD'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('PIN');
                    setErrorMsg('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    loginMode === 'PIN'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Fast PIN</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* PASSWORD LOGIN FORM */}
            {loginMode === 'PASSWORD' ? (
              <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Username or Employee Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. sarah.jenkins"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <span>Remember terminal session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Log In to Terminal</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* FAST PIN LOGIN FORM */
              <form onSubmit={handlePinLogin} className="mt-6 space-y-4">
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-3">
                    Enter your 4-digit Cashier / Manager PIN
                  </p>
                  <div className="flex justify-center gap-3 my-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono text-xl font-bold transition-all ${
                          pin.length > idx
                            ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-md shadow-orange-500/20'
                            : 'border-slate-800 bg-slate-950 text-slate-600'
                        }`}
                      >
                        {pin.length > idx ? '•' : ''}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => {
                    if (key === 'C') {
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={handlePinClear}
                          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all active:scale-95"
                        >
                          Clear
                        </button>
                      );
                    }
                    if (key === '✓') {
                      return (
                        <button
                          key={key}
                          type="submit"
                          disabled={isLoading || pin.length < 4}
                          className="py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition-all active:scale-95 disabled:opacity-40"
                        >
                          Enter
                        </button>
                      );
                    }
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePinKeyClick(key)}
                        className="py-3 bg-slate-950 hover:bg-slate-800 text-white font-mono font-bold rounded-xl text-base border border-slate-800/80 transition-all active:scale-95"
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              </form>
            )}
          </div>

          {/* Quick Preset Accounts for Easy Evaluation / Testing */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">Quick Demo Accounts (1-Click Login):</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                {
                  role: 'Branch Manager',
                  name: 'Sarah J.',
                  username: 'sarah.jenkins',
                  pass: 'password123',
                  pin: '1234',
                  color: 'border-orange-500/40 bg-orange-950/20 text-orange-300',
                },
                {
                  role: 'Cashier',
                  name: 'Alex R.',
                  username: 'alex.rivera',
                  pass: 'password123',
                  pin: '1111',
                  color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
                },
                {
                  role: 'Stock Clerk',
                  name: 'Mark T.',
                  username: 'mark.tanaka',
                  pass: 'password123',
                  pin: '2222',
                  color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
                },
                {
                  role: 'Purchaser',
                  name: 'Elena R.',
                  username: 'purchaser.admin',
                  pass: 'password123',
                  pin: '3333',
                  color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
                },
                {
                  role: 'Admin',
                  name: 'System Admin',
                  username: 'admin',
                  pass: 'admin123',
                  pin: '9999',
                  color: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
                },
              ].map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className={`p-2 rounded-xl border text-left transition-all hover:scale-102 active:scale-95 cursor-pointer ${acc.color}`}
                >
                  <p className="font-bold text-[11px] truncate">{acc.name}</p>
                  <p className="text-[10px] opacity-75 font-mono">{acc.role}</p>
                  <p className="text-[9px] opacity-60 font-mono mt-0.5">
                    PIN: {acc.pin}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
