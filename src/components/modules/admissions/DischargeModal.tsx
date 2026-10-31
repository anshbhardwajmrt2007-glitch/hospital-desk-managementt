import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Admission } from '../../../types';
import { useHospital } from '../../../context/HospitalContext';
import { CheckCircle, Calculator, FileText } from 'lucide-react';

interface DischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  admission: Admission | null;
  onProceedToBilling: (admission: Admission, calculatedRoomCharges: number, daysStayed: number) => void;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({
  isOpen,
  onClose,
  admission,
  onProceedToBilling
}) => {
  const { dischargePatient } = useHospital();

  const [dischargeSummary, setDischargeSummary] = useState(
    'Patient clinically stable, hemodynamically normal. Discharged in satisfactory condition with oral medications and follow-up advice in 7 days.'
  );
  const [dischargeDate, setDischargeDate] = useState(
    new Date().toISOString().replace('T', ' ').substring(0, 16)
  );

  if (!admission) return null;

  // Calculate days stayed
  const admTime = new Date(admission.admissionDate).getTime();
  const disTime = new Date(dischargeDate).getTime();
  const diffDays = Math.max(1, Math.ceil((disTime - admTime) / (1000 * 60 * 60 * 24)));
  const roomCharges = diffDays * admission.dailyRate;

  const handleDischargeOnly = () => {
    dischargePatient(admission.id, dischargeSummary, dischargeDate);
    onClose();
  };

  const handleDischargeAndBill = () => {
    dischargePatient(admission.id, dischargeSummary, dischargeDate);
    onProceedToBilling(admission, roomCharges, diffDays);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Patient Discharge Clearance — ${admission.patientName}`}
      subtitle={`Admission ID: ${admission.id} • Room: ${admission.roomNumber} (${admission.bedNumber})`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Stay Summary Card */}
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Inpatient Stay Calculation</span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-200 text-purple-900 rounded-full">
              {admission.roomType}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs mt-3">
            <div>
              <span className="text-slate-500">Admitted At:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{admission.admissionDate}</p>
            </div>
            <div>
              <span className="text-slate-500">Total Duration:</span>
              <p className="font-bold text-purple-900 text-sm mt-0.5">{diffDays} Day(s)</p>
            </div>
            <div>
              <span className="text-slate-500">Room Total:</span>
              <p className="font-extrabold text-purple-900 text-base mt-0.5">₹{roomCharges.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Discharge Date & Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Discharge Date & Time
          </label>
          <input
            type="text"
            value={dischargeDate}
            onChange={(e) => setDischargeDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
          />
        </div>

        {/* Clinical Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Clinical Discharge Summary & Advice <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={dischargeSummary}
            onChange={(e) => setDischargeSummary(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDischargeOnly}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Mark Discharged Only
            </button>
            <button
              type="button"
              onClick={handleDischargeAndBill}
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Discharge & Generate Final Bill</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
