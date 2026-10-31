import React, { useState, useMemo } from 'react';
import {
  UserRoundCheck,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  CalendarPlus,
  Grid,
  List
} from 'lucide-react';
import { useHospital } from '../../../context/HospitalContext';
import { Doctor, DoctorAvailability } from '../../../types';
import { Badge, getStatusBadgeVariant } from '../../common/Badge';
import { SearchInput } from '../../common/SearchInput';
import { EmptyState } from '../../common/EmptyState';
import { DoctorModal } from './DoctorModal';
import { DoctorProfileModal } from './DoctorProfileModal';

interface DoctorDirectoryProps {
  onBookAppointment: (doctorId: string) => void;
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({ onBookAppointment }) => {
  const { doctors, departments, toggleDoctorAvailability, activeDepartmentFilter } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(activeDepartmentFilter || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
  const [profileDoctor, setProfileDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.qualification.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'all' || d.departmentName === selectedDept;
      const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [doctors, searchQuery, selectedDept, selectedStatus]);

  const availableCount = doctors.filter(d => d.status === 'Available').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Consulting Doctors Directory</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {availableCount} Available Now
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage clinical specialist credentials, OPD consultation schedules, and availability statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Card / Table toggle */}
          <div className="flex items-center bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={() => {
              setDoctorToEdit(null);
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-hospital-600 rounded-xl hover:bg-hospital-700 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search doctor, specialization, OPD room..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
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

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-200"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="In Consultation">In Consultation</option>
            <option value="On Leave">On Leave</option>
            <option value="Off Duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* Content: Cards or Table */}
      {viewMode === 'cards' ? (
        filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDoctors.map(doctor => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-hospital-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                      {doctor.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <Badge variant={getStatusBadgeVariant(doctor.status)} size="sm" dot>
                      {doctor.status}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{doctor.name}</h3>
                  <p className="text-[11px] font-medium text-hospital-700 mt-0.5">{doctor.qualification}</p>
                  <p className="text-xs text-slate-600 mt-1 font-semibold">{doctor.specialization}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{doctor.departmentName} • {doctor.opdRoom}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consultation Fee:</span>
                      <span className="font-bold text-slate-900 font-mono">₹{doctor.consultationFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">OPD Timings:</span>
                      <span className="font-medium text-slate-700">{doctor.availableHours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Days:</span>
                      <span className="text-[11px] text-slate-600 truncate max-w-[150px]">
                        {doctor.availableDays.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleDoctorAvailability(doctor.id)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    title="Toggle Available / On Leave"
                  >
                    {doctor.status === 'Available' ? 'Mark Leave' : 'Set Available'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setProfileDoctor(doctor)}
                      className="p-1.5 text-slate-400 hover:text-hospital-600 hover:bg-hospital-50 rounded-lg transition-colors"
                      title="View Schedule & Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDoctorToEdit(doctor);
                        setIsAddOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Doctor Info"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onBookAppointment(doctor.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-hospital-600 hover:bg-hospital-700 rounded-lg transition-colors shadow-xs"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No doctors found"
            description="No doctors match the selected department or query criteria."
            actionLabel="Add Doctor"
            onAction={() => {
              setDoctorToEdit(null);
              setIsAddOpen(true);
            }}
          />
        )
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Doctor ID</th>
                  <th className="py-3 px-4">Doctor Name</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">OPD Room</th>
                  <th className="py-3 px-4">Fee (₹)</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map(doctor => (
                  <tr key={doctor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-hospital-700 whitespace-nowrap">
                      {doctor.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {doctor.name}
                      <span className="text-[11px] text-slate-400 block font-normal">{doctor.qualification}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {doctor.specialization}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {doctor.departmentName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap font-medium">
                      {doctor.opdRoom}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      ₹{doctor.consultationFee}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {doctor.availableHours}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(doctor.status)} dot>
                        {doctor.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setProfileDoctor(doctor)}
                          className="p-1.5 text-slate-400 hover:text-hospital-600 hover:bg-hospital-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDoctorToEdit(doctor);
                            setIsAddOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onBookAppointment(doctor.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-hospital-600 hover:bg-hospital-700 rounded-lg"
                        >
                          Book
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      <DoctorModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setDoctorToEdit(null);
        }}
        doctorToEdit={doctorToEdit}
      />

      {/* Doctor Profile Modal */}
      <DoctorProfileModal
        isOpen={!!profileDoctor}
        onClose={() => setProfileDoctor(null)}
        doctor={profileDoctor}
        onBookAppointment={onBookAppointment}
      />
    </div>
  );
};
