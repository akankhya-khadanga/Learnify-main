# 📚 Learnify - Complete Project Documentation

**Generated:** January 30, 2026  
**Author:** Team BitCode  
**Version:** 1.0.0

---

## 📖 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Core Features](#4-core-features)
5. [Architecture](#5-architecture)
6. [Database Schema](#6-database-schema)
7. [Services & Hooks](#7-services--hooks)
8. [Components Library](#8-components-library)
9. [Pages & Routes](#9-pages--routes)
10. [External Integrations](#10-external-integrations)
11. [Accessibility Features](#11-accessibility-features)
12. [Gamification System](#12-gamification-system)
13. [Environment Configuration](#13-environment-configuration)
14. [Server & APIs](#14-server--apis)
15. [Build & Deployment](#15-build--deployment)
16. [Team Information](#16-team-information)

---

## 1. Project Overview

### What is Learnify?

**Learnify** is a comprehensive, AI-powered educational platform designed to transform how students learn, collaborate, and achieve their academic goals. It's an **intelligent learning ecosystem** that combines:

- **AI-Driven Personalization** via Google Gemini Pro
- **Accessibility-First Design** including 3D Sign Language (CWASA)
- **Immersive Learning Environments** with VR/3D experiences
- **Unified Learning OS** integrating all study tools
- **Gamification & Motivation** systems
- **Real-time Collaboration & Community** features

### Vision

> "To democratize quality education by making personalized, accessible, and engaging learning experiences available to everyone, regardless of their physical abilities, learning preferences, or economic background."

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Source Files | 376+ |
| React Components | 216+ |
| Service Files | 37 |
| Custom Hooks | 19 |
| Database Migrations | 23 |
| Supported Routes | 40+ |
| Dependencies | 94 |

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework with concurrent features |
| TypeScript | 5.8.3 | Type-safe development |
| Vite | 7.2.2 | Build tool and dev server |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Framer Motion | 12.23.24 | Animations and transitions |
| GSAP | 3.13.0 | Advanced animations |
| Three.js | 0.170.0 | 3D graphics |
| React Three Fiber | 8.18.0 | React renderer for Three.js |
| Radix UI | Latest | Accessible component primitives |
| Zustand | 5.0.8 | State management |
| React Router | 6.30.1 | Client-side routing |
| React Hook Form | 7.61.1 | Form handling |
| Zod | 3.25.76 | Schema validation |
| React Query | 5.83.0 | Data fetching and caching |

### Backend & Database

| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL database with real-time capabilities |
| Supabase Auth | Secure authentication with Google OAuth |
| Supabase Storage | File storage for PDFs, images, documents |
| Row-Level Security | Database-level access control |
| Express.js | Backend proxy server (Node.js) |
| Socket.io | Real-time communication |
| Simple-Peer | WebRTC for calling features |

### AI & Machine Learning

| Technology | Purpose |
|------------|---------|
| Google Gemini Pro 1.5 | AI tutoring and content generation |
| CWASA | 3D Sign Language avatars |
| MediaPipe Hands | Gesture recognition |
| Adaptive Learning Algorithms | Personalized learning paths |

### External APIs & Services

| Service | Purpose |
|---------|---------|
| Judge0 | Code execution sandbox (50+ languages) |
| RapidAPI Deep Translate | Multi-language translation (100+ languages) |
| YouTube Data API | Video integration |
| Google Classroom API | Assignment synchronization |
| Spotify API | Music integration |
| Resend | Email notifications |
| Sentry | Error tracking |

### Observability

| Technology | Purpose |
|------------|---------|
| OpenTelemetry | Distributed tracing |
| Winston | Logging |
| Prometheus (prom-client) | Metrics collection |

---

## 3. Project Structure

```
Learnify/
├── .agent/                 # AI agent configuration
├── public/                 # Static assets (1339 files)
│   ├── jas/loc2021/       # CWASA sign language assets
│   └── ...
├── server/                 # Express backend server
│   ├── index.js           # Main server file (487 lines)
│   ├── logger.js          # Winston logging
│   ├── metrics.js         # Prometheus metrics
│   └── tracing.js         # OpenTelemetry tracing
├── src/                    # Frontend source code
│   ├── App.tsx            # Main application (741 lines)
│   ├── main.tsx           # Entry point
│   ├── index.css          # Global styles
│   ├── components/        # React components (216+ files)
│   │   ├── 3D/           # Three.js 3D components
│   │   ├── accessibility/ # Accessibility tools
│   │   ├── calling/      # WebRTC calling
│   │   ├── dashboard/    # Dashboard components
│   │   ├── game/         # Game components
│   │   ├── gamification/ # XP, achievements, leaderboards
│   │   ├── pdf/          # PDF viewer/annotator
│   │   ├── signLanguage/ # Sign language components
│   │   ├── ui/           # shadcn/ui components (52)
│   │   ├── VR/           # VR environments
│   │   ├── wellness/     # Wellness/mental health
│   │   └── workspace/    # Workspace tools
│   ├── config/            # App configuration
│   │   └── navigationClusters.ts
│   ├── hooks/             # Custom React hooks (19)
│   ├── lib/               # Core libraries (10)
│   │   ├── gemini.ts     # Gemini AI client
│   │   ├── supabase.ts   # Supabase client
│   │   ├── aiClient.ts   # AI utilities
│   │   └── isl-dataset.ts # Sign language dataset
│   ├── mocks/             # Mock data (22 files)
│   ├── pages/             # Page components (50)
│   ├── services/          # API services (37)
│   ├── store/             # Zustand stores (7)
│   ├── types/             # TypeScript types (7)
│   └── utils/             # Utility functions (3)
├── supabase/              # Database configuration
│   ├── migrations/        # SQL migrations (23)
│   └── functions/         # Edge functions
├── design-system/         # Design tokens
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind configuration
├── vercel.json            # Vercel deployment
└── docker-compose.*.yml   # Docker configurations
```

---

## 4. Core Features

### 🤖 AI-Powered Learning

| Feature | Description |
|---------|-------------|
| **Intelligent AI Tutor** | Context-aware assistance powered by Gemini Pro |
| **Multi-Modal Input** | Text, voice, and document upload support |
| **Reasoning Transparency** | View AI's thought process with reasoning drawers |
| **Citation & Verification** | Responses include verified sources |
| **Instructor Mode** | Upload PDFs for personalized tutoring |
| **Adaptive Content Generation** | AI generates courses, roadmaps, and exercises |
| **Smart Roadmaps** | 40+ pre-built career paths + custom generation |

### 🤟 Accessibility Features

| Feature | Description |
|---------|-------------|
| **3D Sign Language (CWASA)** | Interactive lessons with 3D animated avatars |
| **Real-Time Translation** | Text-to-sign and sign-to-text conversion |
| **Gesture Recognition** | Webcam-based sign practice with feedback |
| **Dyslexia-Friendly Fonts** | Comic Sans MS and OpenDyslexic |
| **Text Scaling** | 80% to 150% adjustment |
| **High Contrast Mode** | Enhanced visibility |
| **Colorblind Filters** | Protanopia, Deuteranopia, Tritanopia |
| **Screen Reader Support** | Full ARIA compatibility |
| **Keyboard Navigation** | Complete keyboard-only navigation |
| **Caption Bar** | Real-time captions for audio/video |

### 🌌 Immersive Learning

| Feature | Description |
|---------|-------------|
| **VR Study Rooms** | Virtual library, space station, beach, forest |
| **3D Visualizations** | Interactive 3D for complex concepts |
| **Knowledge Orbit** | 3D knowledge graph exploration |
| **Focus Room** | Pomodoro timer with ambient soundscapes |
| **3D Model Viewer** | Science, engineering, anatomy models |

### 📚 Study Tools

| Feature | Description |
|---------|-------------|
| **Monaco Code Editor** | 50+ languages with execution (Judge0) |
| **Smart Notes** | Rich text, AI summaries, flashcards |
| **PDF Annotator** | Highlights, drawings, text notes |
| **Interactive Whiteboard** | Collaborative with shape recognition |
| **Study Planner** | AI-powered scheduling |
| **Habit Tracker** | Custom habits with streak tracking |
| **Smart Deadline Manager** | Google Classroom integration |

### 🎮 Gamification

| Feature | Description |
|---------|-------------|
| **XP & Leveling** | Earn points for learning activities |
| **Performance Tiers** | Bronze → Silver → Gold → Platinum → Diamond → Master |
| **Leaderboards** | Global and institution rankings |
| **Achievement System** | 100+ badges for milestones |
| **Game Hub** | Educational games and competitions |

### 🤝 Collaboration

| Feature | Description |
|---------|-------------|
| **Study Groups** | Real-time messaging, voice chat |
| **Friends System** | Direct messaging, online status |
| **Discussion Forums** | Peer-to-peer learning |
| **Classroom Workspace** | Teacher dashboard, assignments |
| **Voice/Video Calls** | WebRTC-based calling |

### 📊 Analytics & Insights

| Feature | Description |
|---------|-------------|
| **Performance Analytics** | Time spent, completion rates, accuracy |
| **Study Pattern Analysis** | Optimal study times, productivity |
| **Progress Charts** | Visual learning journey |
| **Burnout Detection** | Alerts for overworking |
| **Weekly/Monthly Reports** | Email summaries |

### 💙 Wellness & Mental Health

| Feature | Description |
|---------|-------------|
| **Mood Tracking** | Emotional wellness monitoring |
| **Crisis Resources** | 24/7 support access |
| **Breathing Exercises** | 4-7-8 technique guidance |
| **Break Reminders** | Smart break suggestions |
| **Wellness Challenges** | Healthy habit participation |

---

## 5. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
│  React 18 + TypeScript + Tailwind CSS + Framer Motion          │
│  • Responsive UI Components (Radix UI)                          │
│  • 3D Graphics (Three.js / React Three Fiber)                   │
│  • State Management (Zustand)                                   │
│  • Form Handling (React Hook Form + Zod)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                           │
│  • Routing (React Router v6)                                    │
│  • Authentication Flow                                          │
│  • Real-Time Subscriptions                                      │
│  • Data Caching (React Query)                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Service Layer                               │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ AI Services  │ Auth Service │ Data Service │ Integration  │ │
│  │ • Gemini Pro │ • Supabase   │ • Supabase   │ • Judge0     │ │
│  │ • Adaptive   │   Auth       │   PostgreSQL │ • Classroom  │ │
│  │   Learning   │ • OAuth      │ • Real-time  │ • YouTube    │ │
│  │ • CWASA      │ • RLS        │ • Storage    │ • Spotify    │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                  │
│  Supabase (PostgreSQL + Real-time + Storage + Auth)            │
│  • User Profiles & Authentication                               │
│  • Learning Content & Progress                                  │
│  • Social Features (Groups, Messages, Friends)                  │
│  • Analytics & Study Sessions                                   │
│  • File Storage (PDFs, Images, Documents)                       │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Accessibility-First**: WCAG 2.1 AA compliance
2. **Real-Time Sync**: Supabase real-time subscriptions
3. **Offline Support**: PWA with service workers
4. **Modular Design**: Component-based architecture
5. **Type Safety**: Full TypeScript coverage
6. **Performance**: Code splitting, lazy loading
7. **Security**: Row-Level Security (RLS) policies
8. **Scalability**: Designed for thousands of concurrent users

---

## 6. Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User profiles, XP, level, streak, preferences |
| `workspaces` | User-created learning spaces |
| `notes` | Rich text notes with AI summaries |
| `pdf_documents` | Uploaded PDF documents |
| `pdf_annotations` | PDF highlights, drawings, notes |
| `study_sessions` | Session tracking with duration |
| `study_pattern_stats` | Aggregated study patterns (materialized view) |
| `habits` | Custom user habits |
| `habit_completions` | Habit completion tracking |
| `roadmaps` | Career path roadmaps |
| `roadmap_nodes` | Skills, resources, progress |
| `ai_roadmaps` | AI-generated custom roadmaps |
| `courses` | AI-generated and curated courses |
| `course_modules` | Course modules and lessons |
| `study_groups` | Study group metadata |
| `group_messages` | Real-time group messaging |
| `friends` | Friend connections |
| `direct_messages` | Private messaging |
| `call_sessions` | WebRTC call sessions |
| `call_participants` | Call participant status |
| `achievements` | Achievement definitions |
| `user_achievements` | User achievement unlocks |
| `exam_notifications` | Exam reminder notifications |

### Migrations Overview (23 files)

```
000_users_table_setup.sql           - Core user table
001_exam_notifications.sql          - Exam notification system
002_exam_email_notifications.sql    - Email notification triggers
20250101_learning_safe_integrations - Safe integrations
20250111_courses_schema.sql         - Course management
20250127_study_groups_schema.sql    - Study groups & messaging
20250127_study_planner_schema.sql   - Study planner
20250128_habit_tracker.sql          - Habit tracking
20250128_pdf_annotator_schema.sql   - PDF annotation
20250128_study_pattern_analysis.sql - Study analytics
20251213_workspace_settings.sql     - Workspace configuration
20260111_calling_*.sql              - WebRTC calling
20260126_create_ai_roadmaps*.sql    - AI roadmap generation
area2_functionality_enhancements    - Feature enhancements
area7_gamification.sql              - Gamification system
create_notes_table.sql              - Notes table
fix_users_rls_policies.sql          - RLS policy fixes
```

---

## 7. Services & Hooks

### Services (37 files)

| Service | Purpose |
|---------|---------|
| `adaptiveLearning.ts` | AI-driven personalized learning |
| `aiSchedulingService.ts` | Study schedule optimization |
| `analyticsService.ts` | Performance tracking |
| `apiService.ts` | HTTP API utilities |
| `authService.ts` | Authentication management |
| `calendarService.ts` | Calendar integration |
| `callSignalingService.ts` | WebRTC signaling |
| `callingService.ts` | Voice/video calling |
| `ccmaSignLanguage.ts` | CWASA sign language integration |
| `classroomService.ts` | Google Classroom integration |
| `communitiesService.ts` | Community management |
| `communityService.ts` | Forums and discussions |
| `contextService.ts` | AI context management |
| `courseService.ts` | Course CRUD operations |
| `discordService.ts` | Discord-like features |
| `examNotificationService.ts` | Exam reminders |
| `friendsService.ts` | Friends system |
| `geminiLesson.ts` | AI lesson generation |
| `habitService.ts` | Habit tracking |
| `leaderboardService.ts` | Rankings and tiers |
| `messagingService.ts` | Direct messages |
| `notesService.ts` | Notes management |
| `notificationService.ts` | Push notifications |
| `onlineStatusService.ts` | Presence tracking |
| `pdfService.ts` | PDF operations |
| `reportService.ts` | Analytics reports |
| `roadmapService.ts` | Roadmap management |
| `roadmapShService.ts` | roadmap.sh integration |
| `signalingService.ts` | WebRTC signaling |
| `spotifyService.ts` | Spotify music integration |
| `studyGroupsService.ts` | Study groups |
| `studyPlannerService.ts` | Study planning |
| `studyTogetherService.ts` | Collaborative study |
| `translateService.ts` | Translation service |
| `userService.ts` | User management |
| `webrtcService.ts` | WebRTC media handling |

### Custom Hooks (19 files)

| Hook | Purpose |
|------|---------|
| `useAIContext.ts` | AI conversation context |
| `useCallNotifications.ts` | Call notifications |
| `useEnergyTracker.ts` | User energy levels |
| `useExamCountdown.ts` | Exam countdown timer |
| `useGoogleClassroom.ts` | Classroom API integration |
| `useNotifications.ts` | Notification system |
| `useOnlineStatus.ts` | User presence |
| `useRoadmapProgress.ts` | Roadmap progression |
| `useRoadmapTimer.ts` | Roadmap study time |
| `useSoundPlayer.ts` | Audio playback |
| `useStreak.ts` | Study streak tracking |
| `useTasks.ts` | Task management |
| `useTranslation.ts` | Multi-language support |
| `useWellness.ts` | Wellness tracking |
| `useWhiteboardSession.ts` | Whiteboard collaboration |
| `useWorkspace.ts` | Workspace management |
| `useXP.ts` | XP and leveling |
| `useYouTubeSearch.ts` | YouTube video search |
| `use-toast.ts` | Toast notifications |

---

## 8. Components Library

### Component Categories (216+ components)

| Category | Files | Description |
|----------|-------|-------------|
| `3D/` | 20 | Three.js 3D components, scenes, avatars |
| `accessibility/` | 3 | Accessibility FAB, caption bar, tools |
| `adaptiveContent/` | 3 | Personalized content components |
| `analytics/` | 1 | Performance charts |
| `auth/` | 1 | Authentication UI |
| `calling/` | 2 | WebRTC call UI |
| `courses/` | 1 | Course display |
| `dashboard/` | 4 | Dashboard widgets |
| `emails/` | 1 | Email templates |
| `game/` | 11 | Game components (lobbies, results) |
| `gamification/` | 7 | XP bars, levels, achievements |
| `habits/` | 2 | Habit tracker UI |
| `integrations/` | 2 | Third-party integrations |
| `onboarding/` | 5 | User onboarding flow |
| `opportunities/` | 5 | Scholarships, internships |
| `pdf/` | 3 | PDF viewer/annotator |
| `performance/` | 5 | Performance metrics |
| `roadmaps/` | 3 | Roadmap display and creation |
| `schemes/` | 6 | Government schemes |
| `signLanguage/` | 6 | Sign language learning |
| `smartDeadline/` | 5 | Deadline management |
| `smartPlanner/` | 6 | Study planning |
| `studyGroups/` | 4 | Group collaboration |
| `studyTogether/` | 1 | Co-study features |
| `tasks/` | 1 | Task management |
| `ui/` | 52 | shadcn/ui components |
| `VR/` | 3 | VR environment components |
| `wellness/` | 8 | Mental health tools |
| `workspace/` | 7 | Workspace tools (IDE, whiteboard) |

### Key Components

```typescript
// Primary Components
AITutorPanel.tsx         // AI chat interface (20K bytes)
IDE.tsx                  // Monaco code editor integration
StudyGroupChat.tsx       // Real-time group messaging
GlobalMusicPlayer.tsx    // Spotify/ambient music player
ReasoningDrawer.tsx      // AI reasoning transparency
InstructorSourceManager  // PDF document management
UniverseVisualization    // 3D knowledge graph
```

---

## 9. Pages & Routes

### All Routes (40+ protected routes)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingGold` | Public landing page |
| `/login` | `Login` | User login |
| `/register` | `Register` | User registration |
| `/forgot-password` | `ForgotPassword` | Password recovery |
| `/reset-password` | `ResetPassword` | Password reset |
| `/dashboard` | `DashboardGold` | Main dashboard |
| `/ai-bot` | `AIBot` | AI tutor interface |
| `/roadmap` | `Roadmap` | Learning roadmaps |
| `/notes` | `Notes` | Smart notes |
| `/courses` | `Courses` | Course catalog |
| `/courses/:courseId` | `CourseDetail` | Course details |
| `/focus-room` | `FocusRoom` | Pomodoro/focus |
| `/study-vr` | `StudyVR` | VR environments |
| `/sign-language` | `SignLanguage` | Sign language hub |
| `/sign-language/setup` | `SignLanguageSetup` | Setup wizard |
| `/sign-language/lesson` | `SignLanguageLesson` | Interactive lessons |
| `/sign-language/translator` | `SignLanguageTranslator` | Text-to-sign |
| `/sign-language/practice` | `PracticeMode` | Practice with webcam |
| `/sign-language/tutor` | `SignLanguageTutor` | AI sign tutor |
| `/study-groups` | `StudyGroups` | Group management |
| `/study-planner` | `StudyPlanner` | Planning tools |
| `/smart-deadline` | `SmartDeadline` | Deadline manager |
| `/workspace` | `Workspace` | Workspace selection |
| `/workspace/:type` | `WorkspaceView` | Subject workspaces |
| `/workspaces` | `UnifiedOS` | Unified OS |
| `/workspaces/create` | `CreateSpace` | New workspace |
| `/workspaces/workspace/:id` | `WorkspaceLayout` | Workspace view |
| `/knowledge-orbit` | `KnowledgeOrbit` | 3D knowledge graph |
| `/game-hub` | `GameHub` | Educational games |
| `/game-hub/:gameId` | `GameDetail` | Game details |
| `/game-hub/:gameId/lobby` | `GameCompetitionLobby` | Game lobby |
| `/game-hub/:gameId/results` | `GameMatchResults` | Match results |
| `/performance-tiers` | `PerformanceTiers` | Tier rankings |
| `/community` | `Community` | Forums/discussions |
| `/friends` | `Friends` | Friends list |
| `/profile` | `Profile` | User profile |
| `/opportunities` | `Opportunities` | Career opportunities |
| `/wellness` | `Wellness` | Mental health tools |
| `/tasks` | `TaskManager` | Task management |
| `/browser` | `Browser` | In-app browser |
| `/study-together` | `StudyTogether` | Co-study sessions |
| `/cluster/:clusterId` | `ClusterRouteHandler` | Navigation clusters |

### Navigation Clusters

```typescript
{
  'learning-tools': ['AI Bot', 'Roadmap', 'Courses', 'Study Planner', 'Community'],
  'sign-language': ['Sign Language Hub'],
  'visualization-tools': ['Content Generator', 'Galaxy Graph', 'Visual Minds', 'Adaptive Content'],
  'supportive-tools': ['Government Schemes', 'Mental Wellness', 'Opportunities', 'Analytics', 'Performance Tiers'],
  'unified-os': ['Unified OS Workspace']
}
```

---

## 10. External Integrations

### Google Gemini AI

```typescript
// lib/gemini.ts - AI Client Configuration
- Model: gemini-1.5-pro
- Context-aware tutoring
- Adaptive content generation
- Roadmap creation
- Flashcard/quiz generation
```

### CWASA Sign Language

```typescript
// services/ccmaSignLanguage.ts
- 3D avatar rendering
- Text-to-sign translation
- Real-time animation
- ISL dataset (155K+ bytes)
```

### Judge0 Code Execution

```typescript
// 50+ supported languages
// Secure sandbox execution
// Real-time output streaming
```

### Google Classroom

```typescript
// hooks/useGoogleClassroom.ts
- Assignment sync
- Deadline import
- Grade integration
```

### Spotify

```typescript
// services/spotifyService.ts
- Focus room music
- Ambient sounds
- Playlist integration
```

### YouTube Data API

```typescript
// hooks/useYouTubeSearch.ts
- Educational video search
- Roadmap video tutorials
- In-app video player
```

---

## 11. Accessibility Features

### WCAG 2.1 AA Compliance

| Feature | Implementation |
|---------|----------------|
| **Keyboard Navigation** | Full tabindex and focus management |
| **Screen Readers** | ARIA labels, roles, and live regions |
| **Color Contrast** | High contrast mode available |
| **Text Scaling** | 80%-150% text size adjustment |
| **Dyslexia Support** | Specialized fonts |
| **Colorblind Modes** | Protanopia, Deuteranopia, Tritanopia filters |
| **Caption Bar** | Real-time captions for multimedia |
| **Focus Indicators** | Clear focus outlines |
| **Skip Links** | Navigation shortcuts |

### Accessibility Store

```typescript
// store/accessibilityStore.ts
{
  dyslexiaFont: boolean,
  textScale: number,      // 80-150
  highContrast: boolean,
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia',
  captionsEnabled: boolean
}
```

---

## 12. Gamification System

### XP & Leveling

| Activity | XP Earned |
|----------|-----------|
| Complete lesson | +50 XP |
| Finish milestone | +100 XP |
| Daily login | +10 XP |
| Study session (25 min) | +25 XP |
| Perfect quiz score | +75 XP |
| Help in community | +15 XP |
| Maintain streak | Multiplier |

### Performance Tiers

```
Bronze (0-999 XP) → Silver (1K-2.5K) → Gold (2.5K-5K) 
→ Platinum (5K-10K) → Diamond (10K-25K) → Master (25K+)
```

### Achievement Categories

- **Learning**: Course completion, topics mastered
- **Social**: Community contributions, friendships
- **Consistency**: Streaks, daily logins
- **Mastery**: Perfect scores, skill milestones
- **Special**: Event participation, rare unlocks

---

## 13. Environment Configuration

### Required Variables

```env
# Supabase (REQUIRED)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI (REQUIRED)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Optional Variables

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Code Execution
VITE_JUDGE0_HOST=https://judge0-ce.p.rapidapi.com
VITE_JUDGE0_KEY=your_rapidapi_key

# Translation
VITE_RAPIDAPI_KEY=your_rapidapi_key
VITE_RAPIDAPI_HOST=deep-translate1.p.rapidapi.com

# YouTube
VITE_YOUTUBE_API_KEY=your_youtube_api_key

# Backend Server
VITE_API_URL=http://localhost:3001
PORT=3001
```

---

## 14. Server & APIs

### Express Backend (Port 3001)

```javascript
// server/index.js - API Endpoints

GET  /                         // API information
GET  /health                   // Health check
GET  /health/live              // Liveness probe
GET  /health/ready             // Readiness probe
GET  /metrics                  // Prometheus metrics
GET  /api/courses/external     // External course catalog
GET  /courses/external         // Alternative endpoint
GET  /api/test-error           // Error testing (dev)
```

### Features

- **Logging**: Winston with file and console transports
- **Metrics**: Prometheus metrics collection
- **Tracing**: OpenTelemetry distributed tracing
- **Error Handling**: Sentry integration
- **CORS**: Enabled for all origins
- **Graceful Shutdown**: SIGTERM/SIGINT handling

---

## 15. Build & Deployment

### Development

```bash
# Install dependencies
npm install

# Start development server (frontend)
npm run dev                    # Port 8080

# Start backend server
npm run dev:server             # Port 3001

# Start both concurrently
npm run dev:all
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Platforms

| Platform | Configuration |
|----------|---------------|
| **Vercel** | `vercel.json` - Optimized for serverless |
| **Docker** | `docker-compose.*.yml` - Container deployment |

### PWA Configuration

```typescript
// vite.config.ts - VitePWA plugin
{
  registerType: 'autoUpdate',
  manifest: {
    name: 'Learnify',
    short_name: 'Learnify',
    display: 'standalone',
    theme_color: '#8b5cf6'
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
    runtimeCaching: [
      // Google Fonts caching
      // Supabase API caching
    ]
  }
}
```

---

## 16. Team Information

### Team BitCode

| Member | Role | Contributions |
|--------|------|---------------|
| **M Bhuvaneswar** | Full Stack Developer & AI Integration | AI Tutor, Adaptive Learning, Backend Architecture |
| **Sakthivel (Siva Hari)** | Frontend Developer & UI/UX Design | UI Components, 3D Graphics, Accessibility Features |
| **Manoj Shivprasad** | Backend Developer & Database Architect | Database Design, API Integration, Real-time Features |

### Contact

- **GitHub**: [S-Sivahari/Learnify](https://github.com/S-Sivahari/Learnify)
- **Email**: team.bitcode@learnify.com

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- **Google Gemini** - Advanced AI capabilities
- **Supabase** - Robust backend infrastructure
- **roadmap.sh** - Career path inspiration
- **CWASA** - 3D sign language technology
- **Three.js Community** - 3D graphics support
- **Open Source Community** - Amazing libraries and tools

---

<div align="center">

**⭐ Built with passion by Team BitCode 🚀**

*Transforming Education, One Student at a Time*

</div>
