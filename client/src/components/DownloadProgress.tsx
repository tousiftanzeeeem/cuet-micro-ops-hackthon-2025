import type { DownloadMode, DownloadStatus } from "../types/download";

interface DownloadProgressProps {
  jobId: string | null;
  mode: DownloadMode | null;
  status: DownloadStatus | null;
  progress: number;
  queuePosition: number | null;
  error: string | null;
  onReset: () => void;
}

function DownloadProgress({
  jobId,
  mode,
  status,
  progress,
  queuePosition,
  error,
  onReset,
}: DownloadProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "queued":
        return "⏳";
      case "processing":
        return "⚙️";
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "📦";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "queued":
        return queuePosition ? `Queued (Position: ${queuePosition})` : "Queued";
      case "processing":
        return "Processing...";
      case "completed":
        return "Download Complete!";
      case "failed":
        return "Download Failed";
      default:
        return "Initializing...";
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "WEBSOCKET":
        return "text-green-600 bg-green-50";
      case "POLLING":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="text-center">
        <div className="text-6xl mb-4">{getStatusIcon()}</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {getStatusText()}
        </h2>
        {jobId && (
          <p className="text-sm text-gray-500 font-mono">Job ID: {jobId}</p>
        )}
      </div>

      {/* Mode Badge */}
      {mode && (
        <div className="flex justify-center">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getModeColor()}`}
          >
            {mode === "WEBSOCKET" ? "⚡ WebSocket Mode" : "🔄 Polling Mode"}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      {status === "processing" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {(status === "queued" || status === "processing") && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Success Message */}
      {status === "completed" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Your download should start automatically. If it doesn't, please
            check your browser's download settings.
          </p>
        </div>
      )}

      {/* Queue Position */}
      {queuePosition && queuePosition > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Queue Position:</span>{" "}
            {queuePosition}
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">
          How it works:
        </h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>
            • <strong>WebSocket Mode:</strong> Real-time updates for fast jobs
            (&lt;60s)
          </li>
          <li>
            • <strong>Polling Mode:</strong> Status checks every 3s for larger
            jobs
          </li>
          <li>
            • <strong>Auto-Fallback:</strong> Switches to polling if WebSocket
            fails
          </li>
        </ul>
      </div>

      {/* Reset Button */}
      {(status === "completed" || status === "failed") && (
        <button
          onClick={onReset}
          className="w-full bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors duration-200"
        >
          Start New Download
        </button>
      )}
    </div>
  );
}

export default DownloadProgress;
