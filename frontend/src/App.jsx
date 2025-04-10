import { useState } from "react";
import FileUpload from "@/components/ui/FileUpload";
import FileCrop from "@/components/ui/FileCrop";
import "./App.css";

function App() {
  // State for managing uploaded files, previews, cropped preview and cropped raw URL.
  const [files, setFiles] = useState([]);
  const [previewURL, setPreviewURL] = useState(null);
  const [croppedURL, setCroppedURL] = useState(null);       // Color JPEG preview after crop.
  const [croppedRawURL, setCroppedRawURL] = useState(null);   // Downloadable cropped raw file.
  const [mode, setMode] = useState("preview");                // "preview" or "edit" mode.
  const [loading, setLoading] = useState(false);

  // Clears all files and resets state.
  const clearAllData = async () => {
    if (!window.confirm("Are you sure you want to delete all files?")) return;
    const response = await fetch("http://127.0.0.1:8000/clear-data", {
      method: "DELETE",
    });
    const data = await response.json();
    alert(data.message);
    setFiles([]);
    setPreviewURL(null);
    setCroppedURL(null);
    setCroppedRawURL(null);
  };

  // This function sends the crop coordinates (from the interactive cropper)
  // to the backend and expects two URLs in the response.
  const sendCropDataToBackend = async (cropData) => {
    if (!files.length) return;
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/crop-raw/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: files[0].filename,
          x: cropData.x,
          y: cropData.y,
          width: cropData.width,
          height: cropData.height,
        }),
      });
      const result = await response.json();
      // Save the color preview URL for display.
      if (result.cropped_preview_url) {
        setCroppedURL(result.cropped_preview_url);
      }
      // Save the cropped raw file URL for download.
      if (result.cropped_raw_url) {
        setCroppedRawURL(result.cropped_raw_url);
      }
      setMode("preview");
    } catch (error) {
      alert("Error during cropping: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Switch to editing mode.
  const handleEdit = () => {
    setMode("edit");
  };

  // Cancel cropping and return to preview.
  const handleCancelCrop = () => {
    setMode("preview");
  };

  // For display, choose the cropped preview image if available; otherwise use the initial preview.
  const displayImage = croppedURL || previewURL;
  // For the download link, if the cropped raw is available use that; otherwise fallback to the original raw URL.
  const downloadURL = croppedRawURL || (files[0] && files[0].raw_url) || "";

  return (
    <div className="p-6 relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="loader"></div>
        </div>
      )}

      <button
        onClick={clearAllData}
        className="ml-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition block mb-4"
      >
        Clear Data
      </button>

      {!files.length && (
        <div>
          <h1 className="text-3xl font-bold mb-4">Upload your RAW file here</h1>
          <FileUpload files={files} setFiles={setFiles} setPreviewURL={setPreviewURL} />
        </div>
      )}

      {files.length > 0 && mode === "preview" && (
        <div className="grid grid-cols-2 gap-4 items-start">
          {/* Left Panel: Image Preview & Edit Button */}
          <div className="flex flex-col items-center">
            {displayImage && (
              <img
                src={displayImage}
                alt="Preview"
                className="max-w-full max-h-[400px] rounded-md shadow-lg mb-4"
              />
            )}
            <button onClick={handleEdit} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
              Edit
            </button>
          </div>
          {/* Right Panel: Metadata & Download */}
          <div className="p-4 border rounded-md">
            <h2 className="text-xl font-semibold mb-2">Image Metadata</h2>
            <p>
              <strong>Filename:</strong> {files[0]?.name}
            </p>
            <p>
              <strong>File Extension:</strong> {files[0]?.name.split(".").pop().toUpperCase()}
            </p>
            {downloadURL && (
              <a
                href={downloadURL}
                download
                className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Download Cropped RAW
              </a>
            )}
          </div>
        </div>
      )}

      {files.length > 0 && mode === "edit" && (
        <FileCrop
          imageSrc={displayImage}
          onCropComplete={(blob, cropData) => sendCropDataToBackend(cropData)}
          onCancel={handleCancelCrop}
        />
      )}
    </div>
  );
}

export default App;
