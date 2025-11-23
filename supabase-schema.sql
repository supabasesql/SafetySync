-- SafetySync Database Schema for Supabase
-- Copy and paste this into Supabase SQL Editor

-- =====================================================
-- 1. INCIDENTS TABLE
-- =====================================================
CREATE TABLE incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('safety', 'quality', 'environmental', 'equipment')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT NOT NULL,
  immediate_action TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  reported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. USER PROFILES TABLE (extends Supabase Auth)
-- =====================================================
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  department TEXT,
  role TEXT DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. INCIDENT PHOTOS TABLE
-- =====================================================
CREATE TABLE incident_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CORRECTIVE ACTIONS TABLE
-- =====================================================
CREATE TABLE corrective_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  action_description TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_category ON incidents(category);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_department ON incidents(department);
CREATE INDEX idx_incident_photos_incident_id ON incident_photos(incident_id);
CREATE INDEX idx_corrective_actions_incident_id ON corrective_actions(incident_id);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;

-- Incidents: Anyone authenticated can read
CREATE POLICY "Anyone can view incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (true);

-- Incidents: Anyone authenticated can create
CREATE POLICY "Anyone can create incidents"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Incidents: Users can update their own incidents or admins can update any
CREATE POLICY "Users can update own incidents or admins can update any"
  ON incidents FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = reported_by OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- User Profiles: Users can view all profiles
CREATE POLICY "Anyone can view user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- User Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Incident Photos: Anyone can view photos
CREATE POLICY "Anyone can view incident photos"
  ON incident_photos FOR SELECT
  TO authenticated
  USING (true);

-- Incident Photos: Anyone can upload photos
CREATE POLICY "Anyone can upload incident photos"
  ON incident_photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Corrective Actions: Anyone can view
CREATE POLICY "Anyone can view corrective actions"
  ON corrective_actions FOR SELECT
  TO authenticated
  USING (true);

-- Corrective Actions: Managers and admins can create
CREATE POLICY "Managers can create corrective actions"
  ON corrective_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- 7. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for incidents table
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 8. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample incidents (replace UUIDs with actual user IDs after signup)
INSERT INTO incidents (category, severity, location, department, description, immediate_action, status)
VALUES
  ('safety', 'critical', 'Production Floor A', 'Manufacturing', 'Worker slipped on wet floor near assembly line 3. Minor injury sustained.', 'Area cordoned off, wet floor signs placed, worker sent to medical.', 'in-progress'),
  ('quality', 'high', 'Quality Control Lab', 'QC', 'Batch #4521 failed tensile strength test. 15% below specification.', 'Batch quarantined, supplier notified, root cause analysis initiated.', 'open'),
  ('environmental', 'medium', 'Warehouse B', 'Logistics', 'Small chemical spill (approx 2L) of cleaning solution in storage area.', 'Spill contained with absorbent pads, area ventilated, waste disposed properly.', 'resolved'),
  ('equipment', 'high', 'Assembly Line 2', 'Production', 'Hydraulic press showing abnormal pressure readings. Risk of failure.', 'Machine shut down, maintenance team notified, backup equipment activated.', 'in-progress'),
  ('safety', 'low', 'Break Room', 'Facilities', 'Fire extinguisher found with expired inspection tag.', 'Extinguisher replaced immediately, inspection schedule reviewed.', 'closed');

-- =====================================================
-- DONE! Your database is ready.
-- =====================================================

-- Next steps:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire script
-- 3. Click "Run"
-- 4. Get your API keys from Settings > API
-- 5. Update your backend with Supabase credentials
