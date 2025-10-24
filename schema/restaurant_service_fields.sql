CREATE TABLE resturant_service_fields(
	service_id UUID PRIMARY KEY,
	cuisine_type TEXT NOT NULL,
	dietary_tags TEXT,
	portion_size TEXT,
	is_vegan BOOLEAN DEFAULT true
);

ALTER TABLE resturant_service_fields
	ADD CONSTRAINT fk_resturant_service FOREIGN KEY(service_id)
	REFERENCES services(service_id) ON DELETE CASCADE;