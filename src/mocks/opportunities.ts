/**
 * MOCK DATA: Smart Opportunity Recommender
 * Government schemes, scholarships, internships, competitions, and grants
 */

export type OpportunityCategory = 'SCHOLARSHIP' | 'SCHEME' | 'COMPETITION' | 'INTERNSHIP' | 'GRANT';
export type EligibilityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ApplicationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  provider: string;
  description: string;
  amount?: string;
  deadline: string;
  eligibility: string[];
  eligibilityScore: EligibilityLevel;
  requirements: string[];
  benefits: string[];
  applicationUrl: string;
  applicationStatus: ApplicationStatus;
  matchScore: number; // 0-100
  tags: string[];
  location?: string;
  duration?: string;
}

export interface AutoApplicationPreview {
  opportunityId: string;
  estimatedCompletion: string;
  requiredDocuments: {
    name: string;
    status: 'available' | 'missing' | 'required';
    source?: string;
  }[];
  prefillData: {
    field: string;
    value: string;
    source: string;
  }[];
  successProbability: number;
}

export const OPPORTUNITY_COLORS = {
  SCHOLARSHIP: '#C9B458',
  SCHEME: '#C27BA0',
  COMPETITION: '#6DAEDB',
  INTERNSHIP: '#9B59B6',
  GRANT: '#E67E22'
};

export const ELIGIBILITY_COLORS = {
  HIGH: '#22C55E',
  MEDIUM: '#EAB308',
  LOW: '#EF4444'
};

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-001',
    title: 'National Merit Scholarship Program 2025',
    category: 'SCHOLARSHIP',
    provider: 'Ministry of Education',
    description: 'Merit-based scholarship for undergraduate students with outstanding academic performance. Covers full tuition, accommodation, and provides a monthly stipend of $500.',
    amount: '$25,000/year',
    deadline: '2025-01-15',
    eligibility: ['GPA > 3.8', 'Undergraduate', 'Age < 25'],
    eligibilityScore: 'HIGH',
    requirements: [
      'Academic transcripts',
      'Two recommendation letters',
      'Personal statement (500 words)',
      'Proof of enrollment'
    ],
    benefits: [
      'Full tuition coverage',
      'Monthly stipend of $500',
      'Book allowance',
      'Mentorship program access'
    ],
    applicationUrl: 'https://example.com/apply/nms2025',
    applicationStatus: 'NOT_STARTED',
    matchScore: 95,
    tags: ['Merit-based', 'Full-ride', 'Renewable'],
    location: 'United States',
    duration: '4 years'
  },
  {
    id: 'opp-002',
    title: 'STEM Excellence Grant',
    category: 'GRANT',
    provider: 'National Science Foundation',
    description: 'Research grant for STEM students working on innovative projects in computer science, engineering, or mathematics.',
    amount: '$15,000',
    deadline: '2025-02-01',
    eligibility: ['STEM Major', 'Research Proposal', 'Sophomore+'],
    eligibilityScore: 'HIGH',
    requirements: [
      'Research proposal (2000 words)',
      'Faculty advisor endorsement',
      'Budget breakdown',
      'Timeline and milestones'
    ],
    benefits: [
      'Research funding',
      'Lab equipment access',
      'Conference travel support',
      'Publication assistance'
    ],
    applicationUrl: 'https://example.com/apply/stem-grant',
    applicationStatus: 'NOT_STARTED',
    matchScore: 88,
    tags: ['Research', 'STEM', 'Innovation'],
    duration: '12 months'
  },
  {
    id: 'opp-003',
    title: 'Digital India Skill Development Scheme',
    category: 'SCHEME',
    provider: 'Government of India',
    description: 'Government initiative to provide free technical training and certification in emerging technologies. Includes placement assistance.',
    deadline: '2025-01-20',
    eligibility: ['Age 18-35', 'Basic Computer Skills', 'Indian Citizen'],
    eligibilityScore: 'MEDIUM',
    requirements: [
      'Government ID proof',
      'Educational certificates',
      'Address proof',
      'Income certificate'
    ],
    benefits: [
      'Free training courses',
      'Industry certification',
      'Placement assistance',
      'Skill development kit'
    ],
    applicationUrl: 'https://example.com/apply/digital-india',
    applicationStatus: 'NOT_STARTED',
    matchScore: 75,
    tags: ['Government', 'Free Training', 'Placement'],
    location: 'India',
    duration: '6 months'
  },
  {
    id: 'opp-004',
    title: 'Google Summer of Code 2025',
    category: 'INTERNSHIP',
    provider: 'Google Inc.',
    description: 'Global program focused on bringing new contributors into open source software development. Work with open source organizations remotely.',
    amount: '$3,000 - $6,600',
    deadline: '2025-03-15',
    eligibility: ['18+ years', 'Student Status', 'Programming Skills'],
    eligibilityScore: 'HIGH',
    requirements: [
      'Project proposal',
      'GitHub profile',
      'Code samples',
      'Organization selection'
    ],
    benefits: [
      'Stipend payment',
      'Mentorship from experts',
      'Open source contribution',
      'Google certification'
    ],
    applicationUrl: 'https://example.com/apply/gsoc',
    applicationStatus: 'NOT_STARTED',
    matchScore: 92,
    tags: ['Remote', 'Open Source', 'Paid'],
    duration: '10-12 weeks'
  },
  {
    id: 'opp-005',
    title: 'International Math Olympiad',
    category: 'COMPETITION',
    provider: 'IMO Foundation',
    description: 'Premier mathematics competition for pre-university students worldwide. Winners receive medals, certificates, and scholarship opportunities.',
    deadline: '2025-02-28',
    eligibility: ['Age < 20', 'High School / Undergraduate', 'Math Proficiency'],
    eligibilityScore: 'MEDIUM',
    requirements: [
      'Registration form',
      'School endorsement',
      'Previous competition scores (optional)',
      'Parent/guardian consent'
    ],
    benefits: [
      'Gold/Silver/Bronze medals',
      'International recognition',
      'University scholarship offers',
      'Travel to host country'
    ],
    applicationUrl: 'https://example.com/apply/imo',
    applicationStatus: 'NOT_STARTED',
    matchScore: 70,
    tags: ['International', 'Mathematics', 'Prestigious'],
    location: 'Global',
    duration: '1 week'
  },
  {
    id: 'opp-006',
    title: 'Women in Tech Scholarship',
    category: 'SCHOLARSHIP',
    provider: 'TechWomen Foundation',
    description: 'Supporting women pursuing degrees in computer science, IT, and related fields. Includes mentorship and networking opportunities.',
    amount: '$10,000/year',
    deadline: '2025-01-30',
    eligibility: ['Female', 'Tech Major', 'GPA > 3.0'],
    eligibilityScore: 'MEDIUM',
    requirements: [
      'Academic transcripts',
      'Essay on women in tech (750 words)',
      'Letter of recommendation',
      'Portfolio or GitHub profile'
    ],
    benefits: [
      'Tuition support',
      'Tech conference passes',
      'Mentorship program',
      'Networking events'
    ],
    applicationUrl: 'https://example.com/apply/women-tech',
    applicationStatus: 'IN_PROGRESS',
    matchScore: 82,
    tags: ['Women', 'Technology', 'Diversity'],
    duration: '2 years'
  },
  {
    id: 'opp-007',
    title: 'StartUp India Seed Fund',
    category: 'GRANT',
    provider: 'Ministry of Commerce',
    description: 'Financial assistance for early-stage startups with innovative business ideas. Provides seed funding and incubation support.',
    amount: 'Up to $50,000',
    deadline: '2025-03-01',
    eligibility: ['Registered Startup', 'Business Plan', 'Innovation Focus'],
    eligibilityScore: 'LOW',
    requirements: [
      'Business plan document',
      'Pitch deck presentation',
      'Financial projections',
      'Team details',
      'Company incorporation proof'
    ],
    benefits: [
      'Seed funding',
      'Incubation center access',
      'Legal and accounting support',
      'Investor networking'
    ],
    applicationUrl: 'https://example.com/apply/startup-seed',
    applicationStatus: 'NOT_STARTED',
    matchScore: 45,
    tags: ['Entrepreneurship', 'Startup', 'Funding'],
    location: 'India',
    duration: '18 months'
  },
  {
    id: 'opp-008',
    title: 'NASA Space Apps Challenge',
    category: 'COMPETITION',
    provider: 'NASA',
    description: 'International hackathon where teams use NASA data to solve challenges related to Earth and space. Global prizes and recognition.',
    deadline: '2025-09-15',
    eligibility: ['All Ages', 'Team or Individual', 'Tech Interest'],
    eligibilityScore: 'HIGH',
    requirements: [
      'Team registration (1-6 members)',
      'Project submission',
      'Video presentation',
      'Code repository'
    ],
    benefits: [
      'Global recognition',
      'NASA swag and certificates',
      'Potential NASA internship',
      'Innovation awards'
    ],
    applicationUrl: 'https://example.com/apply/space-apps',
    applicationStatus: 'NOT_STARTED',
    matchScore: 86,
    tags: ['Hackathon', 'Space', 'Technology'],
    location: 'Global (Virtual)',
    duration: '48 hours'
  }
];

export const MOCK_AUTO_APPLICATION_PREVIEWS: Record<string, AutoApplicationPreview> = {
  'opp-001': {
    opportunityId: 'opp-001',
    estimatedCompletion: '15 minutes',
    requiredDocuments: [
      { name: 'Academic Transcripts', status: 'available', source: 'Uploaded 2024-11-20' },
      { name: 'Recommendation Letter #1', status: 'available', source: 'Dr. Smith - Uploaded 2024-12-01' },
      { name: 'Recommendation Letter #2', status: 'missing' },
      { name: 'Personal Statement', status: 'required' }
    ],
    prefillData: [
      { field: 'Full Name', value: 'Alice Johnson', source: 'Profile' },
      { field: 'Email', value: 'alice.j@student.edu', source: 'Profile' },
      { field: 'GPA', value: '3.92', source: 'Academic Records' },
      { field: 'Major', value: 'Computer Science', source: 'Enrollment' },
      { field: 'Expected Graduation', value: 'May 2026', source: 'Enrollment' }
    ],
    successProbability: 92
  },
  'opp-004': {
    opportunityId: 'opp-004',
    estimatedCompletion: '25 minutes',
    requiredDocuments: [
      { name: 'Project Proposal', status: 'required' },
      { name: 'GitHub Profile Link', status: 'available', source: 'github.com/alice-johnson' },
      { name: 'Code Sample #1', status: 'available', source: 'Portfolio Project - Chess AI' },
      { name: 'Code Sample #2', status: 'missing' }
    ],
    prefillData: [
      { field: 'Full Name', value: 'Alice Johnson', source: 'Profile' },
      { field: 'Email', value: 'alice.j@student.edu', source: 'Profile' },
      { field: 'University', value: 'Tech University', source: 'Profile' },
      { field: 'GitHub Username', value: 'alice-johnson', source: 'Linked Accounts' },
      { field: 'Programming Languages', value: 'Python, JavaScript, C++', source: 'Skills Profile' }
    ],
    successProbability: 88
  }
};

// Helper functions
export const getOpportunitiesByCategory = (category: OpportunityCategory): Opportunity[] => {
  return MOCK_OPPORTUNITIES.filter(opp => opp.category === category);
};

export const getHighMatchOpportunities = (): Opportunity[] => {
  return MOCK_OPPORTUNITIES.filter(opp => opp.matchScore >= 80).sort((a, b) => b.matchScore - a.matchScore);
};

export const getOpportunityById = (id: string): Opportunity | undefined => {
  return MOCK_OPPORTUNITIES.find(opp => opp.id === id);
};

export const getAutoApplicationPreview = (opportunityId: string): AutoApplicationPreview | undefined => {
  return MOCK_AUTO_APPLICATION_PREVIEWS[opportunityId];
};

// Re-export from schemes for backward compatibility
export { getDaysUntilDeadline } from './schemes';

