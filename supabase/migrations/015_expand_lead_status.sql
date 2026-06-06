-- Expand lead_status enum with additional workflow states
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'appointment';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'reserved';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'lost';
