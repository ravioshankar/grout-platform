from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "RoadReady API", "status": "running"}

@router.get("/health")
async def health():
    return {"status": "healthy"}
