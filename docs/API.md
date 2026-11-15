# 📚 Cab Booking Application API Reference

Base URL: `http://localhost:5000/api`

All protected endpoints require authorization header:
`Authorization: Bearer <clerk_or_jwt_token>` or `x-role: customer | driver | admin` in development mode.

---

## 1. Authentication & Profiles (`/auth`)
- `POST /auth/register` — Register a new user (`email`, `phone_number`, `full_name`, `role`).
- `GET /auth/me` — Retrieve the current authenticated user profile.
- `PUT /auth/me` — Update current user's profile details (`full_name`, `phone_number`, `avatar_url`).

## 2. Customer Endpoints (`/customer`)
- `GET /customer/profile` — Get passenger profile, emergency contacts, and ride statistics.
- `POST /customer/emergency-contacts` — Add a new SOS trusted contact (`name`, `phone`, `relationship`).
- `DELETE /customer/emergency-contacts/:id` — Remove an emergency contact.

## 3. Driver Endpoints (`/driver`)
- `POST /driver/register` — Register as driver (`license_number`, `vehicle`).
- `GET /driver/profile` — Get driver profile, verification status, and ratings.
- `PUT /driver/status` — Toggle driver online/offline availability (`{ is_online: boolean }`).
- `POST /driver/documents` — Upload verification documents (`document_type`, `document_url`).
- `GET /driver/vehicles` — List vehicles owned by driver.
- `POST /driver/vehicles` — Register a new vehicle (`make`, `model`, `year`, `license_plate`, `color`, `vehicle_type`).
- `GET /driver/earnings` — Get aggregated earnings summary (today, week, month, all-time).

## 4. Rides Management (`/rides`)
- `POST /rides` — Request a new ride (`vehicle_type`, `pickup_address`, `pickup_lat`, `pickup_lng`, `dropoff_address`, `dropoff_lat`, `dropoff_lng`, `distance_km`, `duration_minutes`, `promo_code`).
- `GET /rides/:id` — Get full details of a specific ride (stops, driver, vehicle, fare).
- `GET /rides/history` — Get paginated ride history for the authenticated user.
- `PUT /rides/:id/accept` — Driver accepts a requested ride.
- `PUT /rides/:id/status` — Update ride progress status (`DRIVER_ARRIVING`, `ARRIVED`, `IN_PROGRESS`, `COMPLETED`).
- `PUT /rides/:id/cancel` — Cancel an active ride (`{ reason: string }`).
- `POST /rides/:id/rate` — Submit driver rating (1-5 stars) and review text.

## 5. Fare Calculation & Promos (`/fare`)
- `POST /fare/calculate` — Estimate fare for all vehicle categories given `distance_km` and `duration_minutes`.
- `POST /fare/validate-promo` — Validate a promo code (`{ code: string, fare_amount: number }`).

## 6. Payments (`/payments`)
- `POST /payments/create-intent` — Create a Stripe PaymentIntent for a completed ride.
- `POST /payments/confirm` — Confirm payment settlement and mark ride as paid.
- `POST /payments/webhook` — Stripe webhook listener for asynchronous event reconciliation.

## 7. Admin Operations (`/admin`)
- `GET /admin/stats` — High-level dashboard metrics (rides, drivers, revenue, commissions).
- `GET /admin/drivers` — List all drivers with filter by verification status.
- `PUT /admin/drivers/:id/verify` — Approve or reject a driver (`{ status: 'APPROVED' | 'REJECTED', rejection_reason?: string }`).
- `GET /admin/customers` — List customer accounts and ride totals.
- `PUT /admin/customers/:id/suspend` — Suspend or reactivate user accounts.
- `GET /admin/rides` — Platform-wide ride log.
- `GET /admin/fare-settings` — Get current pricing configuration for all 5 tiers.
- `PUT /admin/fare-settings/:id` — Update base fare, per km rate, per minute rate, or minimum fare.
- `GET /admin/promo-codes` — List all promo codes.
- `POST /admin/promo-codes` — Create a new promo code campaign.
- `GET /admin/support` — List user support inquiries.
- `PUT /admin/support/:id/status` — Update support ticket status (`OPEN`, `RESOLVED`, `CLOSED`).
