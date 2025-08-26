-- Disable RLS temporarily for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE turfs DISABLE ROW LEVEL SECURITY;  
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Add test data with proper UUIDs
INSERT INTO users (id, email, password, name, phone, role, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'user@tapturf.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test User', '1234567890', 'user', true),
('550e8400-e29b-41d4-a716-446655440001', 'owner@tapturf.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test Owner', '1234567891', 'owner', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO turfs (id, owner_id, name, address, sports, amenities, images, price_per_hour, operating_hours, contact_info, rating, total_reviews, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Test Cricket Ground', 'Test Address, Mumbai', '["Cricket"]', '["Parking", "Cafeteria"]', '[]', 800, '{}', '{}', 4.5, 10, true),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Test Football Ground', 'Test Address 2, Mumbai', '["Football"]', '["Parking", "Changing Room"]', '[]', 1000, '{}', '{}', 4.2, 8, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO games (id, host_id, turf_id, date, start_time, end_time, sport, format, skill_level, current_players, max_players, cost_per_person, description, status) VALUES
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '2025-08-27', '18:00', '20:00', 'Cricket', '6v6', 'intermediate', 3, 12, 150, 'Fun cricket match', 'open')
ON CONFLICT (id) DO NOTHING;