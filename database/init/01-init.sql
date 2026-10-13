-- Database initialization script for CRM Care
-- Database: crm_care

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Set timezone to Vietnam
ALTER DATABASE crm_care SET timezone TO 'Asia/Ho_Chi_Minh';

-- Create monitoring user for prometheus postgres_exporter
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'crm_monitor') THEN
    CREATE USER crm_monitor WITH ENCRYPTED PASSWORD 'Mon1tor@P@ss2024!';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE crm_care TO crm_monitor;
GRANT pg_read_all_stats TO crm_monitor;

-- Initial log table
CREATE TABLE IF NOT EXISTS system_init_log (
    id SERIAL PRIMARY KEY,
    initialized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version VARCHAR(50) DEFAULT '1.0.0',
    notes TEXT DEFAULT 'CRM Care Database initialized successfully'
);

INSERT INTO system_init_log (version, notes)
VALUES ('1.0.0', 'CRM Care schema, extensions, and monitoring user initialized');
