-- Pollen Paw Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for development)
DROP TABLE IF EXISTS symptom_logs CASCADE;
DROP TABLE IF EXISTS environmental_data CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    zip_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Pets Table
CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(20) NOT NULL CHECK (species IN ('cat', 'dog')),
    breed VARCHAR(100),
    age INTEGER CHECK (age >= 0 AND age <= 30),
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster queries
CREATE INDEX idx_pets_user_id ON pets(user_id);

-- Symptom Logs Table
CREATE TABLE symptom_logs (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    eye_symptoms INTEGER CHECK (eye_symptoms >= 1 AND eye_symptoms <= 5),
    fur_quality INTEGER CHECK (fur_quality >= 1 AND fur_quality <= 5),
    skin_irritation INTEGER CHECK (skin_irritation >= 1 AND skin_irritation <= 5),
    respiratory INTEGER CHECK (respiratory >= 1 AND respiratory <= 5),
    notes TEXT,
    photo_url TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_symptom_logs_pet_id ON symptom_logs(pet_id);
CREATE INDEX idx_symptom_logs_date ON symptom_logs(log_date);
CREATE INDEX idx_symptom_logs_pet_date ON symptom_logs(pet_id, log_date);

-- Environmental Data Table (Optional for MVP - can fetch from API)
CREATE TABLE environmental_data (
    id SERIAL PRIMARY KEY,
    zip_code VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    tree_pollen DECIMAL(5,2),
    grass_pollen DECIMAL(5,2),
    weed_pollen DECIMAL(5,2),
    air_quality INTEGER,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(zip_code, date)
);

-- Create index for faster lookups
CREATE INDEX idx_env_data_zip_date ON environmental_data(zip_code, date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptom_logs_updated_at BEFORE UPDATE ON symptom_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some comments for documentation
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE pets IS 'Stores pet profiles (1:N relationship with users)';
COMMENT ON TABLE symptom_logs IS 'Stores daily symptom observations with photos';
COMMENT ON TABLE environmental_data IS 'Cached environmental data from Tomorrow.io API';

COMMENT ON COLUMN symptom_logs.eye_symptoms IS 'Rating 1-5: watery, red eyes';
COMMENT ON COLUMN symptom_logs.fur_quality IS 'Rating 1-5: dull, patchy fur';
COMMENT ON COLUMN symptom_logs.skin_irritation IS 'Rating 1-5: scratching, redness';
COMMENT ON COLUMN symptom_logs.respiratory IS 'Rating 1-5: coughing, sneezing';
