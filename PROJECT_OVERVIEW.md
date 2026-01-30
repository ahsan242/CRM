# CRM E-Commerce Platform - Project Overview

## 📋 Table of Contents
1. [Project Architecture](#project-architecture)
2. [Technology Stack](#technology-stack)
3. [Core Modules & Features](#core-modules--features)
4. [Workflows](#workflows)
5. [Database Structure](#database-structure)
6. [API Structure](#api-structure)
7. [Frontend Structure](#frontend-structure)

---

## 🏗️ Project Architecture

This is a **full-stack CRM E-Commerce platform** built with:
- **Frontend**: React 18 + Vite (Modern React with Hooks, Context API)
- **Backend**: Node.js + Express 5
- **Database**: PostgreSQL with Sequelize ORM
- **Payment**: Stripe Integration
- **File Storage**: Local file system (uploads directory)

### Project Structure
```
CRM/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── app/      # Page components (admin & other routes)
│   │   ├── components/ # Reusable UI components
│   │   ├── context/  # React Context providers (Auth, Cart, etc.)
│   │   ├── http/     # API service functions
│   │   ├── routes/   # Route definitions
│   │   └── layouts/  # Layout components
│   └── package.json
│
└── backend/          # Node.js backend API
    ├── config/       # Database configuration
    ├── controllers/  # Business logic controllers
    ├── models/       # Sequelize database models
    ├── routes/       # API route definitions
    ├── middleware/   # Auth, upload middleware
    ├── services/     # External services (Stripe, Email)
    ├── cron/         # Scheduled jobs (product imports)
    └── uploads/      # File storage
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - UI library
- **React Router 6** - Routing
- **Bootstrap 5** - UI framework
- **ApexCharts** - Data visualization
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Stripe.js** - Payment processing
- **Vite** - Build tool
- **SCSS** - Styling

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **PostgreSQL** - Database
- **Sequelize 6** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Stripe** - Payment processing
- **Nodemailer** - Email service
- **Node-cron** - Scheduled tasks
- **XLSX/CSV-Parser** - File parsing
- **XML2JS** - XML parsing

---

## 🎯 Core Modules & Features

### 1. **Authentication & User Management**
- User registration/login
- JWT-based authentication
- Email verification
- Password reset
- User profiles
- Role-based access control

### 2. **E-Commerce Core**
- **Product Management**
  - Product CRUD operations
  - Product details with images
  - Product categories & subcategories
  - Brands management
  - Technical specifications
  - Inventory management
  - Product search & filtering

- **Shopping Cart**
  - Add/remove items
  - Quantity management
  - Cart persistence
  - Cart totals calculation

- **Order Management**
  - Order creation from cart
  - Order status tracking
  - Order history
  - Order details view
  - Invoice generation

- **Checkout & Payments**
  - Multi-step checkout
  - Address management
  - Stripe payment integration
  - Payment intent creation
  - Order confirmation

### 3. **Product Import System**
- **Bulk Product Import**
  - CSV/Excel file upload
  - Product data validation
  - Scheduled imports
  - Import job tracking
  - Import progress monitoring
  - Error handling & reporting

- **Automated Import Cron Job**
  - Runs every 15 minutes
  - Processes scheduled import jobs
  - Batch processing with concurrency control
  - Daily import limits (300 products/day)
  - Status tracking (scheduled → processing → completed/failed)

### 4. **PunchOut Integration**
- OCI (Open Catalog Interface) support
- Token-based authentication
- B2B procurement integration

### 5. **Analytics & Reporting**
- Sales analytics
- Financial reports
- Dashboard widgets
- Revenue tracking
- Order statistics

### 6. **Customer Management**
- Customer list & details
- Customer profiles
- Order history per customer

### 7. **Seller Management**
- Multi-seller support
- Seller-specific pricing tables
- Seller performance tracking

### 8. **Product Inquiries**
- Customer product inquiries
- Inquiry management
- Response tracking

### 9. **Additional Features**
- **Apps**: Chat, Email, Todo, Social, Contacts
- **Calendar**: Schedule, Integration, Help
- **Invoices**: Invoice generation & management
- **UI Components**: Comprehensive component library
- **Charts & Maps**: Data visualization tools

---

## 🔄 Workflows

### 1. **User Authentication Workflow**

```
User Registration/Login
    ↓
Email Verification (if new user)
    ↓
JWT Token Generation
    ↓
Token Stored in Context/Cookies
    ↓
Protected Routes Access
```

**Key Files:**
- `backend/controllers/authController.js`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/components/ProtectedRoute.jsx`

---

### 2. **Product Management Workflow**

#### **Create Product**
```
Admin → Create Product Page
    ↓
Fill Product Form (title, description, price, etc.)
    ↓
Upload Images
    ↓
Select Category, Subcategory, Brand
    ↓
Add Technical Specifications
    ↓
Submit → API Call
    ↓
Product Created in Database
    ↓
Redirect to Products List
```

#### **Product Import Workflow**
```
Admin → Import Products Page
    ↓
Upload CSV/Excel File
    ↓
File Validation
    ↓
Parse File Data
    ↓
Create Import Job (status: 'scheduled')
    ↓
Cron Job Detects Scheduled Job (every 15 min)
    ↓
Process Products in Batches (concurrency: 3)
    ↓
For Each Product:
    - Validate data
    - Check if exists (by productCode)
    - Create/Update Brand if needed
    - Create/Update Category/Subcategory
    - Download images from URLs
    - Create Product record
    - Create ProductImportItem record
    ↓
Update Import Job Progress
    ↓
Mark Job as 'completed' or 'failed'
    ↓
Return Results (successful/failed/skipped)
```

**Key Files:**
- `backend/controllers/productController.js`
- `backend/controllers/importController.js`
- `backend/cron/productImportCron.js`
- `backend/models/ProductImportJob.js`
- `backend/models/ProductImportItem.js`

---

### 3. **Shopping Cart Workflow**

```
User Browsing Products
    ↓
Add Product to Cart
    ↓
Cart Context Updates
    ↓
API Call: POST /api/carts/add-item
    ↓
Backend Updates Cart in Database
    ↓
Cart Persisted (user-specific)
    ↓
Cart Icon Shows Item Count
    ↓
User Can View Cart
    ↓
Update Quantities / Remove Items
    ↓
Proceed to Checkout
```

**Key Files:**
- `frontend/src/context/CartContext.jsx`
- `backend/controllers/cartController.js`
- `backend/models/Cart.js`

---

### 4. **Order Processing Workflow**

```
User in Cart
    ↓
Click "Checkout"
    ↓
Checkout Page Loads
    ↓
Fill Shipping/Billing Address
    ↓
Select Payment Method
    ↓
Submit Order Form
    ↓
API Call: POST /api/orders
    ↓
Backend Process:
    1. Validate cart exists & not empty
    2. Check product stock availability
    3. Calculate totals (subtotal, tax, shipping)
    4. Create Order record
    5. Create OrderItems
    6. Reduce product quantities
    7. Create OrderHistory entry
    8. Generate Invoice
    9. Mark cart as 'converted'
    10. Clear cart items
    ↓
Order Created Successfully
    ↓
Create Stripe Payment Intent
    ↓
Redirect to Payment Page
    ↓
User Completes Payment
    ↓
Payment Confirmed
    ↓
Order Status Updated to 'confirmed'
    ↓
Invoice Status Updated
    ↓
Order Confirmation Email (if configured)
```

**Key Files:**
- `backend/controllers/orderController.js`
- `frontend/src/app/(admin)/ecommerce/checkout/page.jsx`
- `backend/models/Order.js`
- `backend/models/OrderItem.js`
- `backend/models/Invoice.js`

---

### 5. **Payment Processing Workflow (Stripe)**

```
Order Created
    ↓
Create Payment Intent (Stripe API)
    ↓
Payment Intent ID Returned
    ↓
Frontend: Load Stripe Elements
    ↓
User Enters Card Details
    ↓
Submit Payment
    ↓
Stripe Processes Payment
    ↓
Payment Success/Failure Response
    ↓
Update Order Payment Status
    ↓
Update Invoice Status
    ↓
Redirect to Order Confirmation
```

**Key Files:**
- `backend/services/stripeService.js`
- `frontend/src/app/(admin)/ecommerce/checkout/components/StripePayment.jsx`

---

### 6. **Product Import Cron Job Workflow**

```
Server Starts
    ↓
Database Connection Established
    ↓
Cron Job Initialized (after 2 seconds)
    ↓
Cron Schedule: Every 15 minutes
    ↓
Check for Scheduled Import Jobs
    ↓
If Found:
    - Mark job as 'processing'
    - Process products in batches
    - Update progress in real-time
    - Handle errors gracefully
    - Mark as 'completed' or 'failed'
    ↓
If Not Found:
    - Log: "No scheduled jobs"
    - Wait for next cycle
```

**Key Files:**
- `backend/cron/productImportCron.js`
- `backend/server.js` (cron initialization)

---

### 7. **Analytics & Reporting Workflow**

```
Dashboard Page Loads
    ↓
Fetch Analytics Data:
    - Sales data
    - Revenue metrics
    - Order statistics
    - Product performance
    ↓
Display Charts & Widgets
    ↓
Real-time Updates (if configured)
```

**Key Files:**
- `backend/controllers/analyticsController.js`
- `frontend/src/app/(admin)/dashboard/analytics/page.jsx`

---

## 🗄️ Database Structure

### Core Models

1. **User** - User accounts
2. **UserProfile** - Extended user information
3. **Product** - Product catalog
4. **Brand** - Product brands
5. **Category** - Product categories
6. **SubCategory** - Product subcategories
7. **TechProduct** - Technical product specifications
8. **TechProductName** - Technical product names
9. **Image** - Product images
10. **Cart** - Shopping carts
11. **Order** - Customer orders
12. **OrderItem** - Order line items
13. **OrderHistory** - Order status history
14. **Invoice** - Generated invoices
15. **ProductPrice** - Dynamic seller-specific pricing tables
16. **ProductForImport** - Products pending import
17. **ProductImportJob** - Import job tracking
18. **ProductImportItem** - Individual import item status
19. **ProductInquiry** - Customer product inquiries
20. **PunchoutToken** - PunchOut authentication tokens
21. **SalesAnalytics** - Sales analytics data
22. **FinancialReport** - Financial reports
23. **EmailVerification** - Email verification tokens
24. **Gallery** - Image gallery

### Key Relationships

- **User** → **Cart** (One-to-Many)
- **User** → **Order** (One-to-Many)
- **User** → **UserProfile** (One-to-One)
- **Order** → **OrderItem** (One-to-Many)
- **Order** → **Invoice** (One-to-Many)
- **Product** → **OrderItem** (One-to-Many)
- **Product** → **Brand** (Many-to-One)
- **Product** → **Category** (Many-to-One)
- **Product** → **SubCategory** (Many-to-One)
- **Product** → **Image** (One-to-Many)

---

## 🌐 API Structure

### Base URL
```
http://localhost:5000/api
```

### Main API Endpoints

#### **Authentication**
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `POST /api/users/verify-email` - Email verification
- `POST /api/users/reset-password` - Password reset

#### **Products**
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/import` - Bulk import products
- `POST /api/products/import-from-table` - Import from ProductForImport table

#### **Categories & Brands**
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/brands` - List brands
- `POST /api/brands` - Create brand

#### **Cart**
- `GET /api/carts/:userId` - Get user cart
- `POST /api/carts/add-item` - Add item to cart
- `PUT /api/carts/update-item` - Update cart item
- `DELETE /api/carts/remove-item` - Remove item from cart
- `DELETE /api/carts/clear/:userId` - Clear cart

#### **Orders**
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status
- `POST /api/orders/:id/payment-intent` - Create payment intent

#### **Analytics**
- `GET /api/analytics/sales` - Sales analytics
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/products` - Product performance

#### **Import Jobs**
- `GET /api/cron/jobs` - List import jobs
- `GET /api/cron/job/:id` - Get job status
- `GET /api/cron/status` - Cron job status
- `GET /api/cron/trigger-import` - Manually trigger import

#### **Product Inquiries**
- `GET /api/inquiries` - List inquiries
- `POST /api/inquiries` - Create inquiry
- `PUT /api/inquiries/:id` - Update inquiry

#### **PunchOut**
- `POST /api/punchout/initiate` - Initiate PunchOut session
- `POST /api/punchout/return` - Return from PunchOut

---

## 🎨 Frontend Structure

### Route Organization

#### **Admin Routes** (`/app/(admin)`)
- **Dashboard**: Analytics, Finance, Sales
- **E-Commerce**: Products, Orders, Cart, Checkout, Customers, Sellers, Inventory
- **Apps**: Chat, Email, Todo, Social, Contacts
- **Calendar**: Schedule, Integration, Help
- **Invoices**: List, Details
- **Pages**: Profile, FAQs, Contact Us, About Us, etc.
- **UI Components**: Buttons, Cards, Modals, Tables, etc.
- **Forms**: Basic, Validation, File Upload, etc.
- **Charts**: Area, Bar, Line, Pie, etc.
- **Maps**: Google Maps, Vector Maps

#### **Public Routes** (`/app/(other)`)
- **Auth**: Sign In, Sign Up, Reset Password, Lock Screen
- **Error Pages**: 404, Maintenance, Coming Soon

### Context Providers

1. **AuthContext** - User authentication state
2. **CartContext** - Shopping cart state
3. **NotificationContext** - Toast notifications
4. **LayoutContext** - UI layout state
5. **EmailContext** - Email functionality
6. **ChatContext** - Chat functionality

### Key Components

- **ProtectedRoute** - Route authentication guard
- **AdminLayout** - Main admin layout with sidebar
- **AuthLayout** - Authentication page layout
- **PageTitle** - Page metadata
- **PageBreadcrumb** - Navigation breadcrumbs

---

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes (auth middleware)
- CORS configuration
- File upload validation
- SQL injection prevention (Sequelize ORM)
- Input validation & sanitization

---

## 📦 Key Features Summary

✅ **Full E-Commerce Functionality**
- Product catalog management
- Shopping cart & checkout
- Order processing
- Payment integration (Stripe)
- Invoice generation

✅ **Advanced Product Import**
- Bulk CSV/Excel import
- Automated scheduled imports
- Progress tracking
- Error handling

✅ **Multi-Seller Support**
- Seller-specific pricing
- Dynamic price tables
- Seller management

✅ **Analytics & Reporting**
- Sales dashboards
- Financial reports
- Revenue tracking

✅ **B2B Features**
- PunchOut integration
- Product inquiries
- Customer management

✅ **Modern UI/UX**
- Responsive design
- Rich component library
- Interactive charts
- Real-time updates

---

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
npm install
# Configure .env file with database credentials
npm run dev  # or npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`
- `PORT` (default: 5000)

---

## 📝 Notes

- The system uses **PostgreSQL** as the primary database
- Product imports are processed via **cron jobs** every 15 minutes
- Daily import limit: **300 products per day**
- File uploads are stored in `backend/uploads/`
- The frontend uses **lazy loading** for route optimization
- All API routes are prefixed with `/api/`

---

**Last Updated**: Based on current codebase structure
**Version**: 1.0.0



