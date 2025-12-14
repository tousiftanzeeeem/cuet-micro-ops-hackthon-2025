import type { JobState, DownloadMode } from "../types/download.ts";

// In-memory storage (use Redis in production)
export const jobs = new Map<string, JobState>();
export const wsConnections = new Map<string, any>();

// Job TTL: 1 hour
const JOB_TTL = 3600000;

export function createJob(
  jobId: string,
  mode: DownloadMode,
  fileIds: number[],
  estimatedDuration: number,
): JobState {
  const job: JobState = {
    jobId,
    mode,
    status: "queued",
    progress: 0,
    fileIds,
    createdAt: Date.now(),
    estimatedDuration,
  };

  jobs.set(jobId, job);

  // Auto-cleanup after TTL
  setTimeout(() => {
    jobs.delete(jobId);
    wsConnections.delete(jobId);
  }, JOB_TTL);

  return job;
}

export function getJob(jobId: string): JobState | undefined {
  return jobs.get(jobId);
}

export function updateJob(
  jobId: string,
  updates: Partial<JobState>,
): JobState | undefined {
  const job = jobs.get(jobId);
  if (!job) return undefined;

  const updatedJob = { ...job, ...updates };
  jobs.set(jobId, updatedJob);

  // Notify WebSocket clients
  notifyWebSocketClients(jobId, updatedJob);

  return updatedJob;
}

export function deleteJob(jobId: string): void {
  jobs.delete(jobId);
  wsConnections.delete(jobId);
}

function notifyWebSocketClients(jobId: string, job: JobState): void {
  const ws = wsConnections.get(jobId);
  if (!ws || ws.readyState !== 1) return; // 1 = OPEN

  try {
    ws.send(
      JSON.stringify({
        status: job.status,
        progress: job.progress,
        downloadUrl: job.downloadUrl,
        error: job.error,
      }),
    );
  } catch (error) {
    console.error(`Failed to send WebSocket message for job ${jobId}:`, error);
    wsConnections.delete(jobId);
  }
}

export function registerWebSocket(jobId: string, ws: any): void {
  wsConnections.set(jobId, ws);

  ws.on("close", () => {
    console.log(`WebSocket closed for job ${jobId}`);
    wsConnections.delete(jobId);
  });

  ws.on("error", (error: Error) => {
    console.error(`WebSocket error for job ${jobId}:`, error);
    wsConnections.delete(jobId);
  });
}
