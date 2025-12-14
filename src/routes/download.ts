import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";
import { createJob, getJob } from "../services/jobStore.ts";
import {
  estimateJobDuration,
  determineMode,
  processDownloadJob,
} from "../services/downloadService.ts";
import { randomUUID } from "crypto";

const app = new OpenAPIHono();

// ============================================================================
// 1. POST /v1/download/estimate - Negotiation Endpoint
// ============================================================================
const estimateRoute = createRoute({
  method: "post",
  path: "/estimate",
  tags: ["Download"],
  summary: "Estimate download job and determine protocol",
  description:
    "Analyzes file IDs to estimate job duration and recommends WebSocket or Polling mode",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: z.object({
            file_ids: z
              .array(z.number().int().positive())
              .min(1)
              .describe("Array of file IDs to download"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Job estimate with recommended mode",
      content: {
        "application/json": {
          schema: z.object({
            jobId: z.string().uuid().describe("Unique job identifier"),
            mode: z
              .enum(["WEBSOCKET", "POLLING"])
              .describe("Recommended protocol"),
            estimatedDuration: z
              .number()
              .int()
              .describe("Estimated duration in seconds"),
            websocketUrl: z
              .string()
              .optional()
              .describe("WebSocket endpoint (if mode is WEBSOCKET)"),
            pollingUrl: z
              .string()
              .optional()
              .describe("Polling endpoint (if mode is POLLING)"),
          }),
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(estimateRoute, async (c: Context) => {
  try {
    const { file_ids } = await c.req.json();

    // Generate unique job ID
    const jobId = randomUUID();

    // Estimate job complexity
    const estimatedDuration = estimateJobDuration(file_ids);

    // Determine mode
    const mode = determineMode(estimatedDuration);

    // Create job
    createJob(jobId, mode, file_ids, estimatedDuration);

    console.log(
      `[Estimate] Job ${jobId} | Mode: ${mode} | Duration: ${estimatedDuration}s | Files: ${file_ids.length}`,
    );

    // If WebSocket mode, start processing immediately
    if (mode === "WEBSOCKET") {
      processDownloadJob(jobId).catch((err) =>
        console.error(`[Job ${jobId}] Background processing failed:`, err),
      );
    }

    return c.json({
      jobId,
      mode,
      estimatedDuration,
      websocketUrl:
        mode === "WEBSOCKET" ? `/v1/download/ws?jobId=${jobId}` : undefined,
      pollingUrl: mode === "POLLING" ? "/v1/download/initiate" : undefined,
    });
  } catch (error) {
    console.error("[Estimate] Error:", error);
    return c.json({ error: "Invalid request" }, 400);
  }
});

// ============================================================================
// 2. POST /v1/download/initiate - Start Polling Job
// ============================================================================
const initiateRoute = createRoute({
  method: "post",
  path: "/initiate",
  tags: ["Download"],
  summary: "Initiate download job (Polling mode)",
  description: "Queues the download job for background processing",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: z.object({
            jobId: z.string().uuid().describe("Job ID from estimate endpoint"),
          }),
        },
      },
    },
  },
  responses: {
    202: {
      description: "Job queued successfully",
      content: {
        "application/json": {
          schema: z.object({
            jobId: z.string().uuid(),
            status: z.enum(["queued", "processing", "completed", "failed"]),
          }),
        },
      },
    },
    404: {
      description: "Job not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(initiateRoute, async (c: Context) => {
  try {
    const { jobId } = await c.req.json();

    const job = getJob(jobId);
    if (!job) {
      return c.json({ error: "Job not found" }, 404);
    }

    console.log(`[Initiate] Job ${jobId} | Mode: ${job.mode}`);

    // Start background processing
    processDownloadJob(jobId).catch((err) =>
      console.error(`[Job ${jobId}] Background processing failed:`, err),
    );

    return c.json(
      {
        jobId,
        status: job.status,
      },
      202,
    );
  } catch (error) {
    console.error("[Initiate] Error:", error);
    return c.json({ error: "Invalid request" }, 400);
  }
});

// ============================================================================
// 3. GET /v1/download/status/:jobId - Check Status (Polling)
// ============================================================================
const statusRoute = createRoute({
  method: "get",
  path: "/status/{jobId}",
  tags: ["Download"],
  summary: "Check download job status",
  description: "Returns current status, progress, and download URL when ready",
  request: {
    params: z.object({
      jobId: z.string().uuid().describe("Job ID to check"),
    }),
  },
  responses: {
    200: {
      description: "Job status",
      content: {
        "application/json": {
          schema: z.object({
            jobId: z.string().uuid(),
            status: z.enum(["queued", "processing", "completed", "failed"]),
            progress: z.number().int().min(0).max(100),
            queuePosition: z.number().int().optional(),
            downloadUrl: z.string().url().optional(),
            error: z.string().optional(),
          }),
        },
      },
    },
    404: {
      description: "Job not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(statusRoute, (c: Context) => {
  const { jobId } = c.req.param();

  const job = getJob(jobId);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  return c.json({
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    queuePosition: job.status === "queued" ? 1 : undefined,
    downloadUrl: job.downloadUrl,
    error: job.error,
  });
});

export default app;
