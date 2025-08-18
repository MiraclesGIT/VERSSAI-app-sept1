
// Re-export types for backward compatibility
export type { StartupFormData, StartupFormState } from '@/types/startup';

// Re-export functions from the refactored services
export { createStartup, createStartupFromDeck } from './startupCreationService';
export { triggerN8NWebhook } from './webhookService';
