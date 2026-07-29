import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  FileText,
  AlertTriangle,
  Database,
  Calendar,
  Lock,
  PlusCircle,
  Eye,
  Download,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { SystemAuditLog, UserAccount } from '../../types/pos';

interface SystemAuditLogManagementViewProps {
  currentUser: UserAccount | null;
}

export const SystemAuditLogManagementView: React.FC<SystemAuditLogManagementViewProps> = ({
  currentUser,
}) => {
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemAuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('All Actions');
  const [onlySuspicious, setOnlySuspicious] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals state
  const [selectedLog, setSelectedLog] = useState<SystemAuditLog | null>(null);
  const [isAddLogOpen, setIsAddLogOpen] = useState<boolean>(false);
  const [newLogAction, setNewLogAction] = useState<string>('MANAGER_PIN_VERIFIED');
  const [newLogDesc, setNewLogDesc] = useState<string>('');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchQuery, selectedAction, onlySuspicious]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedAction, onlySuspicious]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError('');
      const list = await apiService.getSystemAuditLogs();
      setLogs(list);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch system audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...logs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.description.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.fullName && l.fullName.toLowerCase().includes(q))
      );
    }

    if (selectedAction !== 'All Actions') {
      result = result.filter((l) => l.action === selectedAction);
    }

    if (onlySuspicious) {
      result = result.filter(
        (l) => l.action === 'SUSPICIOUS_BEHAVIOR_FLAG' || l.isVerified === false
      );
    }

    setFilteredLogs(result);
  };

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const displayedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogDesc.trim()) return;

    try {
      setIsLoading(true);
      const userGuid = currentUser?.id || '99999999-9999-9999-9999-999999999999';
      await apiService.createSystemAuditLog({
        userId: userGuid,
        action: newLogAction,
        description: newLogDesc.trim(),
      });
      setNewLogDesc('');
      setIsAddLogOpen(false);
      await fetchLogs();
    } catch (err) {
      console.error(err);
      setError('Failed to create audit log.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Description', 'HMAC Signature', 'Verification Status'];
    const rows = filteredLogs.map((l) => [
      l.createdAt,
      l.fullName || l.userId,
      l.action,
      l.description,
      l.hmacSignature,
      l.isVerified ? 'VERIFIED' : 'FAILED',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OmniPOS_SystemAuditLogs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract unique actions for filtering
  const actions = ['All Actions', ...Array.from(new Set(logs.map((l) => l.action)))];

  const totalLogs = logs.length;
  const threatCount = logs.filter(
    (l) => l.action === 'SUSPICIOUS_BEHAVIOR_FLAG' || l.isVerified === false
  ).length;
  const integrityFails = logs.filter((l) => l.isVerified === false).length;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-orange-600" />
            System Audit Log Management
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Cryptographic anti-tamper log verification (HMAC SHA-256) & security auditing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddLogOpen(true)}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Trigger Audit Event
          </button>
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-3 rounded-2xl text-xs text-rose-800 dark:text-rose-400 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Audited Events</div>
            <div className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{totalLogs}</div>
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className={`p-3.5 rounded-xl shrink-0 ${threatCount > 0 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-450'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identified Security Alerts</div>
            <div className={`text-2xl font-extrabold mt-1 ${threatCount > 0 ? 'text-amber-600' : 'text-slate-800 dark:text-slate-100'}`}>{threatCount}</div>
          </div>
        </div>

        {/* Anti-Tamper Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className={`p-3.5 rounded-xl shrink-0 ${integrityFails > 0 ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'}`}>
            {integrityFails > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Database Integrity Check</div>
            <div className={`text-lg font-extrabold mt-1 ${integrityFails > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {integrityFails > 0 ? `${integrityFails} Records Compromised!` : 'All Records Intact'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
          <input
            type="text"
            placeholder="Search by action or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-450" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-transparent outline-none text-slate-600 dark:text-slate-300 font-bold"
            >
              {actions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* Only Suspicious toggle */}
          <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={onlySuspicious}
              onChange={(e) => setOnlySuspicious(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            Show Alerts Only
          </label>

          {/* Export button */}
          <button
            onClick={exportToCSV}
            disabled={filteredLogs.length === 0}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/40 text-[10px] font-bold text-slate-450 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800/80">
                <th className="p-4 pl-6">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Description</th>
                <th className="p-4">Integrity Status</th>
                <th className="p-4 pr-6 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Fetching audit event records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                displayedLogs.map((log) => {
                  const isThreat = log.action === 'SUSPICIOUS_BEHAVIOR_FLAG';
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="p-4 pl-6 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </td>

                      {/* User */}
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        <div>{log.fullName || 'System'}</div>
                        <div className="text-[10px] text-slate-400">@{log.username || 'system'}</div>
                      </td>

                      {/* Action */}
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isThreat
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                              : log.action.includes('LOGIN')
                              ? 'bg-indigo-55/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="p-4 text-slate-600 dark:text-slate-305 max-w-sm truncate">
                        {log.description}
                      </td>

                      {/* Integrity Status */}
                      <td className="p-4">
                        {log.isVerified ? (
                          <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-455 font-bold">
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-rose-600 font-bold">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Verification Failed</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Items per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium px-2">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl w-full max-w-lg shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1">
              <FileText className="w-5 h-5 text-orange-600" />
              Event Audit Detail
            </h3>
            <p className="text-[10px] text-slate-400">
              Details and anti-tamper integrity metadata for ID {selectedLog.id}
            </p>

            <div className="mt-5 space-y-4 text-xs">
              {/* Verification status block */}
              <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${selectedLog.isVerified ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-455'}`}>
                {selectedLog.isVerified ? <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 shrink-0 text-rose-600" />}
                <div>
                  <div className="font-bold">Cryptographic Status</div>
                  <div className="text-[10px] opacity-90 mt-0.5">
                    {selectedLog.isVerified 
                      ? 'This log is fully verified. The record signature matches its contents and has not been tampered.'
                      : 'WARNING: The signature does not match log contents! This record might have been modified outside the system.'}
                  </div>
                </div>
              </div>

              {/* Event Metadata */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-3 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Event Timestamp:</span>
                  <span className="text-slate-700 dark:text-slate-300">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Action Name:</span>
                  <span className="text-slate-800 dark:text-slate-100 font-bold">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">User Context:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedLog.fullName} (@{selectedLog.username})
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                  <span className="text-slate-400 block mb-1">Log Description:</span>
                  <p className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{selectedLog.description}</p>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                  <span className="text-slate-400 block mb-1">HMAC SHA-256 Signature:</span>
                  <p className="text-[10px] text-slate-500 break-all bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-xl">
                    {selectedLog.hmacSignature || 'NO_SIGNATURE_AVAILABLE'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 rounded-xl font-bold text-xs transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Event Modal */}
      {isAddLogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateLog} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl relative space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Trigger Simulation Audit Event
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Simulate a secure event that will be cryptographically signed by the POS application.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Action Type</label>
                <select
                  value={newLogAction}
                  onChange={(e) => setNewLogAction(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="MANAGER_PIN_VERIFIED">MANAGER_PIN_VERIFIED</option>
                  <option value="SUSPICIOUS_BEHAVIOR_FLAG">SUSPICIOUS_BEHAVIOR_FLAG</option>
                  <option value="PRICE_OVERRIDE_LOG">PRICE_OVERRIDE_LOG</option>
                  <option value="VOID_ORDER_APPROVED">VOID_ORDER_APPROVED</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Description Detail</label>
                <textarea
                  value={newLogDesc}
                  onChange={(e) => setNewLogDesc(e.target.value)}
                  placeholder="Enter details of the action/incident..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-24 outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddLogOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !newLogDesc.trim()}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-xl font-bold text-xs disabled:opacity-40"
              >
                Sign & Save Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
