-- Set Black Series Premium Cars dealer to Elite plan (match by name or email)
UPDATE dealers
SET
  subscription_plan = 'elite',
  vehicle_slots     = GREATEST(vehicle_slots, 50)
WHERE (name = 'Black Series Premium Cars' OR email = 'info@blackseriespremiumcars.es')
  AND (subscription_plan IS DISTINCT FROM 'elite');
