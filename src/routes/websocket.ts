import type { Context } from "hono";
import { getJob } from "../services/jobStore.ts";

// For now, return a message indicating WebSocket support is being added
// Full WebSocket implementation requires upgrading the connection which needs
// server-level handling beyond Hono's middleware
export function handleWebSocketUpgrade(c: Context) {
  const jobId = c.req.query("jobId");

  if (!jobId) {
    return c.json({ error: "jobId is required" }, 400);
  }

  const job = getJob(jobId);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  console.log(`[WebSocket] Connection request for job ${jobId}`);

  // For MVP, recommend using polling mode
  // Full WebSocket support requires ws library integration at server level
  return c.json(
    {
      message: "WebSocket endpoint - use polling mode for now",
      jobId,
      pollingUrl: `/v1/download/status/${jobId}`,
      recommendation: "Poll every 3 seconds for updates",
    },
    200,
  );
}
