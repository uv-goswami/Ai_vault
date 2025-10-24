CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE media_type_enum AS ENUM ('image', 'video', 'document');

CREATE TABLE media_assets(
	asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	business_id UUID NOT NULL,
	media_type media_type_enum NOT NULL,
	url TEXT NOT NULL,
	alt_text TEXT,
	uploaded_at TIMESTAMPTZ	NOT NULL DEFAULT NOW()
);


ALTER TABLE media_assets
	ADD CONSTRAINT fk_media_assets_BUSINESS FOREIGN KEY (business_id)
	REFERENCES business_profileS(business_id) ON DELETE CASCADE;

CREATE INDEX ix_media_assets_business ON media_assets (business_id);
CREATE INDEX ix_media_assets_type ON media_assets (media_type);
CREATE INDEX ix_media_assets_uploaded ON media_assets(uploaded_at DESC);
