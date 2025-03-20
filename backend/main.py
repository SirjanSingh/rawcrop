from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import os
import uuid  

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (POST, GET, etc.)
    allow_headers=["*"],  # Allow all headers
)



UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    unique_filename = f"{uuid.uuid4()}_{file.filename}"  
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())  

    print(f"✅ File uploaded: {unique_filename}")  # Log in backend terminal
    return JSONResponse(content={"filename": unique_filename, "message": "File uploaded successfully"})
 