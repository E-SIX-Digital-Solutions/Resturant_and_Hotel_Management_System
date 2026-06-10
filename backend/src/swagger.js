import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hotel Restaurant Ordering System API",
      description: `
        A comprehensive API for managing a hotel restaurant ordering system.
        
        ## System Overview
        
        This API enables efficient management of restaurant operations including:
        - User Authentication & Authorization
        - Category Management
        - Food Inventory Management
        - Order Processing & Tracking
        - Admin Dashboard
        - Admin Analytics
        - Real-time Notifications (Socket.IO)
        
        ## User Roles

        1. **Admin**: Full system access, can manage categories, foods, users, update order status, and view analytics
        2. **Customer**: Can place orders and track order status
        
        ## Authentication
        
        The API uses JWT (JSON Web Tokens) for authentication:
        - Register or login to receive a token
        - Include token in the Authorization header: \`Authorization: Bearer YOUR_TOKEN\`
        - Token expires after 30 days
        
        ## Workflow
        
        1. **Authentication**: User registers/logs in
        2. **Browse**: Customer browses categories and food items
        3. **Order**: Customer creates an order with items
        4. **Order Processing**: Admin receives order notifications and updates status
        5. **Completion**: Order is marked as ready for service
        6. **Analytics**: Admin views dashboard statistics
      `,
      version: "1.0.0",
      contact: {
        name: "Hotel Restaurant System",
        email: "support@hotelrestaurant.com",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development Server",
      },
      {
        url: "https://api.hotelrestaurant.com/api",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            role: { type: "string", enum: ["admin"], example: "admin" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "Appetizers" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Food: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "Caesar Salad" },
            price: { type: "number", format: "float", example: 9.99 },
            description: {
              type: "string",
              example: "Fresh romaine lettuce with Caesar dressing",
            },
            ingredients: {
              type: "array",
              items: { type: "string" },
              example: ["Lettuce", "Parmesan"],
            },
            category: { type: "string", example: "507f1f77bcf86cd799439011" },
            image: { type: "string", nullable: true },
            available: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            _id: { type: "string" },
            food: { type: "string", example: "507f1f77bcf86cd799439011" },
            quantity: { type: "integer", example: 2 },
            note: { type: "string", example: "No croutons" },
            subtotal: { type: "number", format: "float", example: 19.98 },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            tableNumber: { type: "integer", example: 5 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            totalPrice: { type: "number", format: "float", example: 45.99 },
            status: {
              type: "string",
              enum: ["Pending", "Preparing", "Ready"],
              example: "Pending",
            },
            notes: { type: "string", example: "Customer is allergic to nuts" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        DashboardStats: {
          type: "object",
          properties: {
            totalOrders: { type: "integer", example: 45 },
            pendingOrders: { type: "integer", example: 5 },
            preparingOrders: { type: "integer", example: 8 },
            readyOrders: { type: "integer", example: 12 },
            totalRevenue: { type: "number", format: "float", example: 2345.67 },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "User registered successfully",
            },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "User not found" },
            error: { type: "object" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Request completed successfully",
            },
            data: { nullable: true },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: { type: "string", minLength: 6, example: "secret123" },
            role: { type: "string", enum: ["admin"], example: "admin" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: { type: "string", example: "secret123" },
          },
        },
        CategoryRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Appetizers" },
          },
        },
        FoodCreateRequest: {
          type: "object",
          required: ["name", "price", "description", "category"],
          properties: {
            name: { type: "string", example: "Caesar Salad" },
            price: { type: "number", format: "float", example: 9.99 },
            description: {
              type: "string",
              example: "Fresh romaine lettuce with Caesar dressing",
            },
            ingredients: {
              type: "array",
              items: { type: "string" },
              example: ["Lettuce", "Parmesan", "Croutons"],
            },
            category: { type: "string", example: "507f1f77bcf86cd799439011" },
            available: { type: "boolean", example: true },
            image: { type: "string", format: "binary" },
          },
        },
        FoodUpdateRequest: {
          type: "object",
          properties: {
            name: { type: "string", example: "Caesar Salad" },
            price: { type: "number", format: "float", example: 9.99 },
            description: {
              type: "string",
              example: "Fresh romaine lettuce with Caesar dressing",
            },
            ingredients: {
              type: "array",
              items: { type: "string" },
              example: ["Lettuce", "Parmesan", "Croutons"],
            },
            category: { type: "string", example: "507f1f77bcf86cd799439011" },
            available: { type: "boolean", example: true },
            image: { type: "string", format: "binary" },
          },
        },
        AvailabilityRequest: {
          type: "object",
          required: ["available"],
          properties: {
            available: { type: "boolean", example: true },
          },
        },
        OrderItemRequest: {
          type: "object",
          required: ["food", "quantity"],
          properties: {
            food: { type: "string", example: "507f1f77bcf86cd799439011" },
            quantity: { type: "integer", minimum: 1, example: 2 },
            note: { type: "string", example: "No onions" },
          },
        },
        OrderCreateRequest: {
          type: "object",
          required: ["tableNumber", "items"],
          properties: {
            tableNumber: { type: "integer", minimum: 1, example: 5 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItemRequest" },
            },
            notes: { type: "string", example: "Customer is allergic to nuts" },
          },
        },
        OrderStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["Pending", "Preparing", "Ready"],
              example: "Preparing",
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  },
  apis: [path.join(__dirname, "routes", "*.js").replace(/\\/g, "/")],
};

const specs = swaggerJsdoc(options);

export default specs;
