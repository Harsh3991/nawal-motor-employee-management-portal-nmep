const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Self Details
  selfDetails: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    middleName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    bloodGroup: String,
    aadhaarNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    panNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String,
    currentAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String
    },
    permanentAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String
    },
    photograph: String, // Cloudinary URL
    drivingLicense: {
      number: String,
      expiryDate: Date,
      documentUrl: String
    }
  },

  // Family Details
  familyDetails: {
    fatherName: String,
    fatherOccupation: String,
    motherName: String,
    motherOccupation: String,
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed']
    },
    marriageDate: Date,
    spouseName: String,
    spouseOccupation: String,
    children: [{
      name: String,
      dateOfBirth: Date,
      gender: String
    }],
    siblings: [{
      name: String,
      occupation: String,
      relationship: String
    }]
  },

  // Job Details
  jobDetails: {
    department: {
      type: String,
      enum: ['Mechanical', 'Bodyshop', 'Insurance', 'Sales'],
      required: true
    },
    designation: {
      type: String,
      enum: ['Denter', 'Painter', 'Semi-Denter', 'Fitter', 'Semi-Painter', 'Rubbing & Cleaning', 'Manager', 'Supervisor', 'Sales Executive', 'Insurance Executive'],
      required: true
    },
    dateOfJoining: {
      type: Date,
      required: true
    },
    employmentType: {
      type: String,
      enum: ['Permanent', 'Contract', 'Temporary'],
      default: 'Permanent'
    },
    salaryType: {
      type: String,
      enum: ['Monthly', 'Daily'],
      required: true
    },
    basicSalary: {
      type: Number,
      required: true
    },
    hra: Number,
    otherAllowances: Number,
    pfNumber: String,
    esiNumber: String,
    uanNumber: String
  },

  // Last Job Details
  lastJobDetails: {
    companyName: String,
    location: String,
    designation: String,
    duration: String,
    reasonForLeaving: String,
    workingStatus: String
  },

  // Education Details
  educationDetails: [{
    degree: String,
    institution: String,
    year: Number,
    percentage: Number,
    documentUrl: String
  }],

  // Documents
  documents: {
    aadhaarCard: String,
    panCard: String,
    applicationHindi: String,
    applicationEnglish: String,
    educationCertificates: [String],
    otherDocuments: [{
      name: String,
      url: String,
      uploadedAt: Date
    }]
  },

  // Profile Completion Status
  profileStatus: {
    isComplete: {
      type: Boolean,
      default: false
    },
    completionPercentage: {
      type: Number,
      default: 0
    },
    missingFields: [String]
  },

  // Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Terminated', 'Resigned'],
    default: 'Active'
  },

  // Other Details
  uniformDetails: {
    uniformIssued: Boolean,
    uniformSize: String,
    issueDate: Date
  },
  toolsIssued: [{
    toolName: String,
    issueDate: Date,
    returnDate: Date
  }],
  trainingRecords: [{
    trainingName: String,
    date: Date,
    duration: String,
    expenses: Number,
    remarks: String
  }],

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Flatten commonly used fields for frontend convenience
      if (ret.selfDetails) {
        ret.email = ret.selfDetails.email;
        ret.phone = ret.selfDetails.phone;
        ret.dateOfBirth = ret.selfDetails.dateOfBirth;
        ret.gender = ret.selfDetails.gender;
        ret.aadhaarNumber = ret.selfDetails.aadhaarNumber;
        ret.panNumber = ret.selfDetails.panNumber;
        ret.photograph = ret.selfDetails.photograph;
      }
      if (ret.jobDetails) {
        ret.department = ret.jobDetails.department;
        ret.designation = ret.jobDetails.designation;
        ret.joiningDate = ret.jobDetails.dateOfJoining;
        ret.employmentType = ret.jobDetails.employmentType;
        ret.salaryType = ret.jobDetails.salaryType;
        ret.basicSalary = ret.jobDetails.basicSalary;
        ret.hra = ret.jobDetails.hra;
        ret.otherAllowances = ret.jobDetails.otherAllowances;
        ret.pfNumber = ret.jobDetails.pfNumber;
        ret.esiNumber = ret.jobDetails.esiNumber;
        ret.uanNumber = ret.jobDetails.uanNumber;
      }
      if (ret.familyDetails) {
        ret.maritalStatus = ret.familyDetails.maritalStatus;
      }
      if (ret.selfDetails?.bankDetails) {
        ret.bankName = ret.selfDetails.bankDetails.bankName;
        ret.accountNumber = ret.selfDetails.bankDetails.accountNumber;
        ret.ifscCode = ret.selfDetails.bankDetails.ifscCode;
      }
      if (ret.selfDetails?.currentAddress) {
        ret.location = ret.selfDetails.currentAddress.city;
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Index for search
employeeSchema.index({ 
  'selfDetails.firstName': 'text', 
  'selfDetails.lastName': 'text',
  employeeId: 'text' 
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  const middle = this.selfDetails.middleName ? ` ${this.selfDetails.middleName} ` : ' ';
  return `${this.selfDetails.firstName}${middle}${this.selfDetails.lastName}`;
});

// Method to calculate profile completion
employeeSchema.methods.calculateProfileCompletion = function() {
  const requiredFields = [
    this.selfDetails.aadhaarNumber,
    this.selfDetails.panNumber,
    this.selfDetails.bankDetails?.accountNumber,
    this.selfDetails.bankDetails?.ifscCode,
    this.jobDetails.department,
    this.jobDetails.designation,
    this.documents.aadhaarCard,
    this.documents.panCard
  ];

  const filledFields = requiredFields.filter(field => field).length;
  const percentage = Math.round((filledFields / requiredFields.length) * 100);
  
  this.profileStatus.completionPercentage = percentage;
  this.profileStatus.isComplete = percentage === 100;

  // Track missing fields
  const missingFields = [];
  if (!this.selfDetails.aadhaarNumber) missingFields.push('Aadhaar Number');
  if (!this.selfDetails.panNumber) missingFields.push('PAN Number');
  if (!this.selfDetails.bankDetails?.accountNumber) missingFields.push('Bank Account Number');
  if (!this.documents.aadhaarCard) missingFields.push('Aadhaar Card Document');
  if (!this.documents.panCard) missingFields.push('PAN Card Document');
  
  this.profileStatus.missingFields = missingFields;
};

// Pre-save hook to calculate profile completion
employeeSchema.pre('save', function(next) {
  this.calculateProfileCompletion();
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
