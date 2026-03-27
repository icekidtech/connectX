import { Controller, Post, Get, Body, UseGuards, Request, Res } from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  signupResponseExample,
  loginResponseExample,
  logoutResponseExample,
  getCurrentUserResponseExample,
  refreshTokenResponseExample,
  unauthorizedErrorExample,
} from '../../docs/auth.swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create new user account with email, username, and password. Sets httpOnly cookies with JWT tokens.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: { example: signupResponseExample },
  })
  @ApiResponse({ status: 400, description: 'Validation error or user already exists' })
  async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    const result = await this.authService.signUp(signUpDto, res);
    return res.status(201).json(result);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user and set httpOnly JWT cookies',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: { example: loginResponseExample },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto, res);
    return res.json(result);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Clear httpOnly cookies and end session',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    schema: { example: logoutResponseExample },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Res() res: Response) {
    const result = await this.authService.logout(res);
    return res.json(result);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Get authenticated user with full profile data',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user data',
    schema: { example: getCurrentUserResponseExample },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req: ExpressRequest & { user: any }) {
    return this.authService.getCurrentUser(req.user.id);
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Refresh JWT token',
    description: 'Get new httpOnly JWT cookies with extended expiration',
  })
  @ApiResponse({
    status: 200,
    description: 'New token issued',
    schema: { example: refreshTokenResponseExample },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshToken(@Request() req: ExpressRequest & { user: any }, @Res() res: Response) {
    const result = await this.authService.refreshToken(req.user.id, res);
    return res.json(result);
  }
}

