
// Re-export all startup service functions from their respective modules
export { fetchStartups, fetchStartupById } from './startupQueryService';
export { updateStartupStatus, updateStartupDetails, generateStartupScore, updateStartup } from './startupMutationService';
export { deleteStartupCompletely } from './startupDeletionService';
