import React, { useState } from 'react';
import {
  Cross,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  User,
  HeartPulse,
  Building2,
  Calendar,
  Phone,
  MapPin,
  AlertCircle,
  KeyRound,
  Stethoscope,
  Receipt,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHospital } from '../context/HospitalContext';
import { Modal } from '../components/common/Modal';

export const LoginPage: React.FC = () => {
  const { login, registerPatient, requestPasswordReset } = useAuth();
  const { settings } = useHospital();

  // Primary portal mode: 'patient' or 'staff'
  const [portalMode, setPortalMode] = useState<'patient' | 'staff'>('staff');

  // Patient sub-tab: 'login' or 'register'
  const [patientTab, setPatientTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('reception.desk@medidesk.org');
  const [password, setPassword] = useState('desk123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Patient registration form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regAddress, setRegAddress] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState('B+');
  const [regAllergies, setRegAllergies] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Password reset modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setLoginError(res.message);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill and instant login helper
  const handleQuickLogin = async (demoEmail: string, demoPass: string, mode: 'patient' | 'staff') => {
    setPortalMode(mode);
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoginError('');
    setLoading(true);

    try {
      const res = await login(demoEmail, demoPass);
      if (!res.success) {
        setLoginError(res.message);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Patient Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await registerPatient({
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        dob: regDob,
        gender: regGender,
        address: regAddress,
        bloodGroup: regBloodGroup,
        allergies: regAllergies,
        password: regPassword,
        confirmPassword: regConfirmPassword
      });

      if (!res.success) {
        setRegError(res.message);
      } else {
        setRegSuccess(res.message);
        // User will be automatically logged in by registerPatient
      }
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  // Handle Password Reset Request
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    setResetLoading(true);

    try {
      const res = await requestPasswordReset(resetEmail);
      setResetMessage({ text: res.message, isError: !res.success });
    } catch (err: any) {
      setResetMessage({ text: err.message || 'Failed to dispatch reset instructions.', isError: true });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8 selection:bg-hospital-500 selection:text-white relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-hospital-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/50 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 px-4 sm:px-0">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-hospital-600 to-teal-500 text-white shadow-lg mb-3">
            <Cross className="w-8 h-8 rotate-45 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medi<span className="text-hospital-600">Desk</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
            Enterprise Hospital & Healthcare Management System
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {settings.hospitalName} • Multi-Role Healthcare Portal
          </p>
        </div>

        {/* Portal Type Switcher Tabs */}
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1.5 mb-6 max-w-lg mx-auto border border-slate-300/60 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setPortalMode('staff');
              setEmail('reception.desk@medidesk.org');
              setPassword('desk123');
              setLoginError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              portalMode === 'staff'
                ? 'bg-white text-hospital-800 shadow-md shadow-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-hospital-600" />
            <span>Hospital Staff Console</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalMode('patient');
              setPatientTab('login');
              setEmail('aarav.sharma@example.com');
              setPassword('patient123');
              setLoginError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              portalMode === 'patient'
                ? 'bg-white text-hospital-800 shadow-md shadow-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span>Patient & Visitor Portal</span>
          </button>
        </div>

        {/* Portal Body Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/80">
          {/* ================= PATIENT PORTAL ================= */}
          {portalMode === 'patient' && (
            <div>
              {/* Patient sub-tab switch */}
              <div className="flex border-b border-slate-200 pb-3 mb-6 gap-6 justify-center text-sm font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setPatientTab('login');
                    setEmail('aarav.sharma@example.com');
                    setPassword('patient123');
                    setLoginError('');
                  }}
                  className={`pb-1 border-b-2 transition-colors ${
                    patientTab === 'login'
                      ? 'border-hospital-600 text-hospital-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Patient Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPatientTab('register');
                    setRegError('');
                    setRegSuccess('');
                  }}
                  className={`pb-1 border-b-2 transition-colors ${
                    patientTab === 'register'
                      ? 'border-hospital-600 text-hospital-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register as New Patient
                </button>
              </div>

              {/* Patient Sign In Subtab */}
              {patientTab === 'login' && (
                <div>
                  <div className="mb-5 p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-2.5 text-xs text-teal-900">
                    <HeartPulse className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Public Patient & Family Access</p>
                      <p className="text-[11px] text-teal-700 mt-0.5 leading-relaxed">
                        Sign in to book doctor appointments, track consultation schedules, view invoices, download payment receipts, and manage your health records.
                      </p>
                    </div>
                  </div>

                  {loginError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="aarav.sharma@example.com"
                          className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white transition-all text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsResetModalOpen(true)}
                          className="text-xs text-hospital-600 hover:text-hospital-700 font-semibold"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white transition-all text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded text-hospital-600 focus:ring-hospital-500"
                        />
                        <span>Remember patient session</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setPatientTab('register')}
                        className="text-hospital-600 font-semibold hover:underline"
                      >
                        New patient? Register here
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <span>{loading ? 'Authenticating...' : 'Sign In to Patient Portal'}</span>
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </form>

                  {/* Quick Demo Patient Credentials */}
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                      One-Click Demo Patient Account
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('aarav.sharma@example.com', 'patient123', 'patient')}
                      className="w-full p-3 rounded-2xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/60 text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                          AS
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-teal-800">
                            Aarav Sharma <span className="text-[10px] font-semibold text-teal-700 ml-1 bg-teal-100 px-1.5 py-0.5 rounded-md">ID: PAT-1001</span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">aarav.sharma@example.com • Pass: patient123</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                        Sign In <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Patient Self-Registration Subtab */}
              {patientTab === 'register' && (
                <div>
                  <div className="mb-5 p-3 bg-hospital-50 border border-hospital-200 rounded-2xl flex items-start gap-2.5 text-xs text-hospital-900">
                    <UserCheck className="w-4 h-4 text-hospital-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Public Patient Self-Registration</p>
                      <p className="text-[11px] text-hospital-700 mt-0.5 leading-relaxed">
                        Create an account to book consultations directly without waiting in hospital desk lines. A unique Patient ID will be generated automatically.
                      </p>
                    </div>
                  </div>

                  {regError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {regSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{regSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Full Legal Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="e.g. Maya Deshmukh"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="maya.d@example.com"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          required
                          value={regDob}
                          onChange={(e) => setRegDob(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Gender *
                        </label>
                        <select
                          value={regGender}
                          onChange={(e) => setRegGender(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white text-slate-900"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Residential Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="Street, Apartment, City, Postal Code"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Blood Group (Optional)
                        </label>
                        <select
                          value={regBloodGroup}
                          onChange={(e) => setRegBloodGroup(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white text-slate-900"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Known Allergies / Pre-existing Conditions
                        </label>
                        <input
                          type="text"
                          value={regAllergies}
                          onChange={(e) => setRegAllergies(e.target.value)}
                          placeholder="e.g. Penicillin, Asthma, or None"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Create Password (min 6 chars) *
                        </label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full mt-3 py-3 px-4 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-hospital-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <span>{regLoading ? 'Registering Patient Record...' : 'Complete Registration & Access Portal'}</span>
                      {!regLoading && <ArrowRight className="w-4 h-4" />}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setPatientTab('login')}
                        className="text-xs text-hospital-600 hover:text-hospital-700 font-semibold"
                      >
                        Already have an account? Sign in
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ================= HOSPITAL STAFF PORTAL ================= */}
          {portalMode === 'staff' && (
            <div>
              {/* Security Advisory */}
              <div className="mb-6 p-3 bg-hospital-50 border border-hospital-200 rounded-2xl flex items-start gap-2.5 text-xs text-hospital-800">
                <ShieldAlert className="w-4 h-4 text-hospital-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Authorized Healthcare Personnel Only</p>
                  <p className="text-[11px] text-hospital-700 mt-0.5 leading-relaxed">
                    Role-based access control (RBAC) enforced. All clinical logins and administrative actions are logged in the audit trail.
                  </p>
                </div>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Hospital Staff Email ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="reception.desk@medidesk.org"
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white transition-all text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Staff Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(true)}
                      className="text-xs text-hospital-600 hover:text-hospital-700 font-semibold"
                    >
                      Reset Password
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white transition-all text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-hospital-600 focus:ring-hospital-500"
                    />
                    <span>Remember staff session</span>
                  </label>
                  <span className="text-hospital-600 font-semibold text-xs">
                    Protected Hospital Intranet
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-hospital-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span>{loading ? 'Authenticating Staff...' : 'Authenticate & Enter Workspace'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* 6 Staff Roles One-Click Demo Credentials */}
              <div className="mt-7 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    One-Click Demo Staff Accounts
                  </span>
                  <span className="text-[10px] text-slate-400">Click to instantly log in</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Desk Admin */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('reception.desk@medidesk.org', 'desk123', 'staff')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-hospital-50 hover:border-hospital-300 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <p className="font-bold text-slate-800">Desk Admin</p>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">Priya Deshmukh</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">reception.desk@medidesk.org</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-hospital-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>

                  {/* Doctor */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('dr.aswami@medidesk.org', 'doctor123', 'staff')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="font-bold text-slate-800">Doctor</p>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">Dr. Ananya Swaminathan</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">dr.aswami@medidesk.org</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>

                  {/* Chief Doctor */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('dr.rnair@medidesk.org', 'chief123', 'staff')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <p className="font-bold text-slate-800">Chief Doctor</p>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">Dr. Rajesh Nair (CMO)</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">dr.rnair@medidesk.org</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>

                  {/* Billing Head */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('billing.head@medidesk.org', 'billing123', 'staff')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <p className="font-bold text-slate-800">Billing Head</p>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">Vikram Sharma</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">billing.head@medidesk.org</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>

                  {/* Head Nurse */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('nurse.head@medidesk.org', 'nurse123', 'staff')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-pink-50 hover:border-pink-300 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        <p className="font-bold text-slate-800">Head Nurse</p>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">Sister Mary Joseph</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">nurse.head@medidesk.org</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>

                  {/* Hospital Manager */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('manager@medidesk.org', 'manager123', 'staff')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <p className="font-bold text-slate-800">Hospital Manager</p>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">Sunil Verma (Admin)</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">manager@medidesk.org</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          MediDesk Hospital OS • PBKDF2 Web Crypto Salted Hashes • Row Level Security Enabled
        </p>
      </div>

      {/* Password Reset Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetMessage(null);
        }}
        title="Simulated Password Recovery"
        maxWidth="sm"
      >
        <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Enter your account email. If the email is registered in MediDesk, a secure password reset link will be dispatched.
          </p>

          {resetMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                resetMessage.isError
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {resetMessage.isError ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{resetMessage.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Account Email
            </label>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="e.g. user@medidesk.org"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsResetModalOpen(false);
                setResetMessage(null);
              }}
              className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={resetLoading}
              className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60"
            >
              {resetLoading ? 'Dispatching...' : 'Send Recovery Instructions'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};