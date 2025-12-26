// src/lib/calculator.ts

export interface ClusterInputs {
  // SOURCE
  sourceHosts: number;
  sourceSockets: number;        
  sourceCoresPerSocket: number; 
  sourceRam: number;            
  sourceUsableStorage: number;  
  
  // NEW: Growth & Services
  growthFactor: number;         // % (0-50)
  storageEfficiency: boolean;   // True = 1.5:1 ratio
  includeMigrationServices: boolean; // True = Add Prof Services Cost

  // TARGET
  targetCpuType: "intel" | "amd";
  targetCoresPerSocket: number; 
  targetRam: number;            
  targetRawStorage: number;     
  
  // POLICIES
  applyModernization: boolean;  
  applyCvmOverhead: boolean;    
  redundancyLevel: "none" | "n+1" | "n+2"; 
  targetLicense: "starter" | "pro" | "ultimate";
  showFinancials: boolean;
}

export interface SizingResults {
  // SOURCE TOTALS
  sourceTotalCores: number;
  sourceTotalRam: number;
  sourceTotalStorage: number;

  // TARGET TOTALS
  nodesRequired: number;
  targetTotalCores: number;
  targetTotalRam: number;
  targetTotalStorage: number; 
  
  // METRICS
  consolidationRatio: string;
  limitingFactor: string;
  efficiencyFactor: number;
  
  // LICENSING & FINANCIALS
  vmwareEdition: string;
  nutanixEdition: string;
  financials: {
    vmwareCost: number;       
    nutanixLicenseCost: number; 
    nutanixHardwareCost: number;
    migrationServicesCost: number; // NEW
    totalNutanixTco: number;
    savings: number;
    savingsPct: number;
  };
}

const CVM_RAM_GB = 32;
const CVM_CPU_CORES = 4;

// PRICING
const PRICE_VMWARE_VVF = 450; 
const PRICE_VMWARE_VCF = 950;
const PRICE_NUTANIX_START = 280; 
const PRICE_NUTANIX_PRO = 500;   
const PRICE_NUTANIX_ULT = 850;   
const MIGRATION_RATE_PER_VM = 150; // Est Service Cost
const EST_VMS_PER_HOST = 15;       // Assumption for Service Calc

const HW_BASE_CHASSIS = 6000;    
const HW_COST_PER_GB_RAM = 8;    
const HW_COST_PER_TB_NVME = 150; 
const HW_COST_PER_CORE = 75;     

export function calculateSizing(inputs: ClusterInputs): SizingResults {
  // 1. SOURCE TOTALS
  const sourceTotalCores = inputs.sourceHosts * inputs.sourceSockets * inputs.sourceCoresPerSocket;
  const sourceTotalRam = inputs.sourceHosts * inputs.sourceRam; 
  const sourceTotalStorage = inputs.sourceUsableStorage; 

  // 2. APPLY GROWTH & EFFICIENCY FACTORS
  const growthMultiplier = 1 + (inputs.growthFactor / 100);
  
  // Demand with Growth
  const demandCores = (sourceTotalCores * growthMultiplier);
  const demandRam = (sourceTotalRam * growthMultiplier);
  
  // Storage: Apply Growth, then Divide by Efficiency (if enabled)
  const efficiencyRatio = inputs.storageEfficiency ? 1.5 : 1.0;
  const demandStorage = (sourceTotalStorage * growthMultiplier) / efficiencyRatio;

  // 3. SIZING MATH
  let cpuEfficiency = 1.0;
  if (inputs.applyModernization) {
    cpuEfficiency = inputs.targetCpuType === "amd" ? 1.4 : 1.25; 
  }
  
  const effectiveCpuDemand = demandCores / cpuEfficiency;
  
  const cvmRam = inputs.applyCvmOverhead ? CVM_RAM_GB : 0;
  const cvmCores = inputs.applyCvmOverhead ? CVM_CPU_CORES : 0;
  
  const nodeEffectiveRam = inputs.targetRam - cvmRam;
  const nodeEffectiveCores = (inputs.targetCoresPerSocket * 2) - cvmCores; 
  
  const USABLE_FACTOR = 0.55; 
  const nodeEffectiveStorage = inputs.targetRawStorage * USABLE_FACTOR;

  const nodesForCpu = Math.ceil(effectiveCpuDemand / nodeEffectiveCores);
  const nodesForRam = Math.ceil(demandRam / nodeEffectiveRam);
  const nodesForStorage = Math.ceil(demandStorage / nodeEffectiveStorage);

  let rawNodes = Math.max(nodesForCpu, nodesForRam, nodesForStorage, 3);

  let finalNodes = rawNodes;
  if (inputs.redundancyLevel === "n+1") finalNodes += 1;
  if (inputs.redundancyLevel === "n+2") finalNodes += 2;

  // 4. TARGET TOTALS
  const targetTotalCores = finalNodes * (inputs.targetCoresPerSocket * 2);
  const targetTotalRam = finalNodes * inputs.targetRam;
  const targetTotalStorage = finalNodes * nodeEffectiveStorage; // This is physical capacity

  // 5. FINANCIAL MODELING
  
  // A. VMware Renewal (Based on CURRENT cores, growth usually triggers true-up later)
  const vmwareBillableCores = inputs.sourceHosts * inputs.sourceSockets * Math.max(inputs.sourceCoresPerSocket, 16);
  const vmwareRate = inputs.targetLicense === "ultimate" ? PRICE_VMWARE_VCF : PRICE_VMWARE_VVF;
  const vmwareTotal = vmwareBillableCores * vmwareRate;

  // B. Nutanix Software
  let nutanixRate = PRICE_NUTANIX_PRO;
  if (inputs.targetLicense === "starter") nutanixRate = PRICE_NUTANIX_START;
  if (inputs.targetLicense === "ultimate") nutanixRate = PRICE_NUTANIX_ULT;
  const nutanixLicenseTotal = targetTotalCores * nutanixRate;

  // C. Nutanix Hardware
  const costPerNode = 
    HW_BASE_CHASSIS + 
    (inputs.targetRam * HW_COST_PER_GB_RAM) + 
    (inputs.targetRawStorage * HW_COST_PER_TB_NVME) + 
    ((inputs.targetCoresPerSocket * 2) * HW_COST_PER_CORE);
  const nutanixHardwareTotal = finalNodes * costPerNode;

  // D. Migration Services (NEW)
  const estimatedVMs = inputs.sourceHosts * EST_VMS_PER_HOST;
  const migrationCost = inputs.includeMigrationServices ? (estimatedVMs * MIGRATION_RATE_PER_VM) : 0;

  // E. Total TCO
  const totalNutanixTco = nutanixLicenseTotal + nutanixHardwareTotal + migrationCost;
  const savings = vmwareTotal - totalNutanixTco;

  // 6. LABELS
  let vmwareMap = "VVF (Standard)";
  if (inputs.targetLicense === "pro") vmwareMap = "VVF + vSAN (Advanced)";
  if (inputs.targetLicense === "ultimate") vmwareMap = "VCF (Enterprise)";

  return {
    sourceTotalCores,
    sourceTotalRam,
    sourceTotalStorage,
    nodesRequired: finalNodes,
    targetTotalCores,
    targetTotalRam,
    targetTotalStorage,
    consolidationRatio: (inputs.sourceHosts / finalNodes).toFixed(1) + " : 1",
    limitingFactor: nodesForCpu >= nodesForRam && nodesForCpu >= nodesForStorage ? "CPU" : nodesForRam >= nodesForStorage ? "RAM" : "Storage",
    efficiencyFactor: cpuEfficiency,
    vmwareEdition: vmwareMap,
    nutanixEdition: inputs.targetLicense === "starter" ? "NCI Starter" : inputs.targetLicense === "pro" ? "NCI Pro" : "NCI Ultimate",
    
    financials: {
      vmwareCost: vmwareTotal,
      nutanixLicenseCost: nutanixLicenseTotal,
      nutanixHardwareCost: nutanixHardwareTotal,
      migrationServicesCost: migrationCost,
      totalNutanixTco: totalNutanixTco,
      savings: savings,
      savingsPct: Math.round((savings / vmwareTotal) * 100)
    }
  };
}