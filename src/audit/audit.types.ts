import type { AUDIT_EVENT_TYPES } from './audit.constants.js';

export type AuditEventType =
  (typeof AUDIT_EVENT_TYPES)[keyof typeof AUDIT_EVENT_TYPES];

export interface ValidationCreatedEvent {
  validationId: string;
  documentNumber: string;
  occurredAt: Date;
}

export interface AuditItem {
  pk: string;
  sk: string;
  eventType: AuditEventType;
  validationId: string;
  documentNumber: string;
  occurredAt: string;
}