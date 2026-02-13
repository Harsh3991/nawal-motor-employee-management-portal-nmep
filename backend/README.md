# Nawal Motor Employee Management Portal - Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Update the `.env` file with the following credentials:

#### Cloudinary (for file uploads)
- Sign up at https://cloudinary.com
- Get your credentials from the dashboard
- Update: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

#### Google Sheets (for data sync)
- Create a Google Cloud Project
- Enable Google Sheets API
- Create Service Account and download the JSON key file
- Save it as `config/google-service-account.json`
- Create a Google Sheet and get its ID from the URL
- Update: `GOOGLE_SHEETS_ID`

### 3. Run the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### Register User (Admin/HR only)
```
POST /api/auth/register
Body: { email, role, employeeId }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
```

#### Send OTP
```
POST /api/auth/send-otp
Body: { email }
```

#### Verify OTP
```
POST /api/auth/verify-otp
Body: { email, otp }
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

### Employee Endpoints

#### Get All Employees
```
GET /api/employees?page=1&limit=10&search=&department=&status=
Headers: Authorization: Bearer <token>
```

#### Get Single Employee
```
GET /api/employees/:id
Headers: Authorization: Bearer <token>
```

#### Create Employee
```
POST /api/employees
Headers: Authorization: Bearer <token>
Body: { employee data }
```

#### Update Employee
```
PUT /api/employees/:id
Headers: Authorization: Bearer <token>
Body: { updated fields }
```

### Attendance Endpoints

#### Mark Attendance
```
POST /api/attendance
Headers: Authorization: Bearer <token>
Body: { employee, date, status, checkInTime, checkOutTime }
```

#### Get Attendance
```
GET /api/attendance?employee=&startDate=&endDate=&status=
Headers: Authorization: Bearer <token>
```

#### Get Attendance Summary
```
GET /api/attendance/summary/:employeeId?month=&year=
Headers: Authorization: Bearer <token>
```

### Salary Endpoints

#### Generate Salary
```
POST /api/salary/generate
Headers: Authorization: Bearer <token>
Body: { employeeId, month, year }
```

#### Get All Salaries
```
GET /api/salary?employee=&month=&year=&paymentStatus=
Headers: Authorization: Bearer <token>
```

#### Add Incentive
```
POST /api/salary/incentive
Headers: Authorization: Bearer <token>
Body: { employee, month, year, amount, type, description }
```

#### Add Deduction
```
POST /api/salary/deduction
Headers: Authorization: Bearer <token>
Body: { employee, month, year, amount, type, reason }
```

#### Add Advance
```
POST /api/salary/advance
Headers: Authorization: Bearer <token>
Body: { employee, amount, reason, installments }
```

#### Add Increment
```
POST /api/salary/increment
Headers: Authorization: Bearer <token>
Body: { employee, effectiveDate, newSalary, reason }
```

### Dashboard Endpoints

#### Get Dashboard Metrics
```
GET /api/dashboard/metrics
Headers: Authorization: Bearer <token>
```

#### Get Monthly Summary
```
GET /api/dashboard/monthly-summary?month=&year=
Headers: Authorization: Bearer <token>
```

#### Get Department Summary
```
GET /api/dashboard/department-summary
Headers: Authorization: Bearer <token>
```

### Reports Endpoints

#### Salary Report
```
GET /api/reports/salary?month=&year=&department=&paymentStatus=
Headers: Authorization: Bearer <token>
```

#### Attendance Report
```
GET /api/reports/attendance?startDate=&endDate=&department=&employeeId=
Headers: Authorization: Bearer <token>
```

#### PF/ESI Report
```
GET /api/reports/pf-esi?month=&year=
Headers: Authorization: Bearer <token>
```

#### Incentive Report
```
GET /api/reports/incentives?month=&year=&type=&status=
Headers: Authorization: Bearer <token>
```

#### Increment Report
```
GET /api/reports/increments?year=&reason=&employeeId=
Headers: Authorization: Bearer <token>
```

### Document Endpoints

#### Upload Document
```
POST /api/documents/upload
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: { file, employeeId, documentType }
```

#### Get Employee Documents
```
GET /api/documents/:employeeId
Headers: Authorization: Bearer <token>
```

## Project Structure

```
backend/
├── config/           # Configuration files
│   ├── db.js        # MongoDB connection
│   ├── passport.js  # Passport configuration
│   ├── cloudinary.js
│   └── googleSheets.js
├── controllers/     # Request handlers
│   ├── authController.js
│   ├── employeeController.js
│   ├── attendanceController.js
│   ├── salaryController.js
│   ├── dashboardController.js
│   ├── reportController.js
│   └── documentController.js
├── middleware/      # Custom middleware
│   ├── auth.js      # Authentication middleware
│   ├── error.js     # Error handler
│   ├── validation.js
│   └── upload.js
├── models/          # Database models
│   ├── User.js
│   ├── Employee.js
│   ├── Attendance.js
│   ├── Salary.js
│   ├── Incentive.js
│   ├── Deduction.js
│   ├── Advance.js
│   └── Increment.js
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── employeeRoutes.js
│   ├── attendanceRoutes.js
│   ├── salaryRoutes.js
│   ├── dashboardRoutes.js
│   ├── reportRoutes.js
│   └── documentRoutes.js
├── utils/           # Helper functions
│   ├── jwt.js
│   ├── email.js
│   ├── fileUpload.js
│   ├── googleSheets.js
│   └── helpers.js
├── .env            # Environment variables
├── server.js       # Entry point
└── package.json    # Dependencies
```

## Features Implemented

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, HR, Employee)
- ✅ OTP-based login
- ✅ Google OAuth integration
- ✅ Password reset functionality
- ✅ HR permission management

### Employee Management
- ✅ Complete CRUD operations
- ✅ Profile completion tracking
- ✅ Document upload & management
- ✅ Search & filter functionality
- ✅ Department & designation management

### Attendance Management
- ✅ Mark daily attendance
- ✅ Bulk attendance marking
- ✅ Attendance summary & reports
- ✅ Night duty tracking
- ✅ Location tracking support
- ✅ Face recognition & fingerprint integration ready

### Salary Management
- ✅ Automated salary generation
- ✅ Monthly & daily wage support
- ✅ Incentive management
- ✅ Deduction tracking
- ✅ Salary advance & repayment
- ✅ Increment history
- ✅ PF/ESI calculation

### Dashboard & Reports
- ✅ Real-time metrics
- ✅ Monthly summaries
- ✅ Department-wise analytics
- ✅ Multiple report types
- ✅ Export-ready data

### Integrations
- ✅ Google Sheets sync
- ✅ Cloudinary for file storage
- ✅ Email notifications
- ✅ OTP system

## Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation
- Rate limiting ready
- Helmet for security headers
- CORS configuration

## Next Steps
1. Update Cloudinary credentials in `.env`
2. Set up Google Service Account for Sheets integration
3. Test all API endpoints
4. Deploy to production server
5. Set up frontend integration
