CREATE TABLE medical_service_fields(
	service_id UUID PRIMARY KEY,
	doctor_specialty TEXT ,
	insurence_accepted TEXT, --dO WE MAKE IT NOT NULL??
	requires_referral BOOLEAN DEFAULT false
);

ALTER TABLE medical_service_fields
	ADD CONSTRAINT fk_medical_services FOREIGN KEY (service_id)
	REFERENCES services(service_id) ON DELETE CASCADE;