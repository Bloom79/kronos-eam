#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple replacements for the most common Italian field names
const replacements = [
  // Workflow fields
  [/\.progresso\b/g, '.progress'],
  [/\['progresso'\]/g, "['progress']"],
  [/\.categoria\b/g, '.category'],
  [/\['categoria'\]/g, "['category']"],
  [/\.enti_coinvolti\b/g, '.involved_entities'],
  [/\['enti_coinvolti'\]/g, "['involved_entities']"],
  [/\.ente_responsabile\b/g, '.responsible_entity'],
  [/\['ente_responsabile'\]/g, "['responsible_entity']"],
  [/\.tipo_pratica\b/g, '.practice_type'],
  [/\['tipo_pratica'\]/g, "['practice_type']"],
  [/\.url_portale\b/g, '.portal_url'],
  [/\['url_portale'\]/g, "['portal_url']"],
  [/\.credenziali_richieste\b/g, '.required_credentials'],
  [/\['credenziali_richieste'\]/g, "['required_credentials']"],
  [/\.documenti_richiesti\b/g, '.required_documents'],
  [/\['documenti_richiesti'\]/g, "['required_documents']"],
  [/\.checkpoints\b/g, '.checklist_items'],
  [/\['checkpoints'\]/g, "['checklist_items']"],
  
  // Plant fields
  [/\.impianto_id\b/g, '.plant_id'],
  [/\['impianto_id'\]/g, "['plant_id']"],
  [/\.impianto_nome\b/g, '.plant_name'],
  [/\['impianto_nome'\]/g, "['plant_name']"],
  [/\.plantname\b/g, '.plantName'],
  [/\['plantname'\]/g, "['plantName']"],
  
  // Time/Status fields
  [/\.durata_giorni\b/g, '.duration_days'],
  [/\['durata_giorni'\]/g, "['duration_days']"],
  [/\.durata_stimata_giorni\b/g, '.estimated_duration_days'],
  [/\['durata_stimata_giorni'\]/g, "['estimated_duration_days']"],
  [/\.ricorrenza\b/g, '.recurrence'],
  [/\['ricorrenza'\]/g, "['recurrence']"],
  [/\.attivo\b/g, '.active'],
  [/\['attivo'\]/g, "['active']"],
  [/\.completato\b/g, '.completed'],
  [/\['completato'\]/g, "['completed']"],
  
  // Organization fields
  [/\.ordine\b/g, '.order'],
  [/\['ordine'\]/g, "['order']"],
  [/\.priorita\b/g, '.priority'],
  [/\['priorita'\]/g, "['priority']"],
  [/\.responsabile\b/g, '.assignee'],
  [/\['responsabile'\]/g, "['assignee']"],
  [/\.dipendenze\b/g, '.dependencies'],
  [/\['dipendenze'\]/g, "['dependencies']"],
  [/\.integrazione\b/g, '.integration'],
  [/\['integrazione'\]/g, "['integration']"],
  
  // Core fields
  [/\.nome\b/g, '.name'],
  [/\['nome'\]/g, "['name']"],
  [/\.descrizione\b/g, '.description'],
  [/\['descrizione'\]/g, "['description']"],
  [/\.tipo\b/g, '.type'],
  [/\['tipo'\]/g, "['type']"],
  [/\.stato\b/g, '.status'],
  [/\['stato'\]/g, "['status']"],
];

// Files to fix (most critical ones)
const filesToFix = [
  'src/pages/Workflows.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/ImpiantoDetail/WorkflowsTab.tsx',
  'src/pages/RenewableWorkflows.tsx',
  'src/pages/AIAssistant.tsx',
  'src/pages/ImpiantoDetail/TernaTab.tsx',
  'src/pages/ImpiantoDetail/DoganeTab.tsx',
  'src/pages/Agenda.tsx',
  'src/components/workflows/WorkflowTemplatePreview.tsx',
  'src/components/workflows/WorkflowTemplateGallery.tsx',
  'src/components/workflows/EnhancedTaskEditor.tsx',
  'src/components/workflows/StageBuilder.tsx',
  'src/components/workflows/WorkflowDiagram.tsx',
  'src/components/workflows/WorkflowTimeline.tsx',
  'src/components/workflows/TaskEditor.tsx',
  'src/components/workflows/WorkflowTemplateConfig.tsx',
  'src/components/workflows/WorkflowTemplateEditor.tsx',
  'src/components/workflows/WorkflowWizard.tsx',
  'src/components/workflows/WorkflowTemplateOverview.tsx',
  'src/components/workflows/WorkflowLocationView.tsx',
  'src/components/workflows/PhaseTemplates.tsx',
  'src/components/workflows/WorkflowTemplateReview.tsx',
  'src/components/workflows/DocumentTemplateSelector.tsx',
  'src/components/workflows/PhaseTemplateSelector.tsx',
  'src/components/integrations/CredentialManager.tsx',
  'src/components/integrations/PECManager.tsx',
  'src/components/integrations/EDIGenerator.tsx',
  'src/components/integrations/RPAMonitor.tsx',
  'src/components/integrations/RPAMonitorV2.tsx',
  'src/services/api/workflow.service.ts',
  'src/utils/typeMappers.ts',
  'src/data/workflowTemplates.ts'
];

console.log('Fixing Italian field names in critical files...\n');

let totalReplacements = 0;
let filesUpdated = 0;

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileReplacements = 0;
  
  replacements.forEach(([pattern, replacement]) => {
    const matches = content.match(pattern);
    if (matches) {
      fileReplacements += matches.length;
      content = content.replace(pattern, replacement);
    }
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated ${file} (${fileReplacements} replacements)`);
    totalReplacements += fileReplacements;
    filesUpdated++;
  }
});

console.log(`\n✓ Fixed ${totalReplacements} Italian field names in ${filesUpdated} files`);