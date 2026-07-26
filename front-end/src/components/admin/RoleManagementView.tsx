import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle, Save, Key, UserCog } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { RoleRoutePermission } from '../../types/pos';

interface RoleManagementViewProps {
  currentRole: string;
  onRequireManagerPin: (
    title: string,
    desc: string,
    reason: 'MANUAL_OPEN' | 'VOID_ORDER' | 'REFUND' | 'NO_SALE' | 'PRICE_OVERRIDE',
    onSuccess: () => void
  ) => void;
}

export const RoleManagementView: React.FC<RoleManagementViewProps> = ({
  currentRole,
  onRequireManagerPin,
}) => {
  const [rolePermissions, setRolePermissions] = useState<RoleRoutePermission[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<string>('');

  useEffect(() => {
    loadRolePermissions();
  }, []);

  const loadRolePermissions = async () => {
    const list = await apiService.getRoleRoutes();
    setRolePermissions(list);
  };

  const availableRoutes = [
    { path: '/pos', label: '1. Cashier POS Terminal' },
    { path: '/shifts', label: '2. Shift Reconciliation & Blind Count' },
    { path: '/shifts/schedule', label: '3. Shift Scheduling & Swaps' },
    { path: '/vendor', label: '4. Vendor Portal & FIFO Purchasing' },
    { path: '/reports', label: '5. Audit & HR Reporting Module' },
    { path: '/admin/roles', label: '6. Role Management & Middleware' },
  ];

  const handleToggleRoutePermission = (role: string, routePath: string) => {
    setRolePermissions((prev) =>
      prev.map((rp) => {
        if (rp.role === role) {
          const hasRoute = rp.routes.includes(routePath);
          const updatedRoutes = hasRoute
            ? rp.routes.filter((r) => r !== routePath)
            : [...rp.routes, routePath];
          return { ...rp, routes: updatedRoutes };
        }
        return rp;
      })
    );
  };

  const handleSavePermissions = () => {
    onRequireManagerPin(
      'Modify Security Permissions',
      'Requires Branch Manager PIN confirmation to modify route access control permissions.',
      'MANUAL_OPEN',
      async () => {
        // Save to Dexie / Server
        for (const rp of rolePermissions) {
          await apiService.updateRoleRoute(rp.role, rp.routes);
        }
        setSaveSuccess('Role Route Permissions (ROLE_ROUTES) saved successfully!');
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-2xl">
            <UserCog className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="font-['Manrope'] font-bold text-2xl text-slate-900 dark:text-slate-100">
              Dynamic Access Control & Role Management Panel
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure ROLE_ROUTES permissions matrix enforcing client-side Middleware navigation rules
            </p>
          </div>
        </div>

        <button
          onClick={handleSavePermissions}
          className="px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" /> Save Permission Matrix
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">ROLE_ROUTES Matrix</h3>
            <p className="text-xs text-slate-500">Check/uncheck to allow or restrict route access per employee role.</p>
          </div>
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold font-mono">
            Active Role: {currentRole}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">System Role</th>
                {availableRoutes.map((rt) => (
                  <th key={rt.path} className="p-4 text-center">
                    {rt.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rolePermissions.map((rp) => (
                <tr key={rp.role} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {rp.role}
                  </td>
                  {availableRoutes.map((rt) => {
                    const isAllowed = rp.routes.includes(rt.path);
                    return (
                      <td key={rt.path} className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={() => handleToggleRoutePermission(rp.role, rt.path)}
                          className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Demonstration Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl text-white space-y-3 border border-slate-800">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-orange-500" />
          <h4 className="font-bold text-sm">Manager Security Override & Anti-Tamper Policy</h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          High-risk security events (Voiding non-empty carts, manual cash drawer triggers, price overrides, and role permission edits) are strictly intercepted by the <code>ManagerPinModal</code>. All events write an immutable timestamped log into Dexie's <code>DrawerOpenLogs</code> table with SHA-256 HMAC verification.
        </p>
      </div>
    </div>
  );
};
