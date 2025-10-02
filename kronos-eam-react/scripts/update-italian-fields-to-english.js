#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Comprehensive mapping of Italian field names to English
const fieldMappings = {
  // Core fields
  'nome': 'name',
  'descrizione': 'description',
  'categoria': 'category',
  'tipo': 'type',
  'stato': 'status',
  
  // Workflow fields
  'progresso': 'progress',
  'enti_coinvolti': 'involved_entities',
  'ente_responsabile': 'responsible_entity',
  'tipo_pratica': 'practice_type',
  'url_portale': 'portal_url',
  'credenziali_richieste': 'required_credentials',
  'documenti_richiesti': 'required_documents',
  'checkpoints': 'checklist_items',
  
  // Plant/Impianto fields
  'impianto_id': 'plant_id',
  'impianto_nome': 'plant_name',
  'tipo_impianto': 'plant_type',
  'potenza_minima': 'min_power',
  'potenza_massima': 'max_power',
  'potenza_kw': 'power_kw',
  
  // Time/Status fields
  'durata_giorni': 'duration_days',
  'durata_stimata_giorni': 'estimated_duration_days',
  'data_scadenza': 'due_date',
  'scadenza': 'deadline',
  'ricorrenza': 'recurrence',
  'attivo': 'active',
  'completato': 'completed',
  
  // Organization fields
  'ordine': 'order',
  'priorita': 'priority',
  'responsabile': 'assignee',
  'dipendenze': 'dependencies',
  'integrazione': 'integration',
  
  // Additional workflow fields
  'statusCorrente': 'currentStatus',
  'dataCreazione': 'creationDate',
  'dataScadenza': 'dueDate',
  'dataCompletamento': 'completionDate',
  'plantname': 'plantName',
  'requisiti_documenti': 'documentRequirements',
  'status_integrazioni': 'integrationStatus',
  
  // Task fields
  'documenti_da_generare': 'documents_to_generate',
  'campi_modulo_ufficiale': 'official_form_fields',
  'importo_costo': 'cost_amount',
  'descrizione_costo': 'cost_description',
  'metodo_pagamento': 'payment_method',
  'riferimento_pagamento': 'payment_reference',
  'scadenza_normativa': 'regulatory_deadline',
  'tipo_scadenza': 'deadline_type',
  'conseguenze_scadenza': 'deadline_consequences',
  'richiede_sopralluogo': 'requires_site_inspection',
  'note_checkpoint_umano': 'human_checkpoint_notes',
  'richiede_auth_umana': 'requires_human_auth',
  'richiede_firma_fisica': 'requires_physical_signature',
};

// Files to process
const filesToProcess = [
  'src/components/**/*.tsx',
  'src/components/**/*.ts',
  'src/pages/**/*.tsx',
  'src/pages/**/*.ts',
  'src/services/**/*.ts',
  'src/utils/**/*.ts',
  'src/data/**/*.ts',
];

// Patterns to skip (translation files, etc.)
const skipPatterns = [
  /\/i18n\//,
  /\/locales\//,
  /\.test\./,
  /\.spec\./,
];

function shouldSkipFile(filePath) {
  return skipPatterns.some(pattern => pattern.test(filePath));
}

function updateFile(filePath) {
  if (shouldSkipFile(filePath)) {
    return { skipped: true };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let replacements = 0;

  // Replace each Italian field name with English equivalent
  Object.entries(fieldMappings).forEach(([italian, english]) => {
    // Match object property access: .nome or ?.nome
    const dotPattern = new RegExp(`\\.${italian}\\b`, 'g');
    const optionalDotPattern = new RegExp(`\\?\\.${italian}\\b`, 'g');
    
    // Match bracket notation: ['nome'] or ["nome"]
    const bracketPattern1 = new RegExp(`\\['${italian}'\\]`, 'g');
    const bracketPattern2 = new RegExp(`\\["${italian}"\\]`, 'g');
    
    // Match object keys in destructuring or object literals: { nome: ... } or { nome, ... }
    const objectKeyPattern = new RegExp(`(\\{[^}]*)(\\b${italian})(:)`, 'g');
    const destructuringPattern = new RegExp(`(\\{[^}]*)(\\b${italian})(,|\\s*\\})`, 'g');
    
    // Count replacements
    const dotMatches = (content.match(dotPattern) || []).length;
    const optionalDotMatches = (content.match(optionalDotPattern) || []).length;
    const bracketMatches1 = (content.match(bracketPattern1) || []).length;
    const bracketMatches2 = (content.match(bracketPattern2) || []).length;
    
    // Perform replacements
    content = content.replace(dotPattern, `.${english}`);
    content = content.replace(optionalDotPattern, `?.${english}`);
    content = content.replace(bracketPattern1, `['${english}']`);
    content = content.replace(bracketPattern2, `["${english}"]`);
    
    // For object keys, be more careful to avoid replacing in strings
    content = content.replace(objectKeyPattern, `$1${english}$3`);
    
    replacements += dotMatches + optionalDotMatches + bracketMatches1 + bracketMatches2;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return { updated: true, replacements };
  }

  return { unchanged: true };
}

// Main execution
console.log('Starting Italian to English field name conversion...\n');

let totalFiles = 0;
let updatedFiles = 0;
let skippedFiles = 0;
let totalReplacements = 0;

filesToProcess.forEach(pattern => {
  const files = glob.sync(pattern, { cwd: path.join(__dirname, '..') });
  
  files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    totalFiles++;
    
    const result = updateFile(filePath);
    
    if (result.skipped) {
      skippedFiles++;
    } else if (result.updated) {
      updatedFiles++;
      totalReplacements += result.replacements;
      console.log(`✓ Updated ${file} (${result.replacements} replacements)`);
    }
  });
});

console.log('\n=== Summary ===');
console.log(`Total files processed: ${totalFiles}`);
console.log(`Files updated: ${updatedFiles}`);
console.log(`Files skipped: ${skippedFiles}`);
console.log(`Total replacements: ${totalReplacements}`);

// Run TypeScript compilation check
console.log('\nRunning TypeScript compilation check...');
const { execSync } = require('child_process');

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✓ TypeScript compilation successful!');
} catch (error) {
  console.log('\n✗ TypeScript compilation failed. Please check the errors above.');
  process.exit(1);
}