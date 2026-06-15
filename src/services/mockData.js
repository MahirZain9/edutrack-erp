// Helper SVG templates for offline default student avatars
const createAvatarSvg = (bgColor, textColor, text) => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100%" height="100%" fill="${encodeURIComponent(bgColor)}"/><text x="50" y="55" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="${encodeURIComponent(textColor)}" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
};

export const INITIAL_CLASSES = [
  { id: 'c1', name: 'Std 9', division: 'A', teacherId: 'u2' },
  { id: 'c2', name: 'Std 9', division: 'B', teacherId: '' },
  { id: 'c3', name: 'Std 10', division: 'A', teacherId: 'u2' }, // teacher@edutrack.com
  { id: 'c4', name: 'Std 10', division: 'B', teacherId: '' }
];

export const INITIAL_USERS = [
  {
    uid: 'u1',
    name: 'Sanjay Patel (Admin)',
    email: 'admin@edutrack.com',
    mobile: '9898989898',
    role: 'Admin',
    assignedClassId: ''
  },
  {
    uid: 'u2',
    name: 'Rita Desai (Teacher)',
    email: 'teacher@edutrack.com',
    mobile: '9797979797',
    role: 'Teacher',
    assignedClassId: 'c3' // Std 10 - Div A
  },
  {
    uid: 'u3',
    name: 'Rajesh Patel (Parent)',
    email: 'parent@edutrack.com',
    mobile: '9876543210',
    role: 'Parent',
    assignedClassId: ''
  }
];

export const INITIAL_STUDENTS = [
  {
    id: 's1',
    fullName: 'Aarav Patel',
    rollNumber: '10',
    admissionNumber: 'GR-2026-001', // General Register Number
    classId: 'c3', // Std 10 - Div A
    division: 'A',
    dateOfBirth: '2011-04-12',
    gender: 'Male',
    parentName: 'Rajesh Patel',
    parentMobile: '9876543210',
    address: '402, Shivalik Heights, Satellite, Ahmedabad',
    photo: createAvatarSvg('#FFE4E6', '#BE123C', 'AP'),
    status: 'Active',
    createdAt: new Date().toISOString()
  },
  {
    id: 's2',
    fullName: 'Diya Shah',
    rollNumber: '18',
    admissionNumber: 'GR-2026-002',
    classId: 'c3',
    division: 'A',
    dateOfBirth: '2011-08-22',
    gender: 'Female',
    parentName: 'Amit Shah',
    parentMobile: '9988776655',
    address: '12, Gokul Row House, Vastrapur, Ahmedabad',
    photo: createAvatarSvg('#FDF2F8', '#DB2777', 'DS'),
    status: 'Active',
    createdAt: new Date().toISOString()
  },
  {
    id: 's3',
    fullName: 'Rohan Patel',
    rollNumber: '11',
    admissionNumber: 'GR-2026-003',
    classId: 'c1', // Std 9 - Div A
    division: 'A',
    dateOfBirth: '2012-05-15',
    gender: 'Male',
    parentName: 'Rajesh Patel',
    parentMobile: '9876543210', // Sibling of Aarav
    address: '402, Shivalik Heights, Satellite, Ahmedabad',
    photo: createAvatarSvg('#ECFDF5', '#059669', 'RP'),
    status: 'Active',
    createdAt: new Date().toISOString()
  },
  {
    id: 's4',
    fullName: 'Ananya Mehta',
    rollNumber: '05',
    admissionNumber: 'GR-2026-004',
    classId: 'c3',
    division: 'A',
    dateOfBirth: '2011-02-28',
    gender: 'Female',
    parentName: 'David Mehta',
    parentMobile: '9123456789',
    address: '89, Dev Bungalows, Bodakdev, Ahmedabad',
    photo: createAvatarSvg('#EFF6FF', '#2563EB', 'AM'),
    status: 'Active',
    createdAt: new Date().toISOString()
  },
  {
    id: 's5',
    fullName: 'Kabir Joshi',
    rollNumber: '14',
    admissionNumber: 'GR-2026-005',
    classId: 'c4', // Std 10 - Div B
    division: 'B',
    dateOfBirth: '2011-11-03',
    gender: 'Male',
    parentName: 'Meera Joshi',
    parentMobile: '9871234560',
    address: '76, Shanti Nagar, Chandkheda, Ahmedabad',
    photo: createAvatarSvg('#FFFBEB', '#D97706', 'KJ'),
    status: 'Active',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_ATTENDANCE = {
  // Key format: classId_YYYY-MM-DD
  'c3_2026-06-12': {
    id: 'c3_2026-06-12',
    classId: 'c3',
    date: '2026-06-12',
    records: {
      s1: 'Present',
      s2: 'Present',
      s4: 'Absent'
    },
    takenBy: 'u2',
    createdAt: '2026-06-12T08:30:00.000Z'
  },
  'c3_2026-06-13': {
    id: 'c3_2026-06-13',
    classId: 'c3',
    date: '2026-06-13',
    records: {
      s1: 'Present',
      s2: 'Late',
      s4: 'Present'
    },
    takenBy: 'u2',
    createdAt: '2026-06-13T08:32:00.000Z'
  },
  'c3_2026-06-14': {
    id: 'c3_2026-06-14',
    classId: 'c3',
    date: '2026-06-14',
    records: {
      s1: 'Absent',
      s2: 'Present',
      s4: 'Present'
    },
    takenBy: 'u2',
    createdAt: '2026-06-14T08:35:00.000Z'
  }
};

export const INITIAL_FEES = [
  {
    id: 'f1',
    studentId: 's1', // Aarav Patel
    amount: 1500,
    type: 'Monthly',
    month: 'June 2026',
    status: 'Paid',
    dueDate: '2026-06-10'
  },
  {
    id: 'f2',
    studentId: 's1', // Aarav Patel
    amount: 4500,
    type: 'Quarterly',
    month: 'Q2 2026',
    status: 'Unpaid',
    dueDate: '2026-07-01'
  },
  {
    id: 'f3',
    studentId: 's2', // Diya Shah
    amount: 1500,
    type: 'Monthly',
    month: 'June 2026',
    status: 'Unpaid',
    dueDate: '2026-06-10'
  },
  {
    id: 'f4',
    studentId: 's3', // Rohan Patel
    amount: 1200,
    type: 'Monthly',
    month: 'June 2026',
    status: 'Paid',
    dueDate: '2026-06-10'
  },
  {
    id: 'f5',
    studentId: 's4', // Ananya Mehta
    amount: 12000,
    type: 'Annual',
    month: 'Session 2026-27',
    status: 'Unpaid',
    dueDate: '2026-06-30'
  }
];

export const INITIAL_RECEIPTS = [
  {
    id: 'r1',
    feeId: 'f1',
    studentId: 's1',
    amountPaid: 1500,
    paymentDate: '2026-06-08',
    paymentMode: 'CASH',
    receiptNumber: 'RCPT-2026-8801'
  },
  {
    id: 'r2',
    feeId: 'f4',
    studentId: 's3',
    amountPaid: 1200,
    paymentDate: '2026-06-09',
    paymentMode: 'UPI',
    receiptNumber: 'RCPT-2026-8802'
  }
];
