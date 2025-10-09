-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the send-ticket function to run every minute
-- It will check internally if enough time has passed based on the random interval
SELECT cron.schedule(
  'auto-send-tickets',
  '* * * * *', -- every minute
  $$
  SELECT
    net.http_post(
        url:='https://terxduqrpnpuuavaxras.supabase.co/functions/v1/send-ticket',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcnhkdXFycG5wdXVhdmF4cmFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4Mzk0MTEsImV4cCI6MjA3NTQxNTQxMX0.YmbrlKOAZ1Nxt2oj2PFbuCFrUNq-7LhxITv8-CyRh3s"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);