CREATE EXTENSION IF NOT EXISTS pgcrypto; --Enable extension for UUIDs
CREATE EXTENSION IF NOT EXISTS citext;  --Enable extension for case-insensitive text

--users table: Central record for identity, access control, ownership, auditing, and personalization across the platform.
CREATE TABLE users(
	user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  --generates a random user_id making sure the id is unique and secure
	email CITEXT NOT NULL UNIQUE,   --enforces case‑insensitive uniqueness for emails without extra indexes or lower() checks
	name TEXT,
	auth_provider TEXT NOT NULL CHECK (auth_provider IN ('oauth', 'email', 'sso', 'password')), --Auth provider tells the system which sign‑in method to run and what credentials or external attributes to expect.
	password_hash TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now  --stores points in time with time zone for when it was created
	last_login TIMESTAMPTZ,     --stores points in time with time zone for when it was created
	is_active BOOLEAN NOT NULL DEFAULT true	  --account status (active or inactive)
);

CREATE INDEX ix_users_email_lower ON users(lower(email));   --Add index for email
CREATE INDEX ix_users_created_at ON users(created_at);   --Add index for created at
CREATE INDEX ix_users_is_active ON users (is_active) WHERE is_active IS TRUE;  --Add indexes that match  real, frequent query patterns; prefer narrow, partial, or functional indexes to keep them efficient.