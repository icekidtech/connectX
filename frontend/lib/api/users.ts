/**
 * Users API Service
 *
 * Handles user profile operations
 */

import { apiGet, apiPut } from '@/lib/fetch-proxy';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  age?: number;
  location?: string;
  bio?: string;
  relationshipStatus?: string;
  isVerified?: boolean;
  photos?: Array<{
    id: string;
    url: string;
    isPrimary?: boolean;
  }>;
  interests?: Array<{
    id: string;
    name: string;
  }>;
  preferences?: {
    lookingFor?: string[];
    minAge?: number;
    maxAge?: number;
    maxDistance?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // ISO date string
  location?: string;
  bio?: string;
  relationshipStatus?: string;
  profession?: string;
  gender?: string;
  education?: string;
}

/**
 * Fetch current user profile
 */
export async function fetchCurrentUserProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>('/users/me');
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  return apiPut<UserProfile>('/users/profile', data);
}
