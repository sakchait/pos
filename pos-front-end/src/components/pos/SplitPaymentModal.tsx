import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  QrCode,
  Gift,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  X,
  Receipt,
} from 'lucide-react';
import { OrderPayment, PaymentMethod } from '../../types/pos';
import { computeHmacSignature } from '../../utils/crypto';

interface SplitPaymentModalProps {
  isOpen: boolean;
  grandTotal: number;
  orderNo: string;
  onCancel: () => void;
  onCompleteOrder: (payments: OrderPayment[], hmacSignature: string) => void;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  isOpen,
  grandTotal,
  orderNo,
  onCancel,
  onCompleteOrder,
}) => {
  const [payments, setPayments] = useState<OrderPayment[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Cash');
  const [amountInput, setAmountInput] = useState<string>('');
  const [refInput, setRefInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, grandTotal - totalPaid);
  const isFullyPaid = Math.abs(totalPaid - grandTotal) <= 0.01 || totalPaid >= grandTotal;

  const handleAddPayment = () => {
    const numAmount = parseFloat(amountInput) || remaining;
    if (numAmount <= 0) return;

    const newPayment: OrderPayment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      method: selectedMethod,
      amount: Math.min(numAmount, grandTotal - totalPaid + (selectedMethod === 'Cash' ? 100 : 0)), // Cash can take overpayment for change
      referenceNo: refInput || (selectedMethod === 'CreditCard' ? `AUTH-${Math.floor(100000 + Math.random() * 900000)}` : undefined),
      timestamp: new Date().toISOString(),
    };

    setPayments((prev) => [...prev, newPayment]);
    setAmountInput('');
    setRefInput('');
  };

  const handleRemovePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const handleQuickAmount = (ratio: number) => {
    const calc = (remaining * ratio).toFixed(2);
    setAmountInput(calc);
  };

  const handleFinalSubmit = async () => {
    if (!isFullyPaid) return;
    setIsSubmitting(true);

    const orderId = `ord-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // HMAC Anti-Tamper Signing
    const hmacSig = await computeHmacSignature(orderId, orderNo, grandTotal, createdAt);

    onCompleteOrder(payments, hmacSig);
    setIsSubmitting(false);
  };

  const paymentMethodIcons: Record<PaymentMethod, React.ReactNode> = {
    Cash: <Banknote className="w-5 h-5 text-emerald-600" />,
    CreditCard: <CreditCard className="w-5 h-5 text-blue-600" />,
    PromptPayQR: <QrCode className="w-5 h-5 text-purple-600" />,
    GiftCard: <Gift className="w-5 h-5 text-pink-600" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-6 h-6 text-orange-500" />
              <h3 className="font-['Manrope'] font-bold text-2xl tracking-tight">Split Payment Engine</h3>
            </div>
            <p className="text-slate-400 text-xs mt-1">Order #{orderNo} • Multi-Channel Checkout Verification</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grand Total</p>
              <p className="font-['Manrope'] text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {grandTotal.toFixed(2)} บาท
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Paid</p>
              <p className="font-['Manrope'] text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {totalPaid.toFixed(2)} บาท
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining</p>
              <p
                className={`font-['Manrope'] text-2xl font-extrabold ${
                  remaining > 0 ? 'text-orange-600' : 'text-slate-400'
                }`}
              >
                {remaining.toFixed(2)} บาท
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Payment Channel</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['Cash', 'CreditCard', 'PromptPayQR', 'GiftCard'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                    selectedMethod === method
                      ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/40 text-orange-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {paymentMethodIcons[method]}
                  <span>{method === 'CreditCard' ? 'Credit Card' : method === 'PromptPayQR' ? 'PromptPay QR' : method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Entry Form */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Add {selectedMethod} Amount
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAmount(1)}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-200"
                >
                  Full ({remaining.toFixed(2)} บาท)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(0.5)}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-200"
                >
                  50%
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">฿</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder={remaining > 0 ? remaining.toFixed(2) : '0.00'}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddPayment}
                className="py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" /> Add Payment
              </button>
            </div>

            {selectedMethod === 'PromptPayQR' && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center gap-3">
                <QrCode className="w-8 h-8 text-purple-600 shrink-0" />
                <p className="text-xs text-purple-900 dark:text-purple-200">
                  Dynamic PromptPay QR generated for <strong>{(parseFloat(amountInput) || remaining).toFixed(2)} บาท</strong>.
                  Scan on terminal display to auto-confirm.
                </p>
              </div>
            )}
          </div>

          {/* List of Applied Payments */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Payment Breakdown</label>
            {payments.length === 0 ? (
              <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                No payments added yet. Select a method and amount above.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">{paymentMethodIcons[payment.method]}</div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{payment.method}</p>
                        {payment.referenceNo && (
                          <p className="text-[10px] text-slate-400 font-mono">Ref: {payment.referenceNo}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {payment.amount.toFixed(2)} บาท
                      </span>
                      <button
                        onClick={() => handleRemovePayment(payment.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification Status */}
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 ${
              isFullyPaid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            {isFullyPaid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-bold text-xs">
                {isFullyPaid
                  ? 'Split Payment Verification Passed (Total Paid Matches Order)'
                  : `Incomplete Payment: ${remaining.toFixed(2)} บาท remaining before order can be finalized.`}
              </p>
              <p className="text-[10px] opacity-80 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Anti-Tamper HMAC SHA-256 signature will be generated on completion.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isFullyPaid || isSubmitting}
              onClick={handleFinalSubmit}
              className="flex-2 py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl font-bold text-base shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ShieldCheck className="w-5 h-5" />
              {isSubmitting ? 'Signing HMAC Order...' : 'Complete Order & Print Receipt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
