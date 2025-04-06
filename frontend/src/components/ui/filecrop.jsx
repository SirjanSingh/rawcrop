import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './utlis/cropImage';
import './FileCrop.css';

const FileCrop = ({ imageSrc }) => {
  const [cropMode, setCropMode] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCrop = async () => {
    const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
    setCroppedImage(croppedImg);
    setCropMode(false);
  };

  return (
    <div className="image-wrapper">
      {!cropMode && (
        <>
          <img src={croppedImage || imageSrc} alt="Preview" className="preview-img" />
          <button className="edit-btn" onClick={() => setCropMode(true)}>Edit</button>
        </>
      )}

      {cropMode && (
        <div className="crop-section">
          <div className="crop-area">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={undefined} // Free aspect ratio
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid={false}
              restrictPosition={false}
            />
          </div>
          <div className="crop-controls">
            <button className="crop-btn" onClick={handleCrop}>Crop</button>
            <button className="cancel-btn" onClick={() => setCropMode(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileCrop;
