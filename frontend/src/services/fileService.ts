
// Re-export all file service functions for backward compatibility
export { uploadPitchDeck, deletePitchDeck, getPitchDeckUrl } from './pitchDeckService';
export { uploadStartupLogo, deleteStartupLogo } from './logoService';
export { uploadDataRoomFiles, deleteDataRoomFile, getDataRoomFileUrl } from './dataRoomService';
export { downloadFile } from './fileDownloadService';
