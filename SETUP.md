# Setup Guide - Connect Dating Platform

## 🎯 Getting Started

This guide will walk you through setting up the dating platform locally for development.

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **Text Editor**: VS Code recommended

## Installation Steps

### Step 1: Clone and Navigate

```bash
# Navigate to your project folder
cd your-dating-platform-folder
```

### Step 2: Setup PostgreSQL Database

#### Option A: Using Docker (Recommended)
```bash
# Install Docker if not already installed
# Then run PostgreSQL container
docker run --name dating-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dating_platform \
  -p 5432:5432 \
  -d postgres:14
```

#### Option B: Local PostgreSQL Installation
1. Install PostgreSQL from official website
2. Create database:
   ```bash
   createdb dating_platform
   ```

### Step 3: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install
# or
pnpm install

# Create .env file from example
cp .env.example .env

# Edit .env with your settings
# Update these values:
# - DB_HOST: localhost (or your DB host)
# - DB_PORT: 5432 (or your DB port)
# - DB_USER: postgres (or your DB user)
# - DB_PASSWORD: postgres (or your DB password)
# - DB_NAME: dating_platform
# - JWT_SECRET: generate a random string (min 32 chars)
# - PORT: 3001
# - FRONTEND_URL: http://localhost:3000

# Start backend in development
npm run start:dev
```

Backend will run on: `http://localhost:3001`

### Step 4: Setup Frontend (New Terminal)

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install
# or
pnpm install

# Create .env.local file
cp .env.local.example .env.local

# Start frontend in development
npm run dev
```

Frontend will run on: `http://localhost:3000`

## ✅ Testing the Setup

### 1. Check Backend is Running
```bash
# In backend terminal, you should see:
# Dating Platform Backend running on port 3001
```

### 2. Check Frontend is Running
```bash
# In frontend terminal, you should see:
# ▲ Next.js X.X.X
# - ready started server on 0.0.0.0:3000
```

### 3. Test the Application

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You should see the landing page with "Connect" branding
3. Click "Get Started" to go to signup
4. Try creating an account

### 4. Test Authentication

```bash
# Test signup API
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'

# Should return user data with JWT token
```

## 🗂️ Important Files to Know

### Backend Files
- `backend/src/main.ts` - Entry point
- `backend/src/app.module.ts` - App configuration
- `backend/src/database/data-source.ts` - Database setup
- `backend/src/modules/auth/` - Authentication logic
- `backend/.env.example` - Environment template

### Frontend Files
- `app/page.tsx` - Landing page
- `app/layout.tsx` - App shell and metadata
- `app/globals.css` - Design tokens and theme
- `app/auth/signup/page.tsx` - Signup page
- `app/auth/login/page.tsx` - Login page
- `app/dashboard/` - Main app pages

## 🚀 Development Workflow

### Making Changes

1. **Backend Changes**
   - Edit files in `backend/src/`
   - Changes auto-reload with `npm run start:dev`
   - Check terminal for errors

2. **Frontend Changes**
   - Edit files in `app/` or `components/`
   - Changes auto-refresh in browser
   - Tailwind CSS is already configured

### Adding New Features

1. Create database entity in `backend/src/modules/[feature]/entities/`
2. Create service in `backend/src/modules/[feature]/[feature].service.ts`
3. Create controller in `backend/src/modules/[feature]/[feature].controller.ts`
4. Import service/controller in module
5. Create frontend pages in `app/[feature]/`

## 🔧 Environment Variables Explained

### Backend (.env)
- `DB_*` - PostgreSQL connection details
- `JWT_SECRET` - Secret key for JWT tokens (must be long and random)
- `PORT` - Backend port (default: 3001)
- `NODE_ENV` - development/production
- `FRONTEND_URL` - URL where frontend runs (for CORS)
- `AWS_*` - S3 credentials (for file uploads, optional for now)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (visible to client)
- `NEXT_PUBLIC_ENABLE_STREAMING` - Enable streaming feature
- `NEXT_PUBLIC_ENABLE_VERIFICATION` - Enable ID verification

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running
```bash
# Check if Postgres is running
psql -U postgres -c "SELECT version();"

# If not running, start it
# macOS: brew services start postgresql
# Windows: Use Services app or installer
# Linux: sudo systemctl start postgresql
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution**: Kill the process using the port
```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### JWT Secret Error
Ensure `JWT_SECRET` in `.env` is set to a long random string:
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📚 Next Steps

1. **Explore the Code**: Open `README.md` for full documentation
2. **Test API**: Use Postman or Insomnia to test endpoints
3. **Read Implementation Plan**: Check `v0_plans/pragmatic-outline.md` for architecture
4. **Customize Design**: Edit colors in `app/globals.css`
5. **Add Features**: Follow the pattern in existing modules

## 📞 Getting Help

- Check terminal for error messages
- Look at the `v0_plans/pragmatic-outline.md` for architectural details
- Review the `README.md` for API documentation
- Check `backend/.env.example` for configuration options

## 🎨 Customization Tips

### Change Colors
Edit `app/globals.css`:
```css
:root {
  --primary: oklch(0.35 0.15 210); /* Change primary color */
  --accent: oklch(0.62 0.28 24);   /* Change accent color */
  /* ... */
}
```

### Change Branding
1. Update `app/layout.tsx` metadata (title, description)
2. Replace logo in navigation
3. Update colors in globals.css
4. Customize copy in `app/page.tsx`

### Add Authentication Persistence
The auth pages save JWT to localStorage. To persist login:
1. Create a context provider for auth state
2. Check localStorage on app load
3. Redirect unauthenticated users to login

## 🎉 You're Ready!

Your dating platform is now running locally. Start building and customizing!

### Quick Commands Reference

```bash
# Backend
cd backend
npm run start:dev          # Start in development mode
npm run build              # Build for production
npm run migration:create   # Create database migration

# Frontend
npm run dev                # Start development server
npm run build              # Build for production
npm run lint               # Check code quality
```

Happy coding! 🚀
