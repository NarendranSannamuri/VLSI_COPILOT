from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.upload import router as upload_router
from backend.routers.auth import router as auth_router

app = FastAPI(
    title="VLSI Copilot",
    description="AI-Powered RTL Analysis Assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(upload_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to VLSI Copilot",
        "status": "Running Successfully"
    }