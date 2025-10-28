from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AiMetadataCreate(BaseModel):
    business_id: UUID
    extracted_insights: str | None = None
    detected_entities: str | None = None
    keywords: str | None = None
    intent_labels: str | None = None

class AiMetadataOut(BaseModel):
    ai_metadata_id: UUID
    business_id: UUID
    extracted_insights: str | None
    detected_entities: str | None
    keywords: str | None
    intent_labels: str | None
    generated_at: datetime

    class Config:
        orm_mode = True
