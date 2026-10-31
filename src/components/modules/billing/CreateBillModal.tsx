import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { useHospital } from '../../../context/HospitalContext';
import { BillItem } from '../../../types';
import { Plus, Trash2, Calculator, Receipt, AlertCircle } from 'lucide-react';

interface CreateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatientId?: string;
  initialItems?: BillItem[];
  linkedType?: 'Appointment' | 'Admission' | 'Walk-in';
  linkedId?: string;
}

export const CreateBillModal: React.FC<CreateBillModalProps> = ({
  isOpen,
  onClose,
  preselectedPatientId,
  initialItems,
  linkedType = 'Walk-in',
  linkedId
}) => {
  const { patients, settings, createBill } = useHospital();

  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [items, setItems] = useState<BillItem[]>([
    {
      id: 'itm-1',
      description: 'General OPD Consultation Fee',
      category: 'Consultation',
      quantity: 1,
      unitPrice: 700,
      total: 700
    }
  ]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(settings.taxRate || 5);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedPatientId) {
      setPatientId(preselectedPatientId);
    } else if (patients.length > 0) {
      setPatientId(patients[0].id);
    }
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
    }
    setError('');
  }, [preselectedPatientId, initialItems, isOpen, patients]);

  const selectedPatient = patients.find(p => p.id === patientId);

  // Line item manipulation
  const addItem = () => {
    const newItem: BillItem = {
      id: `itm-${Date.now()}`,
      description: 'Diagnostic Lab Test / Investigation',
      category: 'Diagnostics',
      quantity: 1,
      unitPrice: 500,
      total: 500
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof BillItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      }
      return item;
    }));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = Math.round((discountedSubtotal * taxPercent) / 100);
  const grandTotal = discountedSubtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !selectedPatient) {
      setError('Please select a patient.');
      return;
    }
    if (items.length === 0 || subtotal <= 0) {
      setError('Invoice must have at least one valid line item with positive price.');
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    createBill({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientPhone: selectedPatient.phone,
      patientAddress: selectedPatient.address,
      linkedType,
      linkedId,
      invoiceDate: todayDate,
      dueDate: todayDate,
      items,
      subtotal,
      discountPercentage: discountPercent,
      discountAmount,
      taxPercentage: taxPercent,
      taxAmount,
      grandTotal,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Patient Invoice"
      subtitle="Compile consultation, pharmacy, diagnostic and bed charges with taxes & discounts."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Patient Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Billed Patient <span className="text-rose-500">*</span>
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id}) — {p.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Line Items Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Itemized Medical Services & Products
            </label>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-hospital-600 hover:text-hospital-700 bg-hospital-50 hover:bg-hospital-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div className="col-span-3">
                  <select
                    value={item.category}
                    onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Diagnostics">Diagnostics</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Room Charges">Room Charges</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Nursing">Nursing</option>
                  </select>
                </div>

                <div className="col-span-4">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Description..."
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-center"
                    title="Quantity"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-right"
                    title="Unit Price"
                  />
                </div>

                <div className="col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className={`p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors ${
                      items.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-2">
              Discount (%):
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-14 px-1.5 py-0.5 text-xs border border-slate-200 rounded bg-white text-center"
              />
            </span>
            <span className="font-semibold text-rose-600">-₹{discountAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-2">
              GST / Taxes (%):
              <input
                type="number"
                min="0"
                max="28"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))}
                className="w-14 px-1.5 py-0.5 text-xs border border-slate-200 rounded bg-white text-center"
              />
            </span>
            <span className="font-semibold text-slate-800">+₹{taxAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
            <span>Grand Total Due:</span>
            <span className="text-base text-hospital-700">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Billing Notes / Insurance Reference
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. OPD consultation and medication charges"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
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
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Generate Invoice (₹{grandTotal.toLocaleString('en-IN')})
          </button>
        </div>
      </form>
    </Modal>
  );
};
