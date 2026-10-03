"use client";

import React, { useState, useEffect } from "react";
import { 
  calculateModernization, 
  EnvironmentProfile, 
  ModernizationResults 
} from "@/lib/calculator"; 

const getDefaultProfile = (): EnvironmentProfile => ({
  hosts: 6,
  socketsPerHost: 2,
  coresPerSocket: 48,
  vmCount: 300,
  storageTb: 100,
  growthRatePct: 10,
  contractHorizonMonths: 12,
  bundle: "vcf",
  hasVsan: true,
  hasNsx: true,
  hasSrm: true,
  hasHorizon: false,
  hasK8s: false,
});

export default function ModernizationPlanner() {
  const [profile, setProfile] = useState<EnvironmentProfile>(getDefaultProfile());
  const [results, setResults] = useState<ModernizationResults | null>(null);
  
  // Forces React to unmount and remount the inputs, guaranteeing a visual reset
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const updatedResults = calculateModernization(profile);
    setResults(updatedResults);
  }, [profile]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? 0 : Number(e.target.value);
    setProfile(prev => ({ ...prev, [e.target.name]: val }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value as "vcf" | "vvf" }));
  };

  const handleReset = () => {
    setProfile(getDefaultProfile());
    setResetKey(prev => prev + 1); // Triggers DOM refresh
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBandColor = (band: string) => {
    switch (band) {
      case "Critical":
      case "Very High": 
      case "Actively Migrate":
        return "text-rose-500 border-rose-500/30 bg-rose-500/10";
      case "High": 
      case "Plan Exit":
        return "text-orange-500 border-orange-500/30 bg-orange-500/10";
      case "Moderate": 
      case "Evaluate":
        return "text-amber-500 border-amber-500/30 bg-amber-500/10";
      case "Low": 
      case "Stay":
        return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
      default: return "text-slate-400 border-slate-700 bg-slate-800";
    }
  };

  if (!results) return <div className="min-h-screen bg-[#0f172a] text-slate-200 flex items-center justify-center font-mono">INITIALIZING ENGINE...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-300 font-sans p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* REBUILT HEADER BLOCK */}
        <header className="mb-12 pt-4">
          <div className="flex flex-wrap gap-3 mb-6 font-mono text-[10px] sm:text-xs tracking-widest uppercase">
            <span className="border border-sky-500 text-sky-400 px-3 py-1.5 rounded-sm">Virtualization Architecture: Tool</span>
            <span className="border border-slate-700 text-slate-400 px-3 py-1.5 rounded-sm hidden sm:inline-block">VMware Renewal Economics</span>
            <span className="border border-slate-700 text-slate-400 px-3 py-1.5 rounded-sm hidden md:inline-block">Frameworks #171, #173, #174</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none mb-6">
            VMWARE MODERNIZATION <span className="text-sky-500">PLANNER</span>
          </h1>
          
          <p className="font-mono text-slate-400 text-xs sm:text-sm uppercase tracking-widest max-w-4xl leading-relaxed mb-8">
            Model renewal exposure, migration complexity, licensing pressure, and modernization scenarios using deterministic infrastructure architecture assumptions.
          </p>
          
          <div className="flex flex-wrap gap-6 font-mono text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Input-Driven. No Telemetry Required.</span>
            <span className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Deterministic. Not AI-Generated.</span>
            <span className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Runs Entirely In Your Browser.</span>
          </div>
        </header>

        {/* ACTION BAR (MOVED FROM HEADER) */}
        <div className="flex justify-end gap-3 mb-4">
          <button type="button" onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied to clipboard!"); }} className="bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 px-5 py-2 rounded text-[10px] font-bold font-mono tracking-widest transition-colors uppercase">
            Share
          </button>
          <button type="button" onClick={() => window.print()} className="bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 px-5 py-2 rounded text-[10px] font-bold font-mono tracking-widest transition-colors uppercase">
            PDF
          </button>
        </div>

        {/* MAIN APP GRID (Keyed for strict resetting) */}
        <div key={resetKey} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                Environment Profile
              </h2>
              
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Total Hosts</label>
                    <input type="number" name="hosts" defaultValue={profile.hosts} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Sockets/Host</label>
                    <input type="number" name="socketsPerHost" defaultValue={profile.socketsPerHost} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Cores/Socket</label>
                    <input type="number" name="coresPerSocket" defaultValue={profile.coresPerSocket} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">VM Count</label>
                    <input type="number" name="vmCount" defaultValue={profile.vmCount} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-slate-400 mb-1">Storage (TB)</label>
                    <input type="number" name="storageTb" defaultValue={profile.storageTb} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-slate-400 mb-1">VMware Renewal Bundle</label>
                  <select name="bundle" defaultValue={profile.bundle} onChange={handleSelectChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono uppercase">
                    <option value="vvf">VMware vSphere Foundation (VVF)</option>
                    <option value="vcf">VMware Cloud Foundation (VCF)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Growth/Yr (%)</label>
                    <input type="number" name="growthRatePct" defaultValue={profile.growthRatePct} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Renewal (Mos)</label>
                    <input type="number" name="contractHorizonMonths" defaultValue={profile.contractHorizonMonths} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Complexity Matrix
              </h2>
              <div className="space-y-3 font-mono text-xs uppercase tracking-wide">
                {[
                  { name: "hasVsan", label: "vSAN Storage" },
                  { name: "hasNsx", label: "NSX Networking" },
                  { name: "hasSrm", label: "Site Recovery Manager" },
                  { name: "hasHorizon", label: "Horizon VDI" },
                  { name: "hasK8s", label: "Tanzu / K8s" }
                ].map((feature) => (
                  <label key={feature.name} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-800/50 rounded transition-colors border border-transparent hover:border-slate-700">
                    <input type="checkbox" name={feature.name} defaultChecked={profile[feature.name as keyof EnvironmentProfile] as boolean} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-sky-500 bg-[#0a0f1e] border-slate-700 rounded focus:ring-sky-500 focus:ring-offset-slate-900" />
                    <span className="text-slate-300">{feature.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={handleReset}
                  className="r2c-btn-full w-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-500/50 text-sky-400 py-2.5 rounded text-xs font-bold font-mono tracking-widest transition-colors uppercase"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 4-CARD METRIC BLOCK */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className={`col-span-2 md:col-span-2 p-6 rounded-lg border ${getBandColor(results.modernizationPressureBand)} flex flex-col justify-between`}>
                <div className="font-mono text-xs font-bold uppercase tracking-wider mb-4 opacity-80">
                  &gt;_ Modernization Pressure Index
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-6xl font-black">{results.modernizationPressureIndex}</span>
                  <span className="text-xl font-bold uppercase tracking-widest opacity-90">{results.modernizationPressureBand}</span>
                </div>
                <p className="mt-4 text-xs opacity-80 font-mono uppercase">Calculated Justification Output</p>
              </div>

              <div className={`col-span-2 md:col-span-2 p-6 rounded-lg border ${profile.contractHorizonMonths <= 6 ? 'border-rose-500/50 bg-rose-500/10 text-rose-400' : 'border-sky-500/30 bg-sky-500/10 text-sky-400'} flex flex-col justify-between`}>
                <div className="font-mono text-xs font-bold uppercase tracking-wider mb-4 opacity-80">
                  &gt;_ Renewal Horizon
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-black">{profile.contractHorizonMonths}</span>
                  <span className="text-lg font-bold uppercase tracking-widest opacity-90">Months</span>
                </div>
                <p className="mt-4 text-xs opacity-80 font-mono uppercase">
                  Decision Window: {profile.contractHorizonMonths <= 6 ? 'Immediate Action' : profile.contractHorizonMonths <= 12 ? 'Planning Phase' : 'Evaluating Options'}
                </p>
              </div>

              <div className={`col-span-1 md:col-span-2 p-4 rounded-lg border ${getBandColor(results.renewalExposureBand)} flex flex-col justify-between`}>
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">&gt;_ Renewal Exposure</div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black">{results.renewalExposureScore}</span>
                  <span className="text-sm font-bold uppercase tracking-widest opacity-90">{results.renewalExposureBand}</span>
                </div>
                <p className="mt-2 text-[10px] opacity-80 font-mono">Licensed Cores: {results.totalLicensedCores}</p>
              </div>

              <div className={`col-span-1 md:col-span-2 p-4 rounded-lg border ${getBandColor(results.migrationComplexityBand)} flex flex-col justify-between`}>
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">&gt;_ Migration Complexity</div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black">{results.migrationComplexityScore}</span>
                  <span className="text-sm font-bold uppercase tracking-widest opacity-90">{results.migrationComplexityBand}</span>
                </div>
                <p className="mt-2 text-[10px] opacity-80 font-mono">Consolidation: {results.consolidationRatio.toFixed(2)}x</p>
              </div>

            </div>

            {results.frameworkSignals.length > 0 && (
              <div className="space-y-4">
                {results.frameworkSignals.map((signal) => (
                  <div key={signal.id} className="bg-slate-900 border-l-4 border-rose-500 p-4 border border-slate-800 rounded-r-lg flex gap-4 items-start">
                    <div className="bg-rose-500/20 text-rose-400 font-mono text-xs font-bold px-2 py-1 rounded mt-1">
                      #{signal.id}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wide">{signal.title}</h4>
                      <p className="text-slate-400 text-sm mt-1">{signal.driver} {signal.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  Strategic Scenario Analysis
                </h2>
                <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-3 py-1 text-xs font-mono font-bold rounded">
                  ESTIMATED MODEL
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.scenarios.map((scenario) => (
                  <div key={scenario.id} className="p-4 bg-[#0a0f1e] border border-slate-800 rounded hover:border-slate-600 transition-colors">
                    <h3 className="text-white font-bold text-sm mb-2">{scenario.name}</h3>
                    <p className="text-slate-500 text-xs mb-4 h-8">{scenario.description}</p>
                    
                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">Year 1 Run Rate:</span>
                        <span className="text-white font-bold">${scenario.year1RecurringCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">Hardware CapEx:</span>
                        <span className={scenario.hardwareCost > 0 ? "text-amber-400" : "text-slate-500"}>
                          ${scenario.hardwareCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">3-Yr Modeled Cost:</span>
                        <span className="text-sky-400 font-bold">${scenario.threeYearModeledCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Planning Window:</span>
                        <span className="text-white">{scenario.migrationEffortMonths} Months</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-dashed border-slate-800">
                <h4 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Architectural Signal</h4>
                <p className="text-lg text-white font-medium leading-relaxed">
                  {results.recommendedPath}
                </p>
              </div>

            </div>

          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 pb-12">
          <div className="text-left mb-10 text-xs text-slate-500 font-mono leading-relaxed">
            <strong className="text-slate-400 uppercase tracking-widest">&gt;_ Disclaimer:</strong> The VMware Modernization Planner is a strategic estimation tool based on field observations, generalized platform pricing, and standard architectural patterns. It does not constitute a formal vendor quote, guaranteed pricing, or binding architectural advice. Actual renewal costs and migration complexities will vary based on enterprise agreements, workload telemetry, and specific technical debt.
          </div>
          <div className="pt-6 border-t border-slate-800/50 text-center text-slate-400 font-sans text-sm">
            <p className="m-0">
              <span className="mr-2">🔒</span> <strong>Privacy Architecture:</strong> The calculator performs all modeling locally in your browser. <br />
              <span className="text-slate-500">No calculator inputs are transmitted to Rack2Cloud servers.</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
