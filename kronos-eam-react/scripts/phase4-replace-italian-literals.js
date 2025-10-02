#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define all value mappings
const valueMappings = {
  // Type values
  '"Comunicazione"': '"Communication"',
  "'Comunicazione'": "'Communication'",
  '"Verifica"': '"Verification"',
  "'Verifica'": "'Verification'",
  '"Riunione"': '"Meeting"',
  "'Riunione'": "'Meeting'",
  '"Pagamento"': '"Payment"',
  "'Pagamento'": "'Payment'",
  '"Dichiarazione"': '"Declaration"',
  "'Dichiarazione'": "'Declaration'",
  '"Scadenza"': '"Deadline"',
  "'Scadenza'": "'Deadline'",
  
  // Priority values
  '"Alta"': '"High"',
  "'Alta'": "'High'",
  '"Media"': '"Medium"',
  "'Media'": "'Medium'",
  '"Bassa"': '"Low"',
  "'Bassa'": "'Low'",
  
  // Status values
  '"Completato"': '"Completed"',
  "'Completato'": "'Completed'",
  '"Pianificato"': '"Planned"',
  "'Pianificato'": "'Planned'",
  '"In Corso"': '"In Progress"',
  "'In Corso'": "'In Progress'",
  '"In Ritardo"': '"Delayed"',
  "'In Ritardo'": "'Delayed'",
  
  // Recurrence values
  '"Annuale"': '"Annual"',
  "'Annuale'": "'Annual'",
  '"Mensile"': '"Monthly"',
  "'Mensile'": "'Monthly'",
  '"Trimestrale"': '"Quarterly"',
  "'Trimestrale'": "'Quarterly'",
  '"Semestrale"': '"Semiannual"',
  "'Semestrale'": "'Semiannual'",
  '"Quinquennale"': '"Quinquennial"',
  "'Quinquennale'": "'Quinquennial'",
  '"Triennale"': '"Triennial"',
  "'Triennale'": "'Triennial'",
  
  // Entity values
  '"Interno"': '"Internal"',
  "'Interno'": "'Internal'",
  '"Dogane"': '"Customs"',
  "'Dogane'": "'Customs'",
  '"Comune"': '"Municipality"',
  "'Comune'": "'Municipality'",
  '"Regione"': '"Region"',
  "'Regione'": "'Region'",
  '"Soprintendenza"': '"Superintendency"',
  "'Soprintendenza'": "'Superintendency'",
  
  // Category values in AIAssistant
  '"Economico"': '"Economic"',
  "'Economico'": "'Economic'",
  '"Tecnico"': '"Technical"',
  "'Tecnico'": "'Technical'",
  '"Temporale"': '"Temporal"',
  "'Temporale'": "'Temporal'",
  '"Normativo"': '"Regulatory"',
  "'Normativo'": "'Regulatory'",
  
  // Plant Status values
  '"In Esercizio"': '"In Operation"',
  "'In Esercizio'": "'In Operation'",
  '"In Autorizzazione"': '"Under Authorization"',
  "'In Autorizzazione'": "'Under Authorization'",
  '"In Costruzione"': '"Under Construction"',
  "'In Costruzione'": "'Under Construction'",
  '"Dismesso"': '"Decommissioned"',
  "'Dismesso'": "'Decommissioned'",
  
  // Plant Type values
  '"Fotovoltaico"': '"Photovoltaic"',
  "'Fotovoltaico'": "'Photovoltaic'",
  '"Eolico"': '"Wind"',
  "'Eolico'": "'Wind'",
  '"Idroelettrico"': '"Hydroelectric"',
  "'Idroelettrico'": "'Hydroelectric'",
  '"Biomasse"': '"Biomass"',
  "'Biomasse'": "'Biomass'",
  '"Geotermico"': '"Geothermal"',
  "'Geotermico'": "'Geothermal'",
  
  // User Status values
  '"Attivo"': '"Active"',
  "'Attivo'": "'Active'",
  '"Sospeso"': '"Suspended"',
  "'Sospeso'": "'Suspended'",
  '"Invitato"': '"Invited"',
  "'Invitato'": "'Invited'"
};

// Special case mappings (for case statements)
const caseMappings = {
  "case 'Dogane':": "case 'Customs':",
  "case 'Comune':": "case 'Municipality':",
  "case 'Regione':": "case 'Region':",
  "case 'Soprintendenza':": "case 'Superintendency':",
  "case 'Interno':": "case 'Internal':",
  "case 'Alta':": "case 'High':",
  "case 'Media':": "case 'Medium':",
  "case 'Bassa':": "case 'Low':",
  "case 'Comunicazione':": "case 'Communication':",
  "case 'Verifica':": "case 'Verification':",
  "case 'Riunione':": "case 'Meeting':",
  "case 'Pagamento':": "case 'Payment':",
  "case 'Dichiarazione':": "case 'Declaration':",
  "case 'Scadenza':": "case 'Deadline':",
  "case 'Economico':": "case 'Economic':",
  "case 'Tecnico':": "case 'Technical':",
  "case 'Temporale':": "case 'Temporal':",
  "case 'Normativo':": "case 'Regulatory':"
};

// Files to process
const filesToProcess = [
  'src/pages/Agenda.tsx',
  'src/pages/AIAssistant.tsx',
  'src/pages/Dashboard.tsx',
  'src/components/workflows/WorkflowDiagram.tsx',
  'src/components/workflows/EnhancedTaskEditor.tsx',
  'src/components/workflows/EntitySwimlanes.tsx',
  'src/components/workflows/WorkflowTimeline.tsx',
  'src/components/integrations/CredentialManager.tsx',
  'src/pages/Plants.tsx',
  'src/pages/UserManagement.tsx',
  'src/pages/Compliance.tsx',
  'src/components/plants/AddPlantModal.tsx',
  'src/components/plants/AddPlantModalV2.tsx'
];

// Additional patterns to fix
const additionalPatterns = [
  // Fix getPriorityColor/getTypeColor functions
  { pattern: /getEnteColor/g, replacement: 'getEntityColor' },
  { pattern: /gettypeIcon/g, replacement: 'getTypeIcon' },
  { pattern: /getScadenzaColor/g, replacement: 'getDeadlineColor' },
  { pattern: /getPriorityColor/g, replacement: 'getPriorityColor' },
  
  // Fix Italian variable names in local scopes
  { pattern: /const ente =/g, replacement: 'const entity =' },
  { pattern: /\(ente\)/g, replacement: '(entity)' },
  { pattern: /\{ente\}/g, replacement: '{entity}' },
  { pattern: /ente =>/g, replacement: 'entity =>' },
  { pattern: /\.ente/g, replacement: '.entity' },
  
  // Fix scadenza references
  { pattern: /const scadenza =/g, replacement: 'const deadline =' },
  { pattern: /\(scadenza\)/g, replacement: '(deadline)' },
  { pattern: /scadenza\./g, replacement: 'deadline.' },
  { pattern: /mapCalendarEventToScadenza/g, replacement: 'mapCalendarEventToDeadline' }
];

let totalReplacements = 0;

// Process each file
filesToProcess.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileReplacements = 0;
  
  // Apply value mappings
  Object.entries(valueMappings).forEach(([italian, english]) => {
    const matches = content.split(italian).length - 1;
    if (matches > 0) {
      content = content.replace(new RegExp(italian.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), english);
      fileReplacements += matches;
    }
  });
  
  // Apply case statement mappings
  Object.entries(caseMappings).forEach(([italian, english]) => {
    const matches = content.split(italian).length - 1;
    if (matches > 0) {
      content = content.replace(new RegExp(italian.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), english);
      fileReplacements += matches;
    }
  });
  
  // Apply additional patterns
  additionalPatterns.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fileReplacements += matches.length;
    }
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file}: ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  }
});

// Also process the RPA service files for Phase 5
const rpaFiles = [
  'src/services/rpa/portals/GSEPortalAPI.ts',
  'src/services/rpa/portals/TernaPortalAPI.ts'
];

rpaFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileReplacements = 0;
  
  // Fix potenzaNominale
  content = content.replace(/potenzaNominale/g, 'nominalPower');
  fileReplacements += (content.match(/nominalPower/g) || []).length;
  
  // Fix typelogia typo
  content = content.replace(/typelogia/g, 'typology');
  fileReplacements += (content.match(/typology/g) || []).length;
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file}: ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  }
});

console.log(`\n✨ Phase 4 & 5 complete! Total replacements: ${totalReplacements}`);