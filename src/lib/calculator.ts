// lib/calculator.ts

// ==========================================
// 1. INTERFACES (State & Output Mapping)
// ==========================================

export interface EnvironmentProfile {
  hosts: number;
  socketsPerHost: number;
  coresPerSocket: number;
  vmCount: number;
  storageTb: number;
  growthRatePct: number; 
  contractHorizonMonths: number; 
  bundle: "vvf" | "vcf";
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
  year1RecurringCost: number;
  threeYearRecurringCost: number;
  hardwareCost: number;
  threeYearModeledCost: number;
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

function calculateComplexity(inputs: EnvironmentProfile): { score: number, band: "Low" | "Moderate" | "High" | "Very High" } {
  let score = 0;
  
  if (inputs.hasNsx) score += 25;
  if (inputs.hasVsan) score += 15;
  if (inputs.hasHorizon) score += 15;
  if (inputs.hasSrm) score += 15;
  if (inputs.hasK8s) score += 10;
  
  if (inputs.vmCount > 500) score += 15;
  if (inputs.hosts > 16) score += 10; 
  if (inputs.storageTb > 250) score += 10; // Storage scale factor

  let band: "Low" | "Moderate" | "High" | "Very High" = "Low";
  if (score >= 20) band = "Moderate";
  if (score >= 40) band = "High";
  if (score >= 60) band = "Very High";

  return { score, band };
}

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

function generateScenarios(inputs: EnvironmentProfile, totalCores: number, consolidationRatio: number): Scenario[] {
  const RATE_PER_CORE = inputs.bundle === "vcf" ? 260 : 120; 
  const TARGET_HW_NODE_COST = 35000;
  const TARGET_SW_RATE_PER_CORE = 150; 
  
  // Explicit Target Capacity Math
  const optimizedVMwareCores = Math.ceil(totalCores / consolidationRatio);
  
  const targetNodeCount = Math.ceil(inputs.hosts / consolidationRatio);
  const targetCoresPerNode = inputs.socketsPerHost * inputs.coresPerSocket; // Matching source density
  const targetTotalCores = targetNodeCount * targetCoresPerNode;

  return [
    {
      id: "scenario-a",
      name: "Scenario A: Renew As-Is",
      description: "Renew the existing footprint without architectural changes.",
      year1RecurringCost: totalCores * RATE_PER_CORE,
      threeYearRecurringCost: (totalCores * RATE_PER_CORE) * 3,
      hardwareCost: 0,
      threeYearModeledCost: (totalCores * RATE_PER_CORE) * 3,
      migrationEffortMonths: 0
    },
    {
      id: "scenario-b",
      name: "Scenario B: Reduce & Renew",
      description: "Consolidate hardware to reduce licensed footprint prior to renewal.",
      year1RecurringCost: optimizedVMwareCores * RATE_PER_CORE,
      threeYearRecurringCost: (optimizedVMwareCores * RATE_PER_CORE) * 3,
      hardwareCost: 0,
      threeYearModeledCost: (optimizedVMwareCores * RATE_PER_CORE) * 3,
      migrationEffortMonths: 1
    },
    {
      id: "scenario-c",
      name: "Scenario C: Full Migration",
      description: "Exit VMware entirely for an alternative HCI platform.",
      year1RecurringCost: targetTotalCores * TARGET_SW_RATE_PER_CORE,
      threeYearRecurringCost: (targetTotalCores * TARGET_SW_RATE_PER_CORE) * 3,
      hardwareCost: targetNodeCount * TARGET_HW_NODE_COST,
      threeYearModeledCost: ((targetTotalCores * TARGET_SW_RATE_PER_CORE) * 3) + (targetNodeCount * TARGET_HW_NODE_COST),
      migrationEffortMonths: inputs.hosts > 16 ? 9 : 4
    },
    {
      id: "scenario-d",
      name: "Scenario D: Hybrid Transition",
      description: "Renew 20% for mission-critical; migrate 80% to alternative.",
      year1RecurringCost: ((totalCores * 0.2) * RATE_PER_CORE) + ((targetTotalCores * 0.8) * TARGET_SW_RATE_PER_CORE),
      threeYearRecurringCost: (((totalCores * 0.2) * RATE_PER_CORE) + ((targetTotalCores * 0.8) * TARGET_SW_RATE_PER_CORE)) * 3,
      hardwareCost: Math.ceil(targetNodeCount * 0.8) * TARGET_HW_NODE_COST,
      threeYearModeledCost: ((((totalCores * 0.2) * RATE_PER_CORE) + ((targetTotalCores * 0.8) * TARGET_SW_RATE_PER_CORE)) * 3) + (Math.ceil(targetNodeCount * 0.8) * TARGET_HW_NODE_COST),
      migrationEffortMonths: inputs.hosts > 16 ? 12 : 6
    }
  ];
}

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

export function calculateModernization(inputs: EnvironmentProfile): ModernizationResults {
  const totalLicensedCores = inputs.hosts * inputs.socketsPerHost * inputs.coresPerSocket;
  const consolidationRatio = inputs.vmCount > 0 && (inputs.vmCount / inputs.hosts) < 15 ? 1.1 : 1.4;

  const complexity = calculateComplexity(inputs);
  const exposure = calculateExposure(inputs, totalLicensedCores, consolidationRatio);
  const scenarios = generateScenarios(inputs, totalLicensedCores, consolidationRatio);
  const frameworkSignals = evaluateFrameworks(inputs, exposure.score, consolidationRatio);

  let recommendedPath = "Consolidate and renew existing footprint.";
  if (exposure.band === "Critical" && complexity.band !== "Very High") {
    recommendedPath = `Target Scenario C: Full Migration. Modeled planning window: ${scenarios[2].migrationEffortMonths} months.`;
  } else if (exposure.band === "High" && complexity.band === "Very High") {
    recommendedPath = `Target Scenario D: Hybrid Transition. Isolate complex workloads and migrate standard VMs over a modeled ${scenarios[3].migrationEffortMonths}-month window.`;
  }

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
