import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function FileUpload({ files, setFiles, setPreviewURL }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const simulateProgress = () => {
    setUploadProgress(0);
    setIsUploading(true);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
          return 100800
        }
        return newProgress;
      });
    }, 200);
    
    return () => clearInterval(interval);
  };

  const handleFiles = async (newFiles) => {
    const allowedRawExtensions = ["nef", "cr2", "arw", "dng"];
    const uploadedFiles = [];
    
    if (newFiles.length === 0) return;
    
    // Start progress simulation
    const stopSimulation = simulateProgress();
    
    for (const file of newFiles) {
      const extension = file.name.split(".").pop().toLowerCase();
      if (!allowedRawExtensions.includes(extension)) {
        alert("Unsupported file format. Please upload a RAW image only.");
        continue;
      }
      
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const response = await fetch("${API_URL}/upload/", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Server responded with ${response.status}`
          );
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
    
    // Stop progress simulation
    stopSimulation();
    
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    if (uploadedFiles.length > 0) {
      setPreviewURL(uploadedFiles[0].preview);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    accept: {
      'image/x-nikon-nef': ['.nef'],
      'image/x-canon-cr2': ['.cr2'],
      'image/x-sony-arw': ['.arw'],
      'image/x-adobe-dng': ['.dng'],
    },
    maxFiles: 10,
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
      
      if (imageFiles.length > 0) {
        await handleFiles(imageFiles);
      }
    };
    
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handleRemoveImage = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    if (files.length === 1) {
      setPreviewURL(null);
    } else if (index === 0 && files.length > 1) {
      setPreviewURL(files[1].preview);
    }
  };

  return (
    <div className="upload-container">
      <div
        {...getRootProps()}
        className={`upload-dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: isDragActive ? 1 : 0.8 }}
          className="upload-content"
        >
          <div className="upload-icon">
            {isUploading ? (
              <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          
          <p className="upload-text">
            {isDragActive
              ? "Drop RAW files here..."
              : isUploading
              ? "Uploading..."
              : "Drag & drop RAW files here, or click to select"}
          </p>
          
          <p className="upload-hint">
            Supported formats: NEF, CR2, ARW, DNG
          </p>
          
          {isUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="progress-text">{Math.round(uploadProgress)}%</span>
            </div>
          )}
        </motion.div>
      </div>

      {files.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="uploaded-files"
        >
          <div className="upload-counter">{files.length} file{files.length !== 1 ? 's' : ''} uploaded</div>
          <div className="file-grid">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="file-item"
              >
                <div className="file-preview">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="file-image"
                    onClick={() => setPreviewURL(file.preview)}
                  />
                  <button
                    className="file-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    aria-label="Remove file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="file-name">{file.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
