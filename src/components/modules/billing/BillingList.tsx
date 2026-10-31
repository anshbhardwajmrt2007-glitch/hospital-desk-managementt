import React, { useState, useMemo } from 'react';
import {
  ReceiptText,
  FilePlus,
  Search,
  Filter,
  CreditCard,
  Printer,
  Eye,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useHospital } from '../../../context/HospitalContext';
import { Bill, PaymentStatus } from '../../../types';
import { Badge, getStatusBadgeVariant } from '../../common/Badge';
import { SearchInput } from '../../common/SearchInput';
import { EmptyState } from '../../common/EmptyState';
import { CreateBillModal } from './CreateBillModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { InvoicePrintView } from './InvoicePrintView';

export const BillingList: React.FC = () => {
  const { bills } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentBill, setPaymentBill] = useState<Bill | null>(null);
  const [printBill, setPrintBill] = useState<Bill | null>(null);

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      const matchesSearch =
        b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.patientPhone.includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }, [bills, searchQuery, statusFilter]);

  // Aggregates
  const totalInvoiced = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalCollected = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalOutstanding = bills.reduce((sum, b) => sum + b.outstandingBalance, 0);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Billing & Receipts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate itemized patient bills, collect simulated payments (Cash/Card/UPI), and print official receipts.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <FilePlus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Invoiced Volume</span>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">₹{totalInvoiced.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-500 mt-1 block">{bills.length} total generated invoices</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Total Revenue Collected</span>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">
            {((totalCollected / (totalInvoiced || 1)) * 100).toFixed(1)}% recovery rate
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Total Outstanding Balance</span>
          <p className="text-2xl font-black text-rose-700 font-mono mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</p>
          <span className="text-xs text-rose-600 font-medium mt-1 block">Pending desk/insurance collections</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search invoice INV-id, patient, or phone..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-200 font-medium"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Paid">Fully Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Line Items</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map(bill => (
                  <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {bill.id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900 block">{bill.patientName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">ID: {bill.patientId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {bill.invoiceDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{bill.items.length} service(s)</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                        {bill.items.map(i => i.description).join(', ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
                      ₹{bill.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                      ₹{bill.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 whitespace-nowrap">
                      ₹{bill.outstandingBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(bill.paymentStatus)} dot>
                        {bill.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {bill.outstandingBalance > 0 && (
                          <button
                            onClick={() => setPaymentBill(bill)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                            title="Collect Payment"
                          >
                            Collect
                          </button>
                        )}
                        <button
                          onClick={() => setPrintBill(bill)}
                          className="p-1.5 text-slate-400 hover:text-hospital-600 hover:bg-hospital-50 rounded-lg transition-colors"
                          title="Print / Save PDF Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No invoices found"
            description="No hospital invoices match the selected payment status or search terms."
            actionLabel="Generate Invoice"
            onAction={() => setIsCreateOpen(true)}
          />
        )}
      </div>

      {/* Create Bill Modal */}
      <CreateBillModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={!!paymentBill}
        onClose={() => setPaymentBill(null)}
        bill={paymentBill}
      />

      {/* Invoice Print & PDF View Modal */}
      <InvoicePrintView
        isOpen={!!printBill}
        onClose={() => setPrintBill(null)}
        bill={printBill}
      />
    </div>
  );
};
