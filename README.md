# 🌌 RawCrop – RAW Image Cropping Tool

**RawCrop** is an open-source tool designed for astrophotographers, professionals, and hobbyists who want to crop RAW image files interactively — directly in the browser. Built with React and FastAPI, RawCrop provides a smooth workflow for previewing, cropping, and downloading RAW files with metadata preserved.

🔗 **Live Demo**: [https://raw-crop.onrender.com/](https://raw-crop.onrender.com/)

---

## 🚀 Features

-  **RAW File Upload**: Supports common RAW formats like `.NEF`, `.CR2`, `.ARW`, and `.DNG`.
-  **Interactive Cropping**: Preview and crop your image with a modern drag-and-resize interface.
-  **Color Preview + RAW Output**: View cropped area in color JPEG while downloading the original raw Bayer cropped file.
-  **Metadata Retention**: Maintains EXIF and metadata using `exiftool`.
-  **Clear All**: One-click cleanup of uploaded and processed files.

---

## 🧩 Tech Stack

### Frontend
- **React + TailwindCSS**
- **Cropper.js** for interactive cropping
- **Drag & Drop + Paste Uploads** with `react-dropzone`

### Backend
- **FastAPI** with CORS support
- **rawpy**, **imageio**, **Pillow**, **tifffile**
- **EXIFTool** for metadata copying

---

## ⚙️ How It Works

1. **Upload** a RAW image via drag & drop or clipboard paste.
2. A **preview** is generated using `rawpy`.
3. **Crop** interactively in the browser.
4. The frontend sends crop coordinates to the backend.
5. Backend:
   - Crops Bayer data from the RAW file.
   - Creates a **color JPEG preview** for display.
   - Reattaches original **EXIF metadata**.
6. Download the cropped RAW file or preview.

---

## ⚠️ Important Notice

After downloading the cropped RAW image, it might appear **black or blank** when opened in regular image viewers. This is expected behavior because:

- The file contains **uncooked RAW Bayer data**, which normal viewers cannot interpret.
- You need to open the image in **advanced photo editing or astronomy tools** such as **Adobe Photoshop (with Camera RAW)** or **Siril**, **RawTherapee**, or **Darktable** to properly view and process the data.

These tools can correctly decode and demosaic the sensor data to render the image.

---

## 📂 Folder Structure

```
📦 rawcrop
 ┣ 📂 frontend (React + Tailwind)
 ┃ ┣ 📜 App.jsx
 ┃ ┣ 📜 fileUpload.jsx
 ┃ ┣ 📜 filecrop.jsx
 ┃ ┣ 📜 card.jsx, button.jsx, input.jsx
 ┃ ┣ 📜 index.css, filecrop.css, App.css
 ┃ ┣ 📜 cropImage.js
 ┃ ┣ 📜 imageUtils.js
 ┗ 📂 backend (FastAPI)
   ┣ 📜 main.py
```

---

## 🛠️ Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## ✅ To Do

- [ ] Batch cropping support
- [ ] Export in multiple formats (TIFF, DNG)
- [ ] User auth & file history
---

##  Future Enhancements

-  AI-powered noise reduction (premium feature)
-  Cloud storage integration
-  Advanced editing tools

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (e.g. `feature-xyz`).
3. Commit your changes and push to your fork.
4. Open a Pull Request.

---

## 🧠 Credits

- Made by [Sirjan Singh](https://github.com/SirjanSingh)
- Powered by `rawpy`, `FastAPI`, `React`, `TailwindCSS`, `CropperJS`, `ExifTool`

---

## 📸 Try it Live

👉 [https://raw-crop.onrender.com/](https://raw-crop.onrender.com/)
