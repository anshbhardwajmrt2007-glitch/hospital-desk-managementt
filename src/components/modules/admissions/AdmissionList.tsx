import React, { useState, useMemo } from 'react';
import {
  BedDouble,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
  ReceiptText
} from 'lucide-react';
import { useHospital } from '../../../context/HospitalContext';
import { Admission, AdmissionStatus, BillItem } from '../../../types';
import { Badge, getStatusBadgeVariant } from '../../common/Badge';
import { SearchInput } from '../../common/SearchInput';
import { EmptyState } from '../../common/EmptyState';
import { NewAdmissionModal } from './NewAdmissionModal';
import { DischargeModal } from './DischargeModal';
import { CreateBillModal } from '../billing/CreateBillModal';

export const AdmissionList: React.FC = () => {
  const { admissions, departments, isBedOccupied } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AdmissionStatus>('Admitted');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modals
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [dischargeTarget, setDischargeTarget] = useState<Admission | null>(null);

  // Billing hand-off state
  const [billingAdmission, setBillingAdmission] = useState<{
    admission: Admission;
    items: BillItem[];
  } | null>(null);

  const filteredAdmissions = useMemo(() => {
    return admissions.filter(adm => {
      const matchesSearch =
        adm.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adm.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adm.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adm.attendingDoctorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || adm.status === statusFilter;
      const matchesDept = selectedDept === 'all' || adm.departmentName === selectedDept;

      return matchesSearch && matchesStatus && matchesDept;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }, [admissions, searchQuery, statusFilter, selectedDept]);

  const activeCount = admissions.filter(a => a.status === 'Admitted').length;

  const handleProceedToBilling = (admission: Admission, roomCharges: number, daysStayed: number) => {
    const items: BillItem[] = [
      {
        id: `itm-rm-${Date.now()}`,
        description: `${admission.roomType} Room Rent (${daysStayed} Day(s) @ ₹${admission.dailyRate}/day)`,
        category: 'Room Charges',
        quantity: daysStayed,
        unitPrice: admission.dailyRate,
        total: roomCharges
      },
      {
        id: `itm-doc-${Date.now() + 1}`,
        description: `Consultant Attending Care — ${admission.attendingDoctorName}`,
        category: 'Consultation',
        quantity: daysStayed,
        unitPrice: 800,
        total: daysStayed * 800
      },
      {
        id: `itm-nurse-${Date.now() + 2}`,
        description: 'Inpatient Nursing Care & Vitals Monitoring',
        category: 'Nursing',
        quantity: daysStayed,
        unitPrice: 500,
        total: daysStayed * 500
      }
    ];

    setBillingAdmission({ admission, items });
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inpatient (IPD) Admissions</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              {activeCount} Currently Admitted
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage bed assignments, attending consultant assignments, and inpatient discharge workflows.
          </p>
        </div>

        <button
          onClick={() => setIsAdmitModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-xs"
        >
          <BedDouble className="w-4 h-4" />
          <span>New Admission</span>
        </button>
      </div>

      {/* Bed Occupancy Quick Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { type: 'General Ward', total: 18, occupied: admissions.filter(a => a.status === 'Admitted' && a.roomType === 'General Ward').length, rate: '₹1,800/d' },
          { type: 'Semi-Private', total: 6, occupied: admissions.filter(a => a.status === 'Admitted' && a.roomType === 'Semi-Private').length, rate: '₹3,200/d' },
          { type: 'Private Room', total: 8, occupied: admissions.filter(a => a.status === 'Admitted' && a.roomType === 'Private Room').length, rate: '₹4,500/d' },
          { type: 'ICU Critical Care', total: 4, occupied: admissions.filter(a => a.status === 'Admitted' && a.roomType === 'ICU').length, rate: '₹6,500/d' },
        ].map(bed => (
          <div key={bed.type} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">{bed.type}</span>
              <span className="text-[10px] text-slate-400 font-mono">{bed.rate}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-900 font-mono">
                {bed.occupied} <span className="text-xs text-slate-400 font-normal">/ {bed.total} Beds</span>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                bed.total - bed.occupied <= 1 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {bed.total - bed.occupied} Free
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search patient, ADM-id, room or doctor..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-200 font-medium"
          >
            <option value="all">All Records</option>
            <option value="Admitted">Active Admitted Only</option>
            <option value="Discharged">Discharged Patients</option>
            <option value="Transferred">Transferred</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-200"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredAdmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Admission ID</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Attending Doctor</th>
                  <th className="py-3 px-4">Room & Bed</th>
                  <th className="py-3 px-4">Daily Rate</th>
                  <th className="py-3 px-4">Admitted Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Discharge / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmissions.map(adm => (
                  <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700 whitespace-nowrap">
                      {adm.id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900 block">{adm.patientName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">ID: {adm.patientId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {adm.departmentName}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {adm.attendingDoctorName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900 block">{adm.roomNumber} ({adm.bedNumber})</span>
                      <span className="text-[11px] text-slate-500">{adm.roomType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      ₹{adm.dailyRate}/d
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {adm.admissionDate}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(adm.status)} dot>
                        {adm.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {adm.status === 'Admitted' ? (
                        <button
                          onClick={() => setDischargeTarget(adm)}
                          className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors shadow-xs"
                        >
                          Discharge Patient
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">
                          Discharged {adm.dischargeDate?.split(' ')[0]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No admission records found"
            description="No inpatient records match the selected filter criteria."
            actionLabel="New Admission"
            onAction={() => setIsAdmitModalOpen(true)}
          />
        )}
      </div>

      {/* New Admission Modal */}
      <NewAdmissionModal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
      />

      {/* Discharge Clearance Workflow Modal */}
      <DischargeModal
        isOpen={!!dischargeTarget}
        onClose={() => setDischargeTarget(null)}
        admission={dischargeTarget}
        onProceedToBilling={handleProceedToBilling}
      />

      {/* Invoice Generator Modal (Hand-off from discharge) */}
      {billingAdmission && (
        <CreateBillModal
          isOpen={!!billingAdmission}
          onClose={() => setBillingAdmission(null)}
          preselectedPatientId={billingAdmission.admission.patientId}
          initialItems={billingAdmission.items}
          linkedType="Admission"
          linkedId={billingAdmission.admission.id}
        />
      )}
    </div>
  );
};
