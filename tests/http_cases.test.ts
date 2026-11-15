/**
 * Comprehensive HTTP Test Case Suite for CabGo API
 * Tests against the live HTTP Server on port 5001.
 * Tests every endpoint with input payloads, expected outputs, status codes, and timing.
 */

const BASE_URL = 'http://localhost:5001/api/v1';

interface TestCase {
  id: string;
  category: string;
  name: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number;
  validate: (res: any, status: number) => { pass: boolean; message: string };
}

async function runHttpTestCases() {
  console.log('================================================================');
  console.log('🧪 CabGo Live HTTP Test Case Runner');
  console.log(`🌐 Target Base URL: ${BASE_URL}`);
  console.log('================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  // Shared test variables
  let testRideId = '';
  let testDriverId = 'driver-profile-001';
  let paymentClientSecret = '';

  const testCases: TestCase[] = [
    // --- CATEGORY 1: SYSTEM & HEALTH ---
    {
      id: 'TC-01',
      category: 'System',
      name: 'Server Health & Diagnostics Endpoint',
      method: 'GET',
      url: `${BASE_URL}/health`,
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.status === 'ok',
        message: `Expected status: 200, got ${status}. Service: ${data.service}`,
      }),
    },

    // --- CATEGORY 2: AUTHENTICATION & USER MANAGEMENT ---
    {
      id: 'TC-02',
      category: 'Authentication',
      name: 'User Registration & Synchronisation (Customer Role)',
      method: 'POST',
      url: `${BASE_URL}/auth/sync`,
      body: {
        clerk_id: 'clerk_test_suite_user_001',
        email: 'priya.tester@cabgo.com',
        first_name: 'Priya',
        last_name: 'Nair',
        phone: '+919876543299',
        role: 'customer',
      },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.success === true && data.data.email === 'priya.tester@cabgo.com',
        message: `User created with ID: ${data?.data?.id}, role: ${data?.data?.role}`,
      }),
    },
    {
      id: 'TC-03',
      category: 'Authentication',
      name: 'Get Current Authenticated User Profile',
      method: 'GET',
      url: `${BASE_URL}/auth/me`,
      headers: {
        'x-role': 'customer',
        'x-user-id': 'customer-user-001',
      },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.data && data.data.email === 'customer@uberclone.com',
        message: `User retrieved: ${data?.data?.first_name} ${data?.data?.last_name}`,
      }),
    },

    // --- CATEGORY 3: MAPS & LOCATION SEARCH ---
    {
      id: 'TC-04',
      category: 'Location',
      name: 'Geocoding Autocomplete Search for Landmark',
      method: 'GET',
      url: `${BASE_URL}/location/search?q=Koramangala`,
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && Array.isArray(data.data) && data.data.length > 0 && data.data[0].lat !== undefined,
        message: `Matched ${data?.data?.length} locations. Top match: "${data?.data?.[0]?.display_name?.slice(0, 45)}..."`,
      }),
    },
    {
      id: 'TC-05',
      category: 'Location',
      name: 'Reverse Geocoding Coordinates to Human Address',
      method: 'GET',
      url: `${BASE_URL}/location/reverse?lat=12.9345&lng=77.6265`,
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && typeof data.data.address === 'string',
        message: `Resolved Address: "${data?.data?.address?.slice(0, 50)}..."`,
      }),
    },

    // --- CATEGORY 4: FARE ENGINE & PROMO CODES ---
    {
      id: 'TC-06',
      category: 'Fare Engine',
      name: 'Dynamic Fare Estimation for All 5 Vehicle Categories',
      method: 'GET',
      url: `${BASE_URL}/fares/estimate?distance_km=10&duration_minutes=30`,
      expectedStatus: 200,
      validate: (data, status) => {
        const types = (data.data || []).map((x: any) => x.vehicleType);
        const hasAll5 = ['bike', 'auto', 'mini', 'sedan', 'suv'].every((t) => types.includes(t));
        const sedanItem = (data.data || []).find((x: any) => x.vehicleType === 'sedan');
        return {
          pass: status === 200 && hasAll5 && sedanItem?.estimatedFare === 285,
          message: `All 5 tiers priced. Sedan: ₹${sedanItem?.estimatedFare} (Base ₹60 + Dist ₹150 + Time ₹75 = ₹285)`,
        };
      },
    },
    {
      id: 'TC-07',
      category: 'Fare Engine',
      name: 'Promo Code Discount Calculation & Cap Enforcement',
      method: 'GET',
      url: `${BASE_URL}/fares/estimate?distance_km=10&duration_minutes=30&promo_code=FIRST50`,
      expectedStatus: 200,
      validate: (data, status) => {
        const sedanItem = (data.data || []).find((x: any) => x.vehicleType === 'sedan');
        return {
          pass: status === 200 && sedanItem?.estimatedFare === 185 && sedanItem?.discount === 100,
          message: `Promo FIRST50 applied: ₹${sedanItem?.discount} discount, net fare: ₹${sedanItem?.estimatedFare}`,
        };
      },
    },

    // --- CATEGORY 5: DRIVER VERIFICATION & GATEKEEPER ---
    {
      id: 'TC-08',
      category: 'Driver Module',
      name: 'Driver Registration with Vehicle Information',
      method: 'POST',
      url: `${BASE_URL}/driver/register`,
      headers: {
        'x-role': 'driver',
        'x-user-id': 'driver-http-candidate',
      },
      body: {
        license_number: 'KA-01-2026-9999',
        vehicle: {
          type: 'sedan',
          make: 'Toyota',
          model: 'Etios',
          year: 2024,
          color: 'Silver',
          license_plate: 'KA 01 TR 9999',
        },
      },
      expectedStatus: 201,
      validate: (data, status) => ({
        pass: (status === 201 || status === 200) && data.data?.profile?.status === 'pending',
        message: `Driver registered with ID: ${data?.data?.profile?.id}, verification status: PENDING`,
      }),
    },
    {
      id: 'TC-09',
      category: 'Driver Security',
      name: 'Unverified Driver Blocked from Going Online',
      method: 'PUT',
      url: `${BASE_URL}/driver/online-status`,
      headers: {
        'x-role': 'driver',
        'x-user-id': 'driver-http-candidate',
      },
      body: { is_online: true },
      expectedStatus: 400,
      validate: (data, status) => ({
        pass: status === 400,
        message: `HTTP 400 received as expected: "${data?.error || data?.message}"`,
      }),
    },
    {
      id: 'TC-10',
      category: 'Driver Module',
      name: 'Verified Driver Toggle Online Availability',
      method: 'PUT',
      url: `${BASE_URL}/driver/online-status`,
      headers: {
        'x-role': 'driver',
        'x-user-id': 'driver-user-001',
      },
      body: { is_online: true },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.data?.is_online === true,
        message: `Verified driver status updated: is_online = ${data?.data?.is_online}`,
      }),
    },
    {
      id: 'TC-11',
      category: 'Driver Module',
      name: 'Driver GPS Location Telemetry Update',
      method: 'PUT',
      url: `${BASE_URL}/driver/location`,
      headers: {
        'x-role': 'driver',
        'x-user-id': 'driver-user-001',
      },
      body: { lat: 12.9352, lng: 77.6245 },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200,
        message: `Driver coordinates updated to [12.9352, 77.6245]`,
      }),
    },

    // --- CATEGORY 6: RIDE BOOKING & LIFECYCLE ---
    {
      id: 'TC-12',
      category: 'Ride Lifecycle',
      name: 'Customer Creates Ride Request',
      method: 'POST',
      url: `${BASE_URL}/rides`,
      headers: {
        'x-role': 'customer',
        'x-user-id': 'customer-user-001',
      },
      body: {
        vehicle_type: 'sedan',
        pickup_address: 'Koramangala 4th Block, Bengaluru',
        pickup_lat: 12.9345,
        pickup_lng: 77.6265,
        dropoff_address: 'Indiranagar 100ft Road, Bengaluru',
        dropoff_lat: 12.9719,
        dropoff_lng: 77.6412,
        distance_km: 6.4,
        duration_minutes: 22,
      },
      expectedStatus: 201,
      validate: (data, status) => {
        testRideId = data.data?.id;
        return {
          pass: (status === 201 || status === 200) && data.data?.status === 'searching',
          message: `Ride created with ID: ${testRideId}, Status: ${data.data?.status}, Estimated Fare: ₹${data.data?.estimated_fare}`,
        };
      },
    },
    {
      id: 'TC-13',
      category: 'Ride Lifecycle',
      name: 'Driver Accepts Ride Request',
      method: 'POST',
      url: () => `${BASE_URL}/rides/${testRideId}/accept`,
      headers: {
        'x-role': 'driver',
        'x-user-id': 'driver-user-001',
      },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.data?.status === 'accepted',
        message: `Ride #${testRideId} assigned to driver. State: ACCEPTED`,
      }),
    },
    {
      id: 'TC-14',
      category: 'Ride Concurrency',
      name: 'Duplicate Ride Acceptance Prevention (Race Condition Lock)',
      method: 'POST',
      url: () => `${BASE_URL}/rides/${testRideId}/accept`,
      headers: {
        'x-role': 'driver',
        'x-user-id': 'driver-user-001',
      },
      expectedStatus: 409,
      validate: (data, status) => ({
        pass: status === 409 || status === 400,
        message: `HTTP ${status} correctly returned: "${data?.error || data?.message}"`,
      }),
    },
    {
      id: 'TC-15',
      category: 'Ride Lifecycle',
      name: 'Driver Status Transition: DRIVER_ARRIVING -> ARRIVED',
      method: 'PUT',
      url: () => `${BASE_URL}/rides/${testRideId}/status`,
      headers: {
        'x-role': 'driver',
        'x-user-id': 'driver-user-001',
      },
      body: { status: 'driver_arriving' },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.data?.status === 'driver_arriving',
        message: `Ride state transitioned to DRIVER_ARRIVING`,
      }),
    },
    {
      id: 'TC-16',
      category: 'Ride Lifecycle',
      name: 'Driver Starts Trip: ARRIVED -> IN_PROGRESS',
      method: 'PUT',
      url: () => `${BASE_URL}/rides/${testRideId}/status`,
      headers: {
        'x-role': 'driver',
        'x-user-id': 'driver-user-001',
      },
      body: { status: 'arrived' },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.data?.status === 'arrived',
        message: `Ride state transitioned to ARRIVED at pickup`,
      }),
    },
    {
      id: 'TC-17',
      category: 'Ride Lifecycle',
      name: 'Driver Completes Trip: IN_PROGRESS -> COMPLETED',
      method: 'PUT',
      url: () => `${BASE_URL}/rides/${testRideId}/status`,
      headers: {
        'x-role': 'driver',
        'x-user-id': 'driver-user-001',
      },
      body: { status: 'in_progress' },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.data?.status === 'in_progress',
        message: `Trip is IN_PROGRESS. Started at: ${data.data?.started_at}`,
      }),
    },
    {
      id: 'TC-18',
      category: 'Ride Lifecycle',
      name: 'Trip Concluded & Final Bill Generated',
      method: 'PUT',
      url: () => `${BASE_URL}/rides/${testRideId}/status`,
      headers: {
        'x-role': 'driver',
        'x-user-id': 'driver-user-001',
      },
      body: { status: 'completed' },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.data?.status === 'completed' && data.data?.actual_fare > 0,
        message: `Trip COMPLETED! Actual fare billed: ₹${data.data?.actual_fare}`,
      }),
    },

    // --- CATEGORY 7: PAYMENT SETTLEMENT & RECEIPT ---
    {
      id: 'TC-19',
      category: 'Payments',
      name: 'Create Stripe PaymentIntent for Completed Ride',
      method: 'POST',
      url: `${BASE_URL}/payments/create-intent`,
      headers: {
        'x-role': 'customer',
        'x-user-id': 'customer-user-001',
      },
      body: () => ({ ride_id: testRideId }),
      expectedStatus: 200,
      validate: (data, status) => {
        paymentClientSecret = data.data?.clientSecret;
        return {
          pass: status === 200 && data.data?.amount > 0 && typeof paymentClientSecret === 'string',
          message: `Stripe PaymentIntent generated: ₹${data.data?.amount} (${data.data?.currency?.toUpperCase()})`,
        };
      },
    },
    {
      id: 'TC-20',
      category: 'Payments',
      name: 'Confirm Payment Settlement & Auto-Generate Receipt',
      method: 'POST',
      url: `${BASE_URL}/payments/confirm`,
      headers: {
        'x-role': 'customer',
        'x-user-id': 'customer-user-001',
      },
      body: () => ({
        payment_intent_id: paymentClientSecret,
        payment_method: 'stripe_card',
      }),
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.data?.status === 'completed',
        message: `Payment status: COMPLETED. Transaction ID: ${data.data?.id}`,
      }),
    },

    // --- CATEGORY 8: RATINGS, REVIEWS & FEEDBACK ---
    {
      id: 'TC-21',
      category: 'Reviews',
      name: 'Customer Submits 5-Star Rating & Driver Review',
      method: 'POST',
      url: () => `${BASE_URL}/rides/${testRideId}/rate`,
      headers: {
        'x-role': 'customer',
        'x-user-id': 'customer-user-001',
      },
      body: { rating: 5, review: 'Great driving, smooth experience!' },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.data?.rating === 5,
        message: `Rating submitted: 5 stars, review: "${data.data?.review}"`,
      }),
    },

    // --- CATEGORY 9: ADMIN GOVERNANCE & AUDIT LOGS ---
    {
      id: 'TC-22',
      category: 'Admin',
      name: 'Admin Dashboard Stats & Financial Revenue KPI',
      method: 'GET',
      url: `${BASE_URL}/admin/stats`,
      headers: {
        'x-role': 'admin',
        'x-user-id': 'admin-user-001',
      },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.data?.totalRevenue > 0 && data.data?.platformCommission > 0,
        message: `Gross Revenue: ₹${data.data?.totalRevenue}, Commission: ₹${data.data?.platformCommission}, Rides: ${data.data?.completedRides}`,
      }),
    },
    {
      id: 'TC-23',
      category: 'Admin',
      name: 'Admin Customer Directory Listing',
      method: 'GET',
      url: `${BASE_URL}/admin/customers`,
      headers: {
        'x-role': 'admin',
        'x-user-id': 'admin-user-001',
      },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && Array.isArray(data.data) && data.data.length > 0,
        message: `Retrieved ${data.data?.length} customer accounts with trip counts`,
      }),
    },
    {
      id: 'TC-24',
      category: 'Admin',
      name: 'Admin Driver Verification Approval',
      method: 'PUT',
      url: `${BASE_URL}/admin/drivers/driver-profile-001/approve`,
      headers: {
        'x-role': 'admin',
        'x-user-id': 'admin-user-001',
      },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && data.data?.status === 'approved',
        message: `Driver approved. verified_at: ${data.data?.verified_at}`,
      }),
    },
    {
      id: 'TC-25',
      category: 'Admin',
      name: 'Admin Audit Log History',
      method: 'GET',
      url: `${BASE_URL}/admin/audit-logs`,
      headers: {
        'x-role': 'admin',
        'x-user-id': 'admin-user-001',
      },
      expectedStatus: 200,
      validate: (data, status) => ({
        pass: status === 200 && Array.isArray(data.data),
        message: `Retrieved ${data.data?.length} recorded administrative audit logs`,
      }),
    },
  ];

  for (const tc of testCases) {
    const startTime = Date.now();
    try {
      const url = typeof tc.url === 'function' ? (tc.url as any)() : tc.url;
      const body = typeof tc.body === 'function' ? (tc.body as any)() : tc.body;

      const response = await fetch(url, {
        method: tc.method,
        headers: {
          'Content-Type': 'application/json',
          ...(tc.headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseData: any = await response.json().catch(() => ({}));
      const elapsed = Date.now() - startTime;
      const result = tc.validate(responseData, response.status);

      if (result.pass) {
        console.log(`[${tc.id}] ✅ PASS (${elapsed}ms) [${tc.category}] ${tc.name}`);
        console.log(`       ↳ ${result.message}`);
        passedCount++;
      } else {
        console.error(`[${tc.id}] ❌ FAIL (${elapsed}ms) [${tc.category}] ${tc.name}`);
        console.error(`       ↳ ${result.message}`);
        failedCount++;
      }
    } catch (err: any) {
      console.error(`[${tc.id}] ❌ ERROR: ${err.message}`);
      failedCount++;
    }
  }

  console.log('\n================================================================');
  console.log(`🏁 TEST EXECUTION SUMMARY: ${passedCount} PASSED | ${failedCount} FAILED (Total: ${testCases.length})`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runHttpTestCases().catch((err) => {
  console.error('Test runner encountered unexpected error:', err);
  process.exit(1);
});
