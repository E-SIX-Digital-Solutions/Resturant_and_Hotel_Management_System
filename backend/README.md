# Hotel Restaurant Ordering System - Backend

A production-ready backend for a Hotel Restaurant Ordering System using the MERN stack.

## 🎯 Features

✅ **User Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin, Kitchen Staff, Customer)
- Secure password hashing with bcrypt
- Cookie management

✅ **Food Management**
- CRUD operations for food items
- Image upload to local storage (uploads/foods)
- Food categorization
- Availability status management

✅ **Order Management**
- Customer order placement
- Real-time order tracking
- Order status updates (Pending → Preparing → Ready)
- Order statistics and analytics

✅ **Kitchen Dashboard**
- Real-time order notifications
- Order status management
- Kitchen staff authentication

✅ **Admin Dashboard**
- Complete order overview
- Food management
- Category management
- Dashboard statistics
- Revenue tracking

✅ **Real-time Updates**
- Socket.IO integration
- Live order notifications
- Real-time status updates
- Food availability changes

---

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **Local storage** - Image uploads saved to uploads/foods
- **Multer** - File upload handling
- **Joi** - Data validation
- **bcryptjs** - Password hashing
- **Morgan** - HTTP logging
- **CORS** - Cross-origin resource sharing
- **Cookie-parser** - Cookie handling

---

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   ├── cloudinary.js    # (legacy placeholder) Cloudinary config (not used)
│   └── db.js            # MongoDB connection
├── controllers/         # Request handlers
│   ├── authController.js
│   ├── foodController.js
│   ├── categoryController.js
│   ├── orderController.js
│   └── adminController.js
├── middleware/          # Custom middleware
│   ├── auth.js          # JWT authentication & authorization
│   ├── errorHandler.js  # Global error handling
│   ├── asyncHandler.js  # Async error wrapper
│   └── upload.js        # File upload configuration
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── Food.js
│   ├── Category.js
│   └── Order.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── foodRoutes.js
│   ├── categoryRoutes.js
│   ├── orderRoutes.js
│   └── adminRoutes.js
├── services/            # Business logic
│   ├── authService.js
│   ├── foodService.js
│   ├── categoryService.js
│   └── orderService.js
├── sockets/             # Socket.IO handlers
│   └── socketHandler.js
├── utils/               # Utility functions
│   ├── jwt.js           # JWT token generation
│   ├── cloudinaryUpload.js (deprecated)
│   └── response.js      # Response formatting
├── validations/         # Data validation schemas
│   └── index.js
├── app.js               # Express app configuration
└── server.js            # Server entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd HMS/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Edit the `.env` file:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/hotel-ordering-db

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=30d
```

## File Uploads

This project uses local file storage for uploaded images. Uploaded food images are saved under `uploads/foods`.

Notes:
- Ensure the `uploads/foods` directory exists and is writable by the server.
- The `upload` middleware (in `src/middleware/upload.js`) handles multipart form data and stores files locally using `multer`.
- The `image` field in the `Food` model stores a relative file path or URL pointing to the stored file.

### Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Foods
- `GET /api/foods` - Get all foods
- `GET /api/foods/:id` - Get food by ID
- `GET /api/foods/category/:categoryId` - Get foods by category
- `POST /api/foods` - Create food with image (Admin)
- `PUT /api/foods/:id` - Update food (Admin)
- `PATCH /api/foods/:id/availability` - Toggle availability (Admin)
- `DELETE /api/foods/:id` - Delete food (Admin)

### Orders
- `POST /api/orders` - Create order (Public)
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders` - Get all orders (Authenticated)
- `GET /api/orders/status/:status` - Get orders by status
- `PUT /api/orders/:id/status` - Update order status (Kitchen/Admin)
- `DELETE /api/orders/:id` - Delete order (Admin)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (Admin)

---

## 🔐 Authentication & Authorization

### Roles
- **Customer**: Can view menu and place orders (no login required)
- **Kitchen Staff**: Can view orders and update order status
- **Admin**: Can manage food, categories, and view statistics

### Protected Routes
- Authentication required: Provide JWT token in header or cookie
- Authorization: Only specific roles can access certain endpoints

Example request with token:
```bash
curl -X GET http://localhost:5000/api/foods \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔌 Socket.IO Events

### Client → Server
- `join-kitchen` - Join kitchen dashboard room
- `join-admin` - Join admin dashboard room
- `leave-kitchen` - Leave kitchen room
- `leave-admin` - Leave admin room

### Server → Client
- `new-order` - New order placed
- `order-status-updated` - Order status changed
- `food-availability-changed` - Food availability changed

Example:
```javascript
const socket = io('http://localhost:5000');

socket.emit('join-kitchen');

socket.on('new-order', (order) => {
  console.log('New order:', order);
});
```

---

## 📋 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: enum ['admin', 'kitchen'],
  createdAt: Date,
  updatedAt: Date
}
```

### Food
```javascript
{
  name: String,
  price: Number,
  description: String,
  ingredients: [String],
  category: ObjectId (ref: Category),
  image: String (file path or URL),
  available: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Category
```javascript
{
  name: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  tableNumber: Number,
  items: [
    {
      food: ObjectId (ref: Food),
      quantity: Number,
      note: String,
      subtotal: Number
    }
  ],
  totalPrice: Number,
  status: enum ['Pending', 'Preparing', 'Ready'],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing

### Using Postman
1. Import the API endpoints
2. Register/Login to get JWT token
3. Add token to Authorization header
4. Test endpoints

### Using cURL
See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for cURL examples

### Using Thunder Client (VS Code)
Install Thunder Client extension and create requests

---

## 📝 Validation Rules

### Register/Login
- Email must be valid
- Password minimum 6 characters
- Name is required

### Food
- Name, Price, Description required
- Price must be positive
- Category must exist

### Category
- Name required and unique

### Order
- Table number required
- Items array must not be empty
- Total price must be positive
- Valid statuses: Pending, Preparing, Ready

---

## 🛡️ Security Features

✅ JWT authentication with expiration
✅ Password hashing with bcryptjs
✅ Role-based access control
✅ CORS configuration
✅ HTTP-only cookies
✅ Input validation with Joi
✅ Error handling middleware
✅ Environment variable protection
✅ Secure local image uploads

---

## 🐛 Error Handling

All errors return consistent JSON response:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Additional error details"
}
```

Status codes:
- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Server Error

---

## 📊 API Response Format

Success response:
```json
{
  "success": true,
  "message": "Success message",
  "data": { /* data */ }
}
```

Error response:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Details"
}
```

---

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use secure JWT_SECRET
3. Use MongoDB Atlas (cloud)
4. Configure CORS for your domain
5. Set secure cookie options

### Deployment Platforms
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean
- Vercel (with serverless functions)

---

## 📖 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API reference with:
- Request/Response examples
- cURL commands
- Socket.IO events
- Error responses

---

## 🔄 Workflow

1. **Customer**
   - Browse menu (GET /api/foods)
   - Place order (POST /api/orders)
   - View order status (GET /api/orders/:id)
   - Real-time updates via Socket.IO

2. **Kitchen Staff**
   - Login (POST /api/auth/login)
   - View orders (GET /api/orders)
   - Update order status (PUT /api/orders/:id/status)
   - Real-time notifications via Socket.IO

3. **Admin**
   - Login (POST /api/auth/login)
   - Manage foods (CRUD)
   - Manage categories (CRUD)
   - View statistics (GET /api/admin/stats)
   - Monitor orders

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Create a feature branch
2. Commit changes with clear messages
3. Push to your branch
4. Create a Pull Request

---

## 📄 License

ISC License

---

## 📞 Support

For issues or questions:
- Check API documentation
- Review error messages
- Check MongoDB logs

---

## ✨ Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Analytics dashboard
- [ ] Mobile app API
- [ ] Table management system
- [ ] Reservation system
- [ ] Billing/Invoice system
- [ ] Customer feedback/ratings
- [ ] Multi-language support

---

**Happy Coding! 🚀**
#   R e s t u r a n t _ a n d _ H o t e l _ M a n a g e m e n t _ S y s t e m 
 
 #   R e s t u r a n t _ a n d _ H o t e l _ M a n a g e m e n t _ S y s t e m 
 
 