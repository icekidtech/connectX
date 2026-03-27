/**
 * Users Module Swagger Documentation
 * 
 * This file contains all Swagger schemas and examples for user endpoints.
 */

// ======================================
// GET CURRENT USER (ME) ENDPOINT
// ======================================

export const getCurrentUserMeResponseExample = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
  username: 'john_doe',
  isVerified: false,
  status: 'active',
  privacySettings: {
    showOnline: true,
    allowMessages: true,
    allowSearch: true,
  },
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
    profileVisibility: 'public',
  },
  photos: [
    {
      id: 'photo-uuid',
      photoUrl: 'https://example.com/photo1.jpg',
      isProfilePhoto: true,
      displayOrder: 0,
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
// GET USER PROFILE BY ID ENDPOINT
// ======================================

export const getUserProfileResponseExample = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
  username: 'john_doe',
  profile: {
    id: 'profile-uuid',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Love hiking and photography',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    location: 'San Francisco, CA',
    profileVisibility: 'public',
  },
  photos: [
    {
      id: 'photo-uuid',
      photoUrl: 'https://example.com/photo1.jpg',
      isProfilePhoto: true,
    },
  ],
  interests: [
    {
      id: 'interest-uuid',
      name: 'hiking',
    },
  ],
};

// ======================================
// UPDATE PROFILE ENDPOINT
// ======================================

export const updateProfileRequestExample = {
  firstName: 'John',
  lastName: 'Doe',
  bio: 'Love hiking and photography',
  location: 'San Francisco, CA',
  latitude: '37.7749',
  longitude: '-122.4194',
  profession: 'Software Engineer',
  education: 'UC Berkeley',
};

export const updateProfileResponseExample = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  profile: {
    id: 'profile-uuid',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Love hiking and photography',
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    profession: 'Software Engineer',
    education: 'UC Berkeley',
  },
};

// ======================================
// UPDATE PREFERENCES ENDPOINT
// ======================================

export const updatePreferencesRequestExample = {
  minAge: 25,
  maxAge: 35,
  maxDistance: 50,
  relationshipTypes: ['casual', 'serious'],
  preferredGenders: ['female', 'other'],
  lookingFor: 'Someone fun and adventurous',
};

export const updatePreferencesResponseExample = {
  minAge: 25,
  maxAge: 35,
  maxDistance: 50,
  genderPreference: ['female', 'other'],
};

// ======================================
// UPDATE PRIVACY SETTINGS ENDPOINT
// ======================================

export const updatePrivacySettingsRequestExample = {
  showOnline: true,
  allowMessages: true,
  allowSearch: true,
  showProfile: true,
  showPhotos: true,
  showEmail: false,
};

export const updatePrivacySettingsResponseExample = {
  showOnline: true,
  allowMessages: true,
  allowSearch: true,
  showProfile: true,
  showPhotos: true,
  showEmail: false,
};

// ======================================
// DELETE USER ENDPOINT
// ======================================

export const deleteUserResponseExample = {
  message: 'User deleted successfully',
};

// ======================================
// ADD PHOTO ENDPOINT
// ======================================

export const addPhotoRequestExample = {
  url: 'https://example.com/photo.jpg',
  caption: 'Me at the beach',
  displayOrder: 0,
  isProfilePhoto: false,
};

export const addPhotoResponseExample = {
  id: 'photo-uuid',
  userId: '550e8400-e29b-41d4-a716-446655440000',
  photoUrl: 'https://example.com/photo.jpg',
  publicId: 'user_550e8400_1000000',
  isProfilePhoto: false,
  displayOrder: 0,
  contentClassification: 'pending',
  isVerified: false,
  createdAt: '2026-03-27T10:00:00Z',
};

// ======================================
// GET USER PHOTOS ENDPOINT
// ======================================

export const getUserPhotosResponseExample = [
  {
    id: 'photo-uuid-1',
    photoUrl: 'https://example.com/photo1.jpg',
    isProfilePhoto: true,
    displayOrder: 0,
    contentClassification: 'clean',
    isVerified: true,
    createdAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'photo-uuid-2',
    photoUrl: 'https://example.com/photo2.jpg',
    isProfilePhoto: false,
    displayOrder: 1,
    contentClassification: 'pending',
    isVerified: false,
    createdAt: '2026-03-27T10:00:00Z',
  },
];

// ======================================
// REMOVE PHOTO ENDPOINT
// ======================================

export const removePhotoResponseExample = {
  message: 'Photo removed successfully',
};

// ======================================
// ADD INTEREST ENDPOINT
// ======================================

export const addInterestRequestExample = {
  interestName: 'hiking',
};

export const addInterestResponseExample = {
  id: 'interest-uuid',
  name: 'hiking',
  description: 'Outdoor hiking and trail exploration',
  category: 'general',
  popularity: 150,
  createdAt: '2026-03-01T10:00:00Z',
};

// ======================================
// GET USER INTERESTS ENDPOINT
// ======================================

export const getUserInterestsResponseExample = [
  {
    id: 'interest-uuid-1',
    name: 'hiking',
    description: 'Outdoor hiking',
    category: 'general',
  },
  {
    id: 'interest-uuid-2',
    name: 'photography',
    description: 'Photography and visual arts',
    category: 'general',
  },
];

// ======================================
// REMOVE INTEREST ENDPOINT
// ======================================

export const removeInterestResponseExample = {
  message: 'Interest removed successfully',
};

// ======================================
// BLOCK USER ENDPOINT
// ======================================

export const blockUserResponseExample = {
  message: 'User blocked successfully',
};

// ======================================
// UNBLOCK USER ENDPOINT
// ======================================

export const unblockUserResponseExample = {
  message: 'User unblocked successfully',
};

// ======================================
// GET BLOCKED USERS ENDPOINT
// ======================================

export const getBlockedUsersResponseExample = [
  {
    id: 'blocked-user-uuid-1',
    email: 'blocked1@example.com',
    username: 'blocked_user_1',
    createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'blocked-user-uuid-2',
    email: 'blocked2@example.com',
    username: 'blocked_user_2',
    createdAt: '2026-03-20T10:00:00Z',
  },
];

// ======================================
// IS USER BLOCKED ENDPOINT
// ======================================

export const isUserBlockedResponseExample = {
  isBlocked: true,
};

// ======================================
// COMMON ERRORS
// ======================================

export const notFoundErrorExample = {
  statusCode: 404,
  message: 'User not found',
  error: 'Not Found',
};

export const unauthorizedErrorExample = {
  statusCode: 401,
  message: 'Unauthorized',
  error: 'Unauthorized',
};

export const badRequestErrorExample = {
  statusCode: 400,
  message: 'Cannot block yourself',
  error: 'Bad Request',
};

