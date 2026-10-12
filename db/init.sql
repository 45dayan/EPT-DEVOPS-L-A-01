-- First-boot schema for PostgreSQL in Docker.
-- This file runs only when the data volume is created empty.
-- It must stay in sync with src/db/schema.ts.

CREATE TABLE IF NOT EXISTS inquiries (
  id serial PRIMARY KEY,
  name varchar(120) NOT NULL,
  email varchar(180) NOT NULL,
  company varchar(140) NOT NULL DEFAULT '',
  project_type varchar(40) NOT NULL,
  budget varchar(48) NOT NULL,
  message text NOT NULL,
  status varchar(24) NOT NULL DEFAULT 'new',
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries (created_at);
