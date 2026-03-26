/**
 * Chat Module Swagger Documentation
 * 
 * This file contains all Swagger decorators and schemas for chat endpoints.
 * Endpoints will be added as Phase 4 is implemented.
 * 
 * Planned Endpoints (Phase 4):
 * - GET /chat/conversations
 * - POST /chat/conversations
 * - GET /chat/conversations/:conversationId
 * - GET /chat/conversations/:conversationId/messages
 * - POST /chat/conversations/:conversationId/messages
 * - DELETE /chat/messages/:messageId
 * - PUT /chat/messages/:messageId
 * - POST /chat/conversations/:conversationId/mark-read
 * 
 * WebSocket Events:
 * - joinConversation
 * - leaveConversation
 * - message
 * - typing
 * - messageRead
 */

export const chatSwaggerFile = 'src/docs/chat.swagger.ts';
