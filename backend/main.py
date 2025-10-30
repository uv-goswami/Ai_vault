from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base
from api import (
    users,
    business,
    services,
    ai_metadata,
    coupons,
    media,
    visibility,
    jsonld,
    operational_info
)


# Create all tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="AiVault Backend",
    description="Modular backend for business profiles, services, media, and AI metadata",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(ai_metadata.router)
app.include_router(business.router)
app.include_router(coupons.router)
app.include_router(media.router)
app.include_router(services.router)
app.include_router(visibility.router)

app.include_router(jsonld.router, prefix="/jsonld", tags=["JSON-LD"])
app.include_router(operational_info.router, prefix="/operational-info", tags=["Operational Info"])


# Health check
@app.get("/")
def read_root():
    return {"status": "AiVault backend is running"}
