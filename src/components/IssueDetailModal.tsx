import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  ShieldAlert, 
  Wrench, 
  Car, 
  CloudRain, 
  Compass, 
  ExternalLink,
  Phone,
  UserCheck
} from 'lucide-react';
import { IssueItem, IssueStatus } from '../types/issue';

interface IssueDetailModalProps {
  issue: IssueItem | null;
  onClose: () => void;
  onViewOnMap: (issue: IssueItem) => void;
  onUpdateStatus: (issueId: string, newStatus: IssueStatus) => void;
  onVote: (issueId: string) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onViewOnMap,
  onUpdateStatus,
  onVote
}) => {
  const [isAiReEstimating, setIsAiReEstimating] = useState(false);
  const [aiAssessmentMessage, setAiAssessmentMessage] = useState<string | null>(null);
  const [customEstimatedBudget, setCustomEstimatedBudget] = useState<number | null>(null);
  const [customWorkerCount, setCustomWorkerCount] = useState<number | null>(null);

  if (!issue) return null;

  const { level, score, reasons, severityScore, trafficScore, proximityScore, weatherRiskScore, publicDemandScore } = issue.priority;
  const { estimatedBudget: baseBudget, currencySymbol, estimatedHours, workerCount: baseWorkers, workerRoles, equipmentNeeded } = issue.resources;
  const estimatedBudget = customEstimatedBudget ?? baseBudget;
  const workerCount = customWorkerCount ?? baseWorkers;

  const handleAiReEstimate = async () => {
    setIsAiReEstimating(true);
    try {
      const res = await fetch('/api/estimate-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: issue.title,
          category: issue.category,
          categoryLabel: issue.categoryLabel,
          description: issue.description,
          area: issue.location.area,
          address: issue.location.address,
          pincode: issue.location.pincode,
          city: issue.location.city
        })
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        if (resData.data.estimatedBudget) setCustomEstimatedBudget(resData.data.estimatedBudget);
        if (resData.data.workerCount) setCustomWorkerCount(resData.data.workerCount);
        if (resData.data.aiAssessment) setAiAssessmentMessage(resData.data.aiAssessment);
      }
    } catch (err) {
      console.error('Failed to run AI re-estimation:', err);
    } finally {
      setIsAiReEstimating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
              level === 'critical'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                : level === 'high'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20'
            }`}>
              {level} • SCORE {score}/100
            </span>
            <span className="text-xs font-mono text-slate-400">
              {issue.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Title & Image Header */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  {issue.categoryLabel}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {issue.title}
                </h2>
              </div>

              {/* Status Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                <select
                  aria-label="Issue status"
                  value={issue.status}
                  onChange={(e) => onUpdateStatus(issue.id, e.target.value as IssueStatus)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="reported">Reported</option>
                  <option value="triaged">Triaged</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Photo preview banner if available */}
            {issue.imageUrl && (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={issue.imageUrl}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-xs text-slate-300 font-medium bg-slate-900/80 px-2 py-1 rounded-md backdrop-blur">
                    Verified Field Inspection Media
                  </span>
                </div>
              </div>
            )}

            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
              {issue.description}
            </p>
          </div>

          {/* Location & Pincode Capture Card */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-rose-400">
                <MapPin className="w-4 h-4" />
                <span>Geospatial Spatial Location</span>
              </span>
              <button
                onClick={() => {
                  onViewOnMap(issue);
                  onClose();
                }}
                className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1"
              >
                <span>View Pin on Priority Map</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2 bg-slate-900 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Street / Landmark</span>
                <span className="font-semibold text-slate-200">{issue.location.address}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Area / Locality</span>
                <span className="font-semibold text-slate-200">{issue.location.area}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Pincode &amp; City</span>
                <span className="font-bold text-cyan-300 font-mono">{issue.location.pincode} • {issue.location.city}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono pt-1">
              Coordinates: Lat {issue.location.lat.toFixed(6)}, Lng {issue.location.lng.toFixed(6)}
            </div>
          </div>

          {/* TRANSPARENT AI PRIORITY SCORE BREAKDOWN */}
          <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Transparent AI Priority Engine Breakdown
                </h3>
              </div>

              {/* Live Gemini AI Re-estimation button */}
              <button
                type="button"
                disabled={isAiReEstimating}
                onClick={handleAiReEstimate}
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiReEstimating ? 'animate-spin' : ''}`} />
                <span>{isAiReEstimating ? 'Estimating with Gemini AI...' : 'Re-Estimate Amount & Severity with AI'}</span>
              </button>
            </div>

            {/* AI Assessment Note Banner */}
            {aiAssessmentMessage && (
              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-700/60 text-xs text-indigo-200 flex items-start gap-2.5 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-cyan-300">Gemini AI Civil Engineering Assessment:</div>
                  <p className="text-slate-300 mt-0.5">{aiAssessmentMessage}</p>
                </div>
              </div>
            )}

            {/* Factor score bars */}
            <div className="space-y-2.5 text-xs">
              {/* Severity */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Structural Hazard Severity (35% weight)</span>
                  <span className="font-mono text-cyan-300 font-bold">{issue.factors.severityWeight}% &rarr; +{severityScore} pts</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${issue.factors.severityWeight}%` }}></div>
                </div>
              </div>

              {/* Traffic */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Traffic Disruption Impact (25% weight)</span>
                  <span className="font-mono text-cyan-300 font-bold">{issue.factors.trafficImpact}% &rarr; +{trafficScore} pts</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${issue.factors.trafficImpact}%` }}></div>
                </div>
              </div>

              {/* Proximity */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Proximity to Hospitals/Schools (20% weight)</span>
                  <span className="font-mono text-cyan-300 font-bold">{issue.factors.vulnerabilityScore}% &rarr; +{proximityScore} pts</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full rounded-full" style={{ width: `${issue.factors.vulnerabilityScore}%` }}></div>
                </div>
              </div>

              {/* Weather */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Monsoon / Weather Hazard (10% weight)</span>
                  <span className="font-mono text-cyan-300 font-bold">{issue.factors.weatherRisk}% &rarr; +{weatherRiskScore} pts</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: `${issue.factors.weatherRisk}%` }}></div>
                </div>
              </div>

              {/* Citizen reports */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Citizen Reports Demand (10% weight)</span>
                  <span className="font-mono text-cyan-300 font-bold">{issue.factors.citizenReportCount} reports &rarr; +{publicDemandScore} pts</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, issue.factors.citizenReportCount * 2)}%` }}></div>
                </div>
              </div>
            </div>

            {/* AI Decision Reasons */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-slate-300">Algorithmic Justification Rationale:</div>
              <ul className="space-y-1">
                {reasons.map((r, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ESTIMATED BUDGET & WORKFORCE DISPATCH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Budget */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase">
                <DollarSign className="w-4 h-4" />
                <span>Estimated Repair Budget</span>
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {currencySymbol}{estimatedBudget.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400">
                Calibrated against municipal Schedule of Rates (SOR) factoring materials, machine hours, and asphalt/pipe replacement.
              </p>
            </div>

            {/* Workforce & Equipment */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                <Users className="w-4 h-4" />
                <span>Workforce &amp; Deployment</span>
              </div>
              <div className="text-2xl font-black text-amber-300">
                {workerCount} Crew Members <span className="text-xs text-slate-400">({estimatedHours} hrs)</span>
              </div>
              <div className="text-[11px] text-slate-300">
                <strong>Equipment:</strong> {equipmentNeeded.join(', ')}
              </div>
            </div>

          </div>

          {/* Community Feedback & Reporter - People issued this problem */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-950/30 rounded-2xl border border-amber-800/60 text-xs">
            <div>
              <div className="flex items-center gap-2 text-amber-200 font-extrabold text-sm">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{issue.votes} people have issued this same problem</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Primary field report logged by: <strong className="text-slate-200">{issue.reportedBy}</strong></span>
              </div>
            </div>

            <button
              onClick={() => onVote(issue.id)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs shadow-md transition-colors"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>+1 I Face This Issue Too</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <button
            onClick={() => {
              onViewOnMap(issue);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:brightness-110 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <MapPin className="w-4 h-4" />
            <span>View Directly on Priority Map &rarr;</span>
          </button>

          <button
            onClick={() => {
              onUpdateStatus(issue.id, 'dispatched');
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-transform"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Dispatch Municipal Work Order</span>
          </button>
        </div>

      </div>

    </div>
  );
};
