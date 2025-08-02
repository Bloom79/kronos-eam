-- Fix critical enums for login functionality
BEGIN;

-- 1. User Status Enum
ALTER TYPE userstatusenum RENAME TO userstatusenum_old;
CREATE TYPE userstatusenum AS ENUM ('Active', 'Suspended', 'Invited');
ALTER TABLE users ALTER COLUMN status TYPE userstatusenum USING 
    CASE status::text
        WHEN 'ATTIVO' THEN 'Active'::userstatusenum
        WHEN 'Attivo' THEN 'Active'::userstatusenum
        WHEN 'SOSPESO' THEN 'Suspended'::userstatusenum  
        WHEN 'Sospeso' THEN 'Suspended'::userstatusenum
        WHEN 'INVITATO' THEN 'Invited'::userstatusenum
        WHEN 'Invitato' THEN 'Invited'::userstatusenum
        WHEN 'ACTIVE' THEN 'Active'::userstatusenum
        WHEN 'SUSPENDED' THEN 'Suspended'::userstatusenum
        WHEN 'INVITED' THEN 'Invited'::userstatusenum
        ELSE 'Active'::userstatusenum
    END;
DROP TYPE userstatusenum_old;

-- 2. User Role Enum
ALTER TYPE userroleenum RENAME TO userroleenum_old;
CREATE TYPE userroleenum AS ENUM ('Admin', 'Asset Manager', 'Operator', 'Viewer');
ALTER TABLE users ALTER COLUMN role TYPE userroleenum USING 
    CASE role::text
        WHEN 'Admin' THEN 'Admin'::userroleenum
        WHEN 'Asset Manager' THEN 'Asset Manager'::userroleenum
        WHEN 'OPERATIVO' THEN 'Operator'::userroleenum
        WHEN 'Operativo' THEN 'Operator'::userroleenum
        WHEN 'Viewer' THEN 'Viewer'::userroleenum
        ELSE 'Viewer'::userroleenum
    END;
DROP TYPE userroleenum_old;

-- 3. Tenant Status Enum
ALTER TYPE tenantstatusenum RENAME TO tenantstatusenum_old;
CREATE TYPE tenantstatusenum AS ENUM ('Active', 'Suspended', 'Trial', 'Expired');
ALTER TABLE tenants ALTER COLUMN status TYPE tenantstatusenum USING 
    CASE status::text
        WHEN 'ATTIVO' THEN 'Active'::tenantstatusenum
        WHEN 'Attivo' THEN 'Active'::tenantstatusenum
        WHEN 'SOSPESO' THEN 'Suspended'::tenantstatusenum
        WHEN 'Sospeso' THEN 'Suspended'::tenantstatusenum
        WHEN 'Trial' THEN 'Trial'::tenantstatusenum
        WHEN 'SCADUTO' THEN 'Expired'::tenantstatusenum
        WHEN 'Scaduto' THEN 'Expired'::tenantstatusenum
        WHEN 'ACTIVE' THEN 'Active'::tenantstatusenum
        WHEN 'SUSPENDED' THEN 'Suspended'::tenantstatusenum
        WHEN 'TRIAL' THEN 'Trial'::tenantstatusenum
        WHEN 'EXPIRED' THEN 'Expired'::tenantstatusenum
        ELSE 'Active'::tenantstatusenum
    END;
DROP TYPE tenantstatusenum_old;

COMMIT;