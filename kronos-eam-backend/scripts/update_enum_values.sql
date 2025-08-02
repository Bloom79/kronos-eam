-- Update Users table status from Italian to English
UPDATE users SET status = 'Active' WHERE status = 'ATTIVO' OR status = 'Attivo';
UPDATE users SET status = 'Suspended' WHERE status = 'SOSPESO' OR status = 'Sospeso';
UPDATE users SET status = 'Invited' WHERE status = 'INVITATO' OR status = 'Invitato';

-- Update Users table role from Italian to English
UPDATE users SET role = 'Admin' WHERE role = 'Admin';
UPDATE users SET role = 'Asset Manager' WHERE role = 'Asset Manager';
UPDATE users SET role = 'Operator' WHERE role = 'OPERATIVO' OR role = 'Operativo';
UPDATE users SET role = 'Viewer' WHERE role = 'Viewer';

-- Update Tenants table status
UPDATE tenants SET status = 'Active' WHERE status = 'ATTIVO' OR status = 'Attivo';
UPDATE tenants SET status = 'Suspended' WHERE status = 'SOSPESO' OR status = 'Sospeso';
UPDATE tenants SET status = 'Trial' WHERE status = 'Trial';
UPDATE tenants SET status = 'Expired' WHERE status = 'SCADUTO' OR status = 'Scaduto';

-- Update Workflows table status
UPDATE workflows SET current_status = 'Draft' WHERE current_status = 'Bozza';
UPDATE workflows SET current_status = 'Active' WHERE current_status = 'Attivo';
UPDATE workflows SET current_status = 'Paused' WHERE current_status = 'In Pausa';
UPDATE workflows SET current_status = 'Completed' WHERE current_status = 'Completato';
UPDATE workflows SET current_status = 'Cancelled' WHERE current_status = 'Annullato';

-- Update Workflow Templates purpose
UPDATE workflow_templates SET purpose = 'Complete Activation' WHERE purpose = 'Attivazione Completa';
UPDATE workflow_templates SET purpose = 'Specific Process' WHERE purpose = 'Processo Specifico';
UPDATE workflow_templates SET purpose = 'Recurring Compliance' WHERE purpose = 'Compliance Ricorrente';
UPDATE workflow_templates SET purpose = 'Custom' WHERE purpose = 'Personalizzato';
UPDATE workflow_templates SET purpose = 'Phase Component' WHERE purpose = 'Componente Fase';

-- Update Workflow Templates phase
UPDATE workflow_templates SET phase = 'Design' WHERE phase = 'Progettazione';
UPDATE workflow_templates SET phase = 'Connection' WHERE phase = 'Connessione';
UPDATE workflow_templates SET phase = 'Registration' WHERE phase = 'Registrazione';
UPDATE workflow_templates SET phase = 'Fiscal' WHERE phase = 'Fiscale';