# Nawal Motor Employee Management Portal (NMEP)

A comprehensive web-based employee management system designed for Nawal Motor to streamline HR operations, attendance tracking, payroll processing, and document management.

## 📋 Overview

NMEP is a full-stack employee management solution that enables organizations to efficiently manage their workforce. The platform provides tools for HR personnel and administrators to handle employee records, track attendance, manage salaries with advances/deductions/incentives, generate reports, and maintain employee documents securely.

## ✨ Key Features

### 👥 Employee Management
- Add, update, and manage employee profiles
- Track employee personal and professional information
- Department-wise organization
- Employee search and filtering
- Detailed employee cards with quick actions

### 📊 Dashboard & Analytics
- Real-time metrics and KPIs
- Monthly attendance and salary summaries
- Department-wise analytics
- Attendance trend visualization
- Quick access to key statistics

### 📅 Attendance Management
- Daily attendance marking
- Bulk attendance entry
- Attendance history tracking
- Summary reports per employee
- Present/Absent/Leave status management

### 💰 Salary Management
- Monthly salary processing
- Salary history tracking
- Advances management
- Deductions handling
- Incentives and bonuses
- Salary increments tracking
- Comprehensive payroll calculations

### 📄 Document Management
- Secure document upload and storage (via Cloudinary)
- Employee document categorization
- Document access control
- Multiple file format support

### 📈 Reports & Analytics
- Generate detailed reports
- Export functionality
- Custom date range filtering
- Department-wise reports
- Salary reports

### 🔐 Authentication & Authorization
- Secure login system
- OTP-based authentication
- Google OAuth integration
- Role-based access control (Admin, HR, Employee)
- Granular HR permissions
- Password reset functionality

### 🔗 Google Sheets Integration
- Automated data synchronization
- Service account authentication
- Real-time data export to spreadsheets

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js (Google OAuth)
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Validation**: express-validator
- **External APIs**: Google Sheets API

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: Lucide React (icons)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Styling**: Tailwind CSS 4
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud instance)
- **Git**

### External Service Accounts
- **Cloudinary account** (for file uploads)
- **Google Cloud Project** (for Sheets integration - optional)
- **Email service credentials** (for notifications)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nawal-motor-employee-management-portal-nmep
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Session
SESSION_SECRET=your_session_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@nawalmotor.com

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Google Sheets (Optional)
GOOGLE_SHEETS_ID=your_google_sheet_id
```

For Google Sheets integration, create `config/google-service-account.json`:
```bash
cp config/google-service-account.json.example config/google-service-account.json
# Add your actual service account credentials
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This will create initial test data including admin user.

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
nawal-motor-employee-management-portal-nmep/
├── backend/
│   ├── config/          # Configuration files (DB, Cloudinary, Google, Passport)
│   ├── controllers/     # Route controllers (business logic)
│   ├── middleware/      # Custom middleware (auth, validation, error handling)
│   ├── models/          # Mongoose models (Employee, Attendance, Salary, etc.)
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts (Google Sheets setup)
│   ├── utils/           # Helper functions (email, file upload, JWT)
│   ├── server.js        # Express app entry point
│   ├── seed.js          # Database seeder
│   └── package.json
│
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── assets/      # Images, fonts, etc.
│   │   ├── components/  # Reusable React components
│   │   ├── layouts/     # Layout components (Auth, Dashboard)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   ├── store/       # Zustand state management
│   │   ├── utils/       # Helper functions and constants
│   │   ├── App.jsx      # Main App component
│   │   └── main.jsx     # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🔑 Default Credentials

After seeding the database, you can login with:
- **Email**: Check the seed.js output
- **Password**: Check the seed.js file

**⚠️ Important**: Change default credentials immediately in production!

## 📚 API Documentation

For detailed API documentation, refer to the [Backend README](backend/README.md).

### Base URL
```
http://localhost:5000/api
```

### Main Endpoints
- `/auth` - Authentication & authorization
- `/employees` - Employee management
- `/dashboard` - Dashboard metrics
- `/attendance` - Attendance tracking
- `/salary` - Salary management
- `/reports` - Report generation
- `/documents` - Document management

## 🔐 User Roles & Permissions

### Admin
- Full system access
- Manage all employees
- Configure HR permissions
- Access all reports and analytics

### HR
- Manage employees (permission-based)
- Mark attendance (permission-based)
- Process salaries (permission-based)
- Generate reports (permission-based)
- Upload documents (permission-based)

### Employee
- View own profile
- View own attendance
- View own salary history
- Access own documents

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name nmep-backend
   ```
3. Set up reverse proxy (Nginx/Apache)
4. Configure SSL certificate

### Frontend Deployment
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)
3. Update `VITE_API_URL` to point to production backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software for Nawal Motor. All rights reserved.

## 📧 Support

For support and queries, please contact the development team.

---

**Built with ❤️ from harshwardhan**
