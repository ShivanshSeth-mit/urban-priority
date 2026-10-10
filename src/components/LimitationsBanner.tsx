import React from 'react';
import { X, Info, CheckCircle2, AlertTriangle, ShieldCheck, Database, MapPin } from 'lucide-react';
import { MAPBOX_TOKEN } from '../utils/priorityEngine';

interface LimitationsBannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LimitationsBanner: React.FC<LimitationsBannerProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Info className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">
                Prototype Architecture &amp; Estimation Scope
              </h2>
              <p className="text-xs text-slate-400">
                Hackathon problem statement compliance &amp; mock boundaries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Mapbox Geospatial Service Integration</span>
            </div>
            <p className="text-slate-400">
              The application connects to Mapbox GL JS using the user-provided public token (<code className="text-cyan-300 font-mono">pk.eyJ1Ijo...</code>). Coordinates, pin placement, drag-and-drop, and reverse geocoding of area and postal pincode are fully functional in real time.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI Priority Scoring Model</span>
            </div>
            <p className="text-slate-400">
              Rather than an untraceable black-box, the priority engine implements a transparent weighted multi-variable regression formula (35% hazard severity, 25% traffic disruption, 20% critical institution proximity, 10% flood risk, 10% citizen demand). This guarantees full auditability for municipal oversight.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Budget &amp; Workforce Estimates</span>
            </div>
            <p className="text-slate-400">
              Repair budgets (in ₹) and worker counts are calibrated using standard municipal Schedule of Rates (SOR) heuristics scaled against hazard volume. In a production enterprise rollout, this module interfaces with municipal ERP work-order dispatch systems.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>State Lifecycle &amp; Live Registration</span>
            </div>
            <p className="text-slate-400">
              New issues submitted through "Register New Issue" are dynamically rendered across the Priority Map and Dashboard issue tables, with instant recalculation of city metrics.
            </p>
          </div>

        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl"
          >
            Acknowledge &amp; Continue
          </button>
        </div>

      </div>

    </div>
  );
};
