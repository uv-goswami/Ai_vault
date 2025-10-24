CREATE TYPE schema_type_enum AS ENUM('Restaurnat', 'HairSalon', 'MedicalClinic');

CREATE TABLE jsonld_feed(
	feed_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	business_id UUID NOT NULL,
	schema_type schema_type_enum NOT NULL,
	jsonld_data TEXT NOT NULL, 
	is_valid BOOLEAN NOT NULL DEFAULT false,
	validation_errors TEXT,
	generated_at TIMESTAMPTZ NOT NULL DEFAULT now()	
);

ALTER TABLE jsonld_feed
	ADD CONSTRAINT fk_jsonld_feed_business FOREIGN KEY(business_id)
	REFERENCES business_profiles(business_id) ON DELETE CASCADE;

CREATE INDEX ix_jsonld_feed_business ON jsonld_feed(business_id);
CREATE INDEX ix_jsonld_feed_type ON jsonld_feed(schema_type);
CREATE INDEX ix_jsonld_feed_valid ON jsonld_feed(is_valid) WHERE is_valid IS TRUE;
CREATE INDEX ix_jsonld_feed_generated ON jsonld_feed(generated_at DESC);









