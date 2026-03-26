/**
 * Moderation Module Swagger Documentation
 * 
 * This file contains all Swagger decorators and schemas for moderation endpoints.
 * Endpoints will be added as Phase 7 is implemented.
 * 
 * Planned Endpoints (Phase 7):
 * - POST /moderation/reports
 * - GET /moderation/reports
 * - GET /moderation/reports/:reportId
 * - PATCH /moderation/reports/:reportId
 * - DELETE /moderation/reports/:reportId
 * - GET /moderation/verifications
 * - GET /moderation/verifications/:userId
 * - PATCH /moderation/verifications/:userId
 * - DELETE /moderation/evidence/:evidenceId
 * - POST /users/:userId/block
 * - DELETE /users/:userId/block
 * - GET /users/:userId/blocked
 * - POST /moderation/users/:userId/suspend
 * - POST /moderation/users/:userId/ban
 * - POST /moderation/users/:userId/warn
 */

export const moderationSwaggerFile = 'src/docs/moderation.swagger.ts';
