CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE service_type_enum AS ENUM ();

CREATE TABLE services(
	service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	business_id UUID NOT NULL,
	service_type service_type_enum NOT NULL,
	name TEXT NOT NULL,
	description TEXT,
	price NUMERIC(10,2) NOT NULL,
	currency TEXT NOT NULL DEFAULT 'INR',
	is_available BOOLEAN NOT NULL DEFAULT true,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ
);

ALTER TABLE services
	ADD CONSTRAINT fk_services_business FOREIGN KEY (business_id)
	REFERENCES business_profiles (business_id) ON DELETE CASCADE;

CREATE INDEX ix_services_business ON services (business_id);
CREATE INDEX ix_services_type ON services(service_type);
CREATE INDEX ix_services_availability ON services(is_available) WHERE is_available IS TRUE;

