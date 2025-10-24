
CREATE TYPE suggestion_type_enum AS ENUM('metadata_enhancement', 'content_update', 'seo' );
CREATE TYPE status_enum AS ENUM ('pending', 'implemented', 'rejected');

CREATE TABLE visibility_suggestions(
	suggestion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	business_id UUID NOT NULL,
	suggestion_type suggestion_type_enum NOT NULL,
	title TEXT NOT NULL,
	status status_enum NOT NULL DEFAULT 'pending',
	suggested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	resolved_at TIMESTAMPTZ
	
);

ALTER TABLE visibility_suggestions
	ADD CONSTRAINT fk_visibility_suggestions_business FOREIGN KEY(business_id)
	REFERENCES business_profiles(business_id) ON DELETE CASCADE;


CREATE INDEX ix_visibility_suggestions_business ON visibility_suggestions (business_id); -- lookup by business
CREATE INDEX ix_visibility_suggestions_status ON visibility_suggestions (status); -- filter by lifecycle
CREATE INDEX ix_visibility_suggestions_type ON visibility_suggestions (suggestion_type); -- filter by type
CREATE INDEX ix_visibility_suggestions_suggested ON visibility_suggestions (suggested_at DESC); -- recent suggestions