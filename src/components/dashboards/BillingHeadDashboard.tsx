import React, { useState } from 'react';
import {
  ReceiptText,
  FilePlus,
  CreditCard,
  Printer,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { Bill } from '../../types';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import { CreateBillModal } from '../modules/billing/CreateBillModal';
import { RecordPaymentModal } from '../modules/billing/RecordPaymentModal';
import { InvoicePrintView } from '../modules/billing/InvoicePrintView';

export const BillingHeadDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { bills } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentBill, setPaymentBill] = useState<Bill | null>(null);
  const [printBill, setPrintBill] = useState<Bill | null>(null);

  // Financial calculations
  const totalBilled = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalCollected = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalOutstanding = bills.reduce((sum, b) => sum + b.outstandingBalance, 0);

  const filteredBills = bills.filter(b => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patientPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Financial Management Banner */}
      <div className="bg-gradient-to-r from-hospital-900 via-navy-900 to-slate-900 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Finance & Revenue Administration
            </span>
            <span className="text-xs text-slate-400">• Cashier Head: {currentUser?.fullName}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Hospital Billing & Accounts
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Compile outpatient consultations, inpatient room tariffs, medications, and diagnostics. Record simulated and verified payments.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <FilePlus className="w-4 h-4" />
          <span>Create Patient Invoice</span>
        </button>
      </div>

      {/* Simulated Verification Notice */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Simulated Transactions Notice:</strong> In this demo environment, payments collected via Cash, Card POS, or UPI are marked as simulated and tracked in the local financial ledger.
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Gross Invoiced"
          value={`₹${totalBilled.toLocaleString('en-IN')}`}
          subtitle={`${bills.length} total generated invoices`}
          icon={ReceiptText}
          iconBgColor="bg-sky-50"
          iconColor="text-hospital-600"
        />

        <StatCard
          title="Collected Revenue"
          value={`₹${totalCollected.toLocaleString('en-IN')}`}
          subtitle={`${((totalCollected / (totalBilled || 1)) * 100).toFixed(1)}% realization rate`}
          icon={TrendingUp}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatCard
          title="Outstanding Balance"
          value={`₹${totalOutstanding.toLocaleString('en-IN')}`}
          subtitle="Pending desk & insurance claims"
          icon={Clock}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
        />
      </div>

      {/* Filter and Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice INV-id, patient, phone..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-200 font-medium"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Fully Settled (Paid)</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid Invoices</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items / Category</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Collected</th>
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
                    <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
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
                        >
                          Collect
                        </button>
                      )}
                      <button
                        onClick={() => setPrintBill(bill)}
                        className="p-1.5 text-slate-400 hover:text-hospital-600 hover:bg-hospital-50 rounded-lg transition-colors"
                        title="Print / Save PDF"
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
      </div>

      {/* Modals */}
      <CreateBillModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <RecordPaymentModal isOpen={Boolean(paymentBill)} onClose={() => setPaymentBill(null)} bill={paymentBill} />
      <InvoicePrintView isOpen={Boolean(printBill)} onClose={() => setPrintBill(null)} bill={printBill} />
    </div>
  );
};
