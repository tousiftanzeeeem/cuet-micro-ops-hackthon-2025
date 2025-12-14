import type { Context } from "hono";

export type DownloadMode = "WEBSOCKET" | "POLLING";
export type DownloadStatus = "queued" | "processing" | "completed" | "failed";

export interface JobState {
  jobId: string;
  mode: DownloadMode;
  status: DownloadStatus;
  progress: number;
  fileIds: number[];
  downloadUrl?: string;
  error?: string;
  createdAt: number;
  estimatedDuration: number;
}

export interface EstimateResponse {
  jobId: string;
  mode: DownloadMode;
  estimatedDuration: number;
  websocketUrl?: string;
  pollingUrl?: string;
}

export interface StatusResponse {
  jobId: string;
  status: DownloadStatus;
  progress: number;
  queuePosition?: number;
  downloadUrl?: string;
  error?: string;
}

export interface WebSocketMessage {
  status: DownloadStatus;
  progress: number;
  downloadUrl?: string;
  error?: string;
}

export interface AppContext extends Context {
  env: {
    jobs: Map<string, JobState>;
    wsConnections: Map<string, any>;
  };
}
