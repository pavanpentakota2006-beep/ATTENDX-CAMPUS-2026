from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as ai_router, get_anomaly_detector, get_shortage_predictor

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and pre-train models on startup if not present
    print("Initializing ATTENDX CAMPUS 2026 AI Service...")
    detector = get_anomaly_detector()
    predictor = get_shortage_predictor()
    print(f"Loaded Anomaly Detector: {detector.version}")
    print(f"Loaded Shortage Predictor: {predictor.version}")
    yield
    print("Shutting down ATTENDX CAMPUS 2026 AI Service...")

app = FastAPI(
    title="ATTENDX CAMPUS 2026 — AI Service",
    description="Real-Time Isolation Forest Anomaly Detection & Random Forest Attendance Shortage Predictor for Smart Campus",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server and Spring Boot backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)

@app.get("/")
def root():
    return {
        "project": "ATTENDX CAMPUS 2026",
        "service": "AI Anomaly Detection & Academic Monitoring Service",
        "version": "1.0.0",
        "docs_url": "/docs",
        "ist_sync": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
