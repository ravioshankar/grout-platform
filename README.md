# grout-platform

`grout-platform is a Python-based project that contains multiple applications and tooling for data,
ML, and "road-ready" experiments.`

## Project structure

- `apps/`
  - `roadready-api/` – backend/API for road-ready features
  - `roadready-ui/` – frontend/UI for road-ready features (Expo/React Native)
- `data/` – datasets and data-related assets
- `notebooks/` – exploration, prototyping, and experiments
- `src/` – core Python source code and shared libraries
- `assets/` – images and other static assets
- `road-ready/` – Python virtual environment and tooling for the road-ready stack
- `main.py` – main entry point for running grout-platform locally

## Getting started

### 1. Clone the repo

```bash
git clone REPO_URL
cd grout-platform
```

### 2. Create and activate the environment

You can use **uv**, **conda**, or plain **pip**.

#### Option A: Using uv (recommended)

```bash
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

#### Option B: Using conda

```bash
conda env create -f environment.yml
conda activate grout-platform
```

#### Option C: Using pip / venv

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Run the core Python entrypoint

```bash
python main.py
```

(Adjust the command as needed depending on which app you want to run.)

### 4. Run the RoadReady UI app

From the repo root:

```bash
cd apps/roadready-ui
npm install        # first time only
npm start          # or: npm run web / npm run android / npm run ios
```

Then in the terminal where Expo is running, press:
- `w` for Web
- `a` for Android (emulator)
- `i` for iOS (on macOS)

The web app typically opens at:

```text
http://localhost:8081
```

For more detailed UI docs, see the `apps/roadready-ui/START_APP.md` and `SETUP_GUIDE.md` files.

## Notes

- The legacy "Pungi" naming and assets have been replaced by the new **grout-platform** branding.
- This README is a starting point; update sections with more detail as the individual apps and
  services stabilize.
