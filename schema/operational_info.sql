CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE operational_info(
	info_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	business_id UUID NOT NULL,
	opening_hours TEXT NOT NULL, 
	closing_hours TEXT NOT NULL,
	off_days TEXT,
	delivery_options TEXT,
	reservation_options TEXT,
	wifi_available BOOLEAN DEFAULT FALSE,
	accessibility_features TEXT,
	neaby_parking_spot TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ
);

ALTER TABLE operational_info
	ADD CONSTRAINT fk_operational_info_business FOREIGN KEY(business_id)
	REFERENCES business_profiles(business_id) ON DELETE CASCADE;


CREATE INDEX ix_operational_info_business ON operational_info (business_id);

