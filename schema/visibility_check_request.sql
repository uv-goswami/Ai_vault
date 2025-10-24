CREATE TYPE check_type_enum AS ENUM ('visibility', 'content_enhancement', 'schema_completeness');

CREATE TABLE visibility_check_request(
	request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	business_id UUID NOT NULL,
	check_type check_type_enum NOT NULL,
	input_data TEXT,
	requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


ALTER TABLE visibility_check_request
	ADD CONSTRAINT fk_visibility_check_business FOREIGN KEY(business_id)
	REFERENCES business_profiles(business_id) ON DELETE CASCADE;


CREATE INDEX ix_visibility_check_business ON visibility_check_request (business_id); -- lookup by business
CREATE INDEX ix_visibility_check_type ON visibility_check_request (check_type); -- filter by check type
CREATE INDEX ix_visibility_check_requested ON visibility_check_request (requested_at DESC); -- recent requests