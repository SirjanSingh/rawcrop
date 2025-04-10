import { useState, useEffect } from "react";
import FileUpload from "@/components/ui/FileUpload";
import FileCrop from "@/components/ui/filecrop";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);
  const [croppingImageURL, setCroppingImageURL] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);

  const clearAllData = async () => {
    if (!window.confirm("Are you sure you want to delete all files?")) return;

    const response = await fetch("http://localhost:8000/clear-data", {
      method: "DELETE",
    });

    const data = await response.json();
    alert(data.message);

    setFiles([]);
  };

  const handleCropComplete = async (croppedBlob) => {
    console.log("Sending cropped image to backend...");

    const formData = new FormData();
    formData.append("file", croppedBlob, "cropped.jpg");

    try {
      const response = await fetch("http://127.0.0.1:8000/upload-cropped", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("🔁 Cropped Upload Response:", data);

      if (data.preview) {
        setCroppingImageURL(data.preview); // Show updated image again in cropper or preview
      } else {
        alert("Failed to receive preview from backend.");
      }
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("Error uploading cropped image.");
    }
  };

  const sendCropDataToBackend = async (cropData) => {
    const response = await fetch("http://127.0.0.1:8000/crop-raw/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: files[0].filename,  // the RAW file
        x: cropData.x,
        y: cropData.y,
        width: cropData.width,
        height: cropData.height,
      }),
    });
  
    const result = await response.json();
    console.log("✅ Cropped RAW result:", result);
  
    // Optional: set a new state for the final cropped image
    setCroppedURL(result.cropped_url);
  };
  
  useEffect(() => {
    if (files.length > 0) {
      setCroppingImageURL(files[0].preview); // ✅ Use the preview URL directly
    }
  }, [files]);

  return (
    <div>

      {/* ✅ Clear Data Button */}
      <button
        onClick={clearAllData}
        className="ml-[1000px] top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
      >
        Clear Data
      </button>

      <div className="relative flex flex-col items-center  justify-center  min-h-screen gap-6 p-6 mt-10">

        <h1 className="text-3xl font-bold">Upload your files here</h1>

        <FileUpload 
          files={files} 
          setFiles={setFiles} 
          setPreviewURL = {setPreviewURL}
        />

        <FileCrop
          imageSrc={previewURL}
          onCropComplete={(blob, cropData) => {
            console.log("Crop dimensions:", cropData);
            sendCropDataToBackend(cropData); // Step 2
          }}
        />



      </div>
    </div>
  );
}

export default App;
