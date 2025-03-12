import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUpload() {
  const [files, setFiles] = useState([]);

  // Handle file selection & API upload
  const handleFiles = async (newFiles) => {
    const uploadedFiles = [];

    for (const file of newFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://127.0.0.1:8000/upload/", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        uploadedFiles.push({
          name: file.name,
          preview: data.preview_url, // Backend se preview URL le raha hai
        });
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    setFiles([...files, ...uploadedFiles]);
  };

  // Drag & Drop using react-dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: handleFiles,
  });

  // Paste Upload
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
          <div key={index} className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden">
            <img
              src={file.preview}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
