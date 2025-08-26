-- Temporarily disable RLS for testing
-- Run this in Supabase SQL Editor for development testing

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE turfs DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;  
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Insert some test data
INSERT INTO users (id, email, password, name, phone, role, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'test@tapturf.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test User', '9876543210', 'user', true),
('550e8400-e29b-41d4-a716-446655440001', 'owner@tapturf.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test Owner', '9876543211', 'owner', true);

INSERT INTO turfs (id, owner_id, name, address, sports, amenities, images, price_per_hour, operating_hours, contact_info, rating, total_reviews, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Test Sports Complex', 'Test Address, Mumbai', '["Cricket", "Football"]', '["Parking", "Cafeteria"]', '[]', 800, '{"monday": {"open": "06:00", "close": "22:00", "isOpen": true}}', '{"phone": "9876543210"}', 4.5, 10, true);