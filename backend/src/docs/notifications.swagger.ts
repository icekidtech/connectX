/**
 * Notifications Module Swagger Documentation
 * 
 * This file contains all Swagger decorators and schemas for notification endpoints.
 * Endpoints will be added as Phase 8 is implemented.
 * 
 * Planned Endpoints (Phase 8):
 * - GET /notifications
 * - PATCH /notifications/:notificationId
 * - POST /notifications/mark-all-read
 * - DELETE /notifications/:notificationId
 * - DELETE /notifications
 * - GET /notifications/preferences
 * - PATCH /notifications/preferences
 * 
 * WebSocket Events:
 * - notificationNew
 * - notificationRead
 * - notificationDeleted
 */

export const notificationsSwaggerFile = 'src/docs/notifications.swagger.ts';
