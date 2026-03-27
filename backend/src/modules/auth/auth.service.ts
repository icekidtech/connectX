import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

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
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Access token cookie (24 hours)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,        // JS cannot access
      secure: isProduction,  // HTTPS only in production
      sameSite: 'strict',    // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    // Refresh token cookie (7 days)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
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

    // Return user data (NOT tokens - stored in httpOnly cookies)
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

    // Return user data (NOT tokens)
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      message: 'Login successful',
    };
  }

  /**
   * Validate user by ID (used by JWT strategy)
   */
  async validateUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    return this.sanitizeUser(user);
  }

  /**
   * Get current authenticated user
   */
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
   * Refresh JWT token
   */
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

    return {
      message: 'Token refreshed',
    };
  }

  /**
   * Logout (clear cookies)
   */
  async logout(res: Response) {
    this.clearAuthCookies(res);
    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Helper: Remove sensitive data from user object
   */
  private sanitizeUser(user: User) {
    const { passwordHash, verificationToken, ...sanitized } = user;
    return sanitized;
  }
}
