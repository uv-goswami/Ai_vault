CREATE TABLE ai_metadata(
	ai_metadata_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	business_id UUID NOT NULL,
	extracted_insights TEXT,
	detected_entities TEXT,
	keywords TEXT,
	intent_labels TEXT,
	generated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE ai_metadata
	ADD CONSTRAINT fk_ai_metadata_business FOREIGN KEY (business_id)
	REFERENCES business_profiles(business_id) ON DELETE CASCADE;


CREATE INDEX ix_ai_metadata_business ON ai_metadata(business_id);
CREATE INDEX ix_ai_metadata_generated ON ai_metadata(generated_at DESC);