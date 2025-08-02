-- This script migrates PostgreSQL enum types from Italian to English values
-- It must be run with superuser privileges

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
        ELSE 'Active'::tenantstatusenum
    END;
DROP TYPE tenantstatusenum_old;

-- 4. Workflow Status Enum  
ALTER TYPE workflowstatusenum RENAME TO workflowstatusenum_old;
CREATE TYPE workflowstatusenum AS ENUM ('Draft', 'Active', 'Paused', 'Completed', 'Cancelled');
ALTER TABLE workflows ALTER COLUMN current_status TYPE workflowstatusenum USING 
    CASE current_status::text
        WHEN 'Bozza' THEN 'Draft'::workflowstatusenum
        WHEN 'Attivo' THEN 'Active'::workflowstatusenum
        WHEN 'In Pausa' THEN 'Paused'::workflowstatusenum
        WHEN 'Completato' THEN 'Completed'::workflowstatusenum
        WHEN 'Annullato' THEN 'Cancelled'::workflowstatusenum
        ELSE 'Draft'::workflowstatusenum
    END;
DROP TYPE workflowstatusenum_old;

-- 5. Workflow Purpose Enum
ALTER TYPE workflowpurposeenum RENAME TO workflowpurposeenum_old;
CREATE TYPE workflowpurposeenum AS ENUM ('Complete Activation', 'Specific Process', 'Recurring Compliance', 'Custom', 'Phase Component');
ALTER TABLE workflow_templates ALTER COLUMN purpose TYPE workflowpurposeenum USING 
    CASE purpose::text
        WHEN 'Attivazione Completa' THEN 'Complete Activation'::workflowpurposeenum
        WHEN 'Processo Specifico' THEN 'Specific Process'::workflowpurposeenum
        WHEN 'Compliance Ricorrente' THEN 'Recurring Compliance'::workflowpurposeenum
        WHEN 'Personalizzato' THEN 'Custom'::workflowpurposeenum
        WHEN 'Componente Fase' THEN 'Phase Component'::workflowpurposeenum
        ELSE 'Custom'::workflowpurposeenum
    END;
DROP TYPE workflowpurposeenum_old;

-- 6. Workflow Phase Enum
ALTER TYPE workflowphaseenum RENAME TO workflowphaseenum_old;
CREATE TYPE workflowphaseenum AS ENUM ('Design', 'Connection', 'Registration', 'Fiscal');
ALTER TABLE workflow_templates ALTER COLUMN phase TYPE workflowphaseenum USING 
    CASE phase::text
        WHEN 'Progettazione' THEN 'Design'::workflowphaseenum
        WHEN 'Connessione' THEN 'Connection'::workflowphaseenum
        WHEN 'Registrazione' THEN 'Registration'::workflowphaseenum
        WHEN 'Fiscale' THEN 'Fiscal'::workflowphaseenum
        ELSE NULL
    END;
DROP TYPE workflowphaseenum_old;

-- 7. Task Status Enum
ALTER TYPE taskstatusenum RENAME TO taskstatusenum_old;
CREATE TYPE taskstatusenum AS ENUM ('To Start', 'In Progress', 'Completed', 'Delayed', 'Blocked');
ALTER TABLE workflow_tasks ALTER COLUMN status TYPE taskstatusenum USING 
    CASE status::text
        WHEN 'Da Iniziare' THEN 'To Start'::taskstatusenum
        WHEN 'In Corso' THEN 'In Progress'::taskstatusenum
        WHEN 'Completato' THEN 'Completed'::taskstatusenum
        WHEN 'In Ritardo' THEN 'Delayed'::taskstatusenum
        WHEN 'Bloccato' THEN 'Blocked'::taskstatusenum
        ELSE 'To Start'::taskstatusenum
    END;
DROP TYPE taskstatusenum_old;

-- 8. Task Priority Enum
ALTER TYPE taskpriorityenum RENAME TO taskpriorityenum_old;
CREATE TYPE taskpriorityenum AS ENUM ('High', 'Medium', 'Low');
ALTER TABLE workflow_tasks ALTER COLUMN priority TYPE taskpriorityenum USING 
    CASE priority::text
        WHEN 'Alta' THEN 'High'::taskpriorityenum
        WHEN 'Media' THEN 'Medium'::taskpriorityenum
        WHEN 'Bassa' THEN 'Low'::taskpriorityenum
        ELSE 'Medium'::taskpriorityenum
    END;
DROP TYPE taskpriorityenum_old;

-- 9. Plant Status Enum (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plantstatusenum') THEN
        ALTER TYPE plantstatusenum RENAME TO plantstatusenum_old;
        CREATE TYPE plantstatusenum AS ENUM ('In Operation', 'In Authorization', 'Under Construction', 'Decommissioned');
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plants' AND column_name='status') THEN
            ALTER TABLE plants ALTER COLUMN status TYPE plantstatusenum USING 
                CASE status::text
                    WHEN 'In Esercizio' THEN 'In Operation'::plantstatusenum
                    WHEN 'In Autorizzazione' THEN 'In Authorization'::plantstatusenum
                    WHEN 'In Costruzione' THEN 'Under Construction'::plantstatusenum
                    WHEN 'Dismesso' THEN 'Decommissioned'::plantstatusenum
                    ELSE 'In Operation'::plantstatusenum
                END;
        END IF;
        
        DROP TYPE plantstatusenum_old;
    END IF;
END $$;

-- 10. Plant Type Enum (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'planttypeenum') THEN
        ALTER TYPE planttypeenum RENAME TO planttypeenum_old;
        CREATE TYPE planttypeenum AS ENUM ('Photovoltaic', 'Wind', 'Hydroelectric', 'Biomass', 'Geothermal');
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plants' AND column_name='type') THEN
            ALTER TABLE plants ALTER COLUMN type TYPE planttypeenum USING 
                CASE type::text
                    WHEN 'Fotovoltaico' THEN 'Photovoltaic'::planttypeenum
                    WHEN 'Eolico' THEN 'Wind'::planttypeenum
                    WHEN 'Idroelettrico' THEN 'Hydroelectric'::planttypeenum
                    WHEN 'Biomasse' THEN 'Biomass'::planttypeenum
                    WHEN 'Geotermico' THEN 'Geothermal'::planttypeenum
                    ELSE 'Photovoltaic'::planttypeenum
                END;
        END IF;
        
        DROP TYPE planttypeenum_old;
    END IF;
END $$;

COMMIT;