"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; 
import { Input } from "@/components/ui/input"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; 
import { calculateSizing, ClusterInputs, SizingResults } from "@/lib/calculator";
import { Share2, TrendingUp, Users, Lock, AlertTriangle, ArrowRight, Info, ShieldCheck, Mail, FileText, CheckCircle2, Download } from "lucide-react";

export default function Tool() {
  const [mounted, setMounted] = useState(false);

  const [inputs, setInputs] = useState<ClusterInputs>({
    sourceHosts: 10,
    sourceSockets: 2,
    sourceCoresPerSocket: 16,
    consolidationRatio: 1.25, 
    includeMigrationServices: true,
    showFinancials: true,
  });

  const [results, setResults] = useState<SizingResults | null>(null);
  
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResults(calculateSizing(inputs));
  }, [inputs]);

  const handlePdfClick = () => {
    setIsLeadModalOpen(true);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setIsSubmitting(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));
    setIsSubmitting(false);
    setIsLeadModalOpen(false);
    setTimeout(() => window.print(), 500);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 font-sans p-4 md:p-8 flex justify-center print:bg-white print:text-black print:p-0">
      <div className="w-full max-w-7xl space-y-6 print:space-y-4 print:max-w-none">
        
        {/* HEADER */}
        <div className="bg-[#11161f] rounded-xl border border-slate-800 p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl print:shadow-none print:border-b-2 print:border-slate-300 print:rounded-none print:bg-white print:p-0 print:mb-8">
           <div className="flex items-center gap-4">
              <Image src="https://www.rack2cloud.com/wp-content/uploads/2025/12/Icon.png" alt="Rack2Cloud" width={48} height={48} className="object-contain" />
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-wide print:text-black">Rack2Cloud</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] print:text-slate-600">Renewal Value Estimator</p>
              </div>
           </div>
           <div className="flex gap-3 print:hidden">
             <Button onClick={() => window.open('mailto:?subject=Renewal Estimate&body=Check this out.')} variant="outline" className="border-slate-700 bg-transparent text-slate-300 hover:text-white hover:bg-slate-800 h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wide transition-all">
               <Share2 className="w-4 h-4 mr-2" /> Share
             </Button>
             <Button onClick={handlePdfClick} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-xs h-10 px-6 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
               <Lock className="w-3 h-3 mr-2" /> Export Report
             </Button>
           </div>
        </div>

        {/* DISCLAIMER BANNER */}
        <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-3 flex items-start gap-3 print:bg-slate-100 print:border-slate-300">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 print:text-slate-600" />
            <div className="text-xs text-blue-200/80 leading-relaxed print:text-slate-600">
                <strong className="text-blue-100 print:text-black">Financial Planning Only:</strong> This tool provides estimated budgetary ranges for renewal vs. migration scenarios. 
                For precise technical sizing, we recommend running <strong>RVTools</strong> or the <strong>Nutanix Collector</strong>.
            </div>
        </div>

        {/* LEAD GEN MODAL */}
        <Dialog open={isLeadModalOpen} onOpenChange={setIsLeadModalOpen}>
          <DialogContent className="bg-[#11161f] border-slate-800 text-slate-100 sm:max-w-md print:hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-wide">
                Unlock Full Report
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter your email to download the detailed Financial Comparison PDF.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLeadSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Business Email</Label>
                <Input type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#0b0e14] border-slate-700 text-white focus:border-blue-500" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 font-bold uppercase tracking-wide">
                  {isSubmitting ? "Generating..." : "Download Report"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* MAIN LAYOUT: 2 COLUMNS (Aligns Heights Better) */}
        <div className="grid lg:grid-cols-12 gap-6 print:block">
          
          {/* LEFT ZONE: Inputs & Strategy (60% Width) */}
          <div className="lg:col-span-7 flex flex-col gap-6 print:mb-8">
            
            {/* ROW 1: SCOPE + STRATEGY */}
            <div className="grid md:grid-cols-2 gap-6 h-full">
                
                {/* 1. CURRENT SCOPE BOX */}
                <div className="bg-[#11161f] rounded-xl border border-slate-800 p-6 flex flex-col justify-between print:border-slate-300">
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-slate-100 font-bold text-sm uppercase tracking-wider">
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px]">1</div>
                            Current Scope
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2"><Label className="text-xs font-bold text-slate-500 uppercase">Legacy Hosts</Label><span className="font-mono font-bold text-white print:text-black">{inputs.sourceHosts}</span></div>
                                <Slider value={[inputs.sourceHosts]} min={1} max={100} onValueChange={(v) => setInputs({...inputs, sourceHosts: v[0]})} className="print:hidden" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2"><Label className="text-xs font-bold text-slate-500 uppercase">CPUs per Host</Label><span className="font-mono font-bold text-white print:text-black">{inputs.sourceSockets}</span></div>
                                <Slider value={[inputs.sourceSockets]} min={1} max={4} step={1} onValueChange={(v) => setInputs({...inputs, sourceSockets: v[0]})} className="print:hidden" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2"><Label className="text-xs font-bold text-slate-500 uppercase">Cores per CPU</Label><span className="font-mono font-bold text-white print:text-black">{inputs.sourceCoresPerSocket}</span></div>
                                <Slider value={[inputs.sourceCoresPerSocket]} min={8} max={64} step={2} onValueChange={(v) => setInputs({...inputs, sourceCoresPerSocket: v[0]})} className="print:hidden" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800 print:border-slate-200 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Billable Cores</div>
                        <div className="text-2xl font-black text-white print:text-black">{results?.totalLegacyCores}</div>
                        <div className="text-[10px] text-slate-600 mt-1">Based on VCF Licensing Metric</div>
                    </div>
                </div>

                {/* 2. MIGRATION STRATEGY BOX */}
                <div className="bg-[#11161f] rounded-xl border border-slate-800 p-6 flex flex-col justify-between print:border-slate-300">
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-slate-100 font-bold text-sm uppercase tracking-wider">
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px]">2</div>
                            Strategy
                        </div>
                        <div className="space-y-6">
                            {/* Integrity Score */}
                            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-slate-300">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className={`w-6 h-6 ${results?.integrityScore && results.integrityScore > 75 ? 'text-emerald-500' : 'text-amber-500'}`} />
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-slate-500">Arch. Score</div>
                                    </div>
                                </div>
                                <div className="text-xl font-black text-white print:text-black">{results?.integrityScore}/100</div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <Label className="text-xs font-bold text-blue-400 uppercase">Consolidation</Label>
                                    <span className="text-sm font-bold text-white print:text-black">{inputs.consolidationRatio} : 1</span>
                                </div>
                                <Slider 
                                    value={[inputs.consolidationRatio]} 
                                    min={1.0} max={2.0} step={0.1} 
                                    onValueChange={(v) => setInputs({...inputs, consolidationRatio: v[0]})} 
                                    className="print:hidden [&>.relative>.absolute]:bg-blue-500" 
                                />
                                <div className="mt-2 text-[10px] text-slate-500 text-center font-bold uppercase tracking-wider">{results?.strategyLabel}</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800 print:border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Include Services</div>
                            <Switch checked={inputs.includeMigrationServices} onCheckedChange={(c) => setInputs({...inputs, includeMigrationServices: c})} className="scale-75 print:hidden" />
                            <span className="text-[10px] font-bold text-white hidden print:inline">{inputs.includeMigrationServices ? "Yes" : "No"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. NEXT STEPS BOX (Full Width Bottom) */}
            <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-6 print:bg-slate-50 print:border-slate-300">
                <h3 className="text-xs font-bold text-blue-100 uppercase mb-4 tracking-wider print:text-black">Recommended Next Steps</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    
                    {/* Validate */}
                    <div className="bg-[#0b0e14] p-4 rounded-lg border border-slate-800 flex flex-col gap-2 print:bg-white print:border-slate-300">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Validate
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            Run <strong>RVTools</strong> or <strong>Nutanix Collector</strong> to get precise sizing data.
                        </p>
                    </div>
                    
                    {/* Export */}
                    <div onClick={handlePdfClick} className="bg-[#0b0e14] p-4 rounded-lg border border-slate-800 flex flex-col gap-2 cursor-pointer hover:border-blue-500 transition-colors group print:hidden">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase group-hover:text-white">
                            <Download className="w-4 h-4 text-blue-500" /> Export
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed group-hover:text-slate-400">
                            Download this financial model as a PDF business case.
                        </p>
                    </div>

                    {/* Assess */}
                    <a href="mailto:sales@rack2cloud.com?subject=Technical Assessment Request" className="bg-[#0b0e14] p-4 rounded-lg border border-slate-800 flex flex-col gap-2 cursor-pointer hover:border-indigo-500 transition-colors group print:bg-white print:border-slate-300">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase group-hover:text-white print:text-black">
                            <Mail className="w-4 h-4 text-indigo-500" /> Assess
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed group-hover:text-slate-400">
                            Email <strong>sales@rack2cloud.com</strong> to schedule a deep-dive.
                        </p>
                    </a>
                </div>
            </div>
          </div>

          {/* RIGHT ZONE: Financial Summary (40% Width - Full Height) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#161b26] rounded-xl border border-slate-800 overflow-hidden shadow-2xl h-full flex flex-col print:bg-white print:border-2 print:border-black print:shadow-none">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/20 to-slate-900/50 p-6 border-b border-slate-800 print:bg-slate-100 print:border-black">
                    <h2 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 print:text-black">
                        <TrendingUp className="w-5 h-5 text-emerald-400 print:text-black" /> Financial Summary
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider print:text-slate-600">3-Year TCO Comparison</p>
                </div>
                
                <div className="p-8 flex-grow flex flex-col gap-8">
                    
                    {/* RISK SECTION */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2 text-red-500 font-bold uppercase text-xs tracking-wider print:text-red-700">
                                <AlertTriangle className="w-4 h-4" /> Estimated Renewal Risk
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">3-Year Term</span>
                        </div>
                        <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg print:bg-red-50 print:border-red-200">
                            <div className="text-4xl font-black text-white tracking-tighter mb-1 print:text-black">
                                ${(results?.financials.vmware3Year || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-red-400/80 print:text-red-700">
                                ~${(results?.financials.vmwareAnnual || 0).toLocaleString()} / year recurring
                            </div>
                        </div>
                    </div>

                    {/* SAVINGS SECTION */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase text-xs tracking-wider print:text-emerald-700">
                                <TrendingUp className="w-4 h-4" /> Projected Savings
                            </div>
                            <div className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded print:bg-emerald-100 print:text-emerald-800">
                                {results?.financials.savingsPct}% ROI
                            </div>
                        </div>
                        <div className="p-6 bg-emerald-950/20 border border-emerald-900/30 rounded-lg relative overflow-hidden print:bg-emerald-50 print:border-emerald-200">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            <div className="text-5xl font-black text-white tracking-tighter mb-2 print:text-black">
                                ${(results?.financials.netSavings || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-emerald-500/70 font-mono print:text-emerald-800">
                                Range: ${(results?.financials.savingsRange.min || 0).toLocaleString()} - ${(results?.financials.savingsRange.max || 0).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* METRICS GRID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0b0e14] p-4 rounded-lg border border-slate-800 print:bg-slate-50 print:border-slate-300">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Payback Period</div>
                            <div className="text-2xl font-black text-white print:text-black">{results?.financials.paybackPeriodMonths} Months</div>
                        </div>
                        <div className="bg-[#0b0e14] p-4 rounded-lg border border-slate-800 print:bg-slate-50 print:border-slate-300">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Cost of Inaction</div>
                            <div className="text-xl font-black text-red-400 print:text-red-700">~${(results?.financials.costOfInactionMonthly || 0).toLocaleString()}/mo</div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-[#0b0e14] p-6 border-t border-slate-800 flex flex-col gap-2 text-xs print:bg-white print:border-t-2 print:border-black">
                    <div className="flex justify-between">
                        <span className="text-slate-500 font-bold uppercase">Cost of Change (3yr)</span>
                        <span className="text-white font-mono print:text-black">${(results?.financials.nutanixInvestment || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 font-bold uppercase">Target Architecture</span>
                        <span className="text-slate-400">{results?.estimatedNodes} Nodes ({results?.strategyLabel})</span>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}