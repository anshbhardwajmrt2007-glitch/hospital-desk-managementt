import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { useHospital } from '../../../context/HospitalContext';
import { Patient, BloodGroup, Gender } from '../../../types';
import { SearchInput } from '../../common/SearchInput';
import { EmptyState } from '../../common/EmptyState';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { PatientModal } from './PatientModal';
import { PatientProfileModal } from './PatientProfileModal';

interface PatientListProps {
  onBookAppointment: (patientId: string) => void;
  onAdmitPatient: (patientId: string) => void;
  onCreateBill: (patientId: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  onBookAppointment,
  onAdmitPatient,
  onCreateBill
}) => {
  const { patients, deletePatient } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [profilePatient, setProfilePatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  // Filtered & Sorted patients
  const filteredPatients = useMemo(() => {
    return patients
      .filter(p => {
        const matchesQuery =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery) ||
          p.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGender = selectedGender === 'all' || p.gender === selectedGender;
        const matchesBlood = selectedBloodGroup === 'all' || p.bloodGroup === selectedBloodGroup;
        return matchesQuery && matchesGender && matchesBlood;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'id') {
          comparison = a.id.localeCompare(b.id);
        } else {
          comparison = new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [patients, searchQuery, selectedGender, selectedBloodGroup, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: 'name' | 'id' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Patient Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage comprehensive electronic medical intake records, demographics, and registration histories.
          </p>
        </div>
        <button
          onClick={() => {
            setPatientToEdit(null);
            setIsRegisterOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-hospital-600 rounded-xl hover:bg-hospital-700 transition-colors shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search name, PAT-id, or mobile number..."
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => {
              setSelectedGender(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-200"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {/* Blood Group Filter */}
          <select
            value={selectedBloodGroup}
            onChange={(e) => {
              setSelectedBloodGroup(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-200 font-medium"
          >
            <option value="all">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          {/* Reset Filters shortcut */}
          {(searchQuery || selectedGender !== 'all' || selectedBloodGroup !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGender('all');
                setSelectedBloodGroup('all');
                setCurrentPage(1);
              }}
              className="text-xs text-hospital-600 hover:text-hospital-700 font-semibold px-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {paginatedPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => toggleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Patient ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Full Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4 text-center">Blood</th>
                  <th className="py-3 px-4">Emergency Contact</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => toggleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Registered</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-hospital-700 whitespace-nowrap">
                      {patient.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <button
                        onClick={() => setProfilePatient(patient)}
                        className="hover:text-hospital-600 hover:underline text-left"
                      >
                        {patient.name}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {patient.gender}, {patient.age} yrs
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {patient.phone}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60 font-mono">
                        {patient.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{patient.emergencyContact.name}</span>
                      <span className="text-slate-400 text-[11px] block">{patient.emergencyContact.relationship}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(patient.registrationDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setProfilePatient(patient)}
                          className="p-1.5 text-slate-400 hover:text-hospital-600 hover:bg-hospital-50 rounded-lg transition-colors"
                          title="View 360° Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPatientToEdit(patient);
                            setIsRegisterOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPatientToDelete(patient)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
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
            title="No matching patients found"
            description="Try modifying your search terms or filter criteria, or register a new patient."
            actionLabel="Register Patient"
            onAction={() => {
              setPatientToEdit(null);
              setIsRegisterOpen(true);
            }}
          />
        )}

        {/* Pagination Bar */}
        {filteredPatients.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * itemsPerPage, filteredPatients.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{filteredPatients.length}</span> patients
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Register / Edit Modal */}
      <PatientModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setPatientToEdit(null);
        }}
        patientToEdit={patientToEdit}
      />

      {/* Patient Profile 360 Modal */}
      <PatientProfileModal
        isOpen={!!profilePatient}
        onClose={() => setProfilePatient(null)}
        patient={profilePatient}
        onBookAppointment={onBookAppointment}
        onAdmitPatient={onAdmitPatient}
        onCreateBill={onCreateBill}
      />

      {/* Delete Patient Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        onConfirm={() => {
          if (patientToDelete) {
            deletePatient(patientToDelete.id);
            setPatientToDelete(null);
          }
        }}
        title="Remove Patient Record?"
        message={`Are you sure you want to delete the intake file for ${patientToDelete?.name} (${patientToDelete?.id})? This action will remove their record from the local demonstration system.`}
        confirmLabel="Delete Patient"
        isDestructive={true}
      />
    </div>
  );
};
