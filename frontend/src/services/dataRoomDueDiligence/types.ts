
export interface DataRoomFileInfo {
  filePath: string;
  fileName: string;
  downloadUrl: string;
  fileSize?: number;
  fileType?: string;
}

export interface DataRoomDueDiligenceWebhookPayload {
  startup_id: string;
  startup_name: string;
  company_id?: string;
  data_room_files: DataRoomFileInfo[];
  callback_url?: string;
  metadata: {
    total_files: number;
    file_types: string[];
    webhook_triggered_at: string;
  };
}

export interface DataRoomAnalysisStatus {
  processing_status: string;
  webhook_triggered_at: string | null;
  analysis_completed_at: string | null;
}
