// lib/calculator.ts

export interface EnvironmentProfile {
  // Layer 1: Footprint
  hosts: number;
  socketsPerHost: number;
  coresPerSocket: number;
  vmCount: number;
  storageTb: number;
  growthRatePct: number; // e.g., 10 for 10% annual growth
  contractHorizonMonths: number; // Time until renewal event
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
  // 1. Core Metrics
  totalLicensedCores: number;
  consolidationRatio: number;
  
  // 2. The Scorecard
  renewalExposureScore: number;
  renewalExposureBand: "Low" | "Moderate" | "High" | "Critical";
  
  migrationComplexityScore: number;
  migrationComplexityBand: "Low" | "Moderate" | "High" | "Very High";
  
  // 3. Scenario Analysis
  scenarios: Scenario[];
  
  // 4. Strategic Output
  recommendedPath: string;
  frameworkSignals: FrameworkSignal[];
}
