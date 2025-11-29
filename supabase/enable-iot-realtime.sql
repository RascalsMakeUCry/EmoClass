-- Enable Realtime for IoT Sensor Data
-- Run this in Supabase SQL Editor

-- Enable Row Level Security (required for Realtime)
ALTER TABLE iot_sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read on iot_sensor_data" ON iot_sensor_data;
DROP POLICY IF EXISTS "Allow public insert on iot_sensor_data" ON iot_sensor_data;
DROP POLICY IF EXISTS "Allow public read on iot_devices" ON iot_devices;
DROP POLICY IF EXISTS "Allow public insert on iot_devices" ON iot_devices;

-- Create RLS policies: Allow public access (no authentication required)
CREATE POLICY "Allow public read on iot_sensor_data" 
  ON iot_sensor_data FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert on iot_sensor_data" 
  ON iot_sensor_data FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public read on iot_devices" 
  ON iot_devices FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert on iot_devices" 
  ON iot_devices FOR INSERT 
  WITH CHECK (true);

-- Enable Realtime for iot_sensor_data table
-- This allows clients to listen to INSERT/UPDATE/DELETE events
ALTER PUBLICATION supabase_realtime ADD TABLE iot_sensor_data;

-- Verify Realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('iot_sensor_data', 'iot_devices');

-- Expected output should show iot_sensor_data in the list
