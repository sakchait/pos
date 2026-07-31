import React, { useState, useEffect } from 'react';
import {
  Banknote,
  DollarSign,
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  History,
  Calculator,
  EyeOff,
  CheckCircle,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Shift, DrawerOpenLog } from '../../types/pos';

interface ShiftManagementViewProps {
  cashierId: string;
  cashierName: string;
  terminalId: string;
  onRequireManagerPin: (
    title: string,
    desc: string,
    reason: 'NO_SALE' | 'MANUAL_OPEN' | 'VOID_ORDER' | 'REFUND' | 'PRICE_OVERRIDE',
    onSuccess: () => void
  ) => void;
}

export const ShiftManagementView: React.FC<ShiftManagementViewProps> = ({
  cashierId,
  cashierName,
  terminalId,
  onRequireManagerPin,
}) => {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [openingCashInput, setOpeningCashInput] = useState<string>('200.00');

  // Closing Shift (Blind Count) inputs
  const [actualCashCounted, setActualCashCounted] = useState<string>('');
  const [paidIn, setPaidIn] = useState<number>(0);
  const [paidOut, setPaidOut] = useState<number>(0);
  const [safeDrop, setSafeDrop] = useState<number>(0);

  const [closingSummary, setClosingSummary] = useState<{
    expectedCash: number;
    actualCounted: number;
    difference: number;
  } | null>(null);

  const [logs, setLogs] = useState<DrawerOpenLog[]>([]);

  useEffect(() => {
    loadShiftAndLogs();
  }, [cashierId]);

  const loadShiftAndLogs = async () => {
    const shift = await apiService.getActiveShift(cashierId);
    setActiveShift(shift || null);

    const logList = await apiService.getDrawerLogs();
    setLogs(logList.reverse());
  };

  const handleStartShift = async () => {
    const floatVal = parseFloat(openingCashInput) || 0;
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      cashierId,
      cashierName,
      terminalId,
      openingTime: new Date().toISOString(),
      openingCash: floatVal,
      systemCashSales: 0, // Will calculate from cash orders
      paidIn: 0,
      paidOut: 0,
      safeDrop: 0,
      status: 'OPEN',
    };

    await apiService.addShift(newShift);
    setActiveShift(newShift);
  };

  const handleTriggerNoSaleDrawerOpen = () => {
    onRequireManagerPin(
      'No-Sale Cash Drawer Trigger',
      'Requires manager PIN to pop cash drawer without a transaction. Recorded in Anti-Fraud Log.',
      'NO_SALE',
      async () => {
        await loadShiftAndLogs();
      }
    );
  };

  const handleReconcileShiftBlindCount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    const counted = parseFloat(actualCashCounted) || 0;

    // Calculate system cash sales from completed orders
    const orders = await apiService.getOrders();
    const shiftCashSales = orders.reduce((sum, ord) => {
      if (ord.status === 'COMPLETED' && ord.createdAt >= activeShift.openingTime) {
        const cashPay = ord.payments.filter((p) => p.method === 'Cash').reduce((s, p) => s + p.amount, 0);
        return sum + cashPay;
      }
      return sum;
    }, 0);

    const expectedCash = activeShift.openingCash + shiftCashSales + paidIn - paidOut - safeDrop;
    const difference = counted - expectedCash;

    const summary = {
      expectedCash,
      actualCounted: counted,
      difference,
    };

    setClosingSummary(summary);

    // Close shift in Dexie / Server
    await apiService.updateShift(activeShift.id, {
      closingTime: new Date().toISOString(),
      systemCashSales: shiftCashSales,
      paidIn,
      paidOut,
      safeDrop,
      expectedCash,
      actualCashCounted: counted,
      cashDifference: difference,
      status: 'CLOSED',
    });

    setActiveShift(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-950/60 text-orange-600 rounded-2xl">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-['Manrope'] font-bold text-2xl text-slate-900 dark:text-slate-100">
                Shift Reconciliation & Cash Drawer
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Terminal ID: <strong className="text-slate-700 dark:text-slate-300">{terminalId}</strong> • Cashier:{' '}
                <strong className="text-slate-700 dark:text-slate-300">{cashierName}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              activeShift
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {activeShift ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{activeShift ? 'SHIFT ACTIVE' : 'NO ACTIVE SHIFT'}</span>
          </span>

          <button
            onClick={handleTriggerNoSaleDrawerOpen}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Lock className="w-4 h-4" /> Trigger No-Sale Drawer
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Active Shift Control or Start Shift */}
        {!activeShift ? (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Calculator className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Initialize Shift Float</h3>
                <p className="text-xs text-slate-500">Input opening cash float before accepting sales.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Opening Cash Float (บาท)
                </label>
                <div className="relative">
                  <Banknote className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={openingCashInput}
                    onChange={(e) => setOpeningCashInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl font-extrabold text-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleStartShift}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Unlock className="w-5 h-5" /> Start New Shift
              </button>
            </div>
          </div>
        ) : (
          /* Closing Shift (Blind Count) Form */
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <EyeOff className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Blind Count Reconciliation</h3>
                  <p className="text-xs text-slate-500">
                    Opened at {new Date(activeShift.openingTime).toLocaleTimeString()} • Float: {activeShift.openingCash.toFixed(2)} บาท
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-extrabold text-[10px] rounded-full uppercase">
                Anti-Fraud Mode
              </span>
            </div>

            <form onSubmit={handleReconcileShiftBlindCount} className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
                <strong>Blind Count Rule:</strong> Cashier must count and enter physical cash in drawer without viewing system expected total first.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Actual Physical Cash Counted (บาท)
                </label>
                <div className="relative">
                  <Banknote className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Enter total cash counted in drawer"
                    value={actualCashCounted}
                    onChange={(e) => setActualCashCounted(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl font-extrabold text-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Paid In (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paidIn}
                    onChange={(e) => setPaidIn(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Paid Out (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paidOut}
                    onChange={(e) => setPaidOut(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Safe Drop (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={safeDrop}
                    onChange={(e) => setSafeDrop(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!actualCashCounted}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-40"
              >
                <Lock className="w-5 h-5" /> Calculate Shift Reconciliation
              </button>
            </form>
          </div>
        )}

        {/* Right Side: Drawer Anti-Fraud Logs & Closing Result */}
        <div className="space-y-6">
          {/* Closing Summary Modal / Card if generated */}
          {closingSummary && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Shift Reconciliation Summary</h3>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">System Expected</p>
                  <p className="font-extrabold text-lg text-slate-800 dark:text-slate-200">
                    {closingSummary.expectedCash.toFixed(2)} บาท
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Actual Counted</p>
                  <p className="font-extrabold text-lg text-purple-600">
                    {closingSummary.actualCounted.toFixed(2)} บาท
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Discrepancy</p>
                  <p
                    className={`font-extrabold text-lg ${
                      closingSummary.difference === 0
                        ? 'text-emerald-600'
                        : closingSummary.difference > 0
                        ? 'text-blue-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {closingSummary.difference >= 0 ? '+' : ''}{closingSummary.difference.toFixed(2)} บาท
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 italic">
                Formula: Expected = Opening Float + Cash Sales + PaidIn - PaidOut - SafeDrop. Discrepancy logged to store audit report.
              </p>
            </div>
          )}

          {/* Drawer Open Anti-Fraud Log */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Cash Drawer Anti-Fraud Logs</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{logs.length} entries</span>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No drawer open events recorded yet.</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{log.reason}</span>
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-full text-[9px] font-extrabold">
                          {log.managerApprovedBy || 'PIN Approved'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Cashier: {log.cashierName} • {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
