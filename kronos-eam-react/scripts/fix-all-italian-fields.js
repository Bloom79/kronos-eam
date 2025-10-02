#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Comprehensive field mapping
const fieldMappings = {
  // Common fields
  'titolo': 'title',
  'descrizione': 'description', 
  'nome': 'name',
  'data': 'date',
  'ente': 'entity',
  'priorita': 'priority',
  'responsabile': 'assignee',
  'documenti': 'documents',
  'ricorrente': 'recurring',
  
  // Workflow fields
  'dataCreazione': 'createdAt',
  'dataScadenza': 'dueDate',
  'statusCorrente': 'currentStatus',
  'progresso': 'progress',
  'enti_coinvolti': 'involved_entities',
  'involved_entities': 'involvedEntities', // Fix snake_case to camelCase
  'categoria': 'category',
  'tipo': 'type',
  'durataStimataDays': 'estimatedDurationDays',
  'documentiRichiesti': 'requiredDocuments',
  'dipendenze': 'dependencies',
  'integrazione': 'integration',
  'scadenzaGiorni': 'deadlineDays',
  
  // Plant fields
  'impianto': 'plant',
  'impianto_id': 'plant_id',
  'impianto_nome': 'plant_name',
  'plantname': 'plantName',
  'potenza': 'power',
  'potenza_kw': 'power_kw',
  'codice': 'code',
  'comune': 'municipality',
  'provincia': 'province',
  'regione': 'region',
  'prossimaScadenza': 'nextDeadline',
  'prossima_scadenza': 'next_deadline',
  'coloreScadenza': 'deadlineColor',
  'colore_scadenza': 'deadline_color',
  
  // Integration fields
  'integrazione_gse': 'gse_integration',
  'integrazione_terna': 'terna_integration', 
  'integrazione_dogane': 'customs_integration',
  'integrazione_dso': 'dso_integration',
  
  // Task fields
  'assegnato_a': 'assigned_to',
  'data_scadenza': 'due_date',
  'stage_nome': 'stage_name',
  'dueDate': 'due_date', // Standardize to snake_case for API
  
  // Status values
  "'Dichiarazione'": "'Declaration'",
  "'Pagamento'": "'Payment'",
  "'Comunicazione'": "'Communication'",
  "'Verifica'": "'Verification'",
  "'Scadenza'": "'Deadline'",
  "'Riunione'": "'Meeting'",
  "'Dogane'": "'Customs'",
  "'Interno'": "'Internal'",
  "'Alta'": "'High'",
  "'Media'": "'Medium'",
  "'Bassa'": "'Low'",
  "'Completato'": "'Completed'",
  "'In Corso'": "'In Progress'",
  "'Pianificato'": "'Planned'",
  "'In Ritardo'": "'Delayed'",
  "'Mensile'": "'Monthly'",
  "'Trimestrale'": "'Quarterly'",
  "'Annuale'": "'Annual'",
  "'Attiva'": "'Active'",
  "'Scaduta'": "'Expired'",
  "'Bloccata'": "'Blocked'"
};

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;
  const originalContent = content;
  
  // Apply all field mappings
  Object.entries(fieldMappings).forEach(([italian, english]) => {
    // For property names, use word boundaries
    const propertyRegex = new RegExp(`\\b${italian}(?=\\s*[:\\?,])`, 'g');
    const beforeProperty = content.match(propertyRegex);
    content = content.replace(propertyRegex, english);
    if (beforeProperty) changeCount += beforeProperty.length;
    
    // For property access (e.g., scadenza.titolo)
    const accessRegex = new RegExp(`\\.${italian}\\b`, 'g');
    const beforeAccess = content.match(accessRegex);
    content = content.replace(accessRegex, `.${english}`);
    if (beforeAccess) changeCount += beforeAccess.length;
  });
  
  // Fix specific patterns
  // Fix getStatusColor/getPriorityColor etc function calls
  content = content.replace(/getPriorityColor\(([\w.]+)\.(priorita|priority)\)/g, 'getPriorityColor($1.priority)');
  content = content.replace(/filters\.(priorita|priority)/g, 'filters.priority');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath} - ${changeCount} replacements`);
    return changeCount;
  }
  
  return 0;
}

// Find all TypeScript and TSX files
const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  absolute: true,
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
});

console.log(`Found ${files.length} TypeScript files to check...`);

let totalChanges = 0;
files.forEach(file => {
  totalChanges += fixFile(file);
});

console.log(`\n✅ Total replacements: ${totalChanges}`);
console.log('🎉 Done! All Italian field names have been replaced with English.');