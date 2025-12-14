import { useState } from "react";
import { useDownload } from "./hooks/useDownload";
import FileSelector from "./components/FileSelector";
import DownloadProgress from "./components/DownloadProgress";

function App() {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const download = useDownload();

  const handleDownload = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file");
      return;
    }
    download.startDownload(selectedFiles);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Delineate Download Manager
          </h1>
          <p className="text-xl text-gray-600">
            Hybrid WebSocket/Polling Architecture
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Automatically selects the best protocol based on file size
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {!download.isLoading && !download.jobId ? (
            <>
              <FileSelector
                selectedFiles={selectedFiles}
                onSelectionChange={setSelectedFiles}
              />

              <button
                onClick={handleDownload}
                disabled={selectedFiles.length === 0}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                {selectedFiles.length === 0
                  ? "Select files to download"
                  : `Download ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}`}
              </button>
            </>
          ) : (
            <DownloadProgress
              jobId={download.jobId}
              mode={download.mode}
              status={download.status}
              progress={download.progress}
              queuePosition={download.queuePosition}
              error={download.error}
              onReset={download.reset}
            />
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2">
              Smart Protocol Selection
            </h3>
            <p className="text-gray-600 text-sm">
              Automatically chooses WebSocket for fast jobs (&lt;60s) and
              Polling for longer tasks
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-semibold text-lg mb-2">Automatic Fallback</h3>
            <p className="text-gray-600 text-sm">
              Seamlessly switches to Polling if WebSocket connection fails or
              times out
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-semibold text-lg mb-2">Proxy-Friendly</h3>
            <p className="text-gray-600 text-sm">
              Works with Cloudflare, nginx, and other proxies with timeout
              limitations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
