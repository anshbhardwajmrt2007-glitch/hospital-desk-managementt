import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { Bill, PaymentMethod } from '../../../types';
import { useHospital } from '../../../context/HospitalContext';
import { useAuth } from '../../../context/AuthContext';
import { IndianRupee, CreditCard, QrCode, Banknote, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  bill
}) => {
  const { recordPayment } = useHospital();
  const { currentUser } = useAuth();

  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (bill) {
      setAmount(bill.outstandingBalance);
      setReferenceNumber(`UPI/${Math.floor(1000000000 + Math.random() * 9000000000)}/MED`);
    }
    setError('');
  }, [bill, isOpen]);

  if (!bill) return null;

  const handleMethodChange = (m: PaymentMethod) => {
    setMethod(m);
    if (m === 'UPI') {
      setReferenceNumber(`UPI/${Math.floor(1000000000 + Math.random() * 9000000000)}/MED`);
    } else if (m === 'Card') {
      setReferenceNumber(`POS-AUTH-${Math.floor(100000 + Math.random() * 900000)}`);
    } else if (m === 'Cash') {
      setReferenceNumber(`CASH-RCPT-${Math.floor(1000 + Math.random() * 9000)}`);
    } else {
      setReferenceNumber(`NETBANK-REF-${Math.floor(1000000 + Math.random() * 9000000)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Payment amount must be greater than 0.');
      return;
    }
    if (amount > bill.outstandingBalance) {
      setError(`Payment cannot exceed outstanding balance of ₹${bill.outstandingBalance.toLocaleString('en-IN')}`);
      return;
    }

    recordPayment(bill.id, {
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      amount: Number(amount),
      method,
      referenceNumber: referenceNumber.trim() || undefined,
      receivedBy: (currentUser?.fullName || currentUser?.name) ? `${currentUser.fullName || currentUser.name} (${currentUser.role})` : 'Desk Receptionist'
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Collect Simulated Payment — ${bill.id}`}
      subtitle={`Patient: ${bill.patientName} (${bill.patientId})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Simulated disclaimer */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Simulated hospital desk collection. No real payment gateway or banking connection.</span>
        </div>

        {/* Invoice Summary */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
          <div>
            <span className="text-slate-400">Total Billed</span>
            <p className="font-bold text-slate-800 mt-0.5">₹{bill.grandTotal.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span className="text-slate-400">Paid So Far</span>
            <p className="font-bold text-emerald-700 mt-0.5">₹{bill.paidAmount.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span className="text-slate-400">Balance Due</span>
            <p className="font-extrabold text-rose-600 mt-0.5">₹{bill.outstandingBalance.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

        {/* Payment Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Amount to Collect (₹ INR) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input
              type="number"
              min="1"
              max={bill.outstandingBalance}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-8 pr-3 py-2 text-sm font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
            />
          </div>
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={() => setAmount(bill.outstandingBalance)}
              className="text-[11px] font-semibold text-hospital-600 hover:text-hospital-700"
            >
              Set full balance (₹{bill.outstandingBalance.toLocaleString('en-IN')})
            </button>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Payment Mode <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'UPI', label: 'UPI / QR', icon: QrCode },
              { id: 'Card', label: 'Card (POS)', icon: CreditCard },
              { id: 'Cash', label: 'Cash Desk', icon: Banknote },
            ].map(m => {
              const Icon = m.icon;
              const isSelected = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMethodChange(m.id as PaymentMethod)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-hospital-600 bg-hospital-50/70 text-hospital-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reference / Auth code */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Simulated Reference / Auth Number
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Receipt</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
