import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AccessDeniedProps {
  requiredRole?: UserRole | UserRole[];
  onBackToDashboard: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRole, onBackToDashboard }) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Access Control Barrier (403)</h3>
        
        <p className="text-xs text-slate-500 leading-relaxed">
          Your account is authenticated as <strong className="text-slate-800">{currentUser?.role}</strong> ({currentUser?.email}). 
          You do not have administrative clearance or clinical authorization to view this protected hospital workspace.
        </p>

        {requiredRole && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono">
            Required Clearance: {Array.isArray(requiredRole) ? requiredRole.join(' | ') : requiredRole}
          </div>
        )}

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-hospital-600 rounded-xl hover:bg-hospital-700 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to My Dashboard</span>
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
