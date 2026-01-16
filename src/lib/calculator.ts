export interface ClusterInputs {
  sourceHosts: number;
  sourceSockets: number;
  sourceCoresPerSocket: number;
  
  consolidationRatio: number; 
  includeMigrationServices: boolean;
  showFinancials: boolean;
}

export interface SizingResults {
  // Inventory
  totalLegacyCores: number;
  
  // Strategy
  estimatedNodes: number;
  strategyLabel: string;
  
  // The "Scorecard"
  integrityScore: number;
  migrationComplexity: "Low" | "Medium" | "High";
  
  // Financials (Executive View)
  financials: {
    vmwareAnnual: number;
    vmware3Year: number;
    
    // Investment
    nutanixInvestment: number; // HW + SW + Services
    
    // The "Win"
    netSavings: number;
    savingsRange: { min: number; max: number };
    
    // Urgency Metrics
    paybackPeriodMonths: number;
    costOfInactionMonthly: number;
  };
}

export function calculateSizing(inputs: ClusterInputs): SizingResults {
  // 1. INVENTORY
  const totalLegacyCores = inputs.sourceHosts * inputs.sourceSockets * inputs.sourceCoresPerSocket;

  // 2. STRATEGY & TARGET
  const rawNodes = inputs.sourceHosts / inputs.consolidationRatio;
  const estimatedNodes = Math.ceil(rawNodes);

  let strategyLabel = "Lift & Shift";
  if (inputs.consolidationRatio >= 1.2) strategyLabel = "Modernize";
  if (inputs.consolidationRatio >= 1.5) strategyLabel = "Optimize";
  if (inputs.consolidationRatio >= 1.9) strategyLabel = "Transform";

  // 3. COMPLEXITY & INTEGRITY SCORING (Rack2Cloud logic)
  // Complexity based on scale
  let migrationComplexity: "Low" | "Medium" | "High" = "Low";
  if (inputs.sourceHosts > 12) migrationComplexity = "Medium";
  if (inputs.sourceHosts > 30) migrationComplexity = "High";

  // Integrity Score: Starts at 50 (Baseline). 
  // +20 for moving off Broadcom. 
  // +Points for Consolidation (Optimization).
  const integrityScore = Math.min(98, Math.round(50 + 20 + (inputs.consolidationRatio * 15)));

  // 4. FINANCIAL ESTIMATION
  const VMWARE_RATE_PER_CORE = 350; 
  const NUTANIX_HW_NODE_COST = 35000;
  
  // SW Cost logic (Gen5 density assumption)
  const estimatedNewCoresPerNode = inputs.sourceCoresPerSocket * 1.5; 
  const totalNewCores = estimatedNodes * (inputs.sourceSockets * estimatedNewCoresPerNode);
  const NUTANIX_SW_RATE_PER_CORE = 180;
  const MIGRATION_RATE_PER_NODE = 3000;

  // Costs
  const vmwareAnnual = totalLegacyCores * VMWARE_RATE_PER_CORE;
  const vmware3Year = vmwareAnnual * 3;

  const nutanixHw = estimatedNodes * NUTANIX_HW_NODE_COST;
  const nutanixSw3Year = (totalNewCores * NUTANIX_SW_RATE_PER_CORE) * 3;
  const migrationCost = inputs.includeMigrationServices ? (estimatedNodes * MIGRATION_RATE_PER_NODE) : 0;

  const nutanixInvestment = nutanixHw + nutanixSw3Year + migrationCost;

  // Savings
  const netSavings = vmware3Year - nutanixInvestment;
  
  // Confidence Range (+/- 15% variance on HW/SW discounts)
  const savingsRange = {
    min: Math.round(netSavings * 0.85),
    max: Math.round(netSavings * 1.15)
  };

  // Urgency Metrics
  const costOfInactionMonthly = Math.round(netSavings / 36);
  
  // Payback Period: (Investment / Annual Savings) * 12
  const annualSavings = netSavings / 3;
  let paybackPeriodMonths = 0;
  if (annualSavings > 0) {
    paybackPeriodMonths = Math.round((nutanixInvestment / annualSavings) * 12);
  }

  return {
    totalLegacyCores,
    estimatedNodes,
    strategyLabel,
    integrityScore,
    migrationComplexity,
    financials: {
      vmwareAnnual,
      vmware3Year,
      nutanixInvestment,
      netSavings,
      savingsRange,
      paybackPeriodMonths,
      costOfInactionMonthly
    }
  };
}