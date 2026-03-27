/**
 * Matching Algorithm Utilities
 * 
 * Calculates compatibility scores based on mulltiple factors:
 * - Distance (0-30 points): Closer is better
 * - Age (0-20 points): Within preferred range
 * - Common interests (0-20 points): Number of overlapping interests
 * - Gender preference (0-10 points): Matches stated preference
 * - Relationship type (0-10 points): Compatible goals
 * - Online status (0-10 points): Currently active
 * 
 * Total: 0-100 points
 */

export interface CompatibilityFactors {
  distance: number; // in km
  userAge: number;
  targetAge: number;
  targetGender: string;
  userGenderPreference: string;
  commonInterestCount: number;
  userRelationshipTypes: string[];
  targetRelationshipTypes: string[];
  targetIsOnline: boolean;
  maxDistance?: number;
}

export function calculateCompatibilityScore(factors: CompatibilityFactors): number {
  let score = 0;

  // Distance scoring (0-30 points)
  if (factors.distance !== undefined && factors.maxDistance !== undefined) {
    const distanceRatio = Math.min(factors.distance / factors.maxDistance, 1);
    const distanceScore = (1 - distanceRatio) * 30; // Closer = higher score
    score += distanceScore;
  }

  // Age scoring (0-20 points)
  // Assuming users have defined preferred age range in their profile
  // For simplicity, we'll score based on small age differences
  const ageDifference = Math.abs(factors.userAge - factors.targetAge);
  if (ageDifference <= 5) {
    score += 20; // Perfect age match
  } else if (ageDifference <= 10) {
    score += 15; // Close match
  } else if (ageDifference <= 15) {
    score += 10; // Acceptable
  } // else 0 points for large age difference

  // Common interests scoring (0-20 points)
  const interestScore = Math.min(factors.commonInterestCount * 4, 20); // 5 common interests = max 20
  score += interestScore;

  // Gender preference matching (0-10 points)
  if (
    factors.targetGender &&
    factors.userGenderPreference &&
    factors.targetGender.toLowerCase() === factors.userGenderPreference.toLowerCase()
  ) {
    score += 10;
  } else if (factors.userGenderPreference === 'any') {
    score += 5; // Partial credit if user is flexible
  }

  // Relationship type compatibility (0-10 points)
  const relationshipOverlap = factors.userRelationshipTypes.filter((type) =>
    factors.targetRelationshipTypes.includes(type)
  ).length;

  if (relationshipOverlap > 0) {
    score += 10;
  } else {
    score += 0; // No alignment on relationship goals
  }

  // Online status bonus (0-10 points)
  if (factors.targetIsOnline) {
    score += 10;
  } else {
    score += 5; // Partial credit
  }

  // Cap at 100
  return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculate distance between two coordinates (haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Filter users based on matching criteria
 */
export function filterUsersByCriteria(
  users: any[],
  filters: {
    ageMin?: number;
    ageMax?: number;
    maxDistance?: number;
    genderFilter?: string;
    relationshipTypeFilter?: string[];
  }
): any[] {
  return users.filter((user) => {
    // Age filtering
    if (filters.ageMin && user.age < filters.ageMin) return false;
    if (filters.ageMax && user.age > filters.ageMax) return false;

    // Distance filtering
    if (filters.maxDistance && user.distance > filters.maxDistance) return false;

    // Gender filtering
    if (
      filters.genderFilter &&
      user.gender.toLowerCase() !== filters.genderFilter.toLowerCase()
    ) {
      return false;
    }

    // Relationship type filtering
    if (filters.relationshipTypeFilter && filters.relationshipTypeFilter.length > 0) {
      const hasRelationshipType = filters.relationshipTypeFilter.some((type) =>
        user.preferredRelationshipTypes?.includes(type)
      );
      if (!hasRelationshipType) return false;
    }

    return true;
  });
}
