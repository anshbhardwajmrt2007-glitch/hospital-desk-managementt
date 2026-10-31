import React from 'react';
import { Modal } from '../../common/Modal';
import { Bill } from '../../../types';
import { useHospital } from '../../../context/HospitalContext';
import { Printer, Download, Cross, ShieldCheck } from 'lucide-react';
import { Badge, getStatusBadgeVariant } from '../../common/Badge';

interface InvoicePrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({
  isOpen,
  onClose,
  bill
}) => {
  const { settings } = useHospital();

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hospital Official Invoice — ${bill.id}`}
      subtitle="Preview printable receipt and patient discharge billing statement."
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <p className="text-xs text-slate-500">
            Use standard browser print settings to save directly as PDF.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-sm font-medium text-white bg-hospital-600 rounded-xl hover:bg-hospital-700 shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Printable Invoice Document */}
      <div id="printable-invoice" className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 text-slate-800 text-xs shadow-xs">
        {/* Hospital Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-hospital-700 text-white flex items-center justify-center font-black text-2xl shadow-sm">
              <Cross className="w-7 h-7 rotate-45 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{settings.hospitalName}</h2>
              <p className="text-[11px] text-slate-500">{settings.tagline}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Reg No: {settings.registrationNumber} • {settings.printHeaderNote}</p>
            </div>
          </div>
          <div className="sm:text-right text-[11px] text-slate-600">
            <p className="font-semibold text-slate-800">{settings.address}</p>
            <p>{settings.city}, {settings.state} - {settings.pincode}</p>
            <p>Phone: {settings.phone} • OPD Hours: {settings.workingHours}</p>
          </div>
        </div>

        {/* Invoice Metadata & Patient Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-slate-200">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Billed Patient Details</span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">{bill.patientName}</h3>
            <p className="text-slate-600 mt-0.5">Patient ID: <span className="font-mono font-bold text-slate-800">{bill.patientId}</span></p>
            <p className="text-slate-600">Phone: {bill.patientPhone}</p>
            {bill.patientAddress && <p className="text-slate-500 mt-0.5">{bill.patientAddress}</p>}
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tax Invoice Statement</span>
            <h3 className="text-base font-extrabold text-hospital-700 mt-1 font-mono">{bill.id}</h3>
            <p className="text-slate-600 mt-0.5">Date of Issue: <strong className="text-slate-800">{bill.invoiceDate}</strong></p>
            {bill.linkedType && (
              <p className="text-slate-500 mt-0.5">
                Service Context: {bill.linkedType} {bill.linkedId ? `(${bill.linkedId})` : ''}
              </p>
            )}
            <div className="mt-2 sm:inline-block">
              <Badge variant={getStatusBadgeVariant(bill.paymentStatus)} dot>
                Payment Status: {bill.paymentStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Itemized Services Table */}
        <div className="py-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-50/80">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description / Medical Service</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bill.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-700">{item.category}</td>
                  <td className="py-2 px-3 text-slate-800">{item.description}</td>
                  <td className="py-2 px-3 text-center font-mono">{item.quantity}</td>
                  <td className="py-2 px-3 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    ₹{item.total.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
          <div className="flex-1 max-w-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment History</span>
            {bill.payments.length > 0 ? (
              <div className="mt-2 space-y-1.5 border border-slate-200 rounded-lg p-2.5 bg-slate-50/60 text-[11px]">
                {bill.payments.map((p, i) => (
                  <div key={i} className="flex justify-between text-slate-600">
                    <span>{p.date} ({p.method}):</span>
                    <span className="font-mono font-bold text-emerald-700">₹{p.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-slate-400 text-[11px] italic">No payment transactions recorded yet.</p>
            )}

            {bill.notes && (
              <p className="text-[11px] text-slate-500 mt-3 italic">
                Notes: {bill.notes}
              </p>
            )}
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Subtotal:</span>
              <span className="font-mono">₹{bill.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount ({bill.discountPercentage}%):</span>
                <span className="font-mono">-₹{bill.discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Applicable Tax ({bill.taxPercentage}%):</span>
              <span className="font-mono">+₹{bill.taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Invoice Total:</span>
              <span className="font-mono text-base text-hospital-700">₹{bill.grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-700 font-semibold">
              <span>Amount Received:</span>
              <span className="font-mono text-emerald-700">₹{bill.paidAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-rose-600 pt-1 border-t border-slate-200">
              <span>Net Balance Due:</span>
              <span className="font-mono">₹{bill.outstandingBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p className="italic text-center sm:text-left">{settings.printFooterNote}</p>
          <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-300">
            <p className="font-bold text-slate-700">Authorized Desk Administrator</p>
            <p className="text-[10px] text-slate-400">MediDesk Central Billing System</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
