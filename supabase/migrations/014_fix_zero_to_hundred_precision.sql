-- Migration 014: Fix zero_to_hundred precision
-- DECIMAL(4,2) only supports up to 99.99 — vehicles with 0-100 times >= 100s would overflow.
-- DECIMAL(5,2) supports up to 999.99, which covers all practical cases.
ALTER TABLE vehicles ALTER COLUMN zero_to_hundred TYPE DECIMAL(5,2);
