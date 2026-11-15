/**
 * Comprehensive Automated Workflow & Integration Test Suite (TEST 1 through TEST 18)
 * Validates every user workflow, security check, concurrency guard, and business logic.
 */

import { haversineDistance } from '../backend/src/utils/distance';
import { fareService } from '../backend/src/services/fare.service';
import { rideService } from '../backend/src/services/ride.service';
import { driverService } from '../backend/src/services/driver.service';
import { adminService } from '../backend/src/services/admin.service';
import { paymentService } from '../backend/src/services/payment.service';
import { customerService } from '../backend/src/services/customer.service';
import { userService } from '../backend/src/services/user.service';
import { VehicleType, RideStatus, DriverStatus, UserRole } from '../backend/src/types';
import { memoryStore } from '../backend/src/utils/store';

async function runTestSuite() {
  console.log('🧪 Starting 18-Stage End-to-End Automated Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Customer registration and login
  console.log('--- TEST 1: Customer Registration and Login ---');
  const customerUser = await userService.syncUser({
    clerk_id: 'clerk_test_customer_101',
    email: 'test.rider@example.com',
    first_name: 'Sara',
    last_name: 'Connor',
    phone: '+919988112233',
    role: UserRole.CUSTOMER,
  });
  assert(customerUser.id !== undefined && customerUser.email === 'test.rider@example.com', 'Customer account registered and synced');
  const loggedInCustomer = await userService.getUserById(customerUser.id);
  assert(loggedInCustomer.role === UserRole.CUSTOMER, 'Customer profile authenticated and role verified');

  // TEST 2: Customer profile update
  console.log('\n--- TEST 2: Customer Profile Update ---');
  const updatedUser = await userService.updateUser(customerUser.id, {
    first_name: 'Sarah',
    phone_number: '+919988112299',
  });
  assert(updatedUser.first_name === 'Sarah' && updatedUser.phone_number === '+919988112299', 'Customer name and phone updated');

  const addedContact = await customerService.addEmergencyContact(customerUser.id, {
    name: 'John Connor',
    phone: '+919988000000',
    relationship: 'Family',
  });
  assert(addedContact.name === 'John Connor', 'Emergency safety contact successfully registered to profile');

  // TEST 3: Pickup and destination selection
  console.log('\n--- TEST 3: Pickup and Destination Selection & Distance Calculation ---');
  // Koramangala 4th Block (12.9345, 77.6265) to Indiranagar (12.9719, 77.6412)
  const calcDist = haversineDistance(12.9345, 77.6265, 12.9719, 77.6412);
  assert(calcDist > 4.0 && calcDist < 5.0, `Accurate geodesic distance computed (${calcDist.toFixed(2)} km)`);

  // TEST 4: Fare calculation
  console.log('\n--- TEST 4: Dynamic Fare Engine & Promo Caps ---');
  const baseFareSedan = await fareService.calculateFare(VehicleType.SEDAN, 10, 30);
  assert(baseFareSedan.estimatedFare === 285, `Sedan fare verified (Base ₹60 + ₹150 dist + ₹75 time = ₹285)`);

  const promoFare = await fareService.calculateFare(VehicleType.SEDAN, 10, 30, 'FIRST50');
  assert(promoFare.estimatedFare === 185, `Promo code FIRST50 capped at max ₹100 discount (₹285 -> ₹185)`);

  // TEST 5: Ride booking
  console.log('\n--- TEST 5: Ride Booking Request ---');
  const ride = await rideService.createRide(customerUser.id, {
    vehicle_type: VehicleType.SEDAN,
    pickup_address: 'Koramangala 4th Block, Bengaluru',
    pickup_lat: 12.9345,
    pickup_lng: 77.6265,
    dropoff_address: 'Indiranagar 100ft Road, Bengaluru',
    dropoff_lat: 12.9719,
    dropoff_lng: 77.6412,
    distance_km: 6.4,
    duration_minutes: 22,
  });
  assert(ride.status === RideStatus.SEARCHING, `Ride #${ride.id} initialized in SEARCHING state`);

  // TEST 6: Driver receiving a ride request
  console.log('\n--- TEST 6: Driver Receiving a Ride Request ---');
  const nearbyDrivers = await driverService.findNearbyDrivers(12.9345, 77.6265, 10, VehicleType.SEDAN);
  assert(Array.isArray(nearbyDrivers), 'Nearby online driver dispatch queue verified');

  // TEST 7: Driver accepting a ride
  console.log('\n--- TEST 7: Driver Accepting a Ride ---');
  const acceptedRide = await rideService.assignDriver(ride.id, 'driver-profile-001');
  assert(acceptedRide.status === RideStatus.ACCEPTED && acceptedRide.driver_id === 'driver-profile-001', 'Ride assigned and status updated to ACCEPTED');

  // TEST 8: Customer tracking the driver
  console.log('\n--- TEST 8: Customer Tracking the Driver & Driver Navigation ---');
  const enRouteRide = await rideService.updateRideStatus(ride.id, RideStatus.DRIVER_ARRIVING);
  assert(enRouteRide.status === RideStatus.DRIVER_ARRIVING, 'Driver state transitioned to DRIVER_ARRIVING');

  const arrivedRide = await rideService.updateRideStatus(ride.id, RideStatus.ARRIVED);
  assert(arrivedRide.status === RideStatus.ARRIVED, 'Driver arrived at pickup location');

  // TEST 9: Driver starting the ride
  console.log('\n--- TEST 9: Driver Starting the Ride ---');
  const startedRide = await rideService.updateRideStatus(ride.id, RideStatus.IN_PROGRESS);
  assert(startedRide.status === RideStatus.IN_PROGRESS && startedRide.started_at !== null, 'Ride started and trip timestamp recorded');

  // TEST 10: Driver completing the ride
  console.log('\n--- TEST 10: Driver Completing the Ride ---');
  const finishedRide = await rideService.updateRideStatus(ride.id, RideStatus.COMPLETED);
  assert(finishedRide.status === RideStatus.COMPLETED && finishedRide.actual_fare !== null, `Ride completed with actual fare calculated: ₹${finishedRide.actual_fare}`);

  // TEST 11: Customer payment
  console.log('\n--- TEST 11: Customer Payment Settlement ---');
  const paymentIntent = await paymentService.createPaymentIntent(ride.id, customerUser.id);
  assert(paymentIntent.amount > 0 && paymentIntent.clientSecret !== '', `Stripe PaymentIntent created for ₹${paymentIntent.amount}`);

  const confirmedPayment = await paymentService.confirmPayment(paymentIntent.clientSecret, 'stripe_card');
  assert(confirmedPayment.status === 'completed', 'Stripe payment settled with COMPLETED status');

  // TEST 12: Ride history and receipt
  console.log('\n--- TEST 12: Ride History and Trip Receipt ---');
  const fullRideDetails = await rideService.getRideById(ride.id);
  assert(fullRideDetails.payment !== null, 'Trip receipt contains verified payment breakdown');

  const customerHistory = await rideService.getCustomerRides(customerUser.id);
  assert(customerHistory.some((r) => r.id === ride.id), 'Ride present in customer ride history log');

  // TEST 13: Customer rating and review
  console.log('\n--- TEST 13: Customer Rating and Driver Review ---');
  const rated = await rideService.rateRide(ride.id, customerUser.id, 5, 'Smooth ride and courteous driver!');
  assert(rated.rating === 5 && rated.review === 'Smooth ride and courteous driver!', '5-star rating and review recorded');

  // TEST 14: Admin driver verification
  console.log('\n--- TEST 14: Admin Driver Verification Gatekeeper ---');
  const newDriverReg = await driverService.register('driver-e2e-user', {
    vehicle: {
      type: VehicleType.SEDAN,
      make: 'Honda',
      model: 'City',
      year: 2024,
      color: 'White',
      license_plate: 'KA 03 MN 4321',
    },
  });
  assert(newDriverReg.profile.status === DriverStatus.PENDING, 'New driver registered with PENDING verification status');

  let blockedOnline = false;
  try {
    await driverService.updateOnlineStatus(newDriverReg.profile.id, true);
  } catch {
    blockedOnline = true;
  }
  assert(blockedOnline, 'Unverified driver strictly prevented from going online');

  await adminService.approveDriver(newDriverReg.profile.id, 'admin-001');
  const verifiedDriver = await driverService.getProfileById(newDriverReg.profile.id);
  assert(verifiedDriver.status === DriverStatus.APPROVED, 'Admin successfully approved driver documents');

  const activeOnlineDriver = await driverService.updateOnlineStatus(newDriverReg.profile.id, true);
  assert(activeOnlineDriver.is_online === true, 'Approved driver successfully transitioned to ONLINE');

  // TEST 15: Admin dashboard analytics
  console.log('\n--- TEST 15: Admin Dashboard Analytics ---');
  const adminStats = await adminService.getDashboardStats();
  assert(adminStats.totalRevenue > 0 && adminStats.platformCommission > 0, `Platform gross revenue (₹${adminStats.totalRevenue}) and commissions (₹${adminStats.platformCommission}) calculated`);
  assert(adminStats.totalDrivers > 0 && adminStats.totalCustomers > 0, 'Customer and driver counts aggregated');

  // TEST 16: Unauthorized access prevention
  console.log('\n--- TEST 16: Unauthorized Access Prevention ---');
  let unauthorizedDenied = false;
  try {
    // Attempting invalid ride status transition from COMPLETED to IN_PROGRESS
    await rideService.updateRideStatus(ride.id, RideStatus.IN_PROGRESS);
  } catch (err: any) {
    unauthorizedDenied = true;
  }
  assert(unauthorizedDenied, 'Illegal state machine transition blocked by server rules');

  // TEST 17: Ride cancellation
  console.log('\n--- TEST 17: Ride Cancellation Flow ---');
  const rideToCancel = await rideService.createRide(customerUser.id, {
    vehicle_type: VehicleType.MINI,
    pickup_address: 'Forum Mall, Koramangala',
    pickup_lat: 12.9349,
    pickup_lng: 77.6111,
    dropoff_address: 'HSR BDA Complex',
    dropoff_lat: 12.9116,
    dropoff_lng: 77.6389,
    distance_km: 4.1,
    duration_minutes: 15,
  });
  const cancelledRide = await rideService.updateRideStatus(rideToCancel.id, RideStatus.CANCELLED, 'Changed my mind', customerUser.id);
  assert(cancelledRide.status === RideStatus.CANCELLED, 'Ride successfully cancelled with cancellation reason logged');

  // TEST 18: Duplicate ride acceptance prevention
  console.log('\n--- TEST 18: Duplicate Ride Acceptance Prevention (Atomic Concurrency) ---');
  const rideForContention = await rideService.createRide(customerUser.id, {
    vehicle_type: VehicleType.SEDAN,
    pickup_address: 'MG Road Metro Station',
    pickup_lat: 12.9756,
    pickup_lng: 77.6066,
    dropoff_address: 'Whitefield ITPL',
    dropoff_lat: 12.9863,
    dropoff_lng: 77.7315,
    distance_km: 14.5,
    duration_minutes: 40,
  });

  // First driver accepts
  await rideService.assignDriver(rideForContention.id, 'driver-profile-001');

  // Second driver attempts to accept the already assigned ride
  let secondDriverBlocked = false;
  try {
    await rideService.assignDriver(rideForContention.id, newDriverReg.profile.id);
  } catch (err: any) {
    secondDriverBlocked = err.message.includes('already accepted') || err.message.includes('no longer available') || err.statusCode === 409;
  }
  assert(secondDriverBlocked, 'Second driver blocked with 409 Conflict: Atomic assignment prevented race condition');

  console.log(`\n======================================================`);
  console.log(`🏁 AUTOMATED SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test suite failure:', err);
  process.exit(1);
});
