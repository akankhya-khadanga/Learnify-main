# Learnify System Architecture

## Overview
Learnify is a comprehensive AI-powered learning platform built with modern web technologies, featuring real-time collaboration, gamification, and intelligent study tools.

---

## Architecture Layers

### 🎨 Frontend Layer
**Technology Stack:**
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Custom Design System
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Routing:** React Router v6

**Key Pages:**
1. **Dashboard** - Main hub with gamification (XP, levels, streaks)
2. **Friends** - Friend management, online status, messaging
3. **Study Groups** - Group chat, collaboration
4. **AI Tutor** - Intelligent learning assistant
5. **Notes** - Smart notes with AI summaries
6. **Profile** - User stats, achievements, badges

---

### ⚙️ Service Layer
**Core Services:**

#### Authentication Service
- Google OAuth integration
- Session management
- User profile creation

#### Friends Service
- Send/accept friend requests
- Search users
- Online status tracking
- Block/unblock users

#### Study Groups Service
- Create/join groups
- Member management
- Direct messaging (DMs)
- Group discovery

#### Messaging Service
- Real-time chat
- Media sharing
- Message reactions
- Typing indicators
- Read receipts

#### Gamification Service  
- XP system
- Level progression
- Badges & achievements
- Streak tracking

---

### 🔧 Backend Infrastructure
**Supabase Platform:**

#### Database
- **Type:** PostgreSQL 15
- **Features:** 
  - Row-Level Security (RLS)
  - Foreign key constraints
  - Triggers for real-time updates
  - JSON data types for settings

#### Authentication
- **Provider:** Supabase Auth
- **Methods:** Google OAuth 2.0
- **Features:** 
  - JWT tokens
  - Session persistence
  - Email verification

#### Realtime
- **Protocol:** WebSockets
- **Features:**
  - Live message updates
  - Typing indicators
  - Presence tracking
- **Tables:** group_messages, message_reactions, typing_indicators

#### Storage
- **Use Cases:** 
  - User avatars
  - Message media
  - Group images
  - Note attachments

---

### 🗄️ Database Schema

#### Core Tables

**user_profiles**
- `id` (UUID, PK)
- `username` (unique)
- `display_name`
- `avatar_url`
- `status` (online/offline)
- `level`, `xp`, `streak`

**friendships**
- `id` (UUID, PK)
- `user_id` (FK → user_profiles)
- `friend_id` (FK → user_profiles)
- `status` (pending/accepted/blocked)
- `requested_by` (UUID)

**study_groups**
- `id` (UUID, PK)
- `name`
- `description`
- `group_type` (public/private)
- `created_by` (FK → user_profiles)
- `max_members`

**group_members**
- `id` (UUID, PK)
- `group_id` (FK → study_groups)
- `user_id` (FK → user_profiles)
- `role` (admin/member)

**group_messages**
- `id` (UUID, PK)
- `group_id` (FK → study_groups)
- `sender_id` (FK → user_profiles)
- `content` (text)
- `message_type` (text/image/file)
- `reply_to` (FK → group_messages)

**message_reactions**
- `id` (UUID, PK)
- `message_id` (FK → group_messages)
- `user_id` (FK → user_profiles)
- `reaction` (emoji)

---

## Data Flow

### User Login Flow
```
User → Google OAuth → Supabase Auth → JWT Token → 
Create/Update user_profile → Redirect to Dashboard
```

### Messaging Flow
```
User types message → messagingService.sendMessage() → 
INSERT into group_messages → Broadcast trigger → 
Supabase Realtime → WebSocket → Recipients receive update
```

### Friend Request Flow
```
User searches → friendsService.searchUsers() → 
Send request → INSERT friendship (status: pending) → 
Recipient accepts → UPDATE friendship (status: accepted)
```

---

## Key Features Implemented

### ✅ Authentication
- Google OAuth login
- User profile management
- Session persistence

### ✅ Social Features
- Friend system (add, accept, block)
- User search
- Online status tracking

### ✅ Study Groups
- Create/join groups
- Real-time group chat
- Direct messaging (1-on-1)
- Member management

### ✅ Gamification
- XP & Level system
- Daily streak tracking
- Badges & achievements
- Leaderboards

### ✅ UI/UX
- Dark theme with neon accents
- Smooth animations
- Responsive design
- Real-time updates

---

## Technical Highlights

### Performance
- Vite for fast builds
- Lazy loading for routes
- Optimistic UI updates
- Efficient state management

### Security
- Row-Level Security (RLS) policies
- JWT authentication
- Input sanitization
- HTTPS only

### Scalability
- Serverless architecture (Supabase)
- CDN for static assets
- Database indexing
- Connection pooling

---

## Environment Configuration

### Required Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Future Enhancements
- AI-powered study recommendations
- Video call integration
- Mobile app (React Native)
- Analytics dashboard
- Course marketplace
