#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define all function parameter mismatches found
const functionFixes = [
  // File: src/components/integrations/CredentialManager.tsx
  {
    file: 'src/components/integrations/CredentialManager.tsx',
    fixes: [
      {
        pattern: /const getIntegrazioneColor = \(integration: string\) => {\s*switch \(integrazione\)/,
        replacement: 'const getIntegrazioneColor = (integration: string) => {\n    switch (integration)'
      }
    ]
  },
  
  // File: src/components/integrations/EDIGenerator.tsx
  {
    file: 'src/components/integrations/EDIGenerator.tsx',
    fixes: [
      {
        pattern: /const getEnteColor = \(entity: string\) => {\s*switch \(ente\)/,
        replacement: 'const getEnteColor = (entity: string) => {\n    switch (entity)'
      }
    ]
  },
  
  // File: src/components/integrations/PECManager.tsx
  {
    file: 'src/components/integrations/PECManager.tsx',
    fixes: [
      {
        pattern: /const getIntegrazioneColor = \(integration: string\) => {\s*switch \(integrazione\)/,
        replacement: 'const getIntegrazioneColor = (integration: string) => {\n    switch (integration)'
      }
    ]
  },
  
  // File: src/pages/Agenda.tsx
  {
    file: 'src/pages/Agenda.tsx',
    fixes: [
      {
        pattern: /const getEnteColor = \(entity: string\) => {\s*switch \(ente\)/,
        replacement: 'const getEnteColor = (entity: string) => {\n    switch (entity)'
      },
      {
        pattern: /const getPriorityColor = \(priority: string\) => {\s*switch \(priorita\)/,
        replacement: 'const getPriorityColor = (priority: string) => {\n    switch (priority)'
      }
    ]
  },
  
  // File: src/pages/AIAssistant.tsx
  {
    file: 'src/pages/AIAssistant.tsx',
    fixes: [
      {
        pattern: /const getCategoriaColor = \(category: string\) => {\s*switch \(categoria\)/,
        replacement: 'const getCategoriaColor = (category: string) => {\n    switch (category)'
      }
    ]
  },
  
  // File: src/pages/WorkflowTemplates.tsx
  {
    file: 'src/pages/WorkflowTemplates.tsx',
    fixes: [
      {
        pattern: /const getCategoryIcon = \(category: string\) => {\s*switch \(categoria\)/,
        replacement: 'const getCategoryIcon = (category: string) => {\n    switch (category)'
      },
      {
        pattern: /const getCategoryColor = \(category: string\) => {\s*switch \(categoria\)/,
        replacement: 'const getCategoryColor = (category: string) => {\n    switch (category)'
      }
    ]
  },
  
  // File: src/components/workflows/WorkflowTemplatePreview.tsx
  {
    file: 'src/components/workflows/WorkflowTemplatePreview.tsx',
    fixes: [
      {
        pattern: /const getCategoryIcon = \(category: string\) => {\s*switch \(categoria\)/,
        replacement: 'const getCategoryIcon = (category: string) => {\n    switch (category)'
      },
      {
        pattern: /const getCategoryColor = \(category: string\) => {\s*switch \(categoria\)/,
        replacement: 'const getCategoryColor = (category: string) => {\n    switch (category)'
      }
    ]
  },
  
  // File: src/components/workflows/WorkflowTemplateGallery.tsx
  {
    file: 'src/components/workflows/WorkflowTemplateGallery.tsx',
    fixes: [
      {
        pattern: /const getCategoryIcon = \(category: string\) => {\s*switch \(categoria\)/,
        replacement: 'const getCategoryIcon = (category: string) => {\n    switch (category)'
      },
      {
        pattern: /const getCategoryColor = \(category: string\) => {\s*switch \(categoria\)/,
        replacement: 'const getCategoryColor = (category: string) => {\n    switch (category)'
      }
    ]
  },
  
  // File: src/components/plants/AddPlantModalV2.tsx
  {
    file: 'src/components/plants/AddPlantModalV2.tsx',
    fixes: [
      {
        pattern: /const onSubmit = async \(date: PlantFormData\) => {\s*const submitData: PlantCreate = {\s*\.\.\.date,\s*power: `\${data\.power_kw} kW`/,
        replacement: 'const onSubmit = async (data: PlantFormData) => {\n    const submitData: PlantCreate = {\n      ...data,\n      power: `${data.power_kw} kW`'
      }
    ]
  },
  
  // File: src/data/workflowTemplates.ts  
  {
    file: 'src/data/workflowTemplates.ts',
    fixes: [
      {
        pattern: /export const getTemplatesByCategory = \(category: string\): WorkflowTemplate\[\] => {\s*return workflowTemplates\.filter\(template => template\.category === categoria\);/,
        replacement: 'export const getTemplatesByCategory = (category: string): WorkflowTemplate[] => {\n  return workflowTemplates.filter(template => template.category === category);'
      }
    ]
  },
  
  // File: src/services/api/dashboard.service.ts
  {
    file: 'src/services/api/dashboard.service.ts',
    fixes: [
      {
        pattern: /const getScadenzaColor = \(date: string\) => {\s*const days = Math\.floor\(\(new Date\(data\)\.getTime/,
        replacement: 'const getScadenzaColor = (date: string) => {\n    const days = Math.floor((new Date(date).getTime'
      }
    ]
  }
];

// Additional typo fixes for API responses
const apiResponseFixes = [
  {
    file: 'src/services/api/workflow.service.ts',
    fixes: [
      { pattern: /return response\.date;/g, replacement: 'return response.data;' }
    ]
  },
  {
    file: 'src/services/api/dashboard.service.ts',
    fixes: [
      { pattern: /return response\.date;/g, replacement: 'return response.data;' }
    ]
  },
  {
    file: 'src/utils/typeMappers.ts',
    fixes: [
      { pattern: /export function mapBackendToPlant\(date: any\)/g, replacement: 'export function mapBackendToPlant(data: any)' },
      { pattern: /export function mapPlantToBackend\(date: Partial<Plant>\)/g, replacement: 'export function mapPlantToBackend(data: Partial<Plant>)' },
      { pattern: /function mapBackendRegistry\(date: any\)/g, replacement: 'function mapBackendRegistry(data: any)' },
      { pattern: /function mapBackendChecklist\(date: any\)/g, replacement: 'function mapBackendChecklist(data: any)' }
    ]
  },
  {
    file: 'src/types/index.ts',
    fixes: [
      { pattern: /export interface ApiResponse<T> {\s*date: T;/g, replacement: 'export interface ApiResponse<T> {\n  data: T;' }
    ]
  }
];

// Apply fixes to a file
function fixFile(filePath, fixes) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return 0;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changeCount = 0;
  const originalContent = content;
  
  fixes.forEach(fix => {
    const before = content;
    content = content.replace(fix.pattern, fix.replacement);
    if (before !== content) {
      changeCount++;
    }
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${filePath} - ${changeCount} replacements`);
  }
  
  return changeCount;
}

console.log('🔧 Phase 1: Fixing function parameter mismatches...\n');

let totalChanges = 0;

// Apply function parameter fixes
functionFixes.forEach(({file, fixes}) => {
  totalChanges += fixFile(file, fixes);
});

console.log('\n🔧 Fixing API response typos (.date → .data)...\n');

// Apply API response fixes
apiResponseFixes.forEach(({file, fixes}) => {
  totalChanges += fixFile(file, fixes);
});

console.log(`\n✅ Phase 1 complete! Total fixes applied: ${totalChanges}`);