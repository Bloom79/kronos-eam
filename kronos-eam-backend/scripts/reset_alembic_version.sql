-- Reset Alembic version to the new consolidated migration
-- This should be run after backing up the database

-- First, clear the current version
TRUNCATE TABLE alembic_version;

-- Insert the new consolidated migration version
INSERT INTO alembic_version (version_num) VALUES ('001_complete_initial');

-- Verify the change
SELECT * FROM alembic_version;