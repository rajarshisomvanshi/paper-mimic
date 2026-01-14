"""Paper Mimic API - Main Application"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.api.routers import question, history
from src.logging.logger import get_logger

logger = get_logger("API")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle management
    Gracefully handle startup and shutdown events
    """
    # Execute on startup
    logger.info("Application startup")
    yield
    # Execute on shutdown
    logger.info("Application shutdown")


app = FastAPI(title="Paper Mimic API", version="1.0.0", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(question.router, prefix="/api/question", tags=["question"])
app.include_router(history.router)


# Health check endpoint
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Paper Mimic"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Paper Mimic",
        "version": "1.0.0",
        "description": "Intelligent Question Paper Mimicker",
    }
