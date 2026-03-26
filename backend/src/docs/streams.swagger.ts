/**
 * Streams Module Swagger Documentation
 * 
 * This file contains all Swagger decorators and schemas for streaming endpoints.
 * Endpoints will be added as Phase 6 is implemented.
 * 
 * Planned Endpoints (Phase 6):
 * - POST /streams
 * - GET /streams/live
 * - GET /streams/:streamId
 * - PATCH /streams/:streamId
 * - POST /streams/:streamId/end
 * - DELETE /streams/:streamId
 * - POST /streams/:streamId/viewers
 * - DELETE /streams/:streamId/viewers
 * - GET /streams/:streamId/viewers
 * - POST /streams/:streamId/like
 * - POST /streams/:streamId/gift
 * 
 * WebSocket Events:
 * - joinStream
 * - leaveStream
 * - streamMessage
 * - streamGift
 */

export const streamsSwaggerFile = 'src/docs/streams.swagger.ts';
