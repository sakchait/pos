import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Check, X, Lock } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface ManagerPinModalProps {
  isOpen: boolean;
  actionTitle: string;
  actionDescription: string;
  cashierId: string;
  cashierName: string;
  reasonType: 'NO_SALE' | 'MANUAL_OPEN' | 'VOID_ORDER' | 'REFUND' | 'PRICE_OVERRIDE';
  onApproved: (managerPin: string) => void;
  onCancel: () => void;
}

export const ManagerPinModal: React.FC<ManagerPinModalProps> = ({
  isOpen,
  actionTitle,
  actionDescription,
  cashierId,
  cashierName,
  reasonType,
  onApproved,
  onCancel,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const isValid = await apiService.verifyManagerPin('branch-1', pin);
    if (isValid) {
      // Log high risk action to Dexie / Server DrawerOpenLogs
      await apiService.addDrawerLog({
        id: `log-${Date.now()}`,
        cashierId,
        cashierName,
        timestamp: new Date().toISOString(),
        reason: reasonType,
        managerApprovedBy: `Manager (PIN: ${pin})`,
      });

      onApproved(pin);
      setPin('');
      setError('');
    } else {
      setError('Invalid Manager PIN. Please try again (Demo PIN: 1234).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-['Manrope'] font-bold text-xl leading-tight">Manager Approval Required</h3>
              <p className="text-amber-100 text-xs mt-1">Anti-Fraud Security System</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-white/20 text-amber-100 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4">
            <div className="flex gap-3">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{actionTitle}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{actionDescription}</p>
              </div>
            </div>
          </div>

          {/* PIN Display */}
          <div className="space-y-2 text-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> Enter 4-6 Digit Manager PIN
            </label>
            <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-3 px-4">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    idx < pin.length
                      ? 'bg-orange-600 scale-110 shadow-sm'
                      : 'border-2 border-slate-300 dark:border-slate-600'
                  }`}
                />
              ))}
            </div>
            {error && <p className="text-xs font-semibold text-rose-600 mt-1">{error}</p>}
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xl rounded-xl transition-all active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 bg-slate-200 dark:bg-slate-700/60 hover:bg-slate-300 text-slate-600 dark:text-slate-300 font-semibold text-sm rounded-xl transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xl rounded-xl transition-all active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-12 bg-slate-200 dark:bg-slate-700/60 hover:bg-slate-300 text-slate-600 dark:text-slate-300 font-semibold text-sm rounded-xl transition-all"
            >
              Del
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={pin.length < 4}
              className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" /> Approve Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
