import React, { useRef, useState } from "react";
import Cropper from "react-cropper";
import "../../../node_modules/cropperjs/dist/cropper.css";


function FileCrop({ imageSrc, onCropComplete }) {
  const cropperRef = useRef(null);
  const [croppedData, setCroppedData] = useState(null);

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.getCroppedCanvas().toBlob((blob) => {
        if (blob) {
          setCroppedData(blob);
          onCropComplete(blob); // Send to parent or backend
        }
      }, "image/jpeg");
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div className="w-[90%] max-w-4xl h-[500px]">
        <Cropper
          src={imageSrc}
          style={{ height: "100%", width: "100%" }}
          initialAspectRatio={NaN}
          aspectRatio={NaN} // Free aspect ratio
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
      <button
        onClick={handleCrop}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        Crop
      </button>
      {croppedData && (
        <img
          src={URL.createObjectURL(croppedData)}
          alt="Cropped Preview"
          className="mt-4 max-w-md rounded-xl shadow"
        />
      )}

    </div>
  );
}

export default FileCrop;
