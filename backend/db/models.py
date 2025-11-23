from sqlalchemy import Column, String, Boolean, Integer, Float, ForeignKey, DateTime, Enum, Numeric
from sqlalchemy.dialects.postgresql import UUID, CITEXT
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
import uuid
from pydantic import BaseModel
from datetime import datetime, UTC
from db.database import Base
import enum


class ServiceTypeEnum(str, enum.Enum):
    salon = "salon"
    restaurant = "restaurant"
    clinic = "clinic"

# -------------------------
# USERS TABLE
# -------------------------
class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(CITEXT, unique=True, nullable=False)
    name = Column(String)
    auth_provider = Column(String, nullable=False)  # oauth, email, sso, password
    password_hash = Column(String)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    last_login = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)

    # Relationships
    businesses = relationship("BusinessProfile", back_populates="owner")


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    business_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)

    name = Column(String, nullable=False)
    description = Column(String)
    business_type = Column(Enum("restaurant", "salon", "clinic", name="business_type_enum"), nullable=True)
    phone = Column(String)
    website = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)  # preserved as per your schema spelling
    timezone = Column(String)
    quote_slogan = Column(String)
    identification_mark = Column(String)
    published = Column(Boolean, nullable=False, default=True)
    version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated = Column(DateTime(timezone=True))

    # Relationships
    owner = relationship("User", back_populates="businesses")
    services = relationship("Service", back_populates="business")
    media_assets = relationship("MediaAsset", back_populates="business")
    coupons = relationship("Coupon", back_populates="business")
    ai_metadata = relationship("AiMetadata", back_populates="business")


# -------------------------
# SERVICES TABLE
# -------------------------
class Service(Base):
    __tablename__ = "services"

    service_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.business_id", ondelete="CASCADE"), nullable=False)

    service_type = Column(Enum(ServiceTypeEnum, name="service_type_enum"), nullable=False)  # ✅ correct
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, nullable=False, default="INR")
    is_available = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime(timezone=True))

    # Relationships
    business = relationship("BusinessProfile", back_populates="services")
    restaurant_fields = relationship("RestaurantServiceFields", uselist=False, back_populates="service")
    salon_fields = relationship("SalonServiceFields", uselist=False, back_populates="service")


# -------------------------
# RESTAURANT_SERVICE_FIELDS TABLE
# -------------------------
class RestaurantServiceFields(Base):
    __tablename__ = "restaurant_service_fields"

    service_id = Column(UUID(as_uuid=True), ForeignKey("services.service_id", ondelete="CASCADE"), primary_key=True)
    cuisine_type = Column(String, nullable=False)
    dietary_tags = Column(String)
    portion_size = Column(String)
    is_vegan = Column(Boolean, default=True)

    # Relationship
    service = relationship("Service", back_populates="restaurant_fields")



# -------------------------
# SALON_SERVICE_FIELDS TABLE
# -------------------------
class SalonServiceFields(Base):
    __tablename__ = "salon_service_fields"

    service_id = Column(UUID(as_uuid=True), ForeignKey("services.service_id", ondelete="CASCADE"), primary_key=True)
    duration_minutes = Column(Integer)
    stylist_required = Column(Boolean, default=False)
    gender_specific = Column(Enum("male", "female", "unisex", name="gender_specific_enum"), nullable=False, default="male")

    # Relationship
    service = relationship("Service", back_populates="salon_fields")


# -------------------------
# MEDIA_ASSETS TABLE
# -------------------------
class MediaAsset(Base):
    __tablename__ = "media_assets"

    asset_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.business_id", ondelete="CASCADE"), nullable=False)

    media_type = Column(Enum("image", "video", "document", name="media_type_enum"), nullable=False)
    url = Column(String, nullable=False)
    alt_text = Column(String)
    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    # Relationship
    business = relationship("BusinessProfile", back_populates="media_assets")
# -------------------------
# CHECK_REQUEST TABLE
# -------------------------
class VisibilityCheckRequest(Base):
    __tablename__ = "visibility_check_request"

    request_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.business_id", ondelete="CASCADE"), nullable=False)

    check_type = Column(Enum("visibility", "content_enhancement", "schema_completeness", name="check_type_enum"), nullable=False)
    input_data = Column(String)
    requested_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))

    business = relationship("BusinessProfile")



# -------------------------
# RESULT TABLE
# -------------------------
class VisibilityCheckResult(Base):
    __tablename__ = "visibility_check_result"

    result_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("visibility_check_request.request_id", ondelete="CASCADE"), nullable=False)
    business_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.business_id", ondelete="CASCADE"), nullable=False)

    visibility_score = Column(Numeric(5, 2))
    issues_found = Column(String)
    recommendations = Column(String)
    output_snapshot = Column(String)
    completed_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))

    business = relationship("BusinessProfile")
    request = relationship("VisibilityCheckRequest")



# -------------------------
# SUGGESTIONS TABLE
# -------------------------
class VisibilitySuggestion(Base):
    __tablename__ = "visibility_suggestions"

    suggestion_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.business_id", ondelete="CASCADE"), nullable=False)

    suggestion_type = Column(Enum("metadata_enhancement", "content_update", "seo", name="suggestion_type_enum"), nullable=False)
    title = Column(String, nullable=False)
    status = Column(Enum("pending", "implemented", "rejected", name="status_enum"), nullable=False, default="pending")
    suggested_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))
    resolved_at = Column(DateTime(timezone=True))

    business = relationship("BusinessProfile")


# -------------------------
# AI_METADATA TABLE
# -------------------------
class AiMetadata(Base):
    __tablename__ = "ai_metadata"

    ai_metadata_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.business_id", ondelete="CASCADE"), nullable=False)

    extracted_insights = Column(String)
    detected_entities = Column(String)
    keywords = Column(String)
    intent_labels = Column(String)
    generated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))

    # Relationship
    business = relationship("BusinessProfile", back_populates="ai_metadata")



# -------------------------
# COUPONS TABLE
# -------------------------
class Coupon(Base):
    __tablename__ = "coupons"

    coupon_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.business_id", ondelete="CASCADE"), nullable=False)

    code = Column(String, nullable=False)
    description = Column(String)
    discount_value = Column(String, nullable=False)
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_until = Column(DateTime(timezone=True), nullable=False)
    terms_conditions = Column(String)
    is_active = Column(Boolean, default=True)

    # Relationship
    business = relationship("BusinessProfile", back_populates="coupons")


class JsonLDFeed(Base):
    __tablename__ = "jsonld_feed"

    feed_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.business_id", ondelete="CASCADE"), nullable=False)

    schema_type = Column(Enum("Restaurant", "HairSalon", "MedicalClinic", name="schema_type_enum"), nullable=False)
    jsonld_data = Column(String, nullable=False)
    is_valid = Column(Boolean, nullable=False, default=False)
    validation_errors = Column(String)
    generated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))

    business = relationship("BusinessProfile")


class OperationalInfo(Base):
    __tablename__ = "operational_info"

    info_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("business_profiles.business_id", ondelete="CASCADE"), nullable=False)

    opening_hours = Column(String, nullable=False)
    closing_hours = Column(String, nullable=False)
    off_days = Column(ARRAY(String), default=[])
    delivery_options = Column(String)
    reservation_options = Column(String)
    wifi_available = Column(Boolean, default=False)
    accessibility_features = Column(String)
    nearby_parking_spot = Column(String)
    special_notes = Column(String)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime(timezone=True))

    business = relationship("BusinessProfile")

    

