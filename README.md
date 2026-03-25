# Connect - Dating & Social Platform

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

## 🎨 Frontend Architecture

### Design System
- **Colors**: Modern teal/cyan primary, coral accent, sophisticated neutrals
- **Typography**: Geist font family (sans-serif)
- **Components**: shadcn/ui components with Tailwind CSS
- **Theme**: Light and dark mode support with design tokens

### Pages
- `/` - Landing page with feature overview
- `/auth/signup` - User registration
- `/auth/login` - User login
- `/dashboard` - Main feed and quick stats
- `/dashboard/discover` - Matching recommendations
- `/dashboard/messages` - Real-time chat
- `/dashboard/streams` - Live streaming

## 📡 API Endpoints (Implemented)

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/:id` - Get user profile

### Posts
- `GET /posts/feed` - Get user feed

### Matching
- `GET /matching/recommendations` - Get match suggestions

### Chat
- WebSocket events: `message`, `typing`, `joinConversation`, `leaveConversation`

### Streams
- `GET /streams/live` - Get live streams

### Moderation
- `POST /moderation/report` - Report user/post
- `GET /moderation/reports` - Get pending reports

## 📝 Next Steps to Complete

### Phase 3: Advanced Matching
- [ ] Implement matching algorithm (cosine similarity on interests)
- [ ] Create recommendation engine
- [ ] Build preference management UI
- [ ] Add location-based filtering

### Phase 4: Complete Real-time Chat
- [ ] Finish chat service implementation
- [ ] Add typing indicators
- [ ] Implement read receipts
- [ ] Build chat UI components

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
