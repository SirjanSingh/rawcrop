from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
import os
import uuid
import rawpy
import shutil
import imageio
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import subprocess
from tifffile import imwrite
from PIL import Image
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()

import requests

def get_available_url():
    # try:
    #     # Try the deployed server
    #     response = requests.get("https://rawcrop-v64g.onrender.com/health", timeout=2)
    #     if response.status_code == 200:
    #         print("taking render link")
    #         return "https://rawcrop-v64g.onrender.com"
    # except:
    #     pass
    api_url = os.getenv("API_URL")
    if api_url:
        print(f"Using API_URL from environment: {api_url}")
        return api_url 
    # Fallback to localhost
    print("taking local host")
    return "http://localhost:8000"

API_URL = get_available_url()
# for offline development
# API_URL = "http://127.0.0.1:8000" 
# for online development
# API_URL = "https://rawcrop-v64g.onrender.com"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://raw-crop.onrender.com", "https://rawcrop-v64g.onrender.com","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# We mount these for potential direct file serving, 
# but we’ll mainly use custom endpoints to force downloads & store previews.
app.mount("/processed", StaticFiles(directory=PROCESSED_DIR), name="processed")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Allowed raw extensions
ALLOWED_RAW_EXTENSIONS = ["nef", "cr2", "arw", "dng"]

class CropData(BaseModel):
    filename: str
    x: int
    y: int
    width: int
    height: int


@app.get("/")
async def root():
    return {"message": "🎉 RawCrop backend is live!"}
    
@app.post("/crop-raw/")
async def crop_raw_image(data: CropData):
    """
    Crops the *raw Bayer data* for astro stacking, AND also produces a color
    JPEG preview so that you can see the result in your browser.
    """
    try:
        raw_path = os.path.join(UPLOAD_DIR, data.filename)
        
        # Check if file exists
        if not os.path.exists(raw_path):
            return JSONResponse(content={"error": f"File not found: {data.filename}"}, status_code=404)
        
        base, ext = os.path.splitext(data.filename)

        # 1) Final cropped raw file path
        cropped_raw_path = os.path.join(PROCESSED_DIR, f"{base}_cropped{ext}")
        # 2) Color preview for the browser
        cropped_preview_jpg = os.path.join(PROCESSED_DIR, f"{base}_cropped_preview.jpg")

        # -- Read RAW data once with rawpy --
        with rawpy.imread(raw_path) as raw_img:
            # (A) Crop the raw Bayer data
            raw_data = raw_img.raw_image_visible.copy()
            x, y, w, h = data.x, data.y, data.width, data.height

            if (y + h) > raw_data.shape[0] or (x + w) > raw_data.shape[1]:
                return JSONResponse(content={"error": "Crop dimensions exceed raw image bounds."}, status_code=400)

            cropped_bayer = raw_data[y:y+h, x:x+w]
            
            # Write that as a 16-bit array, but keep the original extension
            # so you get something like .arw or .dng, even though it's monochrome.
            imwrite(cropped_raw_path, cropped_bayer.astype(np.uint16))
            
            # Copy metadata from the original file (requires exiftool installed).
            subprocess.run(["exiftool", "-TagsFromFile", raw_path, 
                            "-all:all", "-overwrite_original", cropped_raw_path],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            # (B) Generate a color preview for the same region
            rgb_image = raw_img.postprocess()  
            pil_color = Image.fromarray(rgb_image)

            # Crop the color version using the same coordinates
            preview_cropped = pil_color.crop((x, y, x + w, y + h))
            preview_cropped.save(cropped_preview_jpg, "JPEG")

        # Return both a download URL for the raw file + a browser-friendly preview
        return JSONResponse(content={
            "message": "RAW image cropped successfully.",
            "cropped_raw_url": f"{API_URL}/download/cropped/{os.path.basename(cropped_raw_path)}",
            "cropped_preview_url": f"{API_URL}/processed/{os.path.basename(cropped_preview_jpg)}"
        })

    except Exception as e:
        print(f"Error in crop_raw_image: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    # Basic validation
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ALLOWED_RAW_EXTENSIONS:
        return JSONResponse(content={"error": "Unsupported file format. Please upload a RAW image only."}, status_code=400)
    
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    
    # Also produce a color .jpg preview for the front-end
    preview_filename = f"{unique_filename}.jpg"
    preview_path = os.path.join(PROCESSED_DIR, preview_filename)
    try:
        with rawpy.imread(file_path) as raw_img:
            rgb_image = raw_img.postprocess()
            imageio.imwrite(preview_path, rgb_image)
        return JSONResponse(content={
            "filename": unique_filename,
            "preview": f"{API_URL}/processed/{preview_filename}",
            "raw_url": f"{API_URL}/download/raw/{unique_filename}",
            "message": "File uploaded and processed successfully."
        })
    except Exception as e:
        return JSONResponse(content={"error": f"Failed to process image: {str(e)}"}, status_code=500)


@app.delete("/clear-data")
async def clear_data():
    """
    Clears both the 'uploads' and 'processed' folders to start fresh.
    """
    try:
        for folder in [UPLOAD_DIR, PROCESSED_DIR]:
            if os.path.exists(folder):
                shutil.rmtree(folder)
                os.makedirs(folder)
        return {"message": "Upload and Processed folders cleared!"}
    except Exception as e:
        return {"error": str(e)}


@app.get("/download/raw/{filename}")
async def download_raw(filename: str):
    """
    Force download of the original raw file.
    """
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        return JSONResponse(status_code=404, content={"error": "File not found"})
    return FileResponse(file_path, media_type="application/octet-stream", filename=filename)


@app.get("/download/cropped/{filename}")
async def download_cropped(filename: str):
    """
    Force download of the cropped raw file.
    """
    file_path = os.path.join(PROCESSED_DIR, filename)
    if not os.path.exists(file_path):
        return JSONResponse(status_code=404, content={"error": "File not found"})
    return FileResponse(file_path, media_type="application/octet-stream", filename=filename)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)