/**
 * MOCK DATA: Government Schemes & Educational Opportunities
 * Scholarships, fee waivers, government programs, and student-specific schemes
 */

export type SchemeCategory = 
  | 'SCHOLARSHIP' 
  | 'FEE_WAIVER' 
  | 'CAREER_PROGRAM' 
  | 'MERIT_BASED' 
  | 'FINANCIAL_AID' 
  | 'SKILL_DEVELOPMENT';

export type EducationLevel = 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DOCTORATE' | 'ALL';
export type SchemeStatus = 'ACTIVE' | 'UPCOMING' | 'EXPIRED';

export interface Scheme {
  id: string;
  title: string;
  provider: string;
  category: SchemeCategory;
  description: string;
  benefits: string[];
  eligibility: string[];
  stipend?: string;
  deadline: string;
  applyUrl: string;
  educationLevel: EducationLevel;
  state?: string;
  tags: string[];
  isRecommended: boolean;
  status: SchemeStatus;
  documentsRequired: string[];
  matchScore: number;
}

export interface EligibilityCheck {
  schemeId: string;
  criteria: {
    requirement: string;
    userStatus: 'MEETS' | 'DOES_NOT_MEET' | 'PARTIAL';
    details: string;
  }[];
  overallEligibility: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'PARTIALLY_ELIGIBLE';
  recommendedActions: string[];
}

export const SCHEME_CATEGORIES: { value: SchemeCategory; label: string; icon: string }[] = [
  { value: 'SCHOLARSHIP', label: 'Scholarships', icon: '🎓' },
  { value: 'FEE_WAIVER', label: 'Fee Waivers', icon: '💰' },
  { value: 'CAREER_PROGRAM', label: 'Career Programs', icon: '💼' },
  { value: 'MERIT_BASED', label: 'Merit-Based', icon: '🏆' },
  { value: 'FINANCIAL_AID', label: 'Financial Aid', icon: '🤝' },
  { value: 'SKILL_DEVELOPMENT', label: 'Skill Development', icon: '⚡' }
];

export const MOCK_SCHEMES: Scheme[] = [
  {
    id: 'scheme-001',
    title: 'National Scholarship Portal - Central Sector Scheme',
    provider: 'Ministry of Education, Govt. of India',
    category: 'SCHOLARSHIP',
    description: 'Merit-cum-means based scholarship for students from economically weaker sections pursuing higher education. Covers tuition fees and provides monthly stipend.',
    benefits: [
      'Full tuition fee coverage',
      'Monthly stipend of ₹10,000',
      'Book allowance of ₹5,000/year',
      'Laptop/tablet one-time grant'
    ],
    eligibility: [
      'Family income below ₹8 lakhs per annum',
      'Minimum 75% marks in Class 12',
      'Enrolled in recognized university',
      'Indian citizen'
    ],
    stipend: '₹10,000/month',
    deadline: '2025-01-31',
    applyUrl: 'https://scholarships.gov.in',
    educationLevel: 'UNDERGRADUATE',
    tags: ['Central Government', 'Need-based', 'Renewable'],
    isRecommended: true,
    status: 'ACTIVE',
    documentsRequired: [
      'Income certificate',
      'Caste certificate (if applicable)',
      'Class 12 marksheet',
      'Aadhaar card',
      'Bank account details',
      'College admission proof'
    ],
    matchScore: 94
  },
  {
    id: 'scheme-002',
    title: 'PM Scholarship Scheme for Central Armed Police Forces',
    provider: 'Ministry of Home Affairs',
    category: 'SCHOLARSHIP',
    description: 'Scholarship for wards and widows of Central Armed Police Forces personnel. Supports professional and technical courses.',
    benefits: [
      'Annual scholarship of ₹36,000 (Boys)',
      'Annual scholarship of ₹30,000 (Girls)',
      'Priority in government job applications'
    ],
    eligibility: [
      'Ward/widow of CAPF personnel',
      'Minimum 60% marks in Class 12',
      'Age below 25 years'
    ],
    stipend: '₹30,000-36,000/year',
    deadline: '2025-02-15',
    applyUrl: 'https://scholarships.gov.in/pmss',
    educationLevel: 'UNDERGRADUATE',
    tags: ['Defense', 'Merit-based', 'Special Category'],
    isRecommended: false,
    status: 'ACTIVE',
    documentsRequired: [
      'Service certificate of CAPF personnel',
      'Class 12 marksheet',
      'Domicile certificate',
      'College admission letter'
    ],
    matchScore: 45
  },
  {
    id: 'scheme-003',
    title: 'Post Matric Scholarship for SC/ST Students',
    provider: 'Department of Social Justice',
    category: 'FINANCIAL_AID',
    description: 'Comprehensive financial assistance for Scheduled Caste and Scheduled Tribe students pursuing post-matriculation studies.',
    benefits: [
      'Tuition fee reimbursement',
      'Maintenance allowance',
      'Study tour expenses',
      'Thesis typing/printing charges'
    ],
    eligibility: [
      'Belongs to SC/ST category',
      'Studying in Class 11 or above',
      'Family income below ₹2.5 lakhs',
      'Regular student (not distance learning)'
    ],
    stipend: 'Varies by course',
    deadline: '2025-03-31',
    applyUrl: 'https://scholarships.gov.in/postmatric',
    educationLevel: 'ALL',
    tags: ['SC/ST', 'Government', 'Full Support'],
    isRecommended: true,
    status: 'ACTIVE',
    documentsRequired: [
      'Caste certificate',
      'Income certificate',
      'Previous year marksheet',
      'Fee receipt',
      'Aadhaar card'
    ],
    matchScore: 88
  },
  {
    id: 'scheme-004',
    title: 'INSPIRE Scholarship for Higher Education',
    provider: 'Department of Science & Technology',
    category: 'MERIT_BASED',
    description: 'Innovation in Science Pursuit for Inspired Research scholarship for top 1% students in board exams pursuing natural sciences.',
    benefits: [
      'Scholarship of ₹80,000 per year',
      'Summer research internship',
      'Mentorship from leading scientists',
      'Priority for research grants'
    ],
    eligibility: [
      'Secured top 1% in Class 12 board exams',
      'Pursuing BSc/BS/Int. MSc in natural sciences',
      'Age below 27 years'
    ],
    stipend: '₹80,000/year',
    deadline: '2025-02-28',
    applyUrl: 'https://online-inspire.gov.in',
    educationLevel: 'UNDERGRADUATE',
    tags: ['Science', 'Top 1%', 'Prestigious'],
    isRecommended: true,
    status: 'ACTIVE',
    documentsRequired: [
      'Class 12 marksheet with rank certificate',
      'College admission letter (BSc/natural sciences)',
      'Aadhaar card',
      'Bank account details'
    ],
    matchScore: 91
  },
  {
    id: 'scheme-005',
    title: 'Free Coaching Scheme for SC/ST Students',
    provider: 'Ministry of Social Justice',
    category: 'SKILL_DEVELOPMENT',
    description: 'Free coaching for competitive examinations including UPSC, banking, SSC, and other entrance tests for SC/ST candidates.',
    benefits: [
      'Free coaching for competitive exams',
      'Study material provided',
      'Mock test series',
      'Career counseling'
    ],
    eligibility: [
      'Belongs to SC/ST category',
      'Annual family income below ₹8 lakhs',
      'Qualified preliminary exam (if applicable)'
    ],
    deadline: '2025-04-30',
    applyUrl: 'https://socialjustice.gov.in/coaching',
    educationLevel: 'ALL',
    tags: ['Competitive Exams', 'Free Coaching', 'SC/ST'],
    isRecommended: false,
    status: 'ACTIVE',
    documentsRequired: [
      'Caste certificate',
      'Income certificate',
      'Aadhaar card',
      'Educational certificates'
    ],
    matchScore: 62
  },
  {
    id: 'scheme-006',
    title: 'State Merit Scholarship',
    provider: 'State Education Department',
    category: 'MERIT_BASED',
    description: 'State-level merit scholarship for students excelling in Class 10 and 12 board examinations.',
    benefits: [
      'One-time award of ₹25,000',
      'Certificate of merit',
      'Recognition at state level'
    ],
    eligibility: [
      'Secured 90%+ in board exams',
      'Domicile of the state',
      'Continuing education'
    ],
    stipend: '₹25,000 (one-time)',
    deadline: '2025-01-20',
    applyUrl: 'https://stateeducation.gov.in/merit',
    educationLevel: 'UNDERGRADUATE',
    state: 'Various States',
    tags: ['State Government', 'One-time', 'High Achievers'],
    isRecommended: true,
    status: 'ACTIVE',
    documentsRequired: [
      'Class 10/12 marksheet',
      'Domicile certificate',
      'School/college admission proof',
      'Bank account details'
    ],
    matchScore: 85
  },
  {
    id: 'scheme-007',
    title: 'National Fellowship for Higher Education (SC/ST)',
    provider: 'UGC - University Grants Commission',
    category: 'SCHOLARSHIP',
    description: 'Fellowship for SC/ST students pursuing M.Phil and Ph.D programs in Indian universities.',
    benefits: [
      'Fellowship of ₹31,000/month (JRF)',
      'Fellowship of ₹35,000/month (SRF)',
      'Contingency grant of ₹10,000/year',
      'HRA as per university norms'
    ],
    eligibility: [
      'Belongs to SC/ST category',
      'Pursuing M.Phil/Ph.D',
      'Full-time research scholar',
      'Valid NET/GATE/SLET qualification'
    ],
    stipend: '₹31,000-35,000/month',
    deadline: '2025-03-15',
    applyUrl: 'https://ugc.ac.in/nfsc',
    educationLevel: 'DOCTORATE',
    tags: ['Research', 'Fellowship', 'Higher Education'],
    isRecommended: false,
    status: 'ACTIVE',
    documentsRequired: [
      'Caste certificate',
      'M.Phil/Ph.D admission letter',
      'NET/GATE scorecard',
      'Research proposal',
      'No-objection certificate'
    ],
    matchScore: 38
  },
  {
    id: 'scheme-008',
    title: 'Girl Child Education Support Program',
    provider: 'Ministry of Women & Child Development',
    category: 'FINANCIAL_AID',
    description: 'Special financial assistance program for girl students from economically disadvantaged backgrounds.',
    benefits: [
      'Annual assistance of ₹15,000',
      'Free textbooks and uniforms',
      'Sanitary products support',
      'Career counseling sessions'
    ],
    eligibility: [
      'Female student',
      'Family income below ₹3 lakhs',
      'Regular attendance (>75%)',
      'Enrolled in recognized institution'
    ],
    stipend: '₹15,000/year',
    deadline: '2025-02-10',
    applyUrl: 'https://wcd.gov.in/girlchild',
    educationLevel: 'ALL',
    tags: ['Girls Education', 'Women Empowerment', 'Need-based'],
    isRecommended: true,
    status: 'ACTIVE',
    documentsRequired: [
      'Income certificate',
      'School/college ID card',
      'Bank account in girl\'s name',
      'Attendance certificate'
    ],
    matchScore: 79
  },
  {
    id: 'scheme-009',
    title: 'Fee Waiver for EWS Category',
    provider: 'University Grants Commission',
    category: 'FEE_WAIVER',
    description: 'Complete or partial fee waiver for students from Economically Weaker Sections in central universities.',
    benefits: [
      '100% tuition fee waiver',
      'Hostel fee subsidy',
      'Library and lab fee exemption'
    ],
    eligibility: [
      'Annual family income below ₹1 lakh',
      'Valid EWS certificate',
      'Admitted through merit/entrance exam',
      'Central university student'
    ],
    deadline: '2025-01-15',
    applyUrl: 'https://ugc.ac.in/ews-waiver',
    educationLevel: 'ALL',
    tags: ['Fee Waiver', 'EWS', 'Central Universities'],
    isRecommended: true,
    status: 'ACTIVE',
    documentsRequired: [
      'EWS certificate',
      'Income certificate',
      'Admission receipt',
      'Fee structure document'
    ],
    matchScore: 92
  },
  {
    id: 'scheme-010',
    title: 'Skill India Digital Hub - Free Training',
    provider: 'Ministry of Skill Development',
    category: 'SKILL_DEVELOPMENT',
    description: 'Free online skill development courses in emerging technologies with industry-recognized certifications.',
    benefits: [
      'Free course access (200+ courses)',
      'Industry certifications',
      'Placement assistance',
      'Mentor support'
    ],
    eligibility: [
      'Age 18-35 years',
      'Basic digital literacy',
      'Indian citizen'
    ],
    deadline: '2025-12-31',
    applyUrl: 'https://skillindia.gov.in/digital',
    educationLevel: 'ALL',
    tags: ['Skill Training', 'Free', 'Online', 'Certification'],
    isRecommended: true,
    status: 'ACTIVE',
    documentsRequired: [
      'Aadhaar card',
      'Email ID',
      'Phone number'
    ],
    matchScore: 86
  },
  {
    id: 'scheme-011',
    title: 'Chief Minister\'s Laptop Scheme',
    provider: 'State Government',
    category: 'FINANCIAL_AID',
    description: 'Free laptop/tablet distribution for meritorious students to support digital learning.',
    benefits: [
      'Free laptop/tablet',
      'Pre-loaded educational software',
      '2-year warranty',
      'Internet data voucher'
    ],
    eligibility: [
      'Secured 85%+ in Class 12',
      'State domicile',
      'First in family to pursue higher education'
    ],
    deadline: '2025-02-28',
    applyUrl: 'https://stategov.in/laptop-scheme',
    educationLevel: 'UNDERGRADUATE',
    state: 'Multiple States',
    tags: ['Digital Learning', 'One-time', 'Merit-based'],
    isRecommended: false,
    status: 'ACTIVE',
    documentsRequired: [
      'Class 12 marksheet',
      'Domicile certificate',
      'College admission letter',
      'Family income declaration'
    ],
    matchScore: 71
  },
  {
    id: 'scheme-012',
    title: 'AICTE Pragati Scholarship for Girls',
    provider: 'All India Council for Technical Education',
    category: 'SCHOLARSHIP',
    description: 'Scholarship exclusively for girl students pursuing technical education (Engineering/Architecture/Pharmacy).',
    benefits: [
      'Scholarship of ₹50,000/year',
      'Renewable for course duration',
      'Industry mentorship program',
      'Internship opportunities'
    ],
    eligibility: [
      'Female student',
      'Pursuing Diploma/Degree in technical education',
      'Family income below ₹8 lakhs',
      'AICTE-approved institution'
    ],
    stipend: '₹50,000/year',
    deadline: '2025-03-20',
    applyUrl: 'https://aicte-india.org/pragati',
    educationLevel: 'UNDERGRADUATE',
    tags: ['Girls Education', 'Technical', 'AICTE'],
    isRecommended: true,
    status: 'ACTIVE',
    documentsRequired: [
      'Income certificate',
      'Admission proof from AICTE institution',
      'Previous year marksheet',
      'Aadhaar card',
      'Bank account details'
    ],
    matchScore: 89
  }
];

export const MOCK_ELIGIBILITY_CHECKS: Record<string, EligibilityCheck> = {
  'scheme-001': {
    schemeId: 'scheme-001',
    criteria: [
      {
        requirement: 'Family income below ₹8 lakhs per annum',
        userStatus: 'MEETS',
        details: 'Your family income (₹6.5 lakhs) is below the threshold'
      },
      {
        requirement: 'Minimum 75% marks in Class 12',
        userStatus: 'MEETS',
        details: 'You scored 88% in Class 12'
      },
      {
        requirement: 'Enrolled in recognized university',
        userStatus: 'MEETS',
        details: 'Tech University is UGC recognized'
      },
      {
        requirement: 'Indian citizen',
        userStatus: 'MEETS',
        details: 'Verified from profile'
      }
    ],
    overallEligibility: 'ELIGIBLE',
    recommendedActions: [
      'Prepare income certificate from Tehsildar',
      'Keep Class 12 marksheet ready',
      'Get college admission letter signed',
      'Apply before January 31, 2025'
    ]
  },
  'scheme-009': {
    schemeId: 'scheme-009',
    criteria: [
      {
        requirement: 'Annual family income below ₹1 lakh',
        userStatus: 'DOES_NOT_MEET',
        details: 'Your family income (₹6.5 lakhs) exceeds the limit'
      },
      {
        requirement: 'Valid EWS certificate',
        userStatus: 'DOES_NOT_MEET',
        details: 'No EWS certificate found in profile'
      },
      {
        requirement: 'Admitted through merit/entrance exam',
        userStatus: 'MEETS',
        details: 'You were admitted through entrance exam'
      },
      {
        requirement: 'Central university student',
        userStatus: 'PARTIAL',
        details: 'Verification pending for university status'
      }
    ],
    overallEligibility: 'NOT_ELIGIBLE',
    recommendedActions: [
      'Check alternative fee waiver schemes',
      'Contact university financial aid office',
      'Consider education loans with subsidized interest'
    ]
  }
};

// Helper functions
export const getSchemesByCategory = (category: SchemeCategory): Scheme[] => {
  return MOCK_SCHEMES.filter(scheme => scheme.category === category);
};

export const getRecommendedSchemes = (): Scheme[] => {
  return MOCK_SCHEMES.filter(scheme => scheme.isRecommended).sort((a, b) => b.matchScore - a.matchScore);
};

export const getActiveSchemes = (): Scheme[] => {
  return MOCK_SCHEMES.filter(scheme => scheme.status === 'ACTIVE');
};

export const getSchemeById = (id: string): Scheme | undefined => {
  return MOCK_SCHEMES.find(scheme => scheme.id === id);
};

export const getEligibilityCheck = (schemeId: string): EligibilityCheck | undefined => {
  return MOCK_ELIGIBILITY_CHECKS[schemeId];
};

export const getDaysUntilDeadline = (deadline: string): number => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
