"use client";

import React, { useState, useEffect } from "react";
import { 
  calculateModernization, 
  EnvironmentProfile, 
  ModernizationResults 
} from "@/lib/calculator";

export default function ModernizationPlanner() {
  // 1. Initial State Mapping
  const [profile, setProfile] = useState<EnvironmentProfile>({
    hosts: 16,
    socketsPerHost: 2,
    coresPerSocket: 16,
    vmCount: 300,
    storageTb: 100,
    growthRatePct: 10,
    contractHorizonMonths: 12,
    bundle: "vvf",
    hasVsan: false,
    hasNsx: false,
    hasSrm: false,
    hasHorizon: false,
    hasK8s: false,
  });

  const [results, setResults] = useState<ModernizationResults | null>(null);

  // 2. Calculation Engine Trigger
  useEffect(() => {
    const updatedResults = calculateModernization(profile);
    setResults(updatedResults);
  }, [profile]);

  // 3. Input Handlers
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: Number(e.target.value) });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.checked });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value as "vcf" | "vvf" });
  };

  // Helper for dynamic score coloring
  const getBandColor = (band: string) => {
    switch (band) {
      case "Critical":
      case "Very High": return "text-rose-500 border-rose-500/30 bg-rose-500/10";
      case "High": return "text-orange-500 border-orange-500/30 bg-orange-500/10";
      case "Moderate": return "text-amber-500 border-amber-500/30 bg-amber-500/10";
      case "Low": return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
      default: return "text-slate-400 border-slate-700 bg-slate-800";
    }
  };

  if (!results) return <div className="min-h-screen bg-[#0f172a] text-slate-200 flex items-center justify-center font-mono">INITIALIZING ENGINE...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 border-b border-slate-800 pb-6">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-sky-400 mb-2">
            &gt;_ Rack2Cloud Diagnostics
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">
            VMware Modernization Planner
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Deterministic architectural modeling. Enter your footprint telemetry to generate your renewal exposure baseline, migration complexity scorecard, and strategic path analysis.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ==========================================
              LEFT PANEL: INPUTS (4 Columns)
              ========================================== */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Structural Footprint */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                Environment Profile
              </h2>
              
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Total Hosts</label>
                    <input type="number" name="hosts" value={profile.hosts} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Sockets/Host</label>
                    <input type="number" name="socketsPerHost" value={profile.socketsPerHost} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Cores/Socket</label>
                    <input type="number" name="coresPerSocket" value={profile.coresPerSocket} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">VM Count</label>
                    <input type="number" name="vmCount" value={profile.vmCount} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Target Bundle</label>
                  <select name="bundle" value={profile.bundle} onChange={handleSelectChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono uppercase">
                    <option value="vvf">VMware vSphere Foundation (VVF)</option>
                    <option value="vcf">VMware Cloud Foundation (VCF)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Growth/Yr (%)</label>
                    <input type="number" name="growthRatePct" value={profile.growthRatePct} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Renewal (Mos)</label>
                    <input type="number" name="contractHorizonMonths" value={profile.contractHorizonMonths} onChange={handleNumberChange} className="w-full bg-[#0a0f1e] border border-slate-700 rounded px-3 py-2 text-white focus:border-sky-400 focus:outline-none font-mono" />
                  </div>
                </div>
              </div>
            </div>

            {/* Complexity Matrix */}
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
                    <input 
                      type="checkbox" 
                      name={feature.name} 
                      checked={profile[feature.name as keyof EnvironmentProfile] as boolean} 
                      onChange={handleCheckboxChange} 
                      className="form-checkbox h-4 w-4 text-sky-500 bg-[#0a0f1e] border-slate-700 rounded focus:ring-sky-500 focus:ring-offset-slate-900" 
                    />
                    <span className="text-slate-300">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ==========================================
              RIGHT PANEL: OUTPUTS (8 Columns)
              ========================================== */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Top Row: Diagnostic Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className={`p-6 rounded-lg border ${getBandColor(results.renewalExposureBand)} flex flex-col justify-between`}>
                <div className="font-mono text-xs font-bold uppercase tracking-wider mb-4 opacity-80">
                  &gt;_ Renewal Exposure Score
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-6xl font-black">{results.renewalExposureScore}</span>
                  <span className="text-xl font-bold uppercase tracking-widest opacity-90">{results.renewalExposureBand}</span>
                </div>
                <p className="mt-4 text-sm opacity-80 font-mono">Licensed Cores: {results.totalLicensedCores}</p>
              </div>

              <div className={`p-6 rounded-lg border ${getBandColor(results.migrationComplexityBand)} flex flex-col justify-between`}>
                <div className="font-mono text-xs font-bold uppercase tracking-wider mb-4 opacity-80">
                  &gt;_ Migration Complexity
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-6xl font-black">{results.migrationComplexityScore}</span>
                  <span className="text-xl font-bold uppercase tracking-widest opacity-90">{results.migrationComplexityBand}</span>
                </div>
                <p className="mt-4 text-sm opacity-80 font-mono">Consolidation Ratio: {results.consolidationRatio.toFixed(2)}x</p>
              </div>
              
            </div>

            {/* Framework Signals */}
            {results.frameworkSignals.length > 0 && (
              <div className="space-y-4">
                {results.frameworkSignals.map((signal) => (
                  <div key={signal.id} className="bg-slate-900 border-l-4 border-rose-500 p-4 border border-slate-800 rounded-r-lg flex gap-4 items-start">
                    <div className="bg-rose-500/20 text-rose-400 font-mono text-xs font-bold px-2 py-1 rounded">
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

            {/* 4-Scenario Financials */}
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
                        <span className="text-white font-bold">${scenario.year1Cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">3-Year TCO:</span>
                        <span className="text-sky-400 font-bold">${scenario.year3Cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">CapEx Req:</span>
                        <span className={scenario.capexRequirement > 0 ? "text-amber-400" : "text-emerald-400"}>
                          ${scenario.capexRequirement.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Effort Window:</span>
                        <span className="text-white">{scenario.migrationEffortMonths} Months</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Path Footer */}
              <div className="mt-6 pt-6 border-t border-dashed border-slate-800">
                <h4 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Architectural Signal</h4>
                <p className="text-lg text-white font-medium leading-relaxed">
                  {results.recommendedPath}
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
