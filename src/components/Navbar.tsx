import React from 'react';
import { 
  AlertCircle, 
  MapPin, 
  PlusCircle, 
  Info,
  TrendingUp
} from 'lucide-react';
import { IssueItem } from '../types/issue';
import { UrbanPriorityLogo } from './UrbanPriorityLogo';

interface NavbarProps {
  currentTab: 'dashboard' | 'map';
  setCurrentTab: (tab: 'dashboard' | 'map') => void;
  onOpenRegister: () => void;
  onOpenLimitations: () => void;
  issues: IssueItem[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenRegister,
  onOpenLimitations,
  issues
}) => {
  const criticalCount = issues.filter(i => i.priority.level === 'critical').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand & City Engine Title (Clickable to Home Page) */}
          <button
            onClick={() => {
              setCurrentTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 text-left group cursor-pointer hover:opacity-95 transition-all focus:outline-none"
            title="Go to Urban Priority Home Dashboard"
          >
            {/* Official Urban Priority Logo with Skyline & Checkmark Pin */}
            <div className="relative p-1 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg shadow-cyan-500/10 group-hover:border-cyan-500/50 group-hover:scale-105 transition-all">
              <UrbanPriorityLogo size={40} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  URBAN <span className="text-cyan-400">PRIORITY</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60 rounded">
                  JAIPUR METRO
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Jaipur Municipal Corp &amp; JDA Infrastructure Triage
              </p>
            </div>
          </button>

          {/* Center Navigation Tabs (Dashboard & Priority Map only) */}
          <nav className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-sm">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all relative ${
                currentTab === 'map'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Priority Map</span>
              {criticalCount > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Prototype Info */}
            <button
              onClick={onOpenLimitations}
              title="Prototype & Estimation Model Details"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950/60 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Model Specs</span>
            </button>

            {/* Critical alert pill */}
            {criticalCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-semibold rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>{criticalCount} Critical</span>
              </div>
            )}

            {/* Register New Issue Button */}
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Register New Issue</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
