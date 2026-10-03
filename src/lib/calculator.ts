// lib/calculator.ts

// ==========================================
// 1. INTERFACES (State & Output Mapping)
// ==========================================

export interface EnvironmentProfile {
  // Layer 1: Footprint
  hosts: number;
  socketsPerHost: number;
  coresPerSocket: number;
  vmCount: number;
  storageTb: number;
  growthRatePct: number; 
  contractHorizonMonths: number; 
  bundle: "vvf" | "vcf";

  // Layer 2: Complexity Features
  hasVsan: boolean;
  hasNsx: boolean;
  hasSrm: boolean;
  hasHorizon: boolean;
  hasK8s: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  year1Cost: number;
  year3Cost: number;
  capexRequirement: number;
  migrationEffortMonths: number;
}

export interface FrameworkSignal {
  id: string;
  title: string;
  severity: "Info" | "Warning" | "Critical";
  driver: string;
  explanation: string;
}

export interface ModernizationResults {
  totalLicensedCores: number;
  consolidationRatio: number;
  
  renewalExposureScore: number;
  renewalExposureBand: "Low" | "Moderate" | "High" | "Critical";
  
  migrationComplexityScore: number;
  migrationComplexityBand: "Low" | "Moderate" | "High" | "Very High";
  
  scenarios: Scenario[];
  recommendedPath: string;
  frameworkSignals: FrameworkSignal[];
}

// ==========================================
// 2. HELPER: COMPLEXITY ENGINE
// ==========================================

function calculateComplexity(inputs: EnvironmentProfile): { score: number, band: "Low" | "Moderate" | "High" | "Very High" } {
  let score = 0;
  
  if (inputs.hasNsx) score += 25;
  if (inputs.hasVsan) score += 15;
  if (inputs.hasHorizon) score += 15;
  if (inputs.hasSrm) score += 15;
  if (inputs.hasK8s) score += 10;
  
  if (inputs.vmCount > 500) score += 15;
  if (inputs.hosts > 16) score += 10; 

  let band: "Low" | "Moderate" | "High" | "Very High" = "Low";
  if (score >= 20) band = "Moderate";
  if (score >= 40) band = "High";
  if (score >= 60) band = "Very High";

  return { score, band };
}

// ==========================================
// 3. HELPER: EXPOSURE ENGINE
// ==========================================

function calculateExposure(inputs: EnvironmentProfile, totalCores: number, consolidationRatio: number): { score: number, band: "Low" | "Moderate" | "High" | "Critical" } {
  let score = 0; 

  const coreScore = Math.min(totalCores / 1000, 1) * 30; 
  score += coreScore;

  if (inputs.bundle === "vcf") score += 20;
  else if (inputs.bundle === "vvf") score += 10;

  const growthScore = Math.min(inputs.growthRatePct / 20, 1) * 15;
  score += growthScore;

  const horizonScore = Math.max(0, (36 - inputs.contractHorizonMonths) / 36) * 15;
  score += horizonScore;

  const consolidationScore = Math.max(0, (3 - consolidationRatio) / 2) * 20;
  score += consolidationScore;

  let band: "Low" | "Moderate" | "High" | "Critical" = "Low";
  if (score >= 40) band = "Moderate";
  if (score >= 65) band = "High";
  if (score >= 80) band = "Critical";

  return { score: Math.round(score), band };
}

// ==========================================
// 4. HELPER: SCENARIO GENERATOR
// ==========================================

function generateScenarios(inputs: EnvironmentProfile, totalCores: number, consolidationRatio: number): Scenario[] {
  const RATE_PER_CORE = inputs.bundle === "vcf" ? 260 : 120; 
  const TARGET_HW_NODE_COST = 35000;
  const TARGET_SW_RATE = 180;
  
  const optimizedCores = Math.ceil(totalCores / consolidationRatio);
  const targetNodes = Math.ceil(inputs.hosts / consolidationRatio);

  return [
    {
      id: "scenario-a",
      name: "Scenario A: Renew As-Is",
      description: "Renew the existing footprint without architectural changes.",
      year1Cost: totalCores * RATE_PER_CORE,
      year3Cost: (totalCores * RATE_PER_CORE) * 3,
      capexRequirement: 0,
      migrationEffortMonths: 0
    },
    {
      id: "scenario-b",
      name: "Scenario B: Reduce & Renew",
      description: "Consolidate hardware to reduce licensed footprint prior to renewal.",
      year1Cost: optimizedCores * RATE_PER_CORE,
      year3Cost: (optimizedCores * RATE_PER_CORE) * 3,
      capexRequirement: 0,
      migrationEffortMonths: 1
    },
    {
      id: "scenario-c",
      name: "Scenario C: Full Migration",
      description: "Exit VMware entirely for an alternative HCI platform.",
      year1Cost: (targetNodes * TARGET_SW_RATE * 16), 
      year3Cost: (targetNodes * TARGET_SW_RATE * 16) * 3,
      capexRequirement: targetNodes * TARGET_HW_NODE_COST,
      migrationEffortMonths: inputs.hosts > 16 ? 9 : 4
    },
    {
      id: "scenario-d",
      name: "Scenario D: Hybrid Transition",
      description: "Renew 20% for mission-critical; migrate 80% to alternative.",
      year1Cost: ((totalCores * 0.2) * RATE_PER_CORE) + ((targetNodes * 0.8) * TARGET_SW_RATE * 16),
      year3Cost: (((totalCores * 0.2) * RATE_PER_CORE) + ((targetNodes * 0.8) * TARGET_SW_RATE * 16)) * 3,
      capexRequirement: (targetNodes * 0.8) * TARGET_HW_NODE_COST,
      migrationEffortMonths: inputs.hosts > 16 ? 12 : 6
    }
  ];
}

// ==========================================
// 5. HELPER: FRAMEWORK SIGNALS
// ==========================================

function evaluateFrameworks(inputs: EnvironmentProfile, exposure: number, consolidationRatio: number): FrameworkSignal[] {
  const signals: FrameworkSignal[] = [];

  if (inputs.contractHorizonMonths <= 9 && inputs.growthRatePct > 15) {
    signals.push({
      id: "173",
      title: "Lifecycle Convergence",
      severity: "Critical",
      driver: "Rapid growth colliding with an imminent renewal.",
      explanation: "Licensing renewal and capacity expansion are occurring within the same immediate budget cycle, multiplying the cost impact."
    });
  }

  if (consolidationRatio < 1.2 && inputs.vmCount > 0) {
    const coresPerVm = (inputs.hosts * inputs.socketsPerHost * inputs.coresPerSocket) / inputs.vmCount;
    if (coresPerVm > 4) {
      signals.push({
        id: "171",
        title: "Phantom Capacity",
        severity: "Warning",
        driver: "Low consolidation potential driven by poor workload density.",
        explanation: `Averaging ${coresPerVm.toFixed(1)} cores per VM. You are paying enterprise per-core licensing premiums for unused compute headroom.`
      });
    }
  }

  return signals;
}

// ==========================================
// 6. MASTER EXPORT FUNCTION
// ==========================================
// This is the function page.tsx will actually call whenever an input changes.

export function calculateModernization(inputs: EnvironmentProfile): ModernizationResults {
  // 1. Calculate Base Metrics
  const totalLicensedCores = inputs.hosts * inputs.socketsPerHost * inputs.coresPerSocket;
  
  // Baseline consolidation assumption (can be dynamic later based on VM density)
  const consolidationRatio = inputs.vmCount > 0 && (inputs.vmCount / inputs.hosts) < 15 ? 1.1 : 1.4;

  // 2. Run the Engines
  const complexity = calculateComplexity(inputs);
  const exposure = calculateExposure(inputs, totalLicensedCores, consolidationRatio);
  const scenarios = generateScenarios(inputs, totalLicensedCores, consolidationRatio);
  const frameworkSignals = evaluateFrameworks(inputs, exposure.score, consolidationRatio);

  // 3. Determine Recommended Path
  let recommendedPath = "Consolidate and renew existing footprint.";
  if (exposure.band === "Critical" && complexity.band !== "Very High") {
    recommendedPath = `Target Scenario C: Full Migration. Expected window: ${scenarios[2].migrationEffortMonths} months.`;
  } else if (exposure.band === "High" && complexity.band === "Very High") {
    recommendedPath = `Target Scenario D: Hybrid Transition. Isolate complex workloads and migrate standard VMs over ${scenarios[3].migrationEffortMonths} months.`;
  }

  // 4. Return Final Payload to UI
  return {
    totalLicensedCores,
    consolidationRatio,
    renewalExposureScore: exposure.score,
    renewalExposureBand: exposure.band,
    migrationComplexityScore: complexity.score,
    migrationComplexityBand: complexity.band,
    scenarios,
    recommendedPath,
    frameworkSignals
  };
}
