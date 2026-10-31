import React, { useState } from 'react';
import {
  Settings,
  Building,
  Clock,
  IndianRupee,
  ShieldAlert,
  RotateCcw,
  Save,
  Download,
  Upload,
  User,
  CheckCircle2
} from 'lucide-react';
import { useHospital } from '../../../context/HospitalContext';
import { useAuth } from '../../../context/AuthContext';
import { ConfirmDialog } from '../../common/ConfirmDialog';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoData, patients, doctors, appointments, queue, admissions, bills } = useHospital();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const exportJSON = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      settings: formData,
      patients,
      doctors,
      appointments,
      queue,
      admissions,
      bills
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medidesk-hospital-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hospital & Desk Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure hospital identity, clinical OPD slot durations, queue algorithms, and local demo storage.
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Settings successfully saved and persisted to local storage!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hospital Entity Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-hospital-600" />
            <h3 className="text-sm font-bold text-slate-900">Hospital Profile & Legal Entity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hospital Full Name
              </label>
              <input
                type="text"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hospital Tagline / Motto
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Registration / NABH License No.
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Main Reception Landline
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency 24x7 Hotline
              </label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Desk Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Address & Campus Location
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PIN / Postal Code</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Operational & Regional Settings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-5 h-5 text-hospital-600" />
            <h3 className="text-sm font-bold text-slate-900">OPD Operations & Regional Standards</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Working Hours
              </label>
              <input
                type="text"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Slot Duration
              </label>
              <select
                value={formData.slotDurationMinutes}
                onChange={(e) => setFormData({ ...formData, slotDurationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 bg-white"
              >
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Queue Wait Calculation (Mins/Patient)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={formData.avgConsultationMinutes}
                onChange={(e) => setFormData({ ...formData, avgConsultationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Currency
              </label>
              <input
                type="text"
                value="INR (₹)"
                disabled
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Date Format
              </label>
              <input
                type="text"
                value="DD/MM/YYYY"
                disabled
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Medical GST / Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="28"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Data Persistence & Export */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldAlert className="w-5 h-5 text-hospital-600" />
            <h3 className="text-sm font-bold text-slate-900">Demo Storage & Export</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            All records in this demonstration are saved into your browser's local HTML5 storage. You can backup all records to a JSON file on your machine or restore default initial seeds anytime.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={exportJSON}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Records (JSON Backup)</span>
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-hospital-600 hover:bg-hospital-700 rounded-xl transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Hospital Settings</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetDemoData}
        title="Reset Entire MediDesk Dataset?"
        message="This will re-initialize all 20 patients, 8 doctors, 15 appointments, active admissions, queue tokens, and bills back to the original seed state. Local storage will be refreshed."
        confirmLabel="Reset Everything"
        cancelLabel="Keep Current Changes"
        isDestructive={true}
      />
    </div>
  );
};
