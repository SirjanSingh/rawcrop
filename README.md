# RawCrop — RAW Image Cropping & Preview (React + FastAPI)

RawCrop is a simple, fast, and accurate RAW image cropping and preview tool.

- **Frontend**: React (Vite) + Tailwind + Framer Motion  
- **Backend**: FastAPI + rawpy + Pillow + tifffile + imageio  
- **RAW types**: .NEF, .CR2, .ARW, .DNG (others may work if `rawpy` supports them)

> This repository is prepped for Hacktoberfest and general open-source contributions. See **Contributing** below.

## Features
- Upload RAW files and render color previews
- Pixel-perfect crop selection with live preview
- Download cropped RAW region and JPEG preview
- Minimal, responsive UI

## Monorepo Layout

```
rawcrop-master/
  frontend/    # React + Vite app
  backend/     # FastAPI app (rawpy + Pillow + tifffile + imageio)
  .github/     # Issue templates and CI
```

## Quick Start

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Unix/Mac: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

By default the app serves at http://127.0.0.1:8000.  
Update CORS/URL in the frontend if needed.

### Frontend (Vite React)

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL (commonly http://localhost:5173).

## Configuration

- If your backend is deployed (e.g. Render), set the base URL in the frontend API helper (e.g. an `.env` or config file).
- Supported RAWs depend on `rawpy`/`libraw`. Some edge cases may fail to decode.

## Contributing

We welcome small, focused PRs:
- UI/UX polish, accessibility, copy updates
- Better errors and edge case handling
- Non-invasive code comments / docs
- Build/dev workflow improvements

Please read:
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

For issues, see [new issue](.github/ISSUE_TEMPLATE/bug_report.md) or [feature request](.github/ISSUE_TEMPLATE/feature_request.md).

## Security

If you find a security issue, **please do not open a public issue**.  
See [SECURITY.md](SECURITY.md) for reporting instructions.

## License

MIT © 2025 Sirjan Singh
