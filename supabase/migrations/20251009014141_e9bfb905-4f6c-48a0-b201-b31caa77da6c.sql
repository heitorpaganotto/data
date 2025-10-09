-- Remove is_active column since system will always be running
ALTER TABLE system_config DROP COLUMN IF EXISTS is_active;

-- Update the interval_minutes to store the random interval (will be calculated in edge function)
-- No need to change the column, we'll just store the last random interval used
COMMENT ON COLUMN system_config.interval_minutes IS 'Stores the last random interval used (6-19 minutes)';