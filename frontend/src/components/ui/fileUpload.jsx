import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUpload() {
  const [files, setFiles] = useState([]);

  // ✅ Handle file upload
  const handleFiles = async (newFiles) => {
    const uploadedFiles = [];
  
    for (const file of newFiles) {
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        console.log("📤 Uploading file:", file.name);
  
        const response = await fetch("http://127.0.0.1:8000/upload/", {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server responded with ${response.status}`);
        }
  
        const data = await response.json();
        console.log("📤 Upload Response:", data);
  
        uploadedFiles.push({
          name: file.name,
          preview: `http://127.0.0.1:8000/processed/${data.filename}.jpg`,
        });
  
      } catch (error) {
        console.error("❌ Upload failed:", error);
        alert(`Error uploading file: ${error.message}`);
      }
    }
  
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
  };
  

  // ✅ Drag & Drop
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: handleFiles,
  });

  // ✅ Handle Paste Upload
  useEffect(() => {
    const handlePaste = async (event) => {
      const clipboardItems = event.clipboardData?.items;
      if (!clipboardItems) return;

      const imageFiles = [];
      for (const item of clipboardItems) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) imageFiles.push(blob);
        }
      }
      if (imageFiles.length > 0) await handleFiles(imageFiles);
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [files]);

  // ✅ Function to remove an image
  const handleRemoveImage = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center p-4 border border-gray-300 rounded-lg">
      {/* Drag & Drop */}
      <div
        {...getRootProps()}
        className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer"
      >
        <input {...getInputProps()} />
        <p className="text-gray-500">Drag & drop files here, or click to select</p>
      </div>

      {/* Image Previews */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        {files.map((file, index) => (
          <div key={index} className="relative w-24 h-24 border border-gray-300 rounded-lg">
            <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />

            {/* Remove Button */}
            <button
              className="absolute top-0 right-0 m-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-50 hover:bg-red-700"
              onClick={() => handleRemoveImage(index)}
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


