# Complete Step-by-Step Development Guide

This guide provides detailed step-by-step instructions for developing and using the Hotel Restaurant Ordering System API.

---

## 📌 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Authentication Workflow](#authentication-workflow)
3. [Category Management](#category-management)
4. [Food Management](#food-management)
5. [Order Management](#order-management)
6. [Admin Functions](#admin-functions)
7. [Frontend Integration](#frontend-integration)
8. [Code Standards](#code-standards)
9. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Step 1: Environment Configuration
```bash
# Create .env file
cp .env.example .env

# Edit .env with:
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hotel-ordering-db
JWT_SECRET=your_secret_key_here_generate_with_crypto
JWT_EXPIRE=30d
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Step 2: Generate Secure JWT Secret
```bash
# Run this command to generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output to JWT_SECRET in .env
```

### Step 3: Ensure MongoDB is Running
```bash
# On Windows (if installed locally)
mongod --dbpath "c:\data\db"

# OR use MongoDB Atlas (cloud)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hotel-ordering-db
```

### Step 4: Install and Start
```bash
npm install
npm run dev

# Server should show:
# 🚀 Server is running on port 5000
# 📝 Environment: development
# 🔗 MongoDB: mongodb://127.0.0.1:27017/hotel-ordering-db
```

---

## Authentication Workflow

### What You Need to Know
- All users must register or login to get a JWT token
- Token is valid for 30 days
- Token can be sent as: `Authorization: Bearer <token>` or in cookies
- Two roles exist: `admin` and `kitchen`

### Complete Example Flow

**Step 1: Register Admin User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager John",
    "email": "manager@hotel.com",
    "password": "Manager@123",
    "role": "admin"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Manager John",
      "email": "manager@hotel.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MjE1OTM2MDAsImV4cCI6MTYyNDE4NTYwMH0.ABC123..."
  }
}
```

**⭐ SAVE THE TOKEN** - You'll use it for authenticated requests.

**Step 2: Register Kitchen Staff**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chef Alex",
    "email": "chef@hotel.com",
    "password": "Chef@456",
    "role": "kitchen"
  }'
```

**Step 3: Login with Credentials**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@hotel.com",
    "password": "Manager@123"
  }'
```

**Step 4: Use Token in Requests**
```bash
# Store token in variable
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use in API request
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Category Management

### Create Menu Categories

**Step 1: Admin Creates "Appetizers" Category**
```bash
ADMIN_TOKEN="your_token_here"

curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Appetizers"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Appetizers",
    "createdAt": "2024-05-21T10:00:00.000Z",
    "updatedAt": "2024-05-21T10:00:00.000Z"
  }
}
```

**⭐ SAVE THE ID** - You'll need it for adding foods.

**Step 2: Create More Categories**
```bash
# Main Courses
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Main Courses"}'

# Desserts
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Desserts"}'

# Beverages
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Beverages"}'
```

**Step 3: View All Categories (Public)**
```bash
curl -X GET http://localhost:5000/api/categories
```

**Step 4: Update Category Name**
```bash
CATEGORY_ID="507f1f77bcf86cd799439012"

curl -X PUT http://localhost:5000/api/categories/$CATEGORY_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Starters"}'
```

---

## Food Management

### Add Menu Items to Categories

**Step 1: Add Caesar Salad to Appetizers**
```bash
ADMIN_TOKEN="your_token_here"
CATEGORY_ID="507f1f77bcf86cd799439012"

curl -X POST http://localhost:5000/api/foods \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Caesar Salad",
    "price": 8.99,
    "description": "Fresh romaine lettuce with Caesar dressing and croutons",
    "ingredients": ["Romaine Lettuce", "Parmesan", "Croutons", "Caesar Dressing"],
    "category": "'$CATEGORY_ID'",
    "available": true
  }'
```

**Response includes food `_id` - save it for orders.**

**Step 2: Add More Foods**
```bash
# Soup
curl -X POST http://localhost:5000/api/foods \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tomato Soup",
    "price": 5.99,
    "description": "Creamy tomato soup with crème fraîche",
    "ingredients": ["Tomatoes", "Cream", "Garlic", "Basil"],
    "category": "'$CATEGORY_ID'",
    "available": true
  }'

# Main Course: Salmon
curl -X POST http://localhost:5000/api/foods \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grilled Salmon",
    "price": 22.99,
    "description": "Fresh Atlantic salmon with lemon butter sauce",
    "ingredients": ["Salmon", "Lemon", "Butter", "Dill"],
    "category": "'$MAIN_COURSES_ID'",
    "available": true
  }'
```

**Step 3: View All Foods (Public)**
```bash
curl -X GET http://localhost:5000/api/foods
```

**Step 4: View Foods in a Category**
```bash
curl -X GET http://localhost:5000/api/foods/category/$CATEGORY_ID
```

**Step 5: Make a Food Unavailable**
```bash
FOOD_ID="507f1f77bcf86cd799439013"

curl -X PATCH http://localhost:5000/api/foods/$FOOD_ID/availability \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"available": false}'

# Response: Food is now unavailable
```

**Step 6: Update Food Details**
```bash
curl -X PUT http://localhost:5000/api/foods/$FOOD_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 9.99,
    "description": "Premium Caesar Salad with grilled chicken"
  }'
```

---

## Order Management

### Complete Order-to-Service Workflow

**Step 1: Customer Places an Order**
```bash
# Note: Can be done WITHOUT authentication (public endpoint)

SALAD_ID="507f1f77bcf86cd799439013"
SOUP_ID="507f1f77bcf86cd799439014"

curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": 5,
    "items": [
      {
        "food": "'$SALAD_ID'",
        "quantity": 2,
        "note": "No croutons for one",
        "subtotal": 17.98
      },
      {
        "food": "'$SOUP_ID'",
        "quantity": 1,
        "note": "Extra cream",
        "subtotal": 5.99
      }
    ],
    "totalPrice": 23.97,
    "notes": "Customer is allergic to nuts"
  }'
```

**⚠️ IMPORTANT:** 
- `subtotal` = `quantity × price`
- `totalPrice` = sum of all subtotals
- `tableNumber` must be a number > 0

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "tableNumber": 5,
    "status": "Pending",
    "items": [...],
    "totalPrice": 23.97,
    "createdAt": "2024-05-21T10:15:00.000Z"
  }
}
```

**⭐ SAVE THE ORDER ID**

**Step 2: Kitchen Staff Sees New Order (Real-time)**
```bash
# Socket.IO event: newOrder
# Kitchen dashboard receives notification instantly
```

**Step 3: Kitchen Staff Views Pending Orders**
```bash
KITCHEN_TOKEN="kitchen_staff_token"

curl -X GET http://localhost:5000/api/orders/status/Pending \
  -H "Authorization: Bearer $KITCHEN_TOKEN"
```

**Step 4: Kitchen Staff Marks Order as "Preparing"**
```bash
ORDER_ID="507f1f77bcf86cd799439015"

curl -X PUT http://localhost:5000/api/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $KITCHEN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Preparing"}'

# Response: Order status updated to "Preparing"
```

**Step 5: Check Orders Being Prepared**
```bash
curl -X GET http://localhost:5000/api/orders/status/Preparing \
  -H "Authorization: Bearer $KITCHEN_TOKEN"
```

**Step 6: Kitchen Finishes - Marks as "Ready"**
```bash
curl -X PUT http://localhost:5000/api/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $KITCHEN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Ready"}'
```

**Step 7: View Ready Orders**
```bash
curl -X GET http://localhost:5000/api/orders/status/Ready \
  -H "Authorization: Bearer $KITCHEN_TOKEN"
```

**Step 8: Get Order Details Anytime**
```bash
# Anyone can view order details
curl -X GET http://localhost:5000/api/orders/$ORDER_ID
```

### Customer: View Orders By Table Number

Customers can fetch all orders for a specific table using the public endpoint (no auth required). This is useful for customers who want to check order status from the table number.

**Curl example:**
```bash
curl -X GET http://localhost:5000/api/orders/table/5
```

**JavaScript (Fetch) example:**
```javascript
async function getOrdersByTable(tableNumber) {
  const res = await fetch(`http://localhost:5000/api/orders/table/${tableNumber}`);
  const data = await res.json();
  return data.data; // array of orders for the table
}

// Usage
getOrdersByTable(5).then(orders => console.log(orders));
```

Note: The endpoint returns an array of orders (most recent first) for the provided `tableNumber`.

---

## Admin Functions

### Dashboard Statistics

**View Today's Statistics**
```bash
ADMIN_TOKEN="your_admin_token"

curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved",
  "data": {
    "totalOrdersToday": 45,
    "pendingOrders": 3,
    "completedOrders": 38,
    "totalRevenue": 2345.67
  }
}
```

---

## Frontend Integration

### Using JavaScript Fetch API

**Complete Example:**
```javascript
// =================== AUTH ===================
async function register(name, email, password, role) {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Save token to localStorage
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data;
  } else {
    throw new Error(data.message);
  }
}

async function login(email, password) {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data;
  } else {
    throw new Error(data.message);
  }
}

// =================== CATEGORIES ===================
async function getCategories() {
  const response = await fetch('http://localhost:5000/api/categories');
  const data = await response.json();
  return data.data;
}

async function createCategory(name) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  
  const data = await response.json();
  return data.data;
}

// =================== FOODS ===================
async function getFoods() {
  const response = await fetch('http://localhost:5000/api/foods');
  const data = await response.json();
  return data.data;
}

async function getFoodsByCategory(categoryId) {
  const response = await fetch(
    `http://localhost:5000/api/foods/category/${categoryId}`
  );
  const data = await response.json();
  return data.data;
}

async function createFood(foodData) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/foods', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(foodData)
  });
  
  const data = await response.json();
  return data.data;
}

// =================== ORDERS ===================
async function createOrder(orderData) {
  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  
  const data = await response.json();
  return data.data;
}

async function getOrder(orderId) {
  const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
  const data = await response.json();
  return data.data;
}

async function getAllOrders() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/orders', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  return data.data;
}

async function getOrdersByStatus(status) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/orders/status/${status}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  const data = await response.json();
  return data.data;
}

async function updateOrderStatus(orderId, status) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/orders/${orderId}/status`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    }
  );
  
  const data = await response.json();
  return data.data;
}

// =================== DASHBOARD ===================
async function getDashboardStats() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/admin/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  return data.data;
}

// =================== USAGE EXAMPLE ===================
async function main() {
  try {
    // 1. Login
    const user = await login('admin@hotel.com', 'password123');
    console.log('Logged in as:', user.user.name);
    
    // 2. Get categories
    const categories = await getCategories();
    console.log('Categories:', categories);
    
    // 3. Get foods
    const foods = await getFoods();
    console.log('Foods:', foods);
    
    // 4. Create order
    const order = await createOrder({
      tableNumber: 5,
      items: [
        {
          food: foods[0]._id,
          quantity: 1,
          note: 'No onions',
          subtotal: foods[0].price
        }
      ],
      totalPrice: foods[0].price,
      notes: 'Customer preference'
    });
    console.log('Order created:', order);
    
    // 5. Get dashboard stats
    const stats = await getDashboardStats();
    console.log('Stats:', stats);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run
main();
```

---

## Code Standards

### ✅ DO's
1. ✅ Always include error handling
2. ✅ Validate all user input
3. ✅ Check user permissions before operations
4. ✅ Use meaningful variable names
5. ✅ Add comments for complex logic
6. ✅ Return consistent response format

### ❌ DON'Ts
1. ❌ Don't expose sensitive data in responses
2. ❌ Don't skip validation
3. ❌ Don't forget to check permissions
4. ❌ Don't hardcode sensitive values
5. ❌ Don't ignore error messages

---

## Troubleshooting

### Error: "No token provided"
**Solution:** Add Authorization header
```bash
curl ... -H "Authorization: Bearer YOUR_TOKEN"
```

### Error: "Invalid credentials"
**Solution:** Check email and password are correct

### Error: "Not authorized"
**Solution:** Your role doesn't have permission for this action

### Error: "Validation Error"
**Solution:** Check all required fields are included

### Error: "MongoDB connection failed"
**Solution:** Ensure MongoDB is running

### Server won't start
**Solution:** 
1. Check port 5000 isn't in use
2. Verify .env file exists
3. Check MongoDB connection string

---

**You're ready to start developing! 🚀**

For more details, visit: http://localhost:5000/api-docs
