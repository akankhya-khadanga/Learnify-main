-- Workspace Settings Table for AI Tutor Trust Engine
-- This stores boundaries and preferences for each workspace domain

CREATE TABLE IF NOT EXISTS workspace_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_type TEXT NOT NULL UNIQUE, -- 'frontend', 'backend', 'ml', 'datascience', 'cybersecurity'
  boundary_rules TEXT NOT NULL, -- Academic scope and allowed topics
  preference_rules TEXT NOT NULL, -- Style and formatting preferences
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default boundaries and preferences for each workspace
INSERT INTO workspace_settings (workspace_type, boundary_rules, preference_rules) VALUES
('frontend', 
  'BOUNDARY RULES:
  - HTML5, CSS3, JavaScript (ES6+), TypeScript
  - React.js, Vue.js, Angular, Svelte
  - Responsive Design, CSS Grid, Flexbox
  - Web APIs, DOM Manipulation, Event Handling
  - State Management (Redux, Context API, Zustand)
  - Component Architecture, Hooks, Lifecycle
  - Build Tools (Webpack, Vite, esbuild)
  - Testing (Jest, React Testing Library, Cypress)
  - Performance Optimization, Accessibility
  - Web Standards and Best Practices
  
  OUT OF BOUNDS:
  - Backend/Server code unrelated to frontend
  - Database design (unless for frontend context)
  - Unrelated programming languages
  - Non-academic content',
  
  'PREFERENCE RULES:
  - Use clear, beginner-friendly explanations
  - Provide code examples with comments
  - Break complex concepts into steps
  - Use analogies for difficult concepts
  - Include visual descriptions when relevant
  - Format code with proper syntax highlighting
  - Provide "Why" explanations, not just "What"
  - End with actionable next steps'),

('backend',
  'BOUNDARY RULES:
  - Node.js, Express.js, FastAPI, Django, Spring Boot
  - RESTful APIs, GraphQL, gRPC
  - Authentication (JWT, OAuth, Sessions)
  - Database Design (SQL, NoSQL, ORM)
  - Server Architecture, Microservices
  - API Security, CORS, Rate Limiting
  - Caching (Redis, Memcached)
  - Message Queues, WebSockets
  - Testing (Unit, Integration, E2E)
  - Deployment, Docker, CI/CD
  
  OUT OF BOUNDS:
  - Frontend-specific frameworks (React, Vue)
  - UI/UX design principles
  - Unrelated programming concepts
  - Non-academic content',
  
  'PREFERENCE RULES:
  - Focus on scalability and best practices
  - Explain security implications
  - Provide architecture diagrams descriptions
  - Include error handling patterns
  - Use industry-standard terminology
  - Show request/response examples
  - Explain trade-offs between approaches
  - Reference real-world use cases'),

('ml',
  'BOUNDARY RULES:
  - Python, NumPy, Pandas, Scikit-learn
  - TensorFlow, PyTorch, Keras
  - Neural Networks, Deep Learning
  - Supervised/Unsupervised Learning
  - Natural Language Processing
  - Computer Vision
  - Model Training, Evaluation, Validation
  - Feature Engineering, Data Preprocessing
  - Transfer Learning, Fine-tuning
  - MLOps, Model Deployment
  
  OUT OF BOUNDS:
  - Web development frameworks
  - Non-ML programming topics
  - Pure mathematics without ML context
  - Non-academic content',
  
  'PREFERENCE RULES:
  - Explain mathematical concepts intuitively
  - Use real-world dataset examples
  - Describe model architectures clearly
  - Include metrics and evaluation methods
  - Show code with data pipeline context
  - Explain hyperparameter effects
  - Visualize concepts with descriptions
  - Reference research papers when relevant'),

('datascience',
  'BOUNDARY RULES:
  - Python, R, SQL, Excel
  - Pandas, NumPy, Matplotlib, Seaborn
  - Data Cleaning, EDA, Visualization
  - Statistical Analysis, Hypothesis Testing
  - A/B Testing, Experimental Design
  - Time Series Analysis
  - Big Data (PySpark, Hadoop)
  - Data Warehousing, ETL
  - Business Intelligence, Dashboards
  - Predictive Analytics
  
  OUT OF BOUNDS:
  - Deep learning model architecture
  - Web/mobile app development
  - Unrelated programming topics
  - Non-academic content',
  
  'PREFERENCE RULES:
  - Focus on business insights
  - Explain statistical concepts clearly
  - Show data visualization examples
  - Include interpretation of results
  - Use domain-specific examples
  - Explain data quality issues
  - Provide actionable recommendations
  - Reference industry best practices'),

('cybersecurity',
  'BOUNDARY RULES:
  - Network Security, Protocols (TCP/IP, DNS, HTTPS)
  - Cryptography (Encryption, Hashing, Certificates)
  - Penetration Testing, Ethical Hacking
  - OWASP Top 10, Web Vulnerabilities
  - Security Tools (Kali Linux, Metasploit, Burp Suite)
  - Incident Response, Forensics
  - Security Architecture, Defense in Depth
  - Authentication, Authorization, IAM
  - Malware Analysis, Reverse Engineering
  - Compliance (GDPR, HIPAA, PCI-DSS)
  
  OUT OF BOUNDS:
  - Illegal hacking techniques
  - Non-educational exploit creation
  - Personal attack instructions
  - Non-academic content',
  
  'PREFERENCE RULES:
  - Emphasize ethical practices always
  - Explain attack vectors and defenses
  - Include mitigation strategies
  - Use CVE references when relevant
  - Show secure coding examples
  - Explain security trade-offs
  - Reference industry standards
  - Provide hands-on lab suggestions');

-- Query History Table (optional - for tracking)
CREATE TABLE IF NOT EXISTS ai_tutor_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- Can be linked to auth.users if needed
  workspace_type TEXT NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  boundary_violated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspace_settings_type ON workspace_settings(workspace_type);
CREATE INDEX IF NOT EXISTS idx_ai_queries_workspace ON ai_tutor_queries(workspace_type);
CREATE INDEX IF NOT EXISTS idx_ai_queries_created ON ai_tutor_queries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow service role (Edge Functions) to read/write
CREATE POLICY "Service role can read workspace_settings" 
  ON workspace_settings FOR SELECT 
  USING (true);

CREATE POLICY "Service role can update workspace_settings" 
  ON workspace_settings FOR UPDATE 
  USING (true);

CREATE POLICY "Service role can insert ai_tutor_queries" 
  ON ai_tutor_queries FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role can read ai_tutor_queries" 
  ON ai_tutor_queries FOR SELECT 
  USING (true);

-- Allow authenticated users to read workspace settings
CREATE POLICY "Authenticated users can read workspace_settings" 
  ON workspace_settings FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to update workspace settings
CREATE POLICY "Authenticated users can update workspace_settings" 
  ON workspace_settings FOR UPDATE 
  TO authenticated 
  USING (true);
