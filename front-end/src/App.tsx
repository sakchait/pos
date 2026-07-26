import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Banknote,
  Calendar,
  Truck,
  FileSpreadsheet,
  UserCog,
  ShieldAlert,
  Wifi,
  WifiOff,
  UserCheck,
  Lock,
  ChevronDown,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import { PosTerminalView } from './components/pos/PosTerminalView';
import { ShiftManagementView } from './components/shifts/ShiftManagementView';
import { ShiftScheduleView } from './components/shifts/ShiftScheduleView';
import { VendorPortalView } from './components/vendor/VendorPortalView';
import { ReportsView } from './components/reports/ReportsView';
import { RoleManagementView } from './components/admin/RoleManagementView';
import { ManagerPinModal } from './components/common/ManagerPinModal';
import { db, seedInitialDataIfNeeded } from './db/dexieDb';
import { apiService } from './services/apiService';

export function App() {
  const [activeRoute, setActiveRoute] = useState<string>('/pos');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [dbReady, setDbReady] = useState<boolean>(false);

  // Active User / Role State
  const [activeRole, setActiveRole] = useState<string>('BranchManager');
  const [activeUser, setActiveUser] = useState<{ id: string; name: string }>({
    id: 'emp-101',
    name: 'Sarah Jenkins',
  });

  // Allowed Routes based on ROLE_ROUTES Middleware simulation
  const [allowedRoutes, setAllowedRoutes] = useState<string[]>([
    '/pos',
    '/shifts',
    '/shifts/schedule',
    '/vendor',
    '/reports',
    '/admin/roles',
  ]);

  // Manager PIN Modal State
  const [pinModalState, setPinModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    reason: 'NO_SALE' | 'MANUAL_OPEN' | 'VOID_ORDER' | 'REFUND' | 'PRICE_OVERRIDE';
    onSuccessCallback?: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    reason: 'MANUAL_OPEN',
  });

  // Access Denied Banner
  const [accessDeniedMsg, setAccessDeniedMsg] = useState<string>('');

  useEffect(() => {
    // Online / Offline Listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize Dexie Seed Data
    seedInitialDataIfNeeded().then(() => {
      setDbReady(true);
      refreshRolePermissions(activeRole);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    refreshRolePermissions(activeRole);
  }, [activeRole]);

  const refreshRolePermissions = async (role: string) => {
    const rp = await apiService.getRolePermissions(role);
    if (rp) {
      setAllowedRoutes(rp.routes);
    } else {
      setAllowedRoutes(['/pos', '/shifts', '/shifts/schedule', '/vendor', '/reports', '/admin/roles']);
    }
  };

  const handleNavigate = (routePath: string) => {
    setAccessDeniedMsg('');

    // Middleware check
    if (!allowedRoutes.includes(routePath)) {
      setAccessDeniedMsg(
        `ACCESS DENIED: Role '${activeRole}' is restricted from accessing '${routePath}' via ROLE_ROUTES Middleware.`
      );
      return;
    }

    setActiveRoute(routePath);
  };

  const openManagerPinModal = (
    title: string,
    description: string,
    reason: 'NO_SALE' | 'MANUAL_OPEN' | 'VOID_ORDER' | 'REFUND' | 'PRICE_OVERRIDE',
    onSuccess: () => void
  ) => {
    setPinModalState({
      isOpen: true,
      title,
      description,
      reason,
      onSuccessCallback: onSuccess,
    });
  };

  if (!dbReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="font-['Manrope'] font-bold text-lg">Initializing OmniPOS Dexie IndexedDB Engine...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/pos', label: 'POS Terminal', icon: ShoppingBag },
    { path: '/shifts', label: 'Shift Reconciliation', icon: Banknote },
    { path: '/shifts/schedule', label: 'Shift Scheduling', icon: Calendar },
    { path: '/vendor', label: 'Vendor & FIFO', icon: Truck },
    { path: '/reports', label: 'Audit & HR Reports', icon: FileSpreadsheet },
    { path: '/admin/roles', label: 'Access Control', icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col">
      {/* Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Offline Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white shadow-md">
                OP
              </div>
              <div>
                <span className="font-['Manrope'] font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
                  OmniPOS
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-orange-500/20 text-orange-400 font-extrabold px-2 py-0.5 rounded-full ml-2 border border-orange-500/30">
                  ENTERPRISE
                </span>
              </div>
            </div>

            {/* Offline-First Indicator */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                isOnline
                  ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400'
                  : 'bg-amber-950/80 border-amber-800/80 text-amber-400 animate-pulse'
              }`}
              title={isOnline ? 'Online (Dexie syncing)' : 'Offline (Dexie.js active)'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'ONLINE (Dexie)' : 'OFFLINE MODE'}</span>
            </div>
          </div>

          {/* Nav Tab Buttons */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.path;
              const isAllowed = allowedRoutes.includes(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : isAllowed
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-800/50 opacity-60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Active Role Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
              <UserCheck className="w-4 h-4 text-orange-400 ml-1" />
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-2"
              >
                <option value="BranchManager" className="bg-slate-900">
                  Branch Manager
                </option>
                <option value="Cashier" className="bg-slate-900">
                  Cashier
                </option>
                <option value="StockClerk" className="bg-slate-900">
                  Stock Clerk
                </option>
                <option value="PurchaserManager" className="bg-slate-900">
                  Purchaser Manager
                </option>
                <option value="HRAdmin" className="bg-slate-900">
                  HR Admin
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className="lg:hidden border-t border-slate-800 px-4 py-2 flex overflow-x-auto gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap ${
                  isActive ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Access Denied Warning Banner */}
      {accessDeniedMsg && (
        <div className="bg-rose-600 text-white p-3 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200">
          <ShieldAlert className="w-4 h-4" />
          <span>{accessDeniedMsg}</span>
          <button
            onClick={() =>
              openManagerPinModal(
                'Manager Override',
                'Requires Branch Manager PIN to temporarily override route access restrictions.',
                'MANUAL_OPEN',
                () => {
                  setAllowedRoutes((prev) => [...prev, activeRoute]);
                  setAccessDeniedMsg('');
                }
              )
            }
            className="ml-3 underline hover:text-orange-200"
          >
            Manager PIN Override
          </button>
        </div>
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        {activeRoute === '/pos' && (
          <PosTerminalView
            cashierId={activeUser.id}
            cashierName={activeUser.name}
            terminalId="TERM-01"
            onRequireManagerPin={openManagerPinModal}
          />
        )}

        {activeRoute === '/shifts' && (
          <ShiftManagementView
            cashierId={activeUser.id}
            cashierName={activeUser.name}
            terminalId="TERM-01"
            onRequireManagerPin={openManagerPinModal}
          />
        )}

        {activeRoute === '/shifts/schedule' && (
          <ShiftScheduleView
            currentUserId={activeUser.id}
            currentUserName={activeUser.name}
            currentUserRole={activeRole}
          />
        )}

        {activeRoute === '/vendor' && <VendorPortalView userRole={activeRole} />}

        {activeRoute === '/reports' && <ReportsView />}

        {activeRoute === '/admin/roles' && (
          <RoleManagementView currentRole={activeRole} onRequireManagerPin={openManagerPinModal} />
        )}
      </main>

      {/* Manager PIN Modal */}
      <ManagerPinModal
        isOpen={pinModalState.isOpen}
        title={pinModalState.title}
        description={pinModalState.description}
        reason={pinModalState.reason}
        cashierId={activeUser.id}
        cashierName={activeUser.name}
        onClose={() => setPinModalState((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={() => {
          setPinModalState((prev) => ({ ...prev, isOpen: false }));
          if (pinModalState.onSuccessCallback) {
            pinModalState.onSuccessCallback();
          }
        }}
      />
    </div>
  );
}

export default App;
