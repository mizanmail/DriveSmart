# DriveSmart Web Admin & Dispatch System (v1.0)

> 🚗 **A comprehensive ride-hailing platform admin panel** with real-time driver tracking, booking management, and dispatch capabilities.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Admin Access](#admin-access)
- [Available Pages](#available-pages)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🌟 Overview

**DriveSmart** is a modern ride-hailing platform admin portal that enables platform administrators to manage users, drivers, bookings, payments, and real-time dispatching. Built with **React 18**, **TypeScript**, and **Supabase**, it features a live map interface powered by **Leaflet** for tracking drivers and managing ride requests.

### Key Highlights
- ✅ **Real-time Dispatch Console** with interactive maps
- ✅ **Driver Application Management** (Approve/Reject)
- ✅ **User Management** (Block/Unblock)
- ✅ **Bookings Dashboard** with status filtering
- ✅ **Payments & Finance Tracking**
- ✅ **System Settings & Pricing Controls**
- ✅ **Row Level Security (RLS)** for secure data access

---

## ✨ Features

### 🔐 Authentication & Authorization
- Supabase Auth integration
- Role-based access control (Admin, Customer, Driver, Vehicle Owner)
- Protected dashboard routes
- Secure Row Level Security policies

### 👥 User Management
- View all registered users
- Block/Unblock user accounts
- Search and filter capabilities
- User profile overview

### 🚙 Driver Management
- Review driver applications
- Approve or reject driver requests
- View driver ratings and ride history
- Track driver status (Pending, Approved, Rejected, Suspended)

### 📍 Dispatch Console
- **Live map visualization** with Leaflet & OpenStreetMap
- Real-time driver location tracking
- Unassigned booking markers
- Driver status popups (name, email, rating, online status)
- Statistics dashboard (online drivers, available drivers, unassigned rides)

### 📅 Bookings Dashboard
- View all ride bookings
- Filter by status (Requested, Searching, Assigned, In Progress, Completed, Cancelled)
- Card-based layout with pickup/drop-off addresses
- Fare and distance information
- Customer and driver details

### 💰 Payments & Finance
- Revenue tracking dashboard
- Payment history with status filtering
- Refund processing (placeholder)
- Transaction details

### ⚙️ System Settings
- **Pricing Configuration**: Base Fare, Per KM, Per Minute
- **Emergency Stop Toggle**: Pause new bookings system-wide
- System status monitoring

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 7
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCN UI (with `slate` base color)
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Maps**: Leaflet + React-Leaflet + OpenStreetMap
- **Utilities**: `clsx`, `tailwind-merge`, `class-variance-authority`

### Backend (BaaS)
- **Platform**: Supabase
- **Database**: PostgreSQL with PostGIS extension
- **Authentication**: Supabase Auth
- **Realtime**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage (planned)

### State Management (Planned)
- **Server State**: TanStack Query (React Query)
- **Local State**: Zustand

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Supabase Account** (free tier works)
- **Git** installed

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mizanmail/DriveSmart.git
cd DriveSmart
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React, ReactDOM, TypeScript
- Vite build tool
- Supabase client
- Tailwind CSS, ShadCN UI
- Leaflet, React-Leaflet
- React Router DOM
- And more...

---

## 🗄️ Database Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Enter project details and wait for it to initialize

### 2. Get Your Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy your:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Run the Database Schema

1. Open **SQL Editor** in your Supabase dashboard
2. Copy the entire content of `database/schema.sql`
3. Paste and click **"Run"**

This will create:
- All database tables (profiles, drivers, vehicles, bookings, payments, admins)
- Enums for user roles and statuses
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for `updated_at` timestamps
- PostGIS extension for geography data

---

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace the values with your actual Supabase credentials from Step 2 of Database Setup.

### 2. Path Aliases

The project uses `@/*` path aliases mapping to `src/`. This is already configured in:
- `vite.config.ts`
- `tsconfig.app.json`
- `components.json` (for ShadCN)

---

## 🎯 Running the Application

### Development Server

```bash
npm run dev
```

The app will start on **http://localhost:5173**

### Production Build

```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
DriveSmart/
├── database/
│   └── schema.sql                 # Complete database schema
├── src/
│   ├── components/
│   │   ├── ui/                    # ShadCN UI components
│   │   └── ProtectedRoute.tsx    # Route protection wrapper
│   ├── layouts/
│   │   └── DashboardLayout.tsx   # Main dashboard layout with sidebar
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client config
│   │   └── utils.ts              # Utility functions (cn helper)
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx         # Login page
│   │   │   └── Signup.tsx        # Signup page
│   │   ├── onboarding/
│   │   │   └── RoleSelection.tsx # Role selection page
│   │   └── dashboard/
│   │       ├── Dashboard.tsx     # Dashboard home
│   │       ├── Users.tsx         # User management
│   │       ├── Drivers.tsx       # Driver management
│   │       ├── DispatchConsole.tsx # Live map dispatch
│   │       ├── Bookings.tsx      # Bookings management
│   │       ├── Payments.tsx      # Payments & finance
│   │       └── Settings.tsx      # System settings
│   ├── App.tsx                   # Main app with routing
│   ├── main.tsx                  # App entry point
│   └── index.css                 # Global styles
├── .env                          # Environment variables
├── tailwind.config.js            # Tailwind configuration
├── vite.config.ts                # Vite configuration
└── README.md                     # This file
```

---

## 👤 Admin Access

To access the admin dashboard, you need to be registered as an admin.

### Step 1: Sign Up

1. Navigate to http://localhost:5173/signup
2. Fill in your details:
   - **Full Name**
   - **Email**
   - **Password** (min 6 characters)
3. Click **"Sign Up"**
4. You'll be redirected to role selection

### Step 2: Make Yourself an Admin

Run this SQL in your Supabase **SQL Editor**:

```sql
-- 1. Find your user ID
SELECT id, email FROM profiles;

-- 2. Insert yourself as admin (replace YOUR_USER_ID with actual UUID)
INSERT INTO admins (id, role) VALUES ('YOUR_USER_ID', 'admin');
```

### Step 3: Login

1. Go to http://localhost:5173/login
2. Enter your credentials
3. You now have full admin access! 🎉

---

## 📄 Available Pages

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Admin login page |
| **Signup** | `/signup` | New user registration |
| **Role Selection** | `/role-selection` | Choose user role |
| **Dashboard Home** | `/dashboard` | Overview & statistics |
| **Users** | `/dashboard/users` | Manage all users |
| **Drivers** | `/dashboard/drivers` | Approve/reject driver applications |
| **Dispatch Console** | `/dashboard/dispatch` | Live map with drivers & bookings |
| **Bookings** | `/dashboard/bookings` | View and manage all bookings |
| **Payments** | `/dashboard/payments` | Financial transactions |
| **Settings** | `/dashboard/settings` | Pricing & system controls |

---

## 🐛 Troubleshooting

### Build Errors

**Issue**: TypeScript errors during build

```bash
# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Errors

**Issue**: "infinite recursion detected in policy for relation 'admins'"

**Solution**: This was caused by circular RLS policies. Already fixed in the schema. Make sure you ran the latest `database/schema.sql`.

**Issue**: "Could not embed because more than one relationship was found"

**Solution**: Already fixed! The Drivers and Bookings queries now fetch related data separately.

### Map Not Showing

**Issue**: Dispatch Console map is blank

**Solutions**:
1. Check your internet connection (OpenStreetMap tiles need internet)
2. Ensure PostGIS extension is enabled in Supabase
3. Add sample driver data with `is_online=true` and `current_location` set

### Environment Variables Not Working

**Issue**: Can't connect to Supabase

**Solution**:
1. Ensure `.env` file is in project root
2. Restart dev server after changing `.env`
3. Variable names must start with `VITE_` for Vite to include them

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## 🎉 Acknowledgments

- **ShadCN UI** for beautiful components
- **Leaflet** for map functionality
- **Supabase** for backend infrastructure
- **Lucide** for icons
- **Tailwind CSS** for styling

---

**Built with ❤️ for DriveSmart**

For questions or support, please open an issue on GitHub.
