CREATE TABLE visibility_check_result(
	result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	request_id UUID NOT NULL,
	business_id UUID NOT NULL,
	visibility_score NUMERIC(5,2),
	issues_found TEXT,
	recommendations TEXT,
	output_snapshot TEXT,
	completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE visibility_check_result
	ADD CONSTRAINT fk_visibility_check_result_request FOREIGN KEY (request_id)
	REFERENCES visibility_check_request(request_id) ON DELETE CASCADE;

ALTER TABLE visibility_check_result
	ADD CONSTRAINT fk_visibility_check_result_business FOREIGN KEY(business_id)
	REFERENCES business_profiles(business_id) ON DELETE CASCADE;



CREATE INDEX ix_visibility_result_business ON visibility_check_result (business_id); -- lookup by business
CREATE INDEX ix_visibility_result_score ON visibility_check_result (visibility_score DESC); -- sort by score
CREATE INDEX ix_visibility_result_completed ON visibility_check_result (completed_at DESC); -- recent results