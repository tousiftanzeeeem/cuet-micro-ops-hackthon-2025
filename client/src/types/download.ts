export type DownloadMode = "WEBSOCKET" | "POLLING";

export type DownloadStatus = "queued" | "processing" | "completed" | "failed";

export interface EstimateResponse {
  jobId: string;
  mode: DownloadMode;
  estimatedDuration: number;
  websocketUrl?: string;
  pollingUrl?: string;
}

export interface InitiateResponse {
  jobId: string;
  status: DownloadStatus;
}

export interface StatusResponse {
  jobId: string;
  status: DownloadStatus;
  progress?: number;
  queuePosition?: number;
  downloadUrl?: string;
  error?: string;
}

export interface WebSocketMessage {
  status: DownloadStatus;
  progress?: number;
  downloadUrl?: string;
  error?: string;
}
