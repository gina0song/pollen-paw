-- Seed Data for Development/Testing
-- Run this after schema.sql

-- Insert test users
-- Password for all test users: "password123"
-- (hashed with bcrypt, rounds=10)
INSERT INTO users (email, password_hash, first_name, last_name, zip_code) VALUES
('gina@example.com', '$2a$10$rT5qzJxCZK5vYHZqYHZqYeO4J5J5J5J5J5J5J5J5J5J5J5J5J5J5O', 'Gina', 'Song', '98074'),
('john@example.com', '$2a$10$rT5qzJxCZK5vYHZqYHZqYeO4J5J5J5J5J5J5J5J5J5J5J5J5J5J5O', 'John', 'Doe', '90210'),
('jane@example.com', '$2a$10$rT5qzJxCZK5vYHZqYHZqYeO4J5J5J5J5J5J5J5J5J5J5J5J5J5J5O', 'Jane', 'Smith', '10001');

-- Insert test pets
INSERT INTO pets (user_id, name, type, breed, age) VALUES
(1, 'Luna', 'cat', 'Domestic Shorthair', 3),
(1, 'Shadow', 'cat', 'Persian', 5),
(2, 'Max', 'dog', 'Golden Retriever', 4),
(3, 'Bella', 'dog', 'Labrador', 2);

-- Insert sample symptom logs for Luna (pet_id = 1)
-- Last 30 days with varying symptoms
INSERT INTO symptom_logs (pet_id, eye_symptoms, fur_quality, skin_irritation, respiratory, notes, log_date) VALUES
(1, 4, 3, 3, 4, 'Very watery eyes today, lots of sneezing', CURRENT_DATE - INTERVAL '1 day'),
(1, 3, 3, 2, 3, 'Still some eye issues', CURRENT_DATE - INTERVAL '2 days'),
(1, 5, 2, 4, 5, 'Worst day - high pollen count', CURRENT_DATE - INTERVAL '3 days'),
(1, 2, 4, 2, 2, 'Much better today', CURRENT_DATE - INTERVAL '4 days'),
(1, 2, 4, 1, 2, 'Good day', CURRENT_DATE - INTERVAL '5 days'),
(1, 3, 3, 3, 3, 'Moderate symptoms', CURRENT_DATE - INTERVAL '6 days'),
(1, 4, 3, 3, 4, 'Eyes watery again', CURRENT_DATE - INTERVAL '7 days'),
(1, 2, 4, 2, 2, 'Improved', CURRENT_DATE - INTERVAL '8 days'),
(1, 1, 5, 1, 1, 'Great day!', CURRENT_DATE - INTERVAL '9 days'),
(1, 3, 3, 2, 3, 'Moderate', CURRENT_DATE - INTERVAL '10 days');

-- Insert sample environmental data
INSERT INTO environmental_data (zip_code, date, tree_pollen, grass_pollen, weed_pollen, air_quality) VALUES
('98074', CURRENT_DATE - INTERVAL '1 day', 8.5, 3.2, 2.1, 65),
('98074', CURRENT_DATE - INTERVAL '2 days', 7.8, 3.0, 2.3, 70),
('98074', CURRENT_DATE - INTERVAL '3 days', 9.2, 4.1, 3.5, 55),
('98074', CURRENT_DATE - INTERVAL '4 days', 3.5, 2.0, 1.5, 85),
('98074', CURRENT_DATE - INTERVAL '5 days', 2.8, 1.8, 1.2, 90),
('98074', CURRENT_DATE - INTERVAL '6 days', 6.5, 2.8, 2.0, 75),
('98074', CURRENT_DATE - INTERVAL '7 days', 8.0, 3.5, 2.8, 60),
('98074', CURRENT_DATE - INTERVAL '8 days', 4.2, 2.2, 1.6, 80),
('98074', CURRENT_DATE - INTERVAL '9 days', 2.5, 1.5, 1.0, 95),
('98074', CURRENT_DATE - INTERVAL '10 days', 6.0, 2.5, 2.2, 72);

-- Verify data
SELECT 'Users created:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Pets created:', COUNT(*) FROM pets
UNION ALL
SELECT 'Symptom logs created:', COUNT(*) FROM symptom_logs
UNION ALL
SELECT 'Environmental data entries:', COUNT(*) FROM environmental_data;
