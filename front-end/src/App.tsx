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
  User,
  LogOut,
  UserCircle,
  Layers,
} from 'lucide-react';

import { PosTerminalView } from './components/pos/PosTerminalView';
import { ShiftManagementView } from './components/shifts/ShiftManagementView';
import { ShiftScheduleView } from './components/shifts/ShiftScheduleView';
import { VendorPortalView } from './components/vendor/VendorPortalView';
import { ReportsView } from './components/reports/ReportsView';
import { RoleManagementView } from './components/admin/RoleManagementView';
import { LoginView } from './components/auth/LoginView';
import { ProfileView } from './components/auth/ProfileView';
import { ManagerPinModal } from './components/common/ManagerPinModal';
import { InventoryView } from './components/inventory/InventoryView';
import { db, seedInitialDataIfNeeded } from './db/dexieDb';
import { apiService } from './services/apiService';
import { UserAccount } from './types/pos';

export function App() {
  const [activeRoute, setActiveRoute] = useState<string>('/pos');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [dbReady, setDbReady] = useState<boolean>(false);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Active Role State
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
    '/profile',
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
    seedInitialDataIfNeeded().then(async () => {
      setDbReady(true);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    refreshRolePermissions(activeRole);
  }, [activeRole]);

  const getRoleDefaultRoute = async (role: string): Promise<string> => {
    const rp = await db.roleRoutes.where('role').equals(role).first();
    if (rp && rp.routes.length > 0) {
      if (rp.routes.includes('/pos')) {
        return '/pos';
      }
      const firstNonProfileRoute = rp.routes.find((r) => r !== '/profile');
      return firstNonProfileRoute || rp.routes[0];
    }
    return '/pos';
  };

  const refreshRolePermissions = async (role: string) => {
    const rp = await db.roleRoutes.where('role').equals(role).first();
    if (rp) {
      setAllowedRoutes([...rp.routes, '/profile']);
    } else {
      setAllowedRoutes(['/pos', '/shifts', '/shifts/schedule', '/vendor', '/reports', '/admin/roles', '/profile']);
    }
  };

  const handleLoginSuccess = async (user: UserAccount) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    setActiveUser({ id: user.id, name: user.fullName });
    
    // Dynamically default to first permitted route
    const defaultRoute = await getRoleDefaultRoute(user.role);
    setActiveRoute(defaultRoute);
    
    refreshRolePermissions(user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('omnipos_last_user');
  };

  const handleUpdateCurrentUser = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setActiveUser({ id: updatedUser.id, name: updatedUser.fullName });
  };

  const handleNavigate = (routePath: string) => {
    setAccessDeniedMsg('');

    // Middleware check
    if (!allowedRoutes.includes(routePath) && routePath !== '/profile') {
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

  // Render Login View if user is logged out
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const navItems = [
    { path: '/pos', label: 'POS Terminal', icon: ShoppingBag },
    { path: '/shifts', label: 'Shift Reconciliation', icon: Banknote },
    { path: '/shifts/schedule', label: 'Shift Scheduling', icon: Calendar },
    { path: '/vendor', label: 'Vendor & FIFO', icon: Truck },
    { path: '/inventory', label: 'Inventory Stock', icon: Layers },
    { path: '/reports', label: 'Audit & HR Reports', icon: FileSpreadsheet },
    { path: '/admin/roles', label: 'Access Control', icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col">
      {/* Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            {/* Logo & Offline Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div>
                  <span className="ml-3 font-['Manrope'] font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
                    POS
                  </span>
                  <span className="hidden sm:inline-block text-[10px] bg-orange-500/20 text-orange-400 font-extrabold px-2 py-0.5 rounded-full ml-2 border border-orange-500/30">
                    ENTERPRISE
                  </span>
                </div>
              </div>

              {/* Offline-First Indicator */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${isOnline
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
                const isAllowed = allowedRoutes.includes(item.path) || item.path === '/profile';

                if (!isAllowed) return null;

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active User Header Controls */}
          <div className="flex items-center gap-3">
            {/* User Profile Pill */}
            <button
              onClick={() => handleNavigate('/profile')}
              className={`flex items-center gap-2 p-1.5 pr-3 rounded-2xl border transition-all cursor-pointer ${activeRoute === '/profile'
                ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                }`}
              title="View & Edit User Profile"
            >
              <img
                src={
                  currentUser.avatarUrl ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                }
                alt={currentUser.fullName}
                className="w-7 h-7 rounded-xl object-cover border border-slate-600"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight">{currentUser.fullName}</p>
                <p className="text-[10px] text-orange-400 font-mono leading-tight">{activeRole}</p>
              </div>
            </button>

            {/* Quick Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 bg-slate-800 hover:bg-rose-600/80 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
              title="Log Out of Terminal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className="lg:hidden border-t border-slate-800 px-4 py-2 flex overflow-x-auto gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.path;
            const isAllowed = allowedRoutes.includes(item.path) || item.path === '/profile';

            if (!isAllowed) return null;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap ${isActive ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800'
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

        {activeRoute === '/inventory' && <InventoryView />}

        {activeRoute === '/reports' && <ReportsView />}

        {activeRoute === '/admin/roles' && (
          <RoleManagementView currentRole={activeRole} onRequireManagerPin={openManagerPinModal} />
        )}

        {activeRoute === '/profile' && (
          <ProfileView
            currentUser={currentUser}
            onUpdateCurrentUser={handleUpdateCurrentUser}
            onLogout={handleLogout}
          />
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
