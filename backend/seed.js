const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Employee = require('./models/Employee');
const { generateEmployeeId } = require('./utils/helpers');

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Seed admin user
const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Employee ID:', existingAdmin.employeeId);
      process.exit(0);
    }

    // Create admin employee record
    const employeeId = generateEmployeeId();
    
    const adminEmployee = await Employee.create({
      employeeId,
      selfDetails: {
        firstName: 'Admin',
        middleName: '',
        lastName: 'User',
        email: 'admin@nawalmotor.com',
        phone: '9999999999',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'Male',
        aadhaarNumber: '999999999999',
        panNumber: 'ADMIN1234A',
        bankDetails: {
          accountNumber: '00000000000',
          ifscCode: 'ADMIN0000',
          bankName: 'Admin Bank',
          branchName: 'Main Branch'
        },
        currentAddress: {
          line1: 'Admin Address',
          city: 'Admin City',
          state: 'Admin State',
          pincode: '000000'
        }
      },
      jobDetails: {
        department: 'Sales',
        designation: 'Manager',
        dateOfJoining: new Date(),
        salaryType: 'Monthly',
        basicSalary: 100000,
        employmentType: 'Permanent'
      },
      status: 'Active'
    });

    // Create admin user
    const adminUser = await User.create({
      employeeId,
      email: 'admin@nawalmotor.com',
      password: 'Admin@123', // Default password - CHANGE THIS!
      role: 'admin',
      isActive: true,
      employee: adminEmployee._id
    });

    console.log('✅ Admin user created successfully!');
    console.log('=====================================');
    console.log('Email: admin@nawalmotor.com');
    console.log('Password: Admin@123');
    console.log('Employee ID:', employeeId);
    console.log('=====================================');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
