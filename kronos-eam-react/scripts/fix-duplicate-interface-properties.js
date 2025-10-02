#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the fixes for duplicate interface properties
const fixes = [
  // Fix duplicate name properties in EnhancedTaskEditor.tsx
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /interface EnhancedTask \{[\s\S]*?\}/,
    fix: (match) => {
      // Remove the duplicate name property (line 13)
      return match.replace(/(\s+name\?: string;\n)(\s+name\?: string;\n)/, '$1');
    }
  },
  
  // Fix duplicate name properties in WorkflowDiagram.tsx
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /interface WorkflowTask \{[\s\S]*?\}/,
    fix: (match) => {
      // Remove the duplicate name property with comment
      return match.replace(/(\s+name\?: string;\n)(\s+name\?: string; \/\/ Italian field name\n)/, '$1');
    }
  },
  
  // Fix duplicate title and description in AlertItem (dashboard.service.ts)
  {
    file: 'src/services/api/dashboard.service.ts',
    pattern: /export interface AlertItem \{[\s\S]*?\}/,
    fix: (match) => {
      // Remove duplicate title and description (non-optional versions are the correct ones)
      return match
        .replace(/(\s+title: string;\n)(\s+title\?: string; \/\/ English alias\n)/, '$1')
        .replace(/(\s+description: string;\n)(\s+description\?: string; \/\/ English alias\n)/, '$1');
    }
  },
  
  // Fix references to taskForm.name || taskForm.name in EnhancedTaskEditor
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /if \(taskForm\.name \|\| taskForm\.name \|\| taskForm\.title\)/,
    fix: () => 'if (taskForm.name || taskForm.title)'
  },
  
  // Fix type vs tipo duplicates
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /tipo_pratica\?: string;\n\s+type_pratica\?: string;/,
    fix: () => 'practice_type?: string;'
  },
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /tipo_pratica\?: string; \/\/ Alternate Italian field\n\s+type_pratica\?: string;/,
    fix: () => 'practice_type?: string;'
  },
  
  // Fix durata_giorni to duration_days
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /durata_giorni\?: number;/g,
    fix: () => 'duration_days?: number;'
  },
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /durata_giorni\?: number;/g,
    fix: () => 'duration_days?: number;'
  },
  
  // Fix ente_responsabile to responsible_entity
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /ente_responsabile\?: string;/g,  
    fix: () => 'responsible_entity?: string;'
  },
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /ente_responsabile\?: string;/g,
    fix: () => 'responsible_entity?: string;'
  },
  
  // Fix documenti_richiesti to required_documents
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /documenti_richiesti\?: string\[\];/g,
    fix: () => 'required_documents?: string[];'
  },
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /documenti_richiesti\?: string\[\];/g,
    fix: () => 'required_documents?: string[];'
  },
  
  // Fix condizioni to conditions
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /condizioni\?: any;/g,
    fix: () => 'conditions?: any;'
  },
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /condizioni\?: any;/g,
    fix: () => 'conditions?: any;'
  },
  
  // Fix ordine to order in WorkflowStage
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /ordine: number;/g,
    fix: () => 'order: number;'
  },
  
  // Fix usage of durata_giorni in code
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /durata_giorni: taskForm\.duration_days \|\| 7/,
    fix: () => 'duration_days: taskForm.duration_days || 7'
  },
  
  // Fix Italian entities in array
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /const entities = \['DSO', 'Terna', 'GSE', 'Dogane', 'Comune', 'Regione', 'Soprintendenza'\];/,
    fix: () => "const entities = ['DSO', 'Terna', 'GSE', 'Customs', 'Municipality', 'Region', 'Superintendency'];"
  },
  
  // Fix Italian priorities
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /const priorities = \['Alta', 'Media', 'Bassa'\];/,
    fix: () => "const priorities = ['High', 'Medium', 'Low'];"
  },
  
  // Fix Italian submission methods
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /const submissionMethods = \['Portale Online', 'PEC', 'System-to-System', 'EDI', 'Portale o PEC'\];/,
    fix: () => "const submissionMethods = ['Online Portal', 'PEC', 'System-to-System', 'EDI', 'Portal or PEC'];"
  },
  
  // Fix default priority Media to Medium
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /priority: taskForm\.priority \|\| 'Media'/,
    fix: () => "priority: taskForm.priority || 'Medium'"
  },
  
  // Fix Italian entity references in getEntityColor
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /case 'Dogane':/g,
    fix: () => "case 'Customs':"
  },
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /case 'Comune':/g,
    fix: () => "case 'Municipality':"
  },
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /case 'Soprintendenza':/g,
    fix: () => "case 'Superintendency':"
  },
  
  // Fix Italian entity references in getEntityIcon
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /case 'Dogane': return FileText;/,
    fix: () => "case 'Customs': return FileText;"
  },
  
  // Fix Italian priorities in getPriorityColor
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /case 'Alta': return 'text-red-600 dark:text-red-400';/,
    fix: () => "case 'High': return 'text-red-600 dark:text-red-400';"
  },
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /case 'Media': return 'text-yellow-600 dark:text-yellow-400';/,
    fix: () => "case 'Medium': return 'text-yellow-600 dark:text-yellow-400';"
  },
  {
    file: 'src/components/workflows/WorkflowDiagram.tsx',
    pattern: /case 'Bassa': return 'text-green-600 dark:text-green-400';/,
    fix: () => "case 'Low': return 'text-green-600 dark:text-green-400';"
  },
  
  // Fix Italian confirmation message
  {
    file: 'src/components/workflows/EnhancedTaskEditor.tsx',
    pattern: /window\.confirm\('Sei sicuro di voler eliminare questa attività\?'\)/,
    fix: () => "window.confirm('Are you sure you want to delete this task?')"
  },
  
  // Fix letto to read in AlertItem interface
  {
    file: 'src/services/api/dashboard.service.ts',
    pattern: /letto: boolean;/g,
    fix: () => 'read: boolean;'
  },
  {
    file: 'src/services/api/dashboard.service.ts',
    pattern: /read\?: boolean; \/\/ English alias/g,
    fix: () => ''
  },
  
  // Fix azioni to actions in AlertItem
  {
    file: 'src/services/api/dashboard.service.ts',
    pattern: /azioni\?: Array<\{/g,
    fix: () => 'actions?: Array<{'
  },
  {
    file: 'src/services/api/dashboard.service.ts',
    pattern: /actions\?: Array<\{ \/\/ English alias/g,
    fix: () => ''
  }
];

let totalFixes = 0;

// Process each fix
fixes.forEach((fix) => {
  const filePath = path.join(process.cwd(), fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  if (typeof fix.fix === 'function') {
    // Complex replacement using function
    if (fix.pattern instanceof RegExp && fix.pattern.global) {
      content = content.replace(fix.pattern, fix.fix());
    } else {
      const matches = content.match(fix.pattern);
      if (matches) {
        const replacement = fix.fix(matches[0]);
        content = content.replace(fix.pattern, replacement);
      }
    }
  } else {
    // Simple string replacement
    content = content.replace(fix.pattern, fix.fix);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${fix.file} - ${fix.pattern.toString().substring(0, 50)}...`);
    totalFixes++;
  }
});

console.log(`\n✨ Phase 2 complete! Applied ${totalFixes} fixes for duplicate interface properties.`);