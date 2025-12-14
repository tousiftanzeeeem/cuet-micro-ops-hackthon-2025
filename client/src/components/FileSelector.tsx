import { useState } from "react";

interface FileSelectorProps {
  selectedFiles: number[];
  onSelectionChange: (files: number[]) => void;
}

// Mock file data - in production, this would come from an API
const AVAILABLE_FILES = [
  { id: 1001, name: "report_2024.pdf", size: "2.3 MB", type: "PDF" },
  { id: 1002, name: "presentation.pptx", size: "15.7 MB", type: "PowerPoint" },
  { id: 1003, name: "data_export.csv", size: "48.2 MB", type: "CSV" },
  { id: 1004, name: "video_tutorial.mp4", size: "125.8 MB", type: "Video" },
  { id: 1005, name: "project_files.zip", size: "8.9 MB", type: "Archive" },
  { id: 1006, name: "images_collection.zip", size: "95.4 MB", type: "Archive" },
];

function FileSelector({ selectedFiles, onSelectionChange }: FileSelectorProps) {
  const [selectAll, setSelectAll] = useState(false);

  const handleToggleFile = (fileId: number) => {
    if (selectedFiles.includes(fileId)) {
      onSelectionChange(selectedFiles.filter((id) => id !== fileId));
    } else {
      onSelectionChange([...selectedFiles, fileId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      onSelectionChange([]);
      setSelectAll(false);
    } else {
      onSelectionChange(AVAILABLE_FILES.map((f) => f.id));
      setSelectAll(true);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Select Files</h2>
        <button
          onClick={handleSelectAll}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {selectAll ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {AVAILABLE_FILES.map((file) => {
          const isSelected = selectedFiles.includes(file.id);

          return (
            <div
              key={file.id}
              onClick={() => handleToggleFile(file.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{file.name}</h3>
                    <span className="text-sm text-gray-500">{file.size}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Type: {file.type}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{selectedFiles.length}</span> file
            {selectedFiles.length > 1 ? "s" : ""} selected
          </p>
        </div>
      )}
    </div>
  );
}

export default FileSelector;
