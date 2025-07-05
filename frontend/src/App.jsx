import { useState, useEffect } from "react";
import FileUpload from "@/components/ui/fileUpload";
import FileCrop from "@/components/ui/fileCrop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

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
      const response = await fetch("http://127.0.0.1:8000/clear-data", {
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
      if (result.cropped_preview_url) {
        setCroppedURL(result.cropped_preview_url);
      }
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
      
      <div className="container mx-auto p-6 relative z-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">RAW Image Editor</h1>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTheme} 
              className="theme-toggle"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
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
              className="flex flex-col items-center justify-center mt-16"
            >
              <Card className="w-full max-w-2xl mx-auto glass-card">
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
                  />
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  You can also paste images from your clipboard
                </CardFooter>
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
