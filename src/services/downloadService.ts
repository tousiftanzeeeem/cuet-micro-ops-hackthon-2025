import { updateJob, getJob } from "./jobStore.ts";

// Mock file sizes for estimation (in MB)
const FILE_SIZES: Record<number, number> = {
  1001: 2.3,
  1002: 15.7,
  1003: 48.2,
  1004: 125.8,
  1005: 8.9,
  1006: 95.4,
};

// Processing speed: ~5 MB/s
const PROCESSING_SPEED_MB_PER_SEC = 5;

export function estimateJobDuration(fileIds: number[]): number {
  const totalSize = fileIds.reduce((acc, id) => {
    return acc + (FILE_SIZES[id] || 10); // Default 10MB if unknown
  }, 0);

  // Estimate duration in seconds
  const duration = Math.ceil(totalSize / PROCESSING_SPEED_MB_PER_SEC);
  return Math.min(duration, 300); // Cap at 5 minutes
}

export function determineMode(
  estimatedDuration: number,
): "WEBSOCKET" | "POLLING" {
  // Use WebSocket for jobs under 60 seconds
  return estimatedDuration < 60 ? "WEBSOCKET" : "POLLING";
}

export async function processDownloadJob(jobId: string): Promise<void> {
  const job = getJob(jobId);
  if (!job) {
    console.error(`Job ${jobId} not found`);
    return;
  }

  try {
    console.log(`[Job ${jobId}] Starting processing...`);

    // Update status to processing
    updateJob(jobId, { status: "processing", progress: 0 });

    // Simulate download processing with progress updates
    const totalSteps = 10;
    const delayPerStep = (job.estimatedDuration * 1000) / totalSteps;

    for (let step = 1; step <= totalSteps; step++) {
      // Check if job still exists (might have been cancelled)
      if (!getJob(jobId)) {
        console.log(`[Job ${jobId}] Job was cancelled`);
        return;
      }

      const progress = Math.floor((step / totalSteps) * 100);
      updateJob(jobId, { progress });

      console.log(`[Job ${jobId}] Progress: ${progress}%`);

      // Wait before next update
      await new Promise((resolve) => setTimeout(resolve, delayPerStep));
    }

    // Generate mock presigned URL (in production, use S3 SDK)
    const downloadUrl = generatePresignedUrl(jobId);

    // Mark as completed
    updateJob(jobId, {
      status: "completed",
      progress: 100,
      downloadUrl,
    });

    console.log(`[Job ${jobId}] Completed successfully`);
  } catch (error) {
    console.error(`[Job ${jobId}] Failed:`, error);

    updateJob(jobId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function generatePresignedUrl(jobId: string): string {
  // In production, use AWS SDK to generate presigned S3 URL
  // For demo, return a mock URL
  const expiresIn = 900; // 15 minutes
  const token = Buffer.from(`${jobId}-${Date.now()}`).toString("base64");
  return `https://downloads.example.com/${jobId}.zip?token=${token}&expires=${expiresIn}`;
}
