# 🏥 MediDesk — Enterprise Hospital & Healthcare Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployment_Ready-black?logo=vercel)](https://vercel.com/)
[![Supabase Ready](https://img.shields.io/badge/Supabase-PostgreSQL_RLS-3ecf8e?logo=supabase)](https://supabase.com/)
[![Security: PBKDF2](https://img.shields.io/badge/Auth-PBKDF2_Salted_Hashes-emerald)](#-security-rbac--row-level-security-rls)

**MediDesk** is an enterprise-grade, multi-role hospital management platform designed for public patient portals, outpatient departments (OPD), inpatient wards (IPD), clinical consultations, nursing stations, financial administration, and hospital operations.

Built with clean healthcare SaaS ergonomics (crisp white backgrounds, medical blue, teal, and navy accents), it provides strict Role-Based Access Control (RBAC), Row-Level Security (RLS), and Web Crypto salted password hashing.

---

## 🌟 Architecture & Seven User Roles

MediDesk implements **seven distinct, isolated user roles**. Every account has an authenticated role, and users are automatically directed to their specialized workspace after logging in:

| # | User Role | Authenticated Persona | Email | Demo Password | Core Responsibilities & Clearance |
|---|---|---|---|---|---|
| 1 | **PATIENT** | Aarav Sharma | `aarav.sharma@example.com` | `patient123` | Public portal, self-registration, booking appointments, viewing own invoices & receipts, profile, notifications. |
| 2 | **DESK_ADMIN** | Priya Deshmukh | `reception.desk@medidesk.org` | `desk123` | Reception desk, walk-in registrations, appointment scheduling, token issuing, admissions, waiting queues. |
| 3 | **CHIEF_DOCTOR** | Dr. Rajesh Nair (MD) | `dr.rnair@medidesk.org` | `chief123` | CMO console, doctor workload supervision, turnaround times, clinical audits, department monitoring. |
| 4 | **DOCTOR** | Dr. Arvind Swaminathan | `dr.aswami@medidesk.org` | `doctor123` | Clinical consultations, diagnosis, prescriptions, electronic medical notes, patient appointment history. |
| 5 | **BILLING_HEAD** | Vikram Sharma | `billing.head@medidesk.org` | `billing123` | Invoices, itemized charges, payment collection (UPI, Card, Cash), outstanding balances, revenue analytics. |
| 6 | **HEAD_NURSE** | Sister Mary Joseph | `nurse.head@medidesk.org` | `nurse123` | Ward bed management, patient vital sign logs, nursing tasks queue (medication, vitals, IV fluids), shift rosters. |
| 7 | **HOSPITAL_MANAGER** | Sunil Verma | `manager@medidesk.org` | `manager123` | Executive oversight, staff account provisioning (RBAC), immutable audit trail inspection, system settings. |

---

## 🛡️ Security, RBAC & Row-Level Security (RLS)

- **No Dropdown Privilege Escalation**: Role switching via client dropdowns is strictly prohibited. Access is verified through authenticated credentials and cryptographic password verification.
- **Client-Side PBKDF2 Web Crypto**: Passwords are never stored in plaintext. They are salted with cryptographically secure random 16-byte salts and hashed using PBKDF2-HMAC-SHA256 (10,000 iterations).
- **Patient Privacy & RLS**: Patients can **only** query and view their own personal profile, appointments, and bills. Access to other patients' records or clinical notes is rejected at the data layer.
- **Clinical Confidentiality**: Desk Administrators and Billing Heads cannot view confidential clinical notes or doctor diagnoses.
- **Administrative Clearance**: Only the `HOSPITAL_MANAGER` can provision staff accounts and view the tamper-evident audit logs.
- **PostgreSQL / Supabase Schema**: A production-grade SQL migration file (`supabase/migrations/20261031_initial_multirole_schema.sql`) provides PostgreSQL Row Level Security (RLS) policies and triggers for all 17 tables.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+ or v20+
- npm v9+

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The application will be live at:
```
http://localhost:3000/
```

### Production Build & Type Checking
```bash
npm run build
```
Compiles with `tsc` and bundles through Vite with zero TypeScript or bundling errors.

To preview the production build locally:
```bash
npm run preview
```

---

## 📦 GitHub Preparation & Publishing

The repository is configured with a strict `.gitignore` that safely excludes `node_modules`, `dist`, `.env*` files, and private secrets.

### 1. Initialize Git and Stage Files
```bash
git init
git add .
git commit -m "feat: complete MediDesk multi-user hospital management platform"
```

### 2. Push to GitHub
```bash
# Set default branch
git branch -M main

# Link to your new empty GitHub repository
git remote add origin https://github.com/<your-github-username>/medidesk.git

# Push
git push -u origin main
```

---

## 🌐 Vercel Deployment Guide

MediDesk includes a preconfigured `vercel.json` file that manages SPA route rewrites (`/(.*) -> /index.html`) and static asset caching.

### Option A: Deploy via Vercel Web Dashboard (Recommended)

1. Push your repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com/) and sign in.
3. Click **"Add New..."** ➔ **"Project"**.
4. Select your **`medidesk`** GitHub repository and click **"Import"**.
5. Vercel automatically detects the project settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. *(Optional)* Expand **Environment Variables** if connecting Supabase (see section below).
7. Click **"Deploy"**.
8. In ~30-45 seconds, your live production URL (e.g. `https://medidesk.vercel.app`) will be ready.

### Option B: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Log in to Vercel
vercel login

# 3. Deploy preview
vercel

# 4. Deploy production
vercel --prod
```

---

## 🔑 Environment Variables Configuration

MediDesk is designed to work immediately upon deployment in **zero-config mode** (using built-in Web Storage with PBKDF2 hashing). If you wish to connect an external Supabase PostgreSQL database:

| Environment Variable | Description | Required? | Example |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Optional | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public anonymous client API key | Optional | `eyJhbGciOi...` |

### Safe Configuration on Vercel:
1. In your Vercel Project Dashboard, navigate to **Settings** ➔ **Environment Variables**.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Check the environments: **Production**, **Preview**, **Development**.
4. Click **Save** and trigger a redeployment.

> **Security Warning:**
> - Never add Supabase `service_role` keys or database master passwords to frontend environment variables.
> - Only public `anon` keys prefixed with `VITE_` are safe for frontend client exposure.

---

## 💻 Module Overview

### 1. Public Patient Portal
- **Self-Registration**: Public intake form collecting Full Name, Email, Phone, DOB, Gender, Address, Blood Group, Allergies, and password. Auto-assigns unique `PAT-XXXX` identifier.
- **Appointment Booking Wizard**: 5-step wizard to select department, available doctor, date, and conflict-checked time slot. Generates reference number (e.g., `MD-APT-2024-XXXX`).
- **My Invoices & Receipts**: View billing history, outstanding balances, and print official invoices via browser print dialog.
- **My Profile**: Update personal information and change password.

### 2. Front Desk Admin Console
- **Walk-in Registrations**: Register arrivals instantly.
- **OPD Queue Engine**: Issue digital queue tokens (`T-01`, `T-02`) with wait-time estimation based on average consultation durations.
- **Bed Coordination**: Assign available beds across General Ward, Semi-Private, Private, and ICU.

### 3. Doctor Consultation Console
- **Queue Calling**: Summon next waiting patient into the consultation room.
- **Electronic Health Record (EHR)**: Record symptoms, diagnosis, treatment plans, follow-up advice, and itemized prescriptions (dosage, frequency, duration).
- **Schedule Toggle**: Set availability status (`Available`, `In Consultation`, `On Leave`).

### 4. Chief Medical Officer (CMO) Console
- **Workload Supervision**: Active consultations, doctor caseload distribution, and departmental throughput.
- **Delay Monitoring**: Real-time alerts for patients waiting over 30 minutes.

### 5. Billing & Revenue Head Console
- **Itemized Invoicing**: Consultation fees, diagnostics, pharmacy, inpatient bed charges, and procedures with automated GST and discounts.
- **Payment Collection**: Record payments via UPI, Card, Cash, or Net Banking with reference tracking.
- **Print View**: Clean, printable tax invoices with hospital credentials.

### 6. Head Nurse Station
- **Ward Occupancy Board**: Real-time visual tracking of occupied vs available beds across floors.
- **Nursing Care Tasks**: Task management for medication administration, vitals check, wound dressings, and IV fluids with priority flagging.
- **Vitals Sign Tracker**: Record and inspect systolic/diastolic BP, pulse rate, temperature (°F), SpO2 (%), and respiratory rates.

### 7. Hospital Manager Executive Console
- **Executive KPIs**: Hospital census, revenue collections, doctor utilization, and bed occupancy.
- **Staff Provisioning (RBAC)**: Secure interface to create and provision staff accounts with assigned roles and initial credentials.
- **Tamper-Evident Audit Logs**: Comprehensive audit log recording timestamp, user ID, role, action, resource, and details.
- **Hospital Configuration**: Update operating hours, OPD slot durations, GST rates, and hospital information.

---

## 🗄️ Database & Schema

MediDesk is built with a repository engine that operates smoothly offline in demo mode via Web Storage, and can instantly link to Supabase PostgreSQL:

```bash
# Supabase environment variables (.env)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The migration script in `supabase/migrations/20261031_initial_multirole_schema.sql` defines:
- `user_profiles` & `staff_profiles`
- `patients`, `doctors`, `departments`
- `appointments`, `clinical_notes`, `prescriptions`
- `queue_tokens`, `admissions`, `beds`
- `invoices`, `invoice_items`, `payment_records`
- `nursing_tasks`, `vitals_logs`
- `audit_logs`, `hospital_settings`
- Row-Level Security (RLS) policies for each table ensuring strict isolation.

---

## 📄 License & Disclaimer

This project is created as an enterprise healthcare demonstration and administrative operating system. Medical data included in demo seeds is fictional and intended for testing and demonstration purposes.
