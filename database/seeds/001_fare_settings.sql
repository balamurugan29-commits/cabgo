-- Seed: 001_fare_settings.sql
-- Fare settings for all vehicle types in INR

INSERT INTO fare_settings (vehicle_type, base_fare, per_km_rate, per_minute_rate, minimum_fare, cancellation_fee, surge_multiplier, is_active)
VALUES
  ('bike',  15.00,   6.00,  1.00,  25.00,  10.00, 1.00, true),
  ('auto',  25.00,   9.00,  1.50,  35.00,  15.00, 1.00, true),
  ('mini',  40.00,  12.00,  2.00,  60.00,  25.00, 1.00, true),
  ('sedan', 60.00,  15.00,  2.50,  80.00,  35.00, 1.00, true),
  ('suv',   80.00,  20.00,  3.00, 120.00,  50.00, 1.00, true);
