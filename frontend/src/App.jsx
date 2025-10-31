import { useState, useEffect } from "react";
import FileUpload from "@/components/ui/fileUpload";
import FileCrop from "@/components/ui/filecrop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

// Importing the API URL from environment variables is commented out for local development
// Uncomment the line below to use environment variables in production
const API_URL = import.meta.env.VITE_API_URL 
// ;//comment this line and uncomment below to run local python server
//below one is used for local deevelopment
|| "http://localhost:8000";
console.log(API_URL);
// const API_URL = "https://rawcrop-v64g.onrender.com";
// const API_URL = "http://localhost:8000";


function App() {
  const [files, setFiles] = useState([]);
  const [previewURL, setPreviewURL] = useState(null);
  const [croppedURL, setCroppedURL] = useState(null);
  const [croppedRawURL, setCroppedRawURL] = useState(null);
  const [mode, setMode] = useState("preview");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");

    const handleColorSchemeChange = (e) => {
      setTheme(e.matches ? "dark" : "light");
    };

    window.matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleColorSchemeChange);

    return () => {
      window.matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleColorSchemeChange);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const clearAllData = async () => {
    if (!window.confirm("Are you sure you want to delete all files?")) return;
    try {
      const response = await fetch(API_URL + "/clear-data", {
        method: "DELETE",
      });
      const data = await response.json();
      setFiles([]);
      setPreviewURL(null);
      setCroppedURL(null);
      setCroppedRawURL(null);
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Failed to clear data: " + error.message);
    }
  };

  const sendCropDataToBackend = async (cropData) => {
    if (!files.length) return;
    setLoading(true);
    try {
      const response = await fetch(API_URL + "/crop-raw/", {
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

      // Check if response is OK before parsing
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (result.cropped_preview_url) {
        setCroppedURL(result.cropped_preview_url);
      }
      if (result.cropped_raw_url) {
        setCroppedRawURL(result.cropped_raw_url);
      }
      setMode("preview");
    } catch (error) {
      console.error("Error during cropping:", error);
      alert("Error during cropping: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setMode("edit");
  const handleCancelCrop = () => setMode("preview");

  const displayImage = croppedURL || previewURL;
  const downloadURL = croppedRawURL || (files[0] && files[0].raw_url) || "";

  return (
    <div className={`app-container ${theme}`}>
      <div className="gradient-bg">
        <div className="gradient-sphere gradient-sphere-1"></div>
        <div className="gradient-sphere gradient-sphere-2"></div>
        <div className="gradient-sphere gradient-sphere-3"></div>
      </div>

      <div className="p-6 relative z-10 w-[100vw] h-[99vh]">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">RAW Image Editor</h1>
          <div className="flex gap-4">
<button
  id="theme-toggle"
  aria-label="Toggle theme"
  aria-pressed={theme === 'dark'}
  className="theme-toggle-btn"
  onClick={toggleTheme}
  type="button"
>
  <div className="theme-toggle-track">
    <div className={`theme-toggle-thumb ${theme === 'light' ? 'theme-toggle-thumb-light' : ''}`}>
      <svg
        className={`sun-icon${theme === 'light' ? ' active' : ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
      </svg>
      <svg
        className={`moon-icon${theme === 'dark' ? ' active' : ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
      </svg>
    </div>
  </div>
</button>
            <Button
              onClick={clearAllData}
              variant="destructive"
              className="font-semibold"
            >
              Clear Data
            </Button>
          </div>
        </header>

        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="pulse-loader">
              <div className="spinner"></div>
              <p className="mt-4 text-white font-medium">Processing image...</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!files.length ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-[calc(100vh-100px)] px-4 -mt-16"
            >
              
              <Card className="w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] glass-card p-6">
                <div className="m-6">
                <CardHeader>
                  <CardTitle className="text-2xl">Upload your RAW file</CardTitle>
                  <CardDescription>
                    Supported formats: NEF, CR2, ARW, DNG
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    files={files}
                    setFiles={setFiles}
                    setPreviewURL={setPreviewURL}
                    setLoading={setLoading}
                  />
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  You can also paste images from your clipboard
                </CardFooter>
                </div>
              </Card>
              
            </motion.div>
          ) : mode === "preview" ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card className="glass-card flex flex-col items-center justify-between">
                <CardHeader className="w-full">
                  <CardTitle>Image Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center w-full">
                  {displayImage && (
                    <motion.img
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      src={displayImage}
                      alt="Preview"
                      className="max-w-full max-h-[400px] rounded-md shadow-lg mb-4 object-contain"
                    />
                  )}
                </CardContent>
                <CardFooter className="w-full">
                  <Button
                    onClick={handleEdit}
                    className="w-full"
                    variant="default"
                  >
                    Edit Image
                  </Button>
                </CardFooter>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Image Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="metadata-grid">
                    <div className="metadata-item">
                      <span className="metadata-label">Filename</span>
                      <span className="metadata-value">{files[0]?.name}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Format</span>
                      <span className="metadata-value">{files[0]?.name.split(".").pop().toUpperCase()}</span>
                    </div>
                    {croppedURL && (
                      <div className="metadata-item">
                        <span className="metadata-label">Status</span>
                        <span className="metadata-value">
                          <span className="badge-success">Cropped</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {files.length > 0 && (
                    <div className="thumbnails-grid">
                      {files.map((file, index) => (
                        <div key={index} className="thumbnail">
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="rounded-md shadow-md"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {downloadURL && (
                    <Button
                      variant="default"
                      className="w-full download-button"
                      asChild
                    >
                      <a href={downloadURL} download>
                        Download Cropped RAW
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Crop Image</CardTitle>
                  <CardDescription>
                    Adjust the crop area to select the portion of the image you want to keep
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileCrop
                    imageSrc={displayImage}
                    onCropComplete={(blob, cropData) => sendCropDataToBackend(cropData)}
                    onCancel={handleCancelCrop}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
