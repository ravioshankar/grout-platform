from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="RoadReady API",
    version="1.0.0",
    description="High-performance API for RoadReady DMV Test Application",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "RoadReady API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
