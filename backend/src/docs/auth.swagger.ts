/**
 * Auth Module Swagger Documentation
 * 
 * This file contains all Swagger schemas and examples for authentication endpoints.
 */

// ======================================
// SIGNUP ENDPOINT
// ======================================

export const signupRequestExample = {
  email: 'user@example.com',
  username: 'john_doe',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!',
};

export const signupResponseExample = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
  username: 'john_doe',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

export const signupErrorExample = {
  statusCode: 400,
  message: 'Email or username already in use',
  error: 'Bad Request',
};

// ======================================
// LOGIN ENDPOINT
// ======================================

export const loginRequestExample = {
  email: 'user@example.com',
  password: 'SecurePass123!',
};

export const loginResponseExample = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
  username: 'john_doe',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

export const loginErrorExample = {
  statusCode: 401,
  message: 'Invalid credentials',
  error: 'Unauthorized',
};

// ======================================
// LOGOUT ENDPOINT
// ======================================

export const logoutResponseExample = {
  message: 'Logged out successfully',
};

// ======================================
// GET CURRENT USER ENDPOINT
// ======================================

export const getCurrentUserResponseExample = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
  username: 'john_doe',
  isVerified: false,
  status: 'active',
  profile: {
    id: 'profile-uuid',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Love hiking and photography',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  photos: [
    {
      id: 'photo-uuid',
      photoUrl: 'https://example.com/photo1.jpg',
      isProfilePhoto: true,
      displayOrder: 0,
      contentClassification: 'clean',
      isVerified: true,
    },
  ],
  interests: [
    {
      id: 'interest-uuid',
      name: 'hiking',
      category: 'general',
    },
  ],
};

// ======================================
// REFRESH TOKEN ENDPOINT
// ======================================

export const refreshTokenResponseExample = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

// ======================================
// COMMON ERRORS
// ======================================

export const unauthorizedErrorExample = {
  statusCode: 401,
  message: 'Unauthorized',
  error: 'Unauthorized',
};

export const validationErrorExample = {
  statusCode: 400,
  message: ['email must be an email', 'password must be at least 8 characters'],
  error: 'Bad Request',
};

