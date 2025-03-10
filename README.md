# RawCrop - RAW Image Cropping Tool

RawCrop is an open-source image processing tool designed for quick and efficient cropping of RAW image files. It supports batch processing, metadata retention, and exporting in multiple formats like TIFF and DNG. RawCrop is available as both a web and desktop application.

## Features

- **Upload Images Easily**: Supports drag-and-drop, copy-paste, and file selection.
- **RAW File Support**: Works with common RAW formats.
- **Auto Cropping**: Default cropping with an optional 500px bottom removal.
- **Metadata Retention**: Ensures EXIF and other metadata remain intact.
- **Batch Processing**: Crop multiple RAW files simultaneously.
- **Export Options**: Save images in TIFF/DNG format.
- **Asynchronous Processing**: Uses Redis & Celery for backend optimization.
- **Cross-Platform**: Available as a web app and an Electron-based desktop application.

## Tech Stack

### Web Version
- **Frontend**: React (Next.js) with TailwindCSS
- **Backend**: FastAPI / Flask
- **Hosting**: Vercel (Frontend) + DigitalOcean/AWS (Backend)

### Desktop Version
- **Frontend**: Electron.js with PyQt6

## Installation & Setup

### Web App (Development)

1. Clone the repository:
   ```sh
   git clone https://github.com/SirjanSingh/rawcrop.git
   cd rawcrop
   ```
2. Install dependencies:
   ```sh
   npm install  # or yarn install
   ```
3. Run the development server:
   ```sh
   npm run dev  # or yarn dev
   ```
4. Open `http://localhost:3000` in your browser.

### Backend (FastAPI/Flask)

1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   source venv/bin/activate  # macOS/Linux
   venv\Scripts\activate  # Windows
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```sh
   uvicorn main:app --reload  # FastAPI
   python app.py  # Flask
   ```

### Electron Desktop App

1. Navigate to the desktop folder:
   ```sh
   cd desktop
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the app:
   ```sh
   npm start
   ```

## Usage

1. **Upload RAW files** via drag & drop, paste, or file selection.
2. **Adjust cropping settings** (default: removes 500px bottom strip).
3. **Process images** individually or in batch mode.
4. **Export results** in TIFF/DNG format.

## Future Enhancements
- AI-powered noise reduction (premium feature)
- Cloud storage integration
- Advanced editing tools

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`feature-xyz`).
3. Commit changes and push to your fork.
4. Open a Pull Request.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contact
For questions, feedback, or contributions, reach out via:
- **GitHub Issues**: [https://github.com/SirjanSingh/rawcrop/issues](https://github.com/SirjanSingh/rawcrop/issues)
- **Email**: sirjan.singh036@gmail.com

---

Happy Cropping! 🚀

