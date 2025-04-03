from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import os
import uuid
import rawpy
import imageio
from PIL import Image  # 🆕 For handling PNG/JPG
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (use ["http://localhost:5173"] for stricter security)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# ✅ Serve processed images as static files
app.mount("/processed", StaticFiles(directory="processed"), name="processed")

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())  

    print(f"✅ File uploaded: {unique_filename}")  

    # ✅ Determine file extension
    file_extension = file.filename.split(".")[-1].lower()
    preview_filename = f"{unique_filename}.jpg"
    preview_path = os.path.join(PROCESSED_DIR, os.path.basename(preview_filename))

    try:
        if file_extension in ["nef", "cr2", "arw", "dng"]:  # RAW Formats
            with rawpy.imread(file_path) as raw:
                rgb_image = raw.postprocess()  
                imageio.imwrite(preview_path, rgb_image)  

        elif file_extension in ["png", "jpg", "jpeg", "tiff"]:  # ✅ PNG/JPG Handling
            img = Image.open(file_path)
            img = img.convert("RGB")  # Convert to JPEG format
            img.thumbnail((256, 256))  # Optional: Resize
            img.save(preview_path, "JPEG")

        else:
            return JSONResponse(content={"error": "Unsupported file format"}, status_code=400)

        print(f"🖼️ Preview saved: {preview_filename}")
        return JSONResponse(content={
            "filename": unique_filename,
            "preview": f"http://127.0.0.1:8000/processed/{preview_filename}",
            "message": "File uploaded & processed successfully"
        })
    
    except Exception as e:
        print(f"❌ Image processing failed: {str(e)}")
        return JSONResponse(content={"error": "Failed to process image"}, status_code=500)
    
from fastapi.staticfiles import StaticFiles
app.mount("/processed", StaticFiles(directory=PROCESSED_DIR), name="processed")
