# **📌 Product Requirements Document (PRD)**

**Project:** DriveSmart — Web Admin & Dispatch System (v1.0)  
**Type:** Web Application (Admin + Dispatcher + Analytics)  
**Target Audience:** Admins, Dispatchers, Support Agents, Finance Analysts  

---

### **D. Super Admin (Platform Guardian)**
*   **Role:** The highest authority responsible for platform maintenance.
*   **Responsibilities:**
    *   **User Management:** Oversee all Customers, Drivers, and Vehicle Owners.
    *   **Verification:** Approve driver identities and vehicle documents.
    *   **Operations:** Handle complaints, monitor system health, and ensure fair dispatching.

## **3. User Onboarding Flow**
1.  **Unified Sign Up:** All users start with a verified phone/email.
2.  **Role Selection:**
    *   **"I need a ride"** -> Becomes **Customer**.
    *   **"I want to drive (No Vehicle)"** -> Becomes **Non-vehicle Driver** (Fleet).
    *   **"I have a vehicle"** -> Becomes **Vehicle-Owner Driver**.
3.  **Personalization:** System grants permissions and dashboard features based on this choice.


### **A. Customers (Ride-Seekers)**
*   **Goal:** Request reliable transportation from point A to B.
*   **Key Features:** easy booking, fare estimation, safe payments, ride tracking.

### **B. Non-vehicle Drivers (The Workforce)**
*   **Profile:** Skilled professionals who do *not* own a vehicle.
*   **Goal:** Receive driving assignments and earn a livelihood.
*   **Key Needs:** Job availability, vehicle assignment, transparent payout.

### **C. Vehicle-Owner Drivers (The Providers)**
*   **Profile:** Individuals who own one or more vehicles.
*   **Role Flexibility (Hybrid):**
    1.  **Owner-Operator:** Drives their own vehicle.
    2.  **Asset Provider:** Rents out vehicle(s) to Non-vehicle Drivers (passive income).
*   **Key Needs:** Asset tracking, earnings sharing, driver assignment management.


## **1. Overview & Vision**

**DriveSmart** is a ride-booking ecosystem connecting passengers with drivers. A mobile MVP (React Native + Supabase) already exists for users and drivers. This PRD defines the **Web Platform** (v1.0) designed to manage, control, and analyze the entire system.

### **The Vision: Bridging Opportunity and Skill**
The core purpose of DriveSmart is to **create employment opportunities** for individuals who possess driving skills but lack financial resources. The platform acts as a bridge:
*   **Non-vehicle Drivers** (Skill) get jobs.
*   **Vehicle Owners** (Resources) monetize their idle assets.
*   **Customers** get reliable rides.

### **Core Objectives**
1.  **Employment Creation:** Empower skilled drivers to earn without owning a car.
2.  **Asset Utilization:** Allow vehicle owners to share earnings by letting others drive.
3.  **Operational Control:** Admin panel to manage these pairings/assignments.

---

## **2. Scope**

### **A. Admin Portal**
For super-users to configure the system, pricing, and staff access.

### **B. Dispatcher / Operations Panel**
For real-time monitoring of active bookings, driver locations, and ride status handling.

### **C. Analytics Dashboard**
High-level metrics on revenue, user growth, and system health.

**Out of Scope for v1:**
*   **New Mobile App Features:** We are not building the mobile app, only the admin panel.
*   **Automated AI Matching:** Manual dispatch first.
*   **Driver Payouts Automation:** Manual payouts first.

---

## **3. Tech Stack**

### **Frontend**
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + ShadCN UI (for consistent, premium admin look)
*   **State Management:** React Query (TanStack Query) for server state; Zustand for local state if needed.
*   **Maps:** Mapbox GL JS or Google Maps JavaScript API (Subject to API Key availability).

### **Backend (BaaS)**
*   **Platform:** Supabase
*   **Auth:** Supabase Auth (Email/Password for Admins, Phone for Mobile Users).
*   **Database:** PostgreSQL.
*   **Realtime:** Supabase Realtime (for live ride tracking).
*   **Storage:** Supabase Storage (Driver documents, avatars).

---

## **4. Data Architecture (Schema & Models)**

*Note: Must align with existing Mobile MVP Schema.*

### **4.1 Core Tables (Proposed)**

| Table Name | Description | Key Columns (Proposed) |
| :--- | :--- | :--- |
| **`users`** | End customers | `id`, `email`, `phone`, `full_name`, `avatar_url`, `is_blocked`, `created_at` |
| **`drivers`** | Verified drivers | `id` (FK to auth), `status` (pending/approved/rejected), `license_number`, `rating`, `is_online`, `current_location` (PostGIS point) |
| **`admins`** | Dashboard users | `id` (FK to auth), `email`, `role` (admin/dispatcher/support/finance), `created_at` |
| **`bookings`** | Ride transactions | `id`, `user_id`, `driver_id`, `status`, `pickup_lat/lng`, `drop_lat/lng`, `fare_amount`, `scheduled_time` |
| **`vehicles`** | User vehicles | `id`, `user_id`, `make`, `model`, `plate_number` |
| **`documents`** | Compliance docs | `id`, `driver_id`, `type` (license/insurance), `url`, `status` (verified/rejected) |
| **`payments`** | Financial records | `id`, `booking_id`, `amount`, `status` (pending/paid/refunded), `payment_method` |

### **4.2 Enums & Types**
*   **`booking_status`**: `requested`, `searching`, `assigned`, `arrived`, `in_progress`, `completed`, `cancelled`.
*   **`admin_role`**: `admin`, `dispatcher`, `support`, `finance`.

---

## **5. Feature Modules**

### **5.1 Authentication & RBAC**
*   **Login:** Email/Password implementation for Dashboard staff.
*   **Role-Based Access Control (RBAC):**
    *   **Admin:** Full access to all modules.
    *   **Dispatcher:** Access to Live Map, Bookings, Driver Status. Read-only on Finance.
    *   **Support:** Access to Users, Drivers, Complaints. No access to Finance or Settings.
    *   **Finance:** Access to Payments, Analytics. Read-only on Rides.

### **5.2 User Management**
*   **List View:** Sortable table of all users.
*   **Actions:** Block/Unblock users, view detailed ride history.
*   **Verification:** Manual flag for "Verified Customer" (optional).

### **5.3 Driver Management**
*   **Onboarding Pipeline:** View "Pending" applications.
*   **Document Review:** UI to view uploaded license images and separate "Approve/Reject" buttons.
*   **Live Status:** Indicator showing if driver is Online/Offline and "In Ride" / "Idle".

### **5.4 Live Dispatch Console**
*   **Map View:** Full-screen map showing pins for:
    *   **Available Drivers** (Green)
    *   **Busy Drivers** (Red)
    *   **Unassigned Bookings** (Blinking/Yellow)
*   **Intervention:** Ability to manually assign a driver to a "stuck" booking.

### **5.5 Booking Management**
*   **Kanban/List View:** Filter rides by status.
*   **Details:** See route, timestamps, fare, and participant user/driver.
*   **Issues:** Flag rides that have exceeded expected duration.

### **5.6 Payments & Finance**
*   **Ledger:** List of all payments.
*   **Refunds:** Ability for Admins/Finance users to initiate a refund.

### **5.7 Settings & Pricing**
*   **Pricing Config:** Form to update `base_fare`, `per_km_price`, `per_min_price`.
*   **System Switch:** "Emergency Stop" button to pause all new bookings.

---

## **6. Deliverables & Roadmap**

### **Phase 1: Foundation (Current)**
1.  **Project Setup:** Next.js repo, Supabase connection, Auth implementation.
2.  **Core Dashboard:** Layout (Sidebar/Navbar) + User/Driver Lists.
3.  **Booking Management:** List view and details of rides.

### **Phase 2: Real-time & Operations**
1.  **Live Map:** Mapbox/Google Maps integration for real-time tracking.
2.  **Dispatcher Controls:** Manual assignment logic.
3.  **Analytics:** Charts and graphs.

### **Phase 3: Polish**
1.  **Role Enforcement:** Strict RLS policies and middleware checks.
2.  **Documentation:** Handbook for operations staff.

---

## **7. Open Questions (To Resolve)**
1.  **Maps API:** Do we have a Google Maps or Mapbox API key provisioned?
2.  **Existing Schema:** Can you share the SQL definition of the existing Mobile MVP database? (Crucial for compatibility).
3.  **Deployment:** Will this be hosted on Vercel, or elsewhere?
