import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async signUp(signUpDto: SignUpDto) {
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

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      token,
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
  async refreshToken(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      id: user.id,
      email: user.email,
      token,
    };
  }

  /**
   * Logout (currently just returns success - token invalidation happens on frontend)
   */
  async logout() {
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
