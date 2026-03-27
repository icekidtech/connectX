# Backend Implementation Guide: httpOnly Cookies for JWT Authentication

## Overview

This guide shows how to implement httpOnly Secure SameSite=Strict cookies in the NestJS backend to support the Phase 2 frontend's secure token storage strategy. **This prevents XSS attacks and is required for the frontend work to function properly.**

## Current State

The frontend now expects:
- JWT tokens in **httpOnly Secure SameSite=Strict cookies** (NOT in response body)
- Automatic credential transmission (cookies sent automatically with each request)
- No manual token handling in JavaScript

The backend currently:
- Returns tokens in response bodies
- Does NOT set httpOnly cookies
- Requires modification to match frontend expectations

---

## Implementation Steps

### Step 1: Add Cookie Parsing Middleware

In `src/main.ts`, add cookie parser middleware:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with credentials
  app.enableCors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length'],
  });

  // Add cookie parser middleware
  app.use(cookieParser());

  await app.listen(3001);
}
bootstrap();
```

**Install cookie-parser:**
```bash
pnpm add @types/cookie-parser cookie-parser
```

### Step 2: Update Auth Service

Modify `src/modules/auth/auth.service.ts` to create two tokens:

```typescript
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Generate access token (24 hours)
   */
  private generateAccessToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      { expiresIn: '24h' }
    );
  }

  /**
   * Generate refresh token (7 days)
   */
  private generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' }
    );
  }

  /**
   * Set httpOnly cookies on response
   */
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    // Access token cookie (24 hours)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,        // JS cannot access
      secure: true,          // HTTPS only (set to false in local dev if needed)
      sameSite: 'strict',    // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    // Refresh token cookie (7 days)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  /**
   * Clear auth cookies on logout
   */
  private clearAuthCookies(res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  async signUp(signUpDto: SignUpDto, res: Response) {
    const { email, username, password, confirmPassword } = signUpDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new BadRequestException('Email or username already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      username,
      passwordHash: hashedPassword,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    // Set cookies
    this.setAuthCookies(res, accessToken, refreshToken);

    // Return user data (NOT tokens)
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    // Set cookies
    this.setAuthCookies(res, accessToken, refreshToken);

    // Save refresh token to DB (optional, for token revocation)
    // user.refreshToken = refreshToken;
    // await this.userRepository.save(user);

    // Return user data (NOT tokens)
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      message: 'Login successful',
    };
  }

  async logout(res: Response) {
    this.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  async refreshToken(userId: string, res: Response) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    // Set new cookies
    this.setAuthCookies(res, accessToken, refreshToken);

    return { message: 'Token refreshed' };
  }

  async getCurrentUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'photos', 'interests'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Validate user by ID (used by JWT strategy)
   */
  async validateUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
```

### Step 3: Update Auth Controller

Modify `src/modules/auth/auth.controller.ts` to accept and use Response:

```typescript
import { Controller, Post, Get, Body, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    const result = await this.authService.signUp(signUpDto, res);
    return res.status(201).json(result);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto, res);
    return res.json(result);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Res() res: Response) {
    const result = await this.authService.logout(res);
    return res.json(result);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Request() req: any) {
    return this.authService.getCurrentUser(req.user.id);
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt'))
  async refreshToken(@Request() req: any, @Res() res: Response) {
    const result = await this.authService.refreshToken(req.user.id, res);
    return res.json(result);
  }
}
```

### Step 4: Update JWT Strategy

Modify `src/modules/auth/strategies/jwt.strategy.ts` to read from cookies:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: (req: Request) => {
        // Try to get token from cookies first (httpOnly)
        if (req.cookies?.accessToken) {
          return req.cookies.accessToken;
        }
        // Fallback to Authorization header (for API testing with Postman, etc.)
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secret: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return this.authService.validateUser(payload.sub);
  }
}
```

### Step 5: Environment Variables

Add to `.env` or `.env.local`:

```
# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=24h

# CORS
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

For production (HTTPS):
```
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Testing

### 1. Test Sign Up with httpOnly Cookies

**Request:**
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user123","password":"Pass123!","confirmPassword":"Pass123!"}'
```

**Expected Response:**
```json
{
  "id": "user-id-uuid",
  "email": "user@example.com",
  "username": "user123",
  "message": "User registered successfully"
}
```

**Verify Cookies in Response Headers:**
```
Set-Cookie: accessToken=eyJhbGc...; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refreshToken=eyJhbGc...; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Strict
```

### 2. Test Authenticated Endpoint

Browser/Frontend automatically sends cookies:
```bash
curl -X GET http://localhost:3001/auth/me \
  --cookie "accessToken=YOUR_TOKEN_HERE"
```

### 3. Test Token Refresh

```bash
curl -X POST http://localhost:3001/auth/refresh-token \
  --cookie "refreshToken=YOUR_REFRESH_TOKEN_HERE"
```

---

## Frontend Integration Checklist

✅ Frontend is already configured to:
- Send cookies automatically with `credentials: 'include'` in all requests
- NOT access tokens from JavaScript (stored in httpOnly cookies)
- Auto-refresh tokens every 15 minutes via POST /auth/refresh-token
- Handle 401 responses by redirecting to login

Once backend is updated:
- ✅ All Phase 2 API endpoints will receive authenticated requests
- ✅ Token storage is XSS-proof (httpOnly)
- ✅ CSRF-protected (SameSite=Strict)
- ✅ Automatic token refresh prevents logout

---

## Security Features

| Feature | Mechanism | Benefit |
|---------|-----------|---------|
| **XSS Protection** | httpOnly flag | JavaScript cannot access tokens even if XSS attack succeeds |
| **CSRF Protection** | SameSite=Strict | Cookies only sent to same origin; attacker can't make cross-site requests |
| **Transport Security** | Secure flag | Cookies only sent over HTTPS (disable for local development) |
| **Token Expiration** | JWT exp claim | Short-lived tokens (24h) limit damage if compromised |
| **Refresh Rotation** | New refresh token on each refresh | Limits refresh token reuse window |

---

## Troubleshooting

### Issue: "Can't set headers after response sent"
**Cause:** Using `@Res()` without returning the response
**Fix:** Always return `res.json()` or `res.status().json()`

### Issue: Cookies not being sent from frontend
**Cause:** Missing `credentials: 'include'` in fetch
**Fix:** Frontend is already configured correctly

### Issue: "Cross-Origin Request Blocked"
**Cause:** CORS not allowing credentials
**Fix:** Ensure `credentials: true` in CORS config

### Issue: Cookies not visible in browser Network tab
**Cause:** httpOnly flag prevents JavaScript inspection
**This is expected!** Cookies are secure by design. Verify in DevTools > Application > Cookies

---

## Production Deployment

1. **Change JWT_SECRET** to a strong random string
2. **Set NODE_ENV=production**
3. **Ensure HTTPS is enabled** (secure flag won't work without it)
4. **Update CORS origins** to production domain
5. **Set FRONTEND_URL** to production URL
6. **Disable secure flag in local development** if not using HTTPS locally:
   ```typescript
   secure: process.env.NODE_ENV !== 'development',
   ```

---

## Next Steps

After implementing this guide:
1. Run backend tests to verify authentication flow
2. Start backend server: `cd backend && pnpm run start:dev`
3. Start frontend server: `pnpm run dev`
4. Test the complete auth flow in browser:
   - Signup → Check cookies in DevTools
   - Login → Verify token refresh works
   - Keep app open 15+ min → Verify auto-refresh (no logout)
   - Call protected endpoints → Verify authentication works

All Phase 2 API endpoints will then work correctly with secure token handling!
