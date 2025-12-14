import { useState, useEffect, useRef, useCallback } from "react";
import { downloadApi } from "../services/api";
import type {
  DownloadMode,
  DownloadStatus,
  WebSocketMessage,
} from "../types/download";

interface UseDownloadState {
  jobId: string | null;
  mode: DownloadMode | null;
  status: DownloadStatus | null;
  progress: number;
  queuePosition: number | null;
  downloadUrl: string | null;
  error: string | null;
  isLoading: boolean;
}

interface UseDownloadReturn extends UseDownloadState {
  startDownload: (fileIds: number[]) => Promise<void>;
  reset: () => void;
}

const POLLING_INTERVAL = 3000; // 3 seconds
const WS_TIMEOUT = 90000; // 90 seconds

export function useDownload(): UseDownloadReturn {
  const [state, setState] = useState<UseDownloadState>({
    jobId: null,
    mode: null,
    status: null,
    progress: 0,
    queuePosition: null,
    downloadUrl: null,
    error: null,
    isLoading: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Clear WebSocket timeout
    if (wsTimeoutRef.current) {
      clearTimeout(wsTimeoutRef.current);
      wsTimeoutRef.current = null;
    }
  }, []);

  // Fallback to polling when WebSocket fails
  const fallbackToPolling = useCallback((jobId: string) => {
    console.log("🔄 Falling back to Polling mode...");

    setState((prev) => ({ ...prev, mode: "POLLING" }));

    // Start polling
    const pollStatus = async () => {
      try {
        const statusData = await downloadApi.getStatus(jobId);

        setState((prev) => ({
          ...prev,
          status: statusData.status,
          progress: statusData.progress || prev.progress,
          queuePosition: statusData.queuePosition || null,
          downloadUrl: statusData.downloadUrl || null,
          error: statusData.error || null,
        }));

        // If completed or failed, stop polling and trigger download
        if (
          statusData.status === "completed" ||
          statusData.status === "failed"
        ) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          if (statusData.status === "completed" && statusData.downloadUrl) {
            triggerDownload(statusData.downloadUrl);
          }

          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.error("Polling error:", err);
        setState((prev) => ({
          ...prev,
          error: "Failed to fetch status. Retrying...",
        }));
      }
    };

    // Initial poll
    pollStatus();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(pollStatus, POLLING_INTERVAL);
  }, []);

  // Trigger browser download
  const triggerDownload = useCallback((url: string) => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    console.log("📥 Triggering download:", url);

    // Create temporary anchor element
    const a = document.createElement("a");
    a.href = url;
    a.download = ""; // Let browser determine filename from URL
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  // WebSocket mode handler
  const startWebSocket = useCallback(
    (jobId: string, websocketUrl: string) => {
      console.log("🔌 Starting WebSocket connection...");

      try {
        const ws = downloadApi.createWebSocket(jobId);
        wsRef.current = ws;

        // Set WebSocket timeout (90s)
        wsTimeoutRef.current = setTimeout(() => {
          console.log("⏱️ WebSocket timeout reached, falling back to polling");
          ws.close();
          fallbackToPolling(jobId);
        }, WS_TIMEOUT);

        ws.onopen = () => {
          console.log("✅ WebSocket connected");
          setState((prev) => ({ ...prev, status: "queued" }));
        };

        ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log("📨 WebSocket message:", data);

            setState((prev) => ({
              ...prev,
              status: data.status,
              progress: data.progress || prev.progress,
              downloadUrl: data.downloadUrl || null,
              error: data.error || null,
            }));

            // If completed, trigger download
            if (data.status === "completed" && data.downloadUrl) {
              if (wsTimeoutRef.current) {
                clearTimeout(wsTimeoutRef.current);
              }
              triggerDownload(data.downloadUrl);
              setState((prev) => ({ ...prev, isLoading: false }));
              ws.close();
            }

            // If failed, stop loading
            if (data.status === "failed") {
              if (wsTimeoutRef.current) {
                clearTimeout(wsTimeoutRef.current);
              }
              setState((prev) => ({ ...prev, isLoading: false }));
              ws.close();
            }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          fallbackToPolling(jobId);
        };

        ws.onclose = (event) => {
          console.log("🔌 WebSocket closed:", event.code, event.reason);

          // If not completed and not a normal closure, fallback to polling
          if (!hasCompletedRef.current && event.code !== 1000) {
            fallbackToPolling(jobId);
          }
        };
      } catch (err) {
        console.error("Failed to create WebSocket:", err);
        fallbackToPolling(jobId);
      }
    },
    [fallbackToPolling, triggerDownload],
  );

  // Polling mode handler
  const startPolling = useCallback(
    async (jobId: string) => {
      console.log("🔄 Starting Polling mode...");

      try {
        // Initiate the download job
        await downloadApi.initiate(jobId);
        setState((prev) => ({ ...prev, status: "queued" }));

        // Start polling for status
        fallbackToPolling(jobId);
      } catch (err) {
        console.error("Failed to initiate download:", err);
        setState((prev) => ({
          ...prev,
          error: "Failed to start download",
          isLoading: false,
        }));
      }
    },
    [fallbackToPolling],
  );

  // Main function to start download
  const startDownload = useCallback(
    async (fileIds: number[]) => {
      // Reset state
      hasCompletedRef.current = false;
      cleanup();

      setState({
        jobId: null,
        mode: null,
        status: null,
        progress: 0,
        queuePosition: null,
        downloadUrl: null,
        error: null,
        isLoading: true,
      });

      try {
        // Step 1: Get estimate and mode
        console.log("📊 Requesting estimate for files:", fileIds);
        const estimate = await downloadApi.estimate(fileIds);

        console.log("📋 Estimate received:", estimate);

        setState((prev) => ({
          ...prev,
          jobId: estimate.jobId,
          mode: estimate.mode,
        }));

        // Step 2: Branch based on mode
        if (estimate.mode === "WEBSOCKET" && estimate.websocketUrl) {
          startWebSocket(estimate.jobId, estimate.websocketUrl);
        } else {
          startPolling(estimate.jobId);
        }
      } catch (err) {
        console.error("Failed to start download:", err);
        setState((prev) => ({
          ...prev,
          error:
            err instanceof Error ? err.message : "Failed to start download",
          isLoading: false,
        }));
      }
    },
    [cleanup, startWebSocket, startPolling],
  );

  // Reset function
  const reset = useCallback(() => {
    cleanup();
    hasCompletedRef.current = false;
    setState({
      jobId: null,
      mode: null,
      status: null,
      progress: 0,
      queuePosition: null,
      downloadUrl: null,
      error: null,
      isLoading: false,
    });
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    ...state,
    startDownload,
    reset,
  };
}
