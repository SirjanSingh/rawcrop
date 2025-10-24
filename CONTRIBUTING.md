# Contributing to RawCrop

Thanks for your interest in contributing! This project aims to stay simple and low-maintenance.

## Getting Started

1. **Fork** the repo and create a new branch:
   ```
   git checkout -b fix/short-description
   ```
2. **Run locally**:
   - Backend:
     ```
     cd backend
     python -m venv .venv
     # Windows: .venv\Scripts\activate
     # Unix/Mac: source .venv/bin/activate
     pip install -r requirements.txt
     uvicorn main:app --reload
     ```
   - Frontend:
     ```
     cd frontend
     npm install
     npm run dev
     ```
3. Keep PRs **small and focused**.

## Guidelines

- **No breaking changes** or logic rewrites without discussion.
- Prefer **clear comments and docs** over large refactors.
- Match existing **code style**; format JS/TS with Prettier if present, Python with Black if present.
- Add/update minimal tests if they exist (optional).
- Update README or comments if behavior changes.

## Commit & PR

- Use clear, imperative commit messages:
  - `fix: prevent crash on empty RAW`
  - `docs: add local run instructions`

**PR Checklist**
- [ ] Builds locally (frontend `npm run build`, backend imports without error)
- [ ] Describes the change and rationale
- [ ] Screenshots for UI tweaks (if applicable)

Thanks again for helping!
