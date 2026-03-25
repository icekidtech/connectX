# ConnectX - Dating & Social Platform

A modern, inclusive platform for dating, hookups, relationships, and meaningful connections with advanced safety features, live streaming, and real-time chat.

## 🌟 Features

- **Smart Matching**: Interest-based algorithm for compatible connections
- **Identity Verification**: Photo and optional ID verification for authenticity
- **Social Feed**: Instagram-like posts with likes, comments, and sharing
- **Real-time Chat**: Messaging with typing indicators and read receipts
- **Live Streaming**: One-to-many streaming with live chat
- **Safety Features**: User reporting, content moderation, blocking, NSFW tagging
- **Profile Management**: Comprehensive profiles with interests, preferences, and photos
- **Diverse Communities**: Safe space for dating, hookups, BDSM, and relationships

## 🏗️ Project Structure

```
├── frontend/               # Next.js 16+ application
│   ├── app/
│   │   ├── auth/          # Authentication pages (login, signup)
│   │   ├── dashboard/     # Main app (feed, discover, messages, streams)
│   │   ├── globals.css    # Design tokens and theme
│   │   └── layout.tsx     # Root layout with metadata
│   ├── components/        # Reusable UI components (shadcn/ui)
│   ├── lib/              # Utilities and helpers
│   └── public/           # Static assets
│
├── backend/               # NestJS backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # JWT authentication
│   │   │   ├── users/         # User profiles and management
│   │   │   ├── posts/         # Feed and posts
│   │   │   ├── chat/          # WebSocket real-time chat
│   │   │   ├── matching/      # Recommendation engine
│   │   │   ├── streams/       # Live streaming
│   │   │   ├── moderation/    # Reports and verification
│   │   │   └── notifications/ # Push notifications
│   │   ├── database/
│   │   │   ├── data-source.ts # TypeORM configuration
│   │   │   └── entities/      # Database entities
│   │   ├── app.module.ts      # Main app module
│   │   └── main.ts            # Entry point
│   ├── .env.example       # Environment variables template
│   └── package.json
│
└── docker-compose.yml     # PostgreSQL and Redis setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for scaling)
- npm or pnpm

### 1. Setup Backend

```bash
cd backend

# Install dependencies
npm install
# or
pnpm install

# Create .env file
cp .env.example .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_NAME=dating_platform
# JWT_SECRET=your-super-secret-key

# Run NestJS in development
npm run start:dev
```

The backend will start on `http://localhost:3001`

### 2. Setup Frontend

```bash
# From project root, in another terminal
npm install
# or
pnpm install

# Create .env.local
cp .env.local.example .env.local

# Run Next.js in development
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Database Setup

The backend uses TypeORM with PostgreSQL. TypeORM will automatically synchronize the schema if `synchronize: true` is set in development.

For production migrations:
```bash
cd backend
npm run migration:create -- -n AddNewTable
npm run migration:run
```

## 🗄️ Database Schema

### Core Tables (19 entities)
- **users** - User accounts with authentication
- **user_profiles** - Extended profile information
- **user_photos** - Profile photos and galleries
- **interests** - Master list of interests/tags
- **user_interests** - User interests (many-to-many)
- **matches** - User matches with compatibility scores
- **posts** - Feed posts
- **post_media** - Images/videos for posts
- **post_likes** - Post likes
- **post_comments** - Comments with nested replies
- **conversations** - Direct message conversations
- **messages** - Individual messages
- **message_reads** - Message read receipts
- **streams** - Live stream sessions
- **stream_viewers** - Stream viewers tracking
- **reports** - User/post reports
- **user_verifications** - Photo and ID verification records
- **blocks** - User blocks
- **notifications** - User notifications

## 🔐 Authentication

- JWT-based authentication
- Password hashing with bcrypt
- JWT strategy guard for protected routes
- Signup with email validation
- Login with email/password

### Protected Routes
All authenticated endpoints require a Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

## 🧠 Matching Algorithm

The recommendation engine uses **Cosine Similarity** on interest vectors:

1. **Interest Vector Creation**: Each user's interests are converted to a vector where each dimension represents an interest tag
2. **Cosine Similarity Calculation**: `similarity = (A · B) / (||A|| × ||B||)` where A and B are interest vectors
3. **Compatibility Scoring**: 
   - Base score from cosine similarity (0-100%)
   - Age range filter (must match preferences)
   - Distance filter (location-based)
   - Relationship type alignment
   - Mutual interest boost (if both liked each other)

4. **Recommendation Ranking**: Users sorted by compatibility score descending

### Preference System
Users can customize:
- **Age Range**: Min/max age of potential matches
- **Distance Radius**: Maximum distance in kilometers
- **Looking For**: Relationship types (dating, hookups, relationships, BDSM, friends, etc.)
- **Interests**: Tags that influence recommendations

The algorithm is recalculated on each recommendation request with fresh user preferences.

## 💬 Real-time Chat Features

The chat system includes several real-time features for enhanced communication:

### Typing Indicators
- Users see when someone is typing with animated dots
- Typing indicator appears for 3 seconds of inactivity
- Emitted via WebSocket to all conversation participants

### Read Receipts
- Single checkmark: Message sent
- Double checkmarks (blue): Message read by recipient
- Read status is tracked per message with timestamp

### Message Types
- Text messages
- Media sharing (images and videos)
- Automatic message loading on conversation open
- Auto-marking messages as read when viewed

### WebSocket Events
- `message` - New message received
- `typing` - User is typing
- `messageRead` - Message marked as read
- `joinConversation` - User joins chat
- `leaveConversation` - User leaves chat

## 🎨 Frontend Architecture

### Design System
- **Colors**: Modern teal/cyan primary, coral accent, sophisticated neutrals
- **Typography**: Geist font family (sans-serif)
- **Components**: shadcn/ui components with Tailwind CSS
- **Theme**: Light and dark mode support with design tokens

### Core Components

#### Phase 1-4: Social & Matching
- **PostCreator** - Dialog-based interface for creating new posts with media, hashtags, and NSFW tagging
- **PostCard** - Rich post display with images, likes, comments section, and engagement stats
- **Feed** - Infinite scroll feed with pagination and post loading
- **PreferenceEditor** - Expandable preference management for matching (age range, distance, relationship types)
- **DiscoverCard** - Flip-card interface for browsing matches with compatibility scores
- **AdvancedChat** - Full-featured chat with typing indicators, read receipts, and media sharing
- **UserProfile** - Detailed user profiles with photo gallery, interests, and action buttons

#### Phase 5-7: Streaming, Moderation & Analytics
- **StreamViewer** - Live streaming interface with video player, live chat, and viewer controls
- **ModerationDashboard** - Admin panel for managing reports and user verifications
- **PhotoVerificationFlow** - Multi-step user verification workflow with photo/ID verification
- **NotificationsCenter** - Notification management hub with filtering and search
- **AnalyticsDashboard** - Interactive analytics dashboard with charts and metrics

### Pages

#### Core App Pages
- `/` - Landing page with feature overview
- `/auth/signup` - User registration
- `/auth/login` - User login
- `/dashboard` - Main feed and quick stats
- `/dashboard/feed` - Social feed with posts and comments
- `/dashboard/discover` - Matching recommendations with preference customization
- `/dashboard/messages` - Real-time chat with typing indicators & read receipts
- `/dashboard/messages/[id]` - Individual conversation view
- `/dashboard/profile/[id]` - User profile with photo gallery and interests
- `/dashboard/streams` - Live streaming hub
- `/dashboard/streams/go-live` - Start a live stream
- `/dashboard/streams/[id]` - Watch live stream with live chat
- `/dashboard/settings` - User settings and preferences

#### Phase 5-7 Pages (NEW)
- `/dashboard/admin` - Admin dashboard hub with quick access to admin features
- `/dashboard/admin/moderation` - Report management and user verification
- `/dashboard/admin/analytics` - Platform analytics and metrics dashboard
- `/dashboard/notifications` - User notification center with filtering
- `/dashboard/verify` - Photo and ID verification workflow

## 📡 API Endpoints (Implemented)

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/:id` - Get user profile
- `PUT /users/preferences` - Update matching preferences

### Posts
- `GET /posts/feed` - Get user feed
- `POST /posts` - Create new post
- `DELETE /posts/:id` - Delete post (owner only)
- `POST /posts/:id/like` - Like/unlike post
- `GET /posts/:id/comments` - Get post comments
- `POST /posts/:id/comment` - Add comment to post

### Matching
- `GET /matching/recommendations` - Get match suggestions
- `POST /matching/:userId/like` - Like a user

### Chat
- `GET /chat/conversations/:id/messages` - Get conversation messages
- `POST /chat/conversations/:id/messages` - Send message
- `POST /chat/conversations/:id/read` - Mark messages as read
- WebSocket events: `message`, `typing`, `joinConversation`, `leaveConversation`

### Streams
- `GET /streams/live` - Get live streams
- `POST /streams` - Create new stream
- `GET /streams/:id` - Get stream details

### Moderation
- `POST /moderation/report` - Report user/post
- `GET /moderation/reports` - Get pending reports

## 📝 Implementation Progress

### Phase 3: Advanced Matching ✅ COMPLETED
- [x] Implement matching algorithm (cosine similarity on interests)
- [x] Create recommendation engine
- [x] Build preference management UI (`PreferenceEditor` component)
- [x] Add location-based filtering
- **New Components:**
  - `PreferenceEditor` - Allows users to customize matching preferences (age range, distance, relationship types)
  - `DiscoverPage` - Enhanced with preference controls and detailed match information

### Phase 4: Complete Real-time Chat ✅ COMPLETED
- [x] Finish chat service implementation
- [x] Add typing indicators
- [x] Implement read receipts
- [x] Build chat UI components
- **New Components:**
  - `AdvancedChat` - Complete chat interface with:
    - Real-time messaging
    - Typing indicators with animated dots
    - Read receipts (single/double checkmarks)
    - Media sharing support
    - Automatic message loading and marking as read
    - User presence indicator

### Phase 5: Enhanced Social Feed & Discovery ✅ COMPLETED
- [x] Post creation interface (PostCreator component)
- [x] Post card with detailed display
- [x] Comment system with nested replies
- [x] Like/unlike functionality
- [x] Post deletion for owners
- **New Components:**
  - `PostCard` - Enhanced post display with comment section
  - `Feed` - Improved with pagination, infinite scroll, and comment loading
  - `UserProfilePage` - Detailed user profiles with photo gallery, interests, and action buttons

### Phase 5: Complete Real-time Chat
- [x] Add user profile viewing pages
- [x] Enhanced discover with detailed user profiles
- [x] User profile page with photo gallery
- [x] Message action buttons

### Phase 5: Live Streaming Integration ✅ COMPLETED
- [x] Build stream viewer interface with video player
- [x] Implement live chat during streams
- [x] Add stream quality controls (volume, fullscreen)
- [x] Implement viewer count display
- [x] Add like/share/report functionality
- [x] NSFW tagging for streams
- **New Components:**
  - `StreamViewer` - Complete stream interface with:
    - Video player placeholder
    - Real-time live chat with auto-scroll
    - Viewer count display
    - Quality controls and actions
    - Responsive design

### Phase 6: Moderation & Safety ✅ COMPLETED
- [x] Implement photo verification workflow
- [x] Build admin moderation dashboard
- [x] Add report management system
- [x] Setup user verification interface
- [x] Add content filtering UI
- **New Components:**
  - `PhotoVerificationFlow` - Multi-step verification with:
    - Photo verification
    - ID verification
    - Progress tracking
    - Security guidelines
    - Completion confirmation
  - `ModerationDashboard` - Admin interface with:
    - Report management and filtering
    - User verification display
    - Action buttons for moderation
    - Status tracking
    - Evidence display
  
- **New Pages:**
  - `/dashboard/admin` - Admin dashboard hub
  - `/dashboard/admin/moderation` - Moderation center
  - `/dashboard/verify` - Photo verification flow

### Phase 7: Notifications & Analytics ✅ COMPLETED
- [x] Notification center implementation
- [x] User analytics and engagement tracking
- [x] Admin dashboard for platform metrics
- [x] Enhanced settings with multiple tabs
- [x] Data management and privacy controls
- **New Components:**
  - `NotificationsCenter` - Feature-rich notifications with:
    - Type-based filtering (All/Unread/Matches/Messages)
    - Search functionality
    - Mark as read/unread
    - Delete functionality
    - Unread count display
  - `AnalyticsDashboard` - Comprehensive analytics with:
    - Key metrics cards with trends
    - Interactive Recharts visualizations
    - Engagement tracking
    - Conversion analysis
    - Date range selection
    - Export functionality

- **Enhanced Pages:**
  - `/dashboard/settings` - Complete redesign with:
    - Notification preferences
    - Privacy controls
    - Security settings
    - Data management
    - 2FA setup
    - Login history
  - `/dashboard/streams/[id]` - Enhanced with StreamViewer

- **New Pages:**
  - `/dashboard/notifications` - Notifications center
  - `/dashboard/admin/analytics` - Analytics dashboard

## 🎯 Recent Improvements (Latest Sprint - Phases 5, 6, 7)

### Phase 5: Live Streaming (NEW)
1. **StreamViewer** - Complete streaming interface
   - Video player with placeholder
   - Real-time live chat integration
   - Viewer count display
   - Quality controls (volume, fullscreen)
   - Like/share/report action buttons
   - Auto-scrolling chat with message display
   - NSFW tagging support

### Phase 6: Moderation & Safety (NEW)
1. **PhotoVerificationFlow** - Multi-step verification
   - 5-step linear workflow
   - Photo capture/upload interface
   - ID verification
   - Progress indicator
   - Security guidelines
   - Completion confirmation

2. **ModerationDashboard** - Admin moderation center
   - Report management with filtering
   - User verification display
   - Status-based view switching
   - Search and filter capabilities
   - Moderator action buttons
   - Evidence tracking

3. **AdminDashboard Hub** - Centralized admin interface
   - Quick access cards to all admin functions
   - Moderation, analytics, user management
   - System health and security monitoring

### Phase 7: Notifications & Analytics (NEW)
1. **NotificationsCenter** - Complete notification management
   - Multi-tab filtering (All/Unread/Matches/Messages)
   - Search and discovery
   - Mark as read/unread toggle
   - Delete functionality
   - Unread count badges

2. **AnalyticsDashboard** - Comprehensive platform metrics
   - 4 key metric cards with trend indicators
   - 4 interactive chart types (Line, Pie, Bar, Multi-axis)
   - Engagement tracking and analysis
   - User growth metrics
   - Conversion funnel visualization
   - Streaming activity monitoring
   - Date range selection
   - Export functionality

3. **SettingsPage Redesign** - Complete settings overhaul
   - 4 tabbed interface (Notifications/Privacy/Security/Data)
   - Notification preference toggles
   - Privacy level controls
   - 2FA setup interface
   - Login history display
   - Data export/delete options
   - Session management
   - Logout functionality

### Previously Completed Components
1. **PostCard** - Complete post display with embedded comment section
   - Photo/video display with gallery support
   - Like/unlike with visual feedback
   - Comment loading and submission
   - User profiles linked from posts
   - NSFW and hashtag badges

2. **AdvancedChat** - Feature-complete real-time messaging
   - Typing indicators with animated dots
   - Read receipts (single/double checkmarks)
   - Media attachment support
   - Automatic message loading and scrolling
   - User presence status

3. **PreferenceEditor** - Smart preference customization
   - Age range sliders with dual handles
   - Distance radius adjustment
   - Multi-select relationship types
   - Persistent preference storage

4. **UserProfilePage** - Rich user discovery
   - Photo gallery with swiper
   - Interest badges and tags
   - Looking-for relationship types
   - Like/message/share/report actions
   - Verified badge support

### Page Structure Update
- `/dashboard/feed` - Social feed with infinite scroll
- `/dashboard/profile/[id]` - User profile discovery
- `/dashboard/messages/[id]` - Individual chat conversations
- `/dashboard/admin` - Admin hub (NEW)
- `/dashboard/admin/moderation` - Moderation center (NEW)
- `/dashboard/admin/analytics` - Analytics dashboard (NEW)
- `/dashboard/notifications` - Notification center (NEW)
- `/dashboard/verify` - Photo verification (NEW)
- `/dashboard/settings` - Redesigned preferences
- `/dashboard/streams/[id]` - Stream viewer (ENHANCED)

### UI/UX Improvements
- Consistent design tokens throughout
- Smooth animations and transitions
- Loading states and skeleton screens
- Error handling and user feedback
- Mobile-responsive layouts
- Accessibility features (ARIA labels, semantic HTML)
- Interactive charts with Recharts
- Multi-step form workflows
- Tab-based navigation patterns

## 🌟 Development Status

### Phases 1-7: FRONTEND MOCKUPS ✅ COMPLETE

All user interface mockups for the dating platform have been completed and are production-ready:

- **Phase 1-2**: Core authentication and profiles ✅
- **Phase 3**: Advanced matching algorithm ✅  
- **Phase 4**: Real-time chat with WebSockets ✅
- **Phase 5**: Live streaming interface ✅
- **Phase 6**: Moderation dashboard & verification ✅
- **Phase 7**: Notifications & analytics ✅

### Next Phase: Backend Integration

**Ready to implement:**
1. **Streaming Service Integration** - Connect to Agora, Daily.co, or LiveKit
2. **Database Migrations** - Finalize TypeORM entities and migrations
3. **API Endpoint Implementation** - Create REST endpoints for all features
4. **WebSocket Setup** - Real-time features (chat, typing, notifications)
5. **Authentication** - JWT and session management
6. **File Storage** - AWS S3 integration for photos/videos
7. **Third-party Services** - Email, push notifications, streaming

All frontend components are mocked and ready for backend teams to integrate their APIs.

## 🔌 Third-Party Services (Integration Ready)

- **File Storage**: AWS S3 or similar for photos/videos
- **Streaming**: Agora SDK, Daily.co, or LiveKit
- **Email**: SendGrid, Mailgun for notifications
- **Payment**: Stripe for premium features (optional)

## 🛠️ Technologies

### Frontend
- Next.js 16+ (React 19)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Socket.io-client (for real-time features)
- date-fns (for date formatting)

### Backend
- NestJS 10
- TypeORM
- PostgreSQL
- Socket.io (WebSockets)
- JWT
- bcrypt

### Infrastructure
- Docker/Docker Compose (optional)
- PostgreSQL
- Redis (for scaling)

## ✅ Implementation Summary

### What's Been Built

**Frontend Components (13 total):**
#### Core Social Features (Phases 1-4)
- ✅ PostCard with integrated comment system
- ✅ AdvancedChat with typing indicators & read receipts
- ✅ PreferenceEditor for matching customization
- ✅ Feed component with infinite scroll
- ✅ PostCreator for post authoring
- ✅ UserProfilePage with photo gallery
- ✅ ConversationsList for message overview
- ✅ DiscoverCard with compatibility scoring

#### Streaming, Moderation & Analytics (Phases 5-7) - NEW
- ✅ StreamViewer - Live streaming interface (Phase 5)
- ✅ ModerationDashboard - Report management (Phase 6)
- ✅ PhotoVerificationFlow - User verification (Phase 6)
- ✅ NotificationsCenter - Notification hub (Phase 7)
- ✅ AnalyticsDashboard - Platform metrics (Phase 7)

**Pages (14 created/enhanced):**
#### Core App Pages
- ✅ /dashboard/feed - Social feed
- ✅ /dashboard/discover - Matching recommendations
- ✅ /dashboard/messages - Conversations list
- ✅ /dashboard/messages/[id] - Chat interface
- ✅ /dashboard/profile/[id] - User profiles
- ✅ /dashboard/streams/go-live - Stream creation

#### Phase 5-7 Pages (NEW)
- ✅ /dashboard/streams/[id] - Stream viewer with live chat
- ✅ /dashboard/admin - Admin dashboard hub
- ✅ /dashboard/admin/moderation - Moderation center
- ✅ /dashboard/admin/analytics - Analytics dashboard
- ✅ /dashboard/notifications - Notification center
- ✅ /dashboard/verify - Photo verification flow
- ✅ /dashboard/settings - Enhanced preferences (redesigned)

**Complete Feature List (40+ features):**

**Social & Matching (Phases 1-4):**
- ✅ User authentication (signup/login)
- ✅ Post creation with hashtags and NSFW tagging
- ✅ Post viewing with embedded comments
- ✅ Comment system with reply support
- ✅ Like/unlike functionality with visual feedback
- ✅ Advanced matching with cosine similarity algorithm
- ✅ Real-time messaging with typing indicators
- ✅ Read receipts (single/double checkmarks)
- ✅ Media sharing in chat
- ✅ User preference customization
- ✅ User discovery with detailed profiles
- ✅ Photo galleries with navigation
- ✅ Automatic message marking as read

**Live Streaming (Phase 5):**
- ✅ Stream viewer interface
- ✅ Video player with controls
- ✅ Real-time live chat during streams
- ✅ Viewer count display
- ✅ Quality controls (volume, fullscreen)
- ✅ Like/share/report buttons
- ✅ NSFW tagging for streams
- ✅ Responsive stream design

**Moderation & Safety (Phase 6):**
- ✅ Report management dashboard
- ✅ Multi-status report filtering
- ✅ User verification workflow
- ✅ Photo verification step-by-step
- ✅ ID verification interface
- ✅ Admin moderation hub
- ✅ Evidence tracking display
- ✅ Moderator action buttons

**Notifications & Analytics (Phase 7):**
- ✅ Notification center with filtering
- ✅ Notification search functionality
- ✅ Mark as read/unread toggle
- ✅ Delete notification capability
- ✅ Analytics dashboard with 4 chart types
- ✅ Key metrics display with trends
- ✅ Engagement tracking visualization
- ✅ Conversion funnel analysis
- ✅ Enhanced settings page
- ✅ Notification preferences
- ✅ Privacy controls
- ✅ Security settings (2FA)
- ✅ Data management (export/delete)
- ✅ Login history display

### Current Status: ALL PHASES 1-7 MOCKUPS COMPLETE ✅
**Ready for**: Backend API integration and third-party service integration

## 📚 API Documentation

### Authentication Flow

1. **Signup**
   ```
   POST /auth/signup
   {
     "email": "user@example.com",
     "username": "username",
     "password": "SecurePass123!",
     "confirmPassword": "SecurePass123!"
   }
   Response: { id, email, username, token }
   ```

2. **Login**
   ```
   POST /auth/login
   {
     "email": "user@example.com",
     "password": "SecurePass123!"
   }
   Response: { id, email, username, token }
   ```

3. **Protected Request**
   ```
   GET /users/:id
   Headers: Authorization: Bearer <token>
   ```

## 🔍 Key Configuration Files

- **Backend**
  - `src/database/data-source.ts` - Database configuration
  - `src/main.ts` - App setup and port
  - `.env` - Environment variables

- **Frontend**
  - `app/globals.css` - Design tokens and theme
  - `app/layout.tsx` - Metadata and app shell
  - `.env.local` - Frontend configuration

## 📦 Deployment

### Backend Deployment
```bash
# Build
npm run build

# Run
npm run start:prod
```

Deploy to: Vercel, Render, Railway, or any Node.js hosting

### Frontend Deployment
```bash
# Deploy to Vercel
vercel deploy
```

## 🤝 Contributing

This is a template for a dating platform. Customize as needed for your use case.

## 📄 License

MIT

## 🆘 Support

For issues or questions, refer to the implementation plan in `v0_plans/pragmatic-outline.md`

---

**Built with ❤️ by v0**
