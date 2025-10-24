CREATE TYPE gender_specific_enum AS ENUM('male', 'female', 'unisex');

CREATE TABLE salon_service_fields(
	service_id UUID PRIMARY KEY,
	duration_minutes INTEGER, --need to check again , do we need it , do we make it NOT NULL
	stylist_required BOOLEAN DEFAULT false,  --need to check again , do we need it , do we make it NOT NULL, or du we change to true
	gender_specific gender_specific_enum NOT NULL DEFAULT 'male'

);

ALTER TABLE salon_service_fields
	ADD CONSTRAINT fk_salon_service FOREIGN KEY (service_id)
	REFERENCES services(service_id) ON DELETE CASCADE;