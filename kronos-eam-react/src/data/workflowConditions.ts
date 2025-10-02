export interface WorkflowCondition {
  id: string;
  name: string;
  description: string;
  evaluator: (context: WorkflowContext) => boolean;
  requiredContextFields: string[];
}

export interface WorkflowContext {
  // Plant characteristics
  plantType?: 'residential' | 'commercial' | 'industrial' | 'utility';
  powerKw?: number;
  locationConstraints?: {
    isProtectedArea?: boolean;
    isHistoricCenter?: boolean;
    hasLandscapeConstraints?: boolean;
    isArchaeologicalArea?: boolean;
  };
  
  // Economic parameters
  totalIncentives?: number;
  isee?: number;
  familySize?: number;
  
  // Geographic parameters
  region?: string;
  province?: string;
  cityPopulation?: number;
  climateZone?: 'north' | 'center' | 'south';
  
  // Technical parameters
  roofType?: 'pitched' | 'flat' | 'ground';
  connectionType?: 'bt' | 'mt' | 'at';
  existingPod?: boolean;
  structuralCapacity?: number;
  
  // Administrative
  ownerType?: 'individual' | 'company' | 'publicEntity' | 'condominium';
  hasSpid?: boolean;
  hasCns?: boolean;
  hasPec?: boolean;
}

export const workflowConditions: WorkflowCondition[] = [
  // Authorization Conditions
  {
    id: 'requires-pas',
    name: 'Richiede PAS',
    description: 'Impianto richiede Procedura Abilitativa Semplificata',
    evaluator: (context) => {
      const power = context.powerKw || 0;
      const hasConstraints = context.locationConstraints?.isProtectedArea || 
                           context.locationConstraints?.hasLandscapeConstraints;
      return power < 200 && !hasConstraints;
    },
    requiredContextFields: ['powerKw', 'locationConstraints']
  },
  {
    id: 'requires-cila',
    name: 'Richiede CILA',
    description: 'Impianto residenziale può usare CILA semplificata',
    evaluator: (context) => {
      const power = context.powerKw || 0;
      const isResidential = context.plantType === 'residential';
      const isIntegrated = context.roofType === 'pitched' || context.roofType === 'flat';
      return isResidential && power < 50 && isIntegrated;
    },
    requiredContextFields: ['powerKw', 'plantType', 'roofType']
  },
  {
    id: 'requires-au',
    name: 'Richiede Autorizzazione Unica',
    description: 'Impianto richiede AU regionale',
    evaluator: (context) => {
      const power = context.powerKw || 0;
      const hasConstraints = context.locationConstraints?.isProtectedArea || 
                           context.locationConstraints?.hasLandscapeConstraints ||
                           context.locationConstraints?.isArchaeologicalArea;
      return power >= 200 || hasConstraints || false;
    },
    requiredContextFields: ['powerKw', 'locationConstraints']
  },
  {
    id: 'requires-landscape-authorization',
    name: 'Richiede Autorizzazione Paesaggistica',
    description: 'Impianto in area vincolata richiede autorizzazione paesaggistica',
    evaluator: (context) => {
      return context.locationConstraints?.isProtectedArea === true ||
             context.locationConstraints?.hasLandscapeConstraints === true ||
             context.locationConstraints?.isHistoricCenter === true;
    },
    requiredContextFields: ['locationConstraints']
  },
  
  // Technical Conditions
  {
    id: 'requires-structural-verification',
    name: 'Richiede Verifica Strutturale',
    description: 'Necessaria verifica portata minima 25 kg/m²',
    evaluator: (context) => {
      return (context.structuralCapacity || 0) < 25;
    },
    requiredContextFields: ['structuralCapacity']
  },
  {
    id: 'requires-mt-connection',
    name: 'Richiede Connessione MT',
    description: 'Potenza richiede connessione in Media Tensione',
    evaluator: (context) => {
      return (context.powerKw || 0) > 100;
    },
    requiredContextFields: ['powerKw']
  },
  
  // Fiscal Conditions
  {
    id: 'requires-customs-declaration',
    name: 'Richiede Denuncia Dogane',
    description: 'Impianti > 20kW devono registrare officina elettrica',
    evaluator: (context) => {
      return (context.powerKw || 0) > 20;
    },
    requiredContextFields: ['powerKw']
  },
  {
    id: 'requires-antimafia',
    name: 'Richiede Documentazione Antimafia',
    description: 'Incentivi > 150k€ richiedono documentazione antimafia',
    evaluator: (context) => {
      return (context.totalIncentives || 0) > 150000;
    },
    requiredContextFields: ['totalIncentives']
  },
  
  // Incentive Conditions
  {
    id: 'eligible-bonus-50',
    name: 'Ammissibile Bonus 50%',
    description: 'Può accedere al bonus ristrutturazioni 50%',
    evaluator: (context) => {
      return context.ownerType === 'individual' && 
             context.plantType === 'residential';
    },
    requiredContextFields: ['ownerType', 'plantType']
  },
  {
    id: 'eligible-reddito-energetico',
    name: 'Ammissibile Reddito Energetico',
    description: 'Può accedere al Reddito Energetico Nazionale',
    evaluator: (context) => {
      const iseeLimit = context.familySize && context.familySize >= 4 ? 30000 : 15000;
      const power = context.powerKw || 0;
      return (context.isee || 0) <= iseeLimit && 
             power >= 2 && power <= 6 &&
             context.plantType === 'residential';
    },
    requiredContextFields: ['isee', 'familySize', 'powerKw', 'plantType']
  },
  {
    id: 'eligible-cer-pnrr',
    name: 'Ammissibile CER PNRR',
    description: 'Può accedere a contributo PNRR 40% per CER',
    evaluator: (context) => {
      return (context.cityPopulation || 0) < 5000;
    },
    requiredContextFields: ['cityPopulation']
  },
  
  // Safety Conditions
  {
    id: 'requires-psc',
    name: 'Richiede PSC',
    description: 'Cantiere > 200 uomini-giorno richiede PSC',
    evaluator: (context) => {
      const power = context.powerKw || 0;
      // Rough estimate: 1 kW = 0.5 man-days
      const estimatedManDays = power * 0.5;
      return estimatedManDays > 200;
    },
    requiredContextFields: ['powerKw']
  },
  {
    id: 'requires-cse',
    name: 'Richiede CSE',
    description: 'Cantiere con più imprese richiede coordinatore sicurezza',
    evaluator: (context) => {
      const power = context.powerKw || 0;
      // Large plants typically require multiple contractors
      return power > 50;
    },
    requiredContextFields: ['powerKw']
  }
];

// Helper functions
export const evaluateConditions = (
  context: WorkflowContext
): Record<string, boolean> => {
  const results: Record<string, boolean> = {};
  
  workflowConditions.forEach(condition => {
    // Check if all required fields are present
    const hasRequiredFields = condition.requiredContextFields.every(field => {
      const fieldPath = field.split('.');
      let value: any = context;
      for (const part of fieldPath) {
        value = value?.[part as keyof typeof value];
        if (value === undefined) return false;
      }
      return true;
    });
    
    if (hasRequiredFields) {
      results[condition.id] = condition.evaluator(context);
    } else {
      results[condition.id] = false;
    }
  });
  
  return results;
};

export const getApplicableWorkflowTasks = (
  allTasks: any[],
  context: WorkflowContext
): any[] => {
  const conditions = evaluateConditions(context);
  
  return allTasks.filter(task => {
    // If task has no condition, it's always applicable
    if (!task.condizioneApplicazione) return true;
    
    // Parse condition (e.g., "potenza > 20")
    const conditionStr = task.condizioneApplicazione;
    
    // Simple condition parser for common cases
    if (conditionStr.includes('potenza > 20')) {
      return (context.powerKw || 0) > 20;
    }
    if (conditionStr.includes('incentivi_totali > 150000')) {
      return (context.totalIncentives || 0) > 150000;
    }
    
    // Default to including the task if condition is not recognized
    return true;
  });
};

export const getRecommendedAuthorizationPath = (
  context: WorkflowContext
): 'PAS' | 'CILA' | 'AU' => {
  const conditions = evaluateConditions(context);
  
  if (conditions['requires-au']) {
    return 'AU';
  } else if (conditions['requires-cila']) {
    return 'CILA';
  } else {
    return 'PAS';
  }
};

export const calculateEstimatedIncentives = (
  context: WorkflowContext
): {
  bonusRistrutturazione?: number;
  redditoEnergetico?: number;
  contributoCER?: number;
  total: number;
} => {
  const power = context.powerKw || 0;
  const costPerKw = 1000; // Average cost €/kWp
  const totalCost = power * costPerKw;
  const incentives: ReturnType<typeof calculateEstimatedIncentives> = { total: 0 };
  
  const conditions = evaluateConditions(context);
  
  if (conditions['eligible-bonus-50']) {
    incentives.bonusRistrutturazione = Math.min(totalCost * 0.5, 96000);
    incentives.total += incentives.bonusRistrutturazione;
  }
  
  if (conditions['eligible-reddito-energetico']) {
    incentives.redditoEnergetico = totalCost; // 100% coverage
    incentives.total += incentives.redditoEnergetico;
  }
  
  if (conditions['eligible-cer-pnrr']) {
    incentives.contributoCER = totalCost * 0.4; // 40% PNRR
    incentives.total += incentives.contributoCER;
  }
  
  return incentives;
};

export const getProductionEstimate = (
  context: WorkflowContext
): number => {
  const power = context.powerKw || 0;
  
  // Production factors by climate zone (kWh/kWp/year)
  const productionFactors = {
    north: 1100,
    center: 1300,
    south: 1500
  };
  
  const factor = productionFactors[context.climateZone || 'center'];
  return power * factor;
};

// Validation functions
export const validateWorkflowContext = (
  context: Partial<WorkflowContext>
): {
  valid: boolean;
  missingFields: string[];
  warnings: string[];
} => {
  const missingFields: string[] = [];
  const warnings: string[] = [];
  
  // Required fields for basic workflow
  if (!context.powerKw) {
    missingFields.push('powerKw');
  }
  if (!context.plantType) {
    missingFields.push('plantType');
  }
  
  // Warnings for optimization
  if (!context.climateZone) {
    warnings.push('Zona climatica non specificata, usando valore medio per produzione');
  }
  if (!context.locationConstraints) {
    warnings.push('Vincoli territoriali non verificati, potrebbero essere necessarie autorizzazioni aggiuntive');
  }
  if (!context.structuralCapacity) {
    warnings.push('Capacità strutturale non verificata, richiesta verifica portata 25 kg/m²');
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields,
    warnings
  };
};