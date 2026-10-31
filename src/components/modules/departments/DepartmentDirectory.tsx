import React from 'react';
import {
  Building2,
  Users,
  CalendarDays,
  Phone,
  MapPin,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useHospital } from '../../../context/HospitalContext';
import { Badge } from '../../common/Badge';

interface DepartmentDirectoryProps {
  onSelectDepartmentForDoctors: (deptName: string) => void;
  onSelectDepartmentForAppointments: (deptName: string) => void;
}

export const DepartmentDirectory: React.FC<DepartmentDirectoryProps> = ({
  onSelectDepartmentForDoctors,
  onSelectDepartmentForAppointments
}) => {
  const { departments, doctors, appointments } = useHospital();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinical & Specialty Departments</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Directory of hospital medical wings, heads of departments, faculty counts, and floor locations.
        </p>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(dept => {
          const deptDoctors = doctors.filter(d => d.departmentId === dept.id || d.departmentName === dept.name);
          const deptAppointmentsToday = appointments.filter(
            a => a.departmentName === dept.name && a.date === todayStr && a.status !== 'Cancelled'
          );

          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-hospital-50 border border-hospital-200 text-hospital-700 flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <Badge variant={dept.active ? 'success' : 'neutral'} size="sm" dot>
                    {dept.active ? 'Operational' : 'Inactive'}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                <p className="text-xs text-hospital-700 font-semibold mt-0.5">
                  Head: {dept.headOfDepartment}
                </p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {dept.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dept.roomFloor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Desk Extension: #{dept.contactExtension}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Doctors</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{deptDoctors.length} Faculty</p>
                  </div>
                  <div className="p-2 bg-hospital-50/60 rounded-xl border border-hospital-100">
                    <span className="text-[10px] uppercase font-bold text-hospital-600">Today's Visits</span>
                    <p className="text-sm font-bold text-hospital-900 mt-0.5">{deptAppointmentsToday.length} Slots</p>
                  </div>
                </div>
              </div>

              {/* Quick links to Doctors and Appointments for this Dept */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <button
                  onClick={() => onSelectDepartmentForDoctors(dept.name)}
                  className="text-hospital-600 hover:text-hospital-700 flex items-center gap-1 hover:underline"
                >
                  <span>View Doctors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSelectDepartmentForAppointments(dept.name)}
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline"
                >
                  <span>Appointments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
