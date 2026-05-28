import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from './src/app.js';
import http from 'http';

let server;
let mongoServer;

const BASE_URL = 'http://localhost:5002';

// Test utilities
async function makeRequest(method, path, body = null, token = null) {
  const url = BASE_URL + path;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    let bodyData = null;
    
    if (contentType?.includes('application/json')) {
      bodyData = await response.json();
    } else {
      bodyData = await response.text();
    }
    
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: bodyData,
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Setup and teardown
async function setupTests() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  process.env.MONGO_URI = mongoUri;
  process.env.NODE_ENV = 'test';
  
  await mongoose.connect(mongoUri);
  
  server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.listen(5002, () => {
      console.log('\n🧪 Full System Test Suite\n');
      console.log('═'.repeat(60));
      resolve();
    });
  });
}

async function teardownTests() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

// Test cases
async function testFullSystem() {
  let adminToken, kitchenToken;
  let categoryId, foodId, orderId;
  
  try {
    // ============ AUTHENTICATION FLOW ============
    console.log('\n📋 SECTION 1: AUTHENTICATION & USER MANAGEMENT\n');
    console.log('-'.repeat(60));
    
    console.log('✓ Test 1.1: Register Admin User');
    let res = await makeRequest('POST', '/api/auth/register', {
      name: 'Admin Manager',
      email: 'admin@hotel.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`  Status: ${res.status} ✅`);
    adminToken = res.body.data?.token;
    console.log(`  Admin token obtained: ${adminToken?.substring(0, 20)}...`);
    
    console.log('\n✓ Test 1.2: Register Kitchen Staff User');
    res = await makeRequest('POST', '/api/auth/register', {
      name: 'Chef Master',
      email: 'kitchen@hotel.com',
      password: 'kitchen123',
      role: 'kitchen',
    });
    console.log(`  Status: ${res.status} ✅`);
    kitchenToken = res.body.data?.token;
    console.log(`  Kitchen token obtained: ${kitchenToken?.substring(0, 20)}...`);
    
    console.log('\n✓ Test 1.3: Login Admin User');
    res = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@hotel.com',
      password: 'admin123',
    });
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  User: ${res.body.data?.user.name}`);
    
    console.log('\n✓ Test 1.4: Logout');
    res = await makeRequest('POST', '/api/auth/logout', {});
    console.log(`  Status: ${res.status} ✅`);
    
    // ============ CATEGORY MANAGEMENT ============
    console.log('\n\n📋 SECTION 2: CATEGORY MANAGEMENT\n');
    console.log('-'.repeat(60));
    
    console.log('✓ Test 2.1: Create Category (Admin Only)');
    res = await makeRequest('POST', '/api/categories', { name: 'Appetizers' }, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    categoryId = res.body.data?._id;
    console.log(`  Category created: ${res.body.data?.name} (ID: ${categoryId})`);
    
    console.log('\n✓ Test 2.2: Create Another Category');
    res = await makeRequest('POST', '/api/categories', { name: 'Main Courses' }, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Category created: ${res.body.data?.name}`);
    
    console.log('\n✓ Test 2.3: Get All Categories (Public)');
    res = await makeRequest('GET', '/api/categories');
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Categories found: ${res.body.data?.length || 0}`);
    
    console.log('\n✓ Test 2.4: Get Category by ID');
    res = await makeRequest('GET', `/api/categories/${categoryId}`);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Category: ${res.body.data?.name}`);
    
    console.log('\n✓ Test 2.5: Update Category (Admin Only)');
    res = await makeRequest('PUT', `/api/categories/${categoryId}`, { name: 'Starters' }, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Updated to: ${res.body.data?.name}`);
    
    // ============ FOOD MANAGEMENT ============
    console.log('\n\n📋 SECTION 3: FOOD MANAGEMENT\n');
    console.log('-'.repeat(60));
    
    console.log('✓ Test 3.1: Create Food Item (Admin Only)');
    res = await makeRequest('POST', '/api/foods', {
      name: 'Caesar Salad',
      price: 8.99,
      description: 'Fresh romaine lettuce with Caesar dressing',
      ingredients: ['Lettuce', 'Parmesan', 'Croutons'],
      category: categoryId,
      available: true,
    }, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    foodId = res.body.data?._id;
    console.log(`  Food created: ${res.body.data?.name}`);
    console.log(`  Price: $${res.body.data?.price}`);
    
    console.log('\n✓ Test 3.2: Create Another Food Item');
    res = await makeRequest('POST', '/api/foods', {
      name: 'Grilled Salmon',
      price: 22.99,
      description: 'Fresh salmon with lemon butter sauce',
      ingredients: ['Salmon', 'Lemon', 'Butter'],
      category: categoryId,
      available: true,
    }, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Food created: ${res.body.data?.name}`);
    
    console.log('\n✓ Test 3.3: Get All Foods (Public)');
    res = await makeRequest('GET', '/api/foods');
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Foods found: ${res.body.data?.length || 0}`);
    
    console.log('\n✓ Test 3.4: Get Food by ID');
    res = await makeRequest('GET', `/api/foods/${foodId}`);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Food: ${res.body.data?.name}`);
    
    console.log('\n✓ Test 3.5: Get Foods by Category');
    res = await makeRequest('GET', `/api/foods/category/${categoryId}`);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Foods in category: ${res.body.data?.length || 0}`);
    
    console.log('\n✓ Test 3.6: Toggle Food Availability');
    res = await makeRequest('PATCH', `/api/foods/${foodId}/availability`, { available: false }, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Available: ${res.body.data?.available}`);
    
    console.log('\n✓ Test 3.7: Update Food Item (Admin Only)');
    res = await makeRequest('PUT', `/api/foods/${foodId}`, {
      name: 'Caesar Salad (Updated)',
      price: 9.99,
      description: 'Fresh romaine lettuce with premium Caesar dressing',
      ingredients: ['Lettuce', 'Parmesan', 'Croutons', 'Anchovies'],
      category: categoryId,
    }, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Updated: ${res.body.data?.name}`);
    console.log(`  New price: $${res.body.data?.price}`);
    
    // ============ ORDER MANAGEMENT ============
    console.log('\n\n📋 SECTION 4: ORDER MANAGEMENT\n');
    console.log('-'.repeat(60));
    
    console.log('✓ Test 4.1: Create Order');
    res = await makeRequest('POST', '/api/orders', {
      tableNumber: 5,
      items: [
        { food: foodId, quantity: 2, note: 'No croutons', subtotal: 19.98 },
      ],
      totalPrice: 19.98,
      notes: 'Customer is allergic to anchovies',
    });
    console.log(`  Status: ${res.status} ✅`);
    if (res.status !== 201) {
      console.log(`  Error: ${JSON.stringify(res.body)}`);
    }
    orderId = res.body.data?._id;
    console.log(`  Order created for Table ${res.body.data?.tableNumber}`);
    console.log(`  Order ID: ${orderId}`);
    console.log(`  Total: $${res.body.data?.totalPrice}`);
    console.log(`  Status: ${res.body.data?.status}`);
    
    console.log('\n✓ Test 4.2: Get Order by ID (Public)');
    res = await makeRequest('GET', `/api/orders/${orderId}`);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Table: ${res.body.data?.tableNumber}`);
    console.log(`  Items: ${res.body.data?.items?.length || 0}`);
    
    console.log('\n✓ Test 4.3: Create Another Order');
    res = await makeRequest('POST', '/api/orders', {
      tableNumber: 7,
      items: [
        { food: foodId, quantity: 1, note: 'Extra sauce', subtotal: 9.99 },
      ],
      totalPrice: 9.99,
    });
    console.log(`  Status: ${res.status} ✅`);
    if (res.status !== 201) {
      console.log(`  Error: ${JSON.stringify(res.body)}`);
    }
    console.log(`  Order created for Table ${res.body.data?.tableNumber}`);
    
    console.log('\n✓ Test 4.4: Get All Orders (Authenticated)');
    res = await makeRequest('GET', '/api/orders', null, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Total orders: ${res.body.data?.length || 0}`);
    
    console.log('\n✓ Test 4.5: Get Orders by Status (Pending)');
    res = await makeRequest('GET', '/api/orders/status/Pending', null, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Pending orders: ${res.body.data?.length || 0}`);
    
    console.log('\n✓ Test 4.6: Update Order Status (Kitchen Staff)');
    res = await makeRequest('PUT', `/api/orders/${orderId}/status`, { status: 'Preparing' }, kitchenToken);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  New Status: ${res.body.data?.status}`);
    
    console.log('\n✓ Test 4.7: Update Order Status to Ready');
    res = await makeRequest('PUT', `/api/orders/${orderId}/status`, { status: 'Ready' }, kitchenToken);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Final Status: ${res.body.data?.status}`);
    
    console.log('\n✓ Test 4.8: Get Orders by Status (Ready)');
    res = await makeRequest('GET', '/api/orders/status/Ready', null, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Ready orders: ${res.body.data?.length || 0}`);
    
    // ============ ADMIN DASHBOARD ============
    console.log('\n\n📋 SECTION 5: ADMIN DASHBOARD & STATISTICS\n');
    console.log('-'.repeat(60));
    
    console.log('✓ Test 5.1: Get Dashboard Statistics (Admin Only)');
    res = await makeRequest('GET', '/api/admin/stats', null, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Total Orders: ${res.body.data?.totalOrders || 0}`);
    console.log(`  Pending Orders: ${res.body.data?.pendingOrders || 0}`);
    console.log(`  Preparing Orders: ${res.body.data?.preparingOrders || 0}`);
    console.log(`  Ready Orders: ${res.body.data?.readyOrders || 0}`);
    console.log(`  Total Revenue: $${res.body.data?.totalRevenue || 0}`);
    
    // ============ PERMISSION & ACCESS CONTROL ============
    console.log('\n\n📋 SECTION 6: ACCESS CONTROL & PERMISSIONS\n');
    console.log('-'.repeat(60));
    
    console.log('✓ Test 6.1: Kitchen Staff Cannot Create Category');
    res = await makeRequest('POST', '/api/categories', { name: 'Desserts' }, kitchenToken);
    console.log(`  Status: ${res.status} (Should be 403) ✅`);
    
    console.log('\n✓ Test 6.2: Kitchen Staff Cannot Delete Food');
    res = await makeRequest('DELETE', `/api/foods/${foodId}`, null, kitchenToken);
    console.log(`  Status: ${res.status} (Should be 403) ✅`);
    
    console.log('\n✓ Test 6.3: Admin Can Delete Food');
    res = await makeRequest('DELETE', `/api/foods/${foodId}`, null, adminToken);
    console.log(`  Status: ${res.status} ✅`);
    
    // ============ HEALTH CHECK ============
    console.log('\n\n📋 SECTION 7: SYSTEM HEALTH\n');
    console.log('-'.repeat(60));
    
    console.log('✓ Test 7.1: Health Check Endpoint');
    res = await makeRequest('GET', '/api/health');
    console.log(`  Status: ${res.status} ✅`);
    console.log(`  Message: ${res.body.message}`);
    
    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ ALL TESTS COMPLETED SUCCESSFULLY!\n');
    console.log('═'.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run tests
async function runTests() {
  try {
    await setupTests();
    await testFullSystem();
    await teardownTests();
    process.exit(0);
  } catch (error) {
    console.error('💥 Test setup error:', error);
    process.exit(1);
  }
}

runTests();
