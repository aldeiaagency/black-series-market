-- Set Black Series Premium Cars dealer to Elite plan
UPDATE dealers
SET
  subscription_plan = 'elite',
  vehicle_slots     = GREATEST(vehicle_slots, 50)
WHERE name = 'Black Series Premium Cars'
  AND (subscription_plan IS DISTINCT FROM 'elite');
