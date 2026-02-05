# Learnify Process Workflows

This document details the core architectural workflows visualized in the system diagram.

## 1. 🔐 User Authentication & Onboarding
The secure entry point into the Learnify ecosystem.

**Process Flow:**
1. **Initiation**: User clicks "Login with Google".
2. **Auth Provider**: Request sent to Google OAuth 2.0.
3. **Verification**: Google validates credentials and returns JWT.
4. **Supabase Auth**: Validate token, create/update `auth.users` record.
5. **Profile Sync**: Trigger checks `user_profiles` table.
   - *If new user*: Creates profile with default gamification stats (Lvl 1).
   - *If existing*: Updates `last_seen` timestamp.
6. **Session**: Secure cookie set, user redirected to Dashboard.

---

## 2. 💬 Real-Time Messaging Engine
High-performance, instant communication pipeline.

**Process Flow:**
1. **Composition**: User types message in Group Chat UI.
2. **Transmission**: `messagingService.sendMessage()` called.
3. **Persistence**: Message inserted into `group_messages` (PostgreSQL).
4. **Broadcast**: Database trigger fires `broadcast_group_message()`.
5. **Distribution**: Supabase Realtime pushes packet via WebSocket.
6. **Reception**: Subscribed clients receive payload `(INSERT payload)`.
7. **Rendering**: UI updates instantly via React state.

---

## 3. 👥 Social Connection Workflow
Graph-based relationship management.

**Process Flow:**
1. **Discovery**: User searches for friend (fuzzy text search).
2. **Request**: Click "Add Friend" → Insert into `friendships` (status: 'pending').
3. **Notification**: Real-time alert sent to recipient.
4. **Action**: Recipient clicks "Accept".
5. **Update**: `friendships` row updated to status: 'accepted'.
6. **Graph Sync**: Both users now appear in each other's "Friends List".
7. **DM Creation**: System enables "Message" button for direct private groups.

---

## 4. 🎮 Gamification Loop
Event-driven engagement system.

**Process Flow:**
1. **Action**: User completes task (e.g., sends 10 messages).
2. **Evaluation**: Gamification Service calculates XP award.
3. **Update**: Increment `user_profiles.xp` and `streak`.
4. **Level Check**:
   - `IF xp > level_threshold THEN level++`
5. **Reward**: Unlock Badge/Achievement in `user_achievements`.
6. **Feedback**: Show "Level Up!" animation on frontend.

---

## 5. 🤖 AI Tutor Interaction
Intelligent assistance workflow.

**Process Flow:**
1. **Query**: User asks question in AI Tutor chat.
2. **Context**: System retrieves recent study notes as context.
3. **Processing**: Request sent to Google Gemini Pro API.
4. **Streaming**: Response token-stream received.
5. **Formatting**: Markdown parsing and code highlighting.
6. **Storage**: Chat history saved for contextual continuity.
