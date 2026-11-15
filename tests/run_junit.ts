import fs from 'fs';
import path from 'path';
import { haversineDistance } from '../backend/src/utils/distance';
import { fareService } from '../backend/src/services/fare.service';
import { rideService } from '../backend/src/services/ride.service';
import { driverService } from '../backend/src/services/driver.service';
import { adminService } from '../backend/src/services/admin.service';
import { paymentService } from '../backend/src/services/payment.service';
import { customerService } from '../backend/src/services/customer.service';
import { userService } from '../backend/src/services/user.service';
import { VehicleType, RideStatus, DriverStatus, UserRole } from '../backend/src/types';

interface TestResult {
  suite: string;
  name: string;
  time: number;
  failure?: string;
}

async function runAndGenerateJUnit() {
  const results: TestResult[] = [];
  const overallStart = Date.now();

  async function recordTest(suite: string, name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      results.push({ suite, name, time: (Date.now() - start) / 1000 });
      console.log(`  ✓ [${suite}] ${name}`);
    } catch (err: any) {
      results.push({ suite, name, time: (Date.now() - start) / 1000, failure: err.message });
      console.error(`  ✗ [${suite}] ${name}: ${err.message}`);
    }
  }

  console.log('Running automated test suite for JUnit report...');

  let testUser: any;
  let testRide: any;
  let driverReg: any;

  await recordTest('Customer', 'Register and Authenticate User', async () => {
    testUser = await userService.syncUser({
      clerk_id: 'clerk_junit_customer',
      email: 'junit.rider@cabgo.com',
      first_name: 'JUnit',
      last_name: 'Tester',
      phone: '+919876543200',
      role: UserRole.CUSTOMER,
    });
    if (!testUser?.id) throw new Error('Customer sync failed');
  });

  await recordTest('Customer', 'Update Profile & Emergency Contact', async () => {
    await userService.updateUser(testUser.id, { first_name: 'JUnit Updated' });
    const contact = await customerService.addEmergencyContact(testUser.id, {
      name: 'Safety Contact',
      phone: '+919988776655',
      relationship: 'Friend',
    });
    if (contact.name !== 'Safety Contact') throw new Error('Emergency contact failed');
  });

  await recordTest('Maps', 'Geodesic Distance Calculation', async () => {
    const dist = haversineDistance(12.9345, 77.6265, 12.9719, 77.6412);
    if (dist < 4.0 || dist > 5.0) throw new Error(`Invalid distance: ${dist}`);
  });

  await recordTest('FareEngine', 'Dynamic Fare Estimation and Promo Cap', async () => {
    const fare = await fareService.calculateFare(VehicleType.SEDAN, 10, 30);
    if (fare.estimatedFare !== 285) throw new Error(`Expected 285, got ${fare.estimatedFare}`);
    const promo = await fareService.calculateFare(VehicleType.SEDAN, 10, 30, 'FIRST50');
    if (promo.estimatedFare !== 185) throw new Error(`Expected 185, got ${promo.estimatedFare}`);
  });

  await recordTest('Ride', 'Create Ride Booking Request', async () => {
    testRide = await rideService.createRide(testUser.id, {
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
    if (testRide.status !== RideStatus.SEARCHING) throw new Error(`Invalid status: ${testRide.status}`);
  });

  await recordTest('Driver', 'Register Driver and Verification Gatekeeper', async () => {
    driverReg = await driverService.register('driver-junit-user', {
      vehicle: {
        type: VehicleType.SEDAN,
        make: 'Maruti',
        model: 'Dzire',
        year: 2024,
        color: 'White',
        license_plate: 'KA 05 AB 1234',
      },
    });
    if (driverReg.profile.status !== DriverStatus.PENDING) throw new Error('Expected status to be PENDING');
    try {
      await driverService.updateOnlineStatus(driverReg.profile.id, true);
      throw new Error('Unverified driver should be blocked from going online');
    } catch {
      // expected block
    }
    await adminService.approveDriver(driverReg.profile.id, 'admin-001');
    const online = await driverService.updateOnlineStatus(driverReg.profile.id, true);
    if (!online.is_online) throw new Error('Driver could not go online');
  });

  await recordTest('Ride', 'Driver Assign and Atomic Concurrency Check', async () => {
    const accepted = await rideService.assignDriver(testRide.id, driverReg.profile.id);
    if (accepted.status !== RideStatus.ACCEPTED) throw new Error('Ride not accepted');
    try {
      await rideService.assignDriver(testRide.id, 'driver-profile-001');
      throw new Error('Duplicate driver assignment should be blocked');
    } catch {
      // expected conflict
    }
  });

  await recordTest('Ride', 'Trip Lifecycle Progression to Completion', async () => {
    await rideService.updateRideStatus(testRide.id, RideStatus.DRIVER_ARRIVING);
    await rideService.updateRideStatus(testRide.id, RideStatus.ARRIVED);
    await rideService.updateRideStatus(testRide.id, RideStatus.IN_PROGRESS);
    const completed = await rideService.updateRideStatus(testRide.id, RideStatus.COMPLETED);
    if (completed.status !== RideStatus.COMPLETED || completed.actual_fare === null) {
      throw new Error('Trip completion failed');
    }
  });

  await recordTest('Payments', 'Payment Intent & Settlement', async () => {
    const intent = await paymentService.createPaymentIntent(testRide.id, testUser.id);
    const confirmed = await paymentService.confirmPayment(intent.clientSecret, 'stripe_card');
    if (confirmed.status !== 'completed') throw new Error('Payment confirmation failed');
  });

  await recordTest('Admin', 'Dashboard KPI & Audit Logs', async () => {
    const stats = await adminService.getDashboardStats();
    if (!stats.totalRevenue || !stats.platformCommission) throw new Error('KPI stats failed');
    const logs = await adminService.getAuditLogs();
    if (!Array.isArray(logs)) throw new Error('Audit logs failed');
  });

  // Generate JUnit XML
  const totalTime = ((Date.now() - overallStart) / 1000).toFixed(3);
  const failures = results.filter((r) => r.failure).length;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<testsuites name="CabGo CI/CD Suite" tests="${results.length}" failures="${failures}" errors="0" time="${totalTime}">\n`;
  xml += `  <testsuite name="Automated Integration Suite" tests="${results.length}" failures="${failures}" errors="0" time="${totalTime}">\n`;

  for (const r of results) {
    xml += `    <testcase classname="CabGo.${r.suite}" name="${r.name}" time="${r.time.toFixed(3)}">\n`;
    if (r.failure) {
      xml += `      <failure message="${r.failure.replace(/"/g, '&quot;')}">${r.failure}</failure>\n`;
    }
    xml += `    </testcase>\n`;
  }

  xml += `  </testsuite>\n`;
  xml += `</testsuites>\n`;

  const outputDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'junit.xml');
  fs.writeFileSync(outputPath, xml);

  // Also write to repository root test-results if running from a subdirectory
  const rootOutputDir = path.resolve(__dirname, '../test-results');
  if (rootOutputDir !== outputDir) {
    if (!fs.existsSync(rootOutputDir)) {
      fs.mkdirSync(rootOutputDir, { recursive: true });
    }
    fs.writeFileSync(path.join(rootOutputDir, 'junit.xml'), xml);
  }

  console.log(`\nJUnit report successfully generated at: ${outputPath}`);

  if (failures > 0) {
    process.exit(1);
  }
}

runAndGenerateJUnit().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
