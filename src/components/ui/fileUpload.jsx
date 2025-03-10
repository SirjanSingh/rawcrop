import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUpload() {
  const [files, setFiles] = useState([]);

  // Handle file selection
  const handleFiles = (newFiles) => {
    const updatedFiles = [...files, ...newFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    )];
    setFiles(updatedFiles);
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
      if (imageFiles.length > 0) handleFiles(imageFiles);
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
      <div className="grid grid-cols-3 gap-4 mt-4">
        {files.map((file, index) => (
          <div key={index} className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden">
            <img
              src={file.preview}
              alt={file.name}
              className="w-full h-full object-cover"
              onLoad={() => URL.revokeObjectURL(file.preview)} // Free memory
            />
          </div>
        ))}
      </div>
    </div>
  );
}
