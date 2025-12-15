-- =============================================
-- DriveSmart Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS extension for geography type
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('customer', 'driver', 'vehicle_owner', 'admin');
CREATE TYPE driver_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE booking_status AS ENUM ('requested', 'searching', 'assigned', 'arrived', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');
CREATE TYPE document_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE document_type AS ENUM ('license', 'insurance', 'registration', 'photo');

-- =============================================
-- TABLES
-- =============================================

-- Profiles (extends Supabase Auth users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'customer',
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers (extended details for drivers)
CREATE TABLE drivers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    license_number TEXT,
    status driver_status DEFAULT 'pending',
    rating DECIMAL(2,1) DEFAULT 0.0,
    is_online BOOLEAN DEFAULT FALSE,
    current_location GEOGRAPHY(POINT, 4326),
    total_rides INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT,
    plate_number TEXT UNIQUE NOT NULL,
    color TEXT,
    capacity INT DEFAULT 4,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (for verification)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    type document_type NOT NULL,
    url TEXT NOT NULL,
    status document_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    status booking_status DEFAULT 'requested',
    pickup_lat DECIMAL(10, 8) NOT NULL,
    pickup_lng DECIMAL(11, 8) NOT NULL,
    pickup_address TEXT,
    drop_lat DECIMAL(10, 8) NOT NULL,
    drop_lng DECIMAL(11, 8) NOT NULL,
    drop_address TEXT,
    fare_amount DECIMAL(10, 2),
    distance_km DECIMAL(10, 2),
    scheduled_time TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'pending',
    payment_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins (for the web portal)
CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'dispatcher', -- admin, dispatcher, support, finance
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins: Allow users to check if THEY are admin (prevents infinite recursion)
CREATE POLICY "Users can view own admin status" ON admins FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage admins" ON admins FOR ALL USING (
    id IN (SELECT id FROM admins WHERE id = auth.uid())
);

-- Profiles: Users can view/edit own profile, admins can view all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admins)
);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
);

-- Drivers: Public can view approved drivers, drivers can update own
CREATE POLICY "Public can view approved drivers" ON drivers FOR SELECT USING (status = 'approved');
CREATE POLICY "Drivers can view own record" ON drivers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Drivers can update own record" ON drivers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Drivers can insert own record" ON drivers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage drivers" ON drivers FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
);

-- Vehicles: Owners can manage own vehicles, public can view active
CREATE POLICY "Owners can manage own vehicles" ON vehicles FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Public can view active vehicles" ON vehicles FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage vehicles" ON vehicles FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
);

-- Documents: Drivers can view own, admins can view all
CREATE POLICY "Drivers can view own documents" ON documents FOR SELECT USING (
    auth.uid() = driver_id
);
CREATE POLICY "Drivers can insert own documents" ON documents FOR INSERT WITH CHECK (
    auth.uid() = driver_id
);
CREATE POLICY "Admins can manage documents" ON documents FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
);

-- Bookings: Users can view own, admins can view all
CREATE POLICY "Customers can view own bookings" ON bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Drivers can view assigned bookings" ON bookings FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "Admins can manage bookings" ON bookings FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
);

-- Payments: Related users can view, admins can manage
CREATE POLICY "Users can view related payments" ON payments FOR SELECT USING (
    EXISTS(
        SELECT 1 FROM bookings b 
        WHERE b.id = booking_id AND (b.customer_id = auth.uid() OR b.driver_id = auth.uid())
    )
);
CREATE POLICY "Admins can manage payments" ON payments FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_online ON drivers(is_online);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_driver ON bookings(driver_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- =============================================
-- TRIGGERS (for updated_at)
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
