import React, { useRef, useState } from "react";
import Cropper from "react-cropper";
import "../../../node_modules/cropperjs/dist/cropper.css";

function FileCrop({ imageSrc, onCropComplete, onCancel }) {
  const cropperRef = useRef(null);
  const [croppedData, setCroppedData] = useState(null);

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      console.warn("Cropper not ready yet!");
      return;
    }
    const cropData = cropper.getData(true);
    cropper.getCroppedCanvas().toBlob((blob) => {
      if (blob) {
        setCroppedData(blob);
        onCropComplete(blob, cropData);
      }
    }, "image/jpeg");
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div className="w-[90%] max-w-4xl h-[500px]">
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
          checkOrientation={false}
          ref={cropperRef}
        />
      </div>
      <div className="flex flex-row items-center gap-6">
        <button
          onClick={handleCrop}
          disabled={!imageSrc}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Crop
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700"
        >
          Cancel
        </button>
        {croppedData && (
          <img
            src={URL.createObjectURL(croppedData)}
            alt="Cropped Preview"
            className="max-w-[250px] max-h-[250px] rounded-xl shadow"
          />
        )}
      </div>
    </div>
  );
}

export default FileCrop;
