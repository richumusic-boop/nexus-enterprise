from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine
from app.db.base import Base
from app.mcp_server import mcp
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Nexus Enterprise API",
    description="High-performance project orchestration engine.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

@app.on_event("startup")
async def on_startup():
    logger.info("Initializing database...")
    import asyncio
    max_retries = 5
    for i in range(max_retries):
        try:
            async with engine.begin() as conn:
                # This will create tables if they don't exist
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database initialized successfully.")
            break
        except Exception as e:
            if i == max_retries - 1:
                logger.error(f"Failed to initialize database after {max_retries} attempts: {e}")
                raise e
            logger.warning(f"Database connection failed (attempt {i+1}/{max_retries}). Retrying in 5 seconds...")
            await asyncio.sleep(5)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Strictness should be increased in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
async def health_check():
    """
    Standard health check endpoint for monitoring.
    """
    return {"status": "operational", "version": "1.0.0"}

# Include API v1 router
app.include_router(api_router, prefix="/api/v1")

# Mount MCP SSE app
app.mount("/mcp", mcp.sse_app())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
