CREATE TABLE coupons(
	coupon_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	business_id UUID NOT NULL,
	code TEXT NOT NULL,
	description TEXT,
	discount_value TEXT NOT NULL,
	valid_from TIMESTAMPTZ NOT NULL,
	valid_until TIMESTAMPTZ NOT NULL,
	terms_conditions TEXT,
	is_active BOOLEAN DEFAULT true	
);

ALTER TABLE coupons
	ADD CONSTRAINT fk_coupons_business FOREIGN KEY (business_id)
	REFERENCES business_profiles(business_id) ON DELETE CASCADE;

CREATE INDEX ix_coupons_business ON coupons(business_id);
CREATE iNDEX ix_coupons_code ON coupons(code);
CREATE iNDEX ix_coupons_validity ON coupons(valid_until DESC);