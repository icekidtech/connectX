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
- **PostCreator** - Dialog-based interface for creating new posts with media, hashtags, and NSFW tagging
- **PostCard** - Rich post display with images, likes, comments section, and engagement stats
- **Feed** - Infinite scroll feed with pagination and post loading
- **PreferenceEditor** - Expandable preference management for matching (age range, distance, relationship types)
- **DiscoverCard** - Flip-card interface for browsing matches with compatibility scores
- **AdvancedChat** - Full-featured chat with typing indicators, read receipts, and media sharing
- **UserProfile** - Detailed user profiles with photo gallery, interests, and action buttons

### Pages
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

### Remaining Phases

### Phase 5: Live Streaming Integration
- [ ] Choose streaming service (Agora, Daily.co, or RTMP)
- [ ] Implement stream creation/management
- [ ] Build stream viewer interface
- [ ] Add live chat during streams

### Phase 6: Moderation & Safety
- [ ] Implement photo verification
- [ ] Build admin moderation dashboard
- [ ] Add content filtering
- [ ] Setup NSFW detection

### Phase 7: Notifications & Analytics
- [ ] Push notifications for matches and messages
- [ ] User analytics and engagement tracking
- [ ] Admin dashboard for platform metrics

## 🎯 Recent Improvements (Latest Sprint)

### Enhanced Components
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

### New Pages
- `/dashboard/feed` - Social feed with infinite scroll
- `/dashboard/profile/[id]` - User profile discovery
- `/dashboard/messages/[id]` - Individual chat conversations
- `/dashboard/settings` - User preferences and privacy

### UI/UX Improvements
- Consistent design tokens throughout
- Smooth animations and transitions
- Loading states and skeleton screens
- Error handling and user feedback
- Mobile-responsive layouts
- Accessibility features (ARIA labels, semantic HTML)

## 🔌 Third-Party Services (To Integrate)

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

**Frontend Components (8 new/enhanced):**
- ✅ PostCard with integrated comment system
- ✅ AdvancedChat with typing indicators & read receipts
- ✅ PreferenceEditor for matching customization
- ✅ Feed component with infinite scroll
- ✅ PostCreator for post authoring
- ✅ UserProfilePage with photo gallery
- ✅ ConversationsList for message overview
- ✅ DiscoverCard with compatibility scoring

**Pages (7 created/enhanced):**
- ✅ /dashboard/feed - Social feed
- ✅ /dashboard/discover - Matching recommendations
- ✅ /dashboard/messages - Conversations list
- ✅ /dashboard/messages/[id] - Chat interface
- ✅ /dashboard/profile/[id] - User profiles
- ✅ /dashboard/streams/go-live - Stream creation
- ✅ /dashboard/streams/[id] - Stream viewer

**Features Implemented:**
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

### Remaining Work (Phases 5-7)
- Live streaming integration (Agora/Daily.co)
- Photo and ID verification system
- Admin moderation dashboard
- Push notifications
- Platform analytics dashboard

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
