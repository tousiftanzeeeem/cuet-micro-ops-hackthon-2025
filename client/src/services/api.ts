import axios from "axios";
import type {
  EstimateResponse,
  InitiateResponse,
  StatusResponse,
} from "../types/download";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const downloadApi = {
  /**
   * Step 1: Estimate job and get the recommended mode (WebSocket or Polling)
   */
  async estimate(fileIds: number[]): Promise<EstimateResponse> {
    const response = await api.post<EstimateResponse>("/download/estimate", {
      file_ids: fileIds,
    });
    return response.data;
  },

  /**
   * Step 2: Initiate the download job (for Polling mode)
   */
  async initiate(jobId: string): Promise<InitiateResponse> {
    const response = await api.post<InitiateResponse>("/download/initiate", {
      jobId,
    });
    return response.data;
  },

  /**
   * Step 3: Check status (for Polling mode)
   */
  async getStatus(jobId: string): Promise<StatusResponse> {
    const response = await api.get<StatusResponse>(`/download/status/${jobId}`);
    return response.data;
  },

  /**
   * Create WebSocket connection (for WebSocket mode)
   */
  createWebSocket(jobId: string): WebSocket {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost =
      import.meta.env.VITE_WS_HOST ||
      window.location.host.replace(":5173", ":3000");
    const wsUrl = `${wsProtocol}//${wsHost}/v1/download/ws?jobId=${jobId}`;

    return new WebSocket(wsUrl);
  },
};
