-- Fix enum values to match SQLAlchemy model expectations
-- SQLAlchemy uses the VALUE not the NAME of the enum

BEGIN;

-- Drop and recreate user status enum with the values SQLAlchemy expects
ALTER TYPE userstatusenum RENAME TO userstatusenum_old;
CREATE TYPE userstatusenum AS ENUM ('Active', 'Suspended', 'Invited');
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;
ALTER TABLE users ALTER COLUMN status TYPE userstatusenum USING status::text::userstatusenum;
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'Invited'::userstatusenum;
DROP TYPE userstatusenum_old CASCADE;

-- Drop and recreate user role enum with the values SQLAlchemy expects  
ALTER TYPE userroleenum RENAME TO userroleenum_old;
CREATE TYPE userroleenum AS ENUM ('Admin', 'Asset Manager', 'Operator', 'Viewer');
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE users ALTER COLUMN role TYPE userroleenum USING role::text::userroleenum;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'Viewer'::userroleenum;
DROP TYPE userroleenum_old CASCADE;

-- Drop and recreate tenant status enum
ALTER TYPE tenantstatusenum RENAME TO tenantstatusenum_old;
CREATE TYPE tenantstatusenum AS ENUM ('Active', 'Suspended', 'Trial', 'Expired');
ALTER TABLE tenants ALTER COLUMN status DROP DEFAULT;
ALTER TABLE tenants ALTER COLUMN status TYPE tenantstatusenum USING status::text::tenantstatusenum;
ALTER TABLE tenants ALTER COLUMN status SET DEFAULT 'Active'::tenantstatusenum;
DROP TYPE tenantstatusenum_old CASCADE;

COMMIT;