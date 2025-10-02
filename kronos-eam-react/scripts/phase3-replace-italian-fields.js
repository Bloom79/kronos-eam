#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define all field mappings
const fieldMappings = {
  // Simple property mappings
  'enti_richiesti': 'required_entities',
  'durata_giorni': 'duration_days',
  'ordine': 'order',
  'ente_responsabile': 'responsible_entity',
  'tipo_pratica': 'practice_type',
  'type_pratica': 'practice_type',
  'durata_stimata_giorni': 'estimated_duration_days',
  'ricorrenza': 'recurrence',
  'condizioni_attivazione': 'activation_conditions',
  'scadenza_config': 'deadline_config',
  'documenti_base': 'base_documents',
  'categoria': 'category',
  'descrizione': 'description',
  'attivo': 'active',
  'enti_coinvolti': 'involved_entities',
  'entiCoinvolti': 'involvedEntities',
  'condizioneApplicazione': 'applicationCondition',
  'ora': 'time',
  'confidenza': 'confidence',
  'pagina': 'page',
  'potenzaNominale': 'nominalPower',
  'typelogia': 'typology',
  'totali': 'total',
  'completati': 'completed',
  'inCorso': 'inProgress',
  'pianificati': 'planned',
  'inRitardo': 'delayed'
};

// Files to process
const filesToProcess = [
  'src/components/workflows/PhaseTemplateSelector.tsx',
  'src/components/workflows/StageBuilder.tsx',
  'src/components/workflows/TaskEditor.tsx',
  'src/components/workflows/WorkflowTemplateConfig.tsx',
  'src/components/workflows/WorkflowTemplateEditor.tsx',
  'src/components/workflows/WorkflowTemplateGallery.tsx',
  'src/components/workflows/WorkflowTemplateOverview.tsx',
  'src/components/workflows/WorkflowTemplatePreview.tsx',
  'src/components/workflows/WorkflowTemplateReview.tsx',
  'src/components/workflows/WorkflowWizard.tsx',
  'src/pages/ImpiantoDetail/WorkflowsTab.tsx',
  'src/data/workflowTemplates.ts'
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
  
  // Apply each field mapping
  Object.entries(fieldMappings).forEach(([italian, english]) => {
    // Pattern 1: Property access (object.property)
    const propertyAccessPattern = new RegExp(`\\.${italian}(?![a-zA-Z0-9_])`, 'g');
    const propertyAccessMatches = content.match(propertyAccessPattern);
    if (propertyAccessMatches) {
      content = content.replace(propertyAccessPattern, `.${english}`);
      fileReplacements += propertyAccessMatches.length;
    }
    
    // Pattern 2: Object keys ({ key: value })
    const objectKeyPattern = new RegExp(`(\\s|{|,)${italian}(:)`, 'g');
    const objectKeyMatches = content.match(objectKeyPattern);
    if (objectKeyMatches) {
      content = content.replace(objectKeyPattern, `$1${english}$2`);
      fileReplacements += objectKeyMatches.length;
    }
    
    // Pattern 3: Destructuring ({ key } = object)
    const destructuringPattern = new RegExp(`({[^}]*)(\\s|,)${italian}(\\s|,|})`, 'g');
    const destructuringMatches = content.match(destructuringPattern);
    if (destructuringMatches) {
      content = content.replace(destructuringPattern, `$1$2${english}$3`);
      fileReplacements += destructuringMatches.length;
    }
    
    // Pattern 4: Array/object bracket notation (object['key'])
    const bracketPattern = new RegExp(`\\['${italian}'\\]`, 'g');
    const bracketMatches = content.match(bracketPattern);
    if (bracketMatches) {
      content = content.replace(bracketPattern, `['${english}']`);
      fileReplacements += bracketMatches.length;
    }
    
    // Pattern 5: String literals in comparisons or assignments
    const stringLiteralPattern = new RegExp(`(['"\`])${italian}(['"\`])`, 'g');
    const stringLiteralMatches = content.match(stringLiteralPattern);
    if (stringLiteralMatches) {
      // Only replace if it's used as a field name (e.g., in hasOwnProperty, includes, etc.)
      content = content.replace(/hasOwnProperty\(['"`]([^'"`]+)['"`]\)/g, (match, fieldName) => {
        if (fieldMappings[fieldName]) {
          return `hasOwnProperty('${fieldMappings[fieldName]}')`;
        }
        return match;
      });
    }
    
    // Pattern 6: Type/Interface definitions
    const typeDefPattern = new RegExp(`^(\\s*)(${italian})(\\??:)`, 'gm');
    const typeDefMatches = content.match(typeDefPattern);
    if (typeDefMatches) {
      content = content.replace(typeDefPattern, `$1${english}$3`);
      fileReplacements += typeDefMatches.length;
    }
  });
  
  // Special case: Replace function names
  content = content.replace(/getScadenzaColor/g, 'getDeadlineColor');
  if (content.includes('getDeadlineColor')) fileReplacements++;
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file}: ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  }
});

console.log(`\n✨ Phase 3 complete! Total replacements: ${totalReplacements}`);