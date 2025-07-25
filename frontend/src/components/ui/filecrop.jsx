import React, { useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function FileCrop({ imageSrc, onCropComplete, onCancel }) {
  const cropperRef = useRef(null);
  const [croppedData, setCroppedData] = useState(null);
  const [cropInfo, setCropInfo] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
  });

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      console.warn("Cropper not ready yet!");
      return;
    }
    
    const cropData = cropper.getData(true);
    setCropInfo({
      x: Math.round(cropData.x),
      y: Math.round(cropData.y),
      width: Math.round(cropData.width),
      height: Math.round(cropData.height),
      rotation: Math.round(cropData.rotate || 0),
    });
    
    cropper.getCroppedCanvas().toBlob(
      (blob) => {
        if (blob) {
          setCroppedData(blob);
          onCropComplete(blob, cropData);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const handleRotate = (angle) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(angle);
    }
  };

  const handleReset = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.reset();
      setCropInfo({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <div className="w-full max-w-4xl h-[500px] relative overflow-hidden rounded-lg shadow-lg">
        <Cropper
          src={imageSrc}
          style={{ height: "100%", width: "100%" }}
          initialAspectRatio={NaN}
          aspectRatio={NaN}
          guides={true}
          viewMode={1}
          dragMode="move"
          scalable={true}
          zoomable={true}
          cropBoxMovable={true}
          cropBoxResizable={true}
          responsive={true}
          autoCropArea={0.8}
          checkOrientation={false}
          background={false}
          ref={cropperRef}
          rotatable={true}
          minCropBoxWidth={100}
          minCropBoxHeight={100}
          crossOrigin="anonymous"
          crop={(e) => {
            setCropInfo({
              x: Math.round(e.detail.x),
              y: Math.round(e.detail.y),
              width: Math.round(e.detail.width),
              height: Math.round(e.detail.height),
              rotation: Math.round(e.detail.rotate || 0),
            });
          }}
        />
      </div>
      
      <div className="flex flex-col gap-6 w-full max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div className="crop-info-card">
            <span className="crop-info-label">X Position</span>
            <span className="crop-info-value">{cropInfo.x}px</span>
          </div>
          <div className="crop-info-card">
            <span className="crop-info-label">Y Position</span>
            <span className="crop-info-value">{cropInfo.y}px</span>
          </div>
          <div className="crop-info-card">
            <span className="crop-info-label">Width</span>
            <span className="crop-info-value">{cropInfo.width}px</span>
          </div>
          <div className="crop-info-card">
            <span className="crop-info-label">Height</span>
            <span className="crop-info-value">{cropInfo.height}px</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 justify-center">
          <Button
            onClick={() => handleRotate(-90)}
            variant="outline"
            className="flex-1 md:flex-none"
          >
            Rotate Left
          </Button>
          <Button
            onClick={() => handleRotate(90)}
            variant="outline"
            className="flex-1 md:flex-none"
          >
            Rotate Right
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 md:flex-none"
          >
            Reset
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex gap-4 w-full sm:w-auto">
            <Button
              onClick={handleCrop}
              disabled={!imageSrc}
              className="w-full sm:w-auto"
            >
              Apply Crop
            </Button>
            <Button
              onClick={onCancel}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
          
          {croppedData && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-w-[200px] h-[200px] rounded-lg overflow-hidden border border-accent shadow-lg"
            >
              <img
                src={URL.createObjectURL(croppedData)}
                alt="Cropped Preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs text-white text-center">
                Preview
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileCrop;
