import { useEffect } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUpload({ files, setFiles, setPreviewURL }) {
  const handleFiles = async (newFiles) => {
    const allowedRawExtensions = ["nef", "cr2", "arw", "dng"];
    const uploadedFiles = [];

    for (const file of newFiles) {
      const extension = file.name.split(".").pop().toLowerCase();
      if (!allowedRawExtensions.includes(extension)) {
        alert("Unsupported file format. Please upload a RAW image only.");
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://127.0.0.1:8000/upload/", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        uploadedFiles.push({
          name: file.name,
          preview: data.preview,
          filename: data.filename,
          raw_url: data.raw_url,
        });
      } catch (error) {
        console.error("Upload failed:", error);
        alert(`Error uploading file: ${error.message}`);
      }
    }

    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    if (uploadedFiles.length > 0) {
      setPreviewURL(uploadedFiles[0].preview);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFiles,
  });

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
  }, []);

  const handleRemoveImage = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div
      className="file-upload w-full animate-fadeIn flex flex-col items-center p-6 border-2 border-dashed border-gray-400 rounded-xl hover:animate-glow transition-all duration-500"
    >
      <div
        {...getRootProps()}
        className="w-full h-40 flex items-center justify-center cursor-pointer animate-gradient bg-[length:400%_400%]"
      >
        <input {...getInputProps()} />
        <p className="text-gray-600 text-lg font-semibold animate-pulse">
          Drag & Drop RAW files here or Click to Upload
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 w-full animate-zoomIn">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group w-28 h-28 border border-gray-300 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <img
                src={file.preview}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce hover:bg-red-700 transition-all duration-300"
                onClick={() => handleRemoveImage(index)}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
