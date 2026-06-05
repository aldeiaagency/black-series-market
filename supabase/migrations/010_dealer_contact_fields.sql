-- Add postal_code and attention_note to dealers
ALTER TABLE dealers
  ADD COLUMN IF NOT EXISTS postal_code    TEXT,
  ADD COLUMN IF NOT EXISTS attention_note TEXT;
