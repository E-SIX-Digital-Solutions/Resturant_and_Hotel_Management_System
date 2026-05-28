import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from './src/app.js';
import http from 'http';

let server;
let mongoServer;

const BASE_URL = 'http://localhost:5001';

// Test utilities
async function makeRequest(method, path, body = null) {
  const url = BASE_URL + path;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
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
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set environment variable
  process.env.MONGO_URI = mongoUri;
  process.env.NODE_ENV = 'test';
  
  // Connect mongoose
  await mongoose.connect(mongoUri);
  
  // Start server
  server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.listen(5001, () => {
      console.log('🧪 Test server running on port 5001\n');
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
async function testAuthentication() {
  console.log('🧪 Testing Authentication Endpoints\n');
  
  let testToken = null;
  
  try {
    // Test 1: Register User
    console.log('Test 1: Register Admin User');
    console.log('POST /api/auth/register');
    const registerResponse = await makeRequest('POST', '/api/auth/register', {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });
    
    console.log(`Status: ${registerResponse.status}`);
    console.log('Response:', JSON.stringify(registerResponse.body, null, 2));
    
    if (registerResponse.status === 201) {
      console.log('✅ Registration successful\n');
      testToken = registerResponse.body.data?.token;
    } else {
      console.log('❌ Registration failed\n');
    }
    
    // Test 2: Register Kitchen Staff
    console.log('Test 2: Register Kitchen Staff User');
    console.log('POST /api/auth/register');
    const kitchenResponse = await makeRequest('POST', '/api/auth/register', {
      name: 'Kitchen Staff',
      email: 'kitchen@example.com',
      password: 'kitchen123',
      role: 'kitchen',
    });
    
    console.log(`Status: ${kitchenResponse.status}`);
    console.log('Response:', JSON.stringify(kitchenResponse.body, null, 2));
    
    if (kitchenResponse.status === 201) {
      console.log('✅ Kitchen staff registration successful\n');
    } else {
      console.log('❌ Kitchen staff registration failed\n');
    }
    
    // Test 3: Login with correct credentials
    console.log('Test 3: Login with Correct Credentials');
    console.log('POST /api/auth/login');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123',
    });
    
    console.log(`Status: ${loginResponse.status}`);
    console.log('Response:', JSON.stringify(loginResponse.body, null, 2));
    
    if (loginResponse.status === 200) {
      console.log('✅ Login successful\n');
      testToken = loginResponse.body.data?.token;
    } else {
      console.log('❌ Login failed\n');
    }
    
    // Test 4: Login with wrong password
    console.log('Test 4: Login with Wrong Password');
    console.log('POST /api/auth/login');
    const wrongPasswordResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'wrongpassword',
    });
    
    console.log(`Status: ${wrongPasswordResponse.status}`);
    console.log('Response:', JSON.stringify(wrongPasswordResponse.body, null, 2));
    
    if (wrongPasswordResponse.status !== 200) {
      console.log('✅ Correctly rejected wrong password\n');
    } else {
      console.log('❌ Should have rejected wrong password\n');
    }
    
    // Test 5: Login with non-existent email
    console.log('Test 5: Login with Non-existent Email');
    console.log('POST /api/auth/login');
    const noUserResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'nonexistent@example.com',
      password: 'somepassword',
    });
    
    console.log(`Status: ${noUserResponse.status}`);
    console.log('Response:', JSON.stringify(noUserResponse.body, null, 2));
    
    if (noUserResponse.status !== 200) {
      console.log('✅ Correctly rejected non-existent user\n');
    } else {
      console.log('❌ Should have rejected non-existent user\n');
    }
    
    // Test 6: Register with duplicate email
    console.log('Test 6: Register with Duplicate Email');
    console.log('POST /api/auth/register');
    const duplicateResponse = await makeRequest('POST', '/api/auth/register', {
      name: 'Another Admin',
      email: 'admin@example.com',
      password: 'newpassword123',
      role: 'admin',
    });
    
    console.log(`Status: ${duplicateResponse.status}`);
    console.log('Response:', JSON.stringify(duplicateResponse.body, null, 2));
    
    if (duplicateResponse.status !== 201) {
      console.log('✅ Correctly rejected duplicate email\n');
    } else {
      console.log('❌ Should have rejected duplicate email\n');
    }
    
    // Test 7: Register with invalid email format
    console.log('Test 7: Register with Invalid Email Format');
    console.log('POST /api/auth/register');
    const invalidEmailResponse = await makeRequest('POST', '/api/auth/register', {
      name: 'Invalid Email User',
      email: 'invalidemail',
      password: 'password123',
      role: 'customer',
    });
    
    console.log(`Status: ${invalidEmailResponse.status}`);
    console.log('Response:', JSON.stringify(invalidEmailResponse.body, null, 2));
    
    if (invalidEmailResponse.status === 400) {
      console.log('✅ Correctly rejected invalid email\n');
    } else {
      console.log('❌ Should have rejected invalid email\n');
    }
    
    // Test 8: Logout
    console.log('Test 8: Logout');
    console.log('POST /api/auth/logout');
    const logoutResponse = await makeRequest('POST', '/api/auth/logout', {});
    
    console.log(`Status: ${logoutResponse.status}`);
    console.log('Response:', JSON.stringify(logoutResponse.body, null, 2));
    
    if (logoutResponse.status === 200) {
      console.log('✅ Logout successful\n');
    } else {
      console.log('❌ Logout failed\n');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run tests
async function runTests() {
  try {
    await setupTests();
    await testAuthentication();
    await teardownTests();
    console.log('✅ All tests completed');
    process.exit(0);
  } catch (error) {
    console.error('💥 Test setup error:', error);
    process.exit(1);
  }
}

runTests();
