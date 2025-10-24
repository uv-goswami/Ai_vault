CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE TYPE business_type_enum AS ENUM ('restaurant', 'salon', 'clinic');

CREATE TABLE business_profiles(
	business_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	owner_id UUID NOT NULL,
	name TEXT NOT NULL, 
	description TEXT,
	business_type business_type_enum,
	phone TEXT,
	website TEXT,
	address TEXT,
	latitude DOUBLE PRECISION,
	LONGITUDDE DOUBLE PRECISION,
	timezone TEXT,
	quote_slogan TEXT,
	identification_mark TEXT,
	published BOOLEAN NOT NULL DEFAULT true,
	version INTEGER NOT NULL DEFAULT 1,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated TIMESTAMPTZ 
);

ALTER TABLE business_profiles
ADD CONSTRAINT fk_business_profiles_owner FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE RESTRICT;

CREATE INDEX ix_business_profiles_owner ON business_profiles(owner_id);
CREATE INDEX ix_business_profiles_business_type ON business_profiles(business_type);
CREATE INDEX ix_business_profiles_created_at ON business_profiles (created_at);
CREATE INDEX ix_business_profiles_published ON business_profiles(published) WHERE published IS TRUE;

