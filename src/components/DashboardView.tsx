import React, { useState } from 'react';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Zap,
  ArrowUpDown,
  PlusCircle
} from 'lucide-react';
import { IssueItem, PriorityLevel, IssueCategory, IssueStatus } from '../types/issue';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../utils/priorityEngine';
import { UrbanPriorityLogo } from './UrbanPriorityLogo';

interface DashboardViewProps {
  issues: IssueItem[];
  onSelectIssue: (issue: IssueItem) => void;
  onViewOnMap: (issue: IssueItem) => void;
  onOpenRegister: () => void;
  onUpdateStatus: (issueId: string, newStatus: IssueStatus) => void;
  onVote: (issueId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  issues,
  onSelectIssue,
  onViewOnMap,
  onOpenRegister,
  onUpdateStatus,
  onVote
}) => {
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'budget' | 'reports' | 'date'>('score');

  // Compute roll-up analytics
  const totalIssues = issues.length;
  const criticalIssues = issues.filter(i => i.priority.level === 'critical');
  const highIssues = issues.filter(i => i.priority.level === 'high');
  const lowIssues = issues.filter(i => i.priority.level === 'low');

  const totalBudget = issues.reduce((acc, curr) => acc + curr.resources.estimatedBudget, 0);
  const totalWorkers = issues.reduce((acc, curr) => acc + curr.resources.workerCount, 0);
  const totalReports = issues.reduce((acc, curr) => acc + curr.votes, 0);

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = 
        issue.title.toLowerCase().includes(q) ||
        issue.id.toLowerCase().includes(q) ||
        issue.location.area.toLowerCase().includes(q) ||
        issue.location.pincode.toLowerCase().includes(q) ||
        issue.location.address.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;

    // Priority
    if (selectedPriority !== 'all' && issue.priority.level !== selectedPriority) return false;

    // Status
    if (selectedStatus !== 'all' && issue.status !== selectedStatus) return false;

    return true;
  });

  // Sort issues
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'score') return b.priority.score - a.priority.score;
    if (sortBy === 'budget') return b.resources.estimatedBudget - a.resources.estimatedBudget;
    if (sortBy === 'reports') return b.votes - a.votes;
    if (sortBy === 'date') return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner & Overview */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex p-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg shadow-cyan-500/10 flex-shrink-0">
            <UrbanPriorityLogo size={56} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                MUNICIPAL TRIAGE CONSOLE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Live Jaipur Feed Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Urban Infrastructure Priority Engine
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Algorithmic dispatch prioritization calculating hazard severity, traffic impedance, emergency proximity, and municipal workforce allocation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenRegister}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Register New Issue</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Issues */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Logged</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalIssues}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across Jaipur Metro</div>
        </div>

        {/* Critical Red */}
        <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-900/40 shadow-md">
          <div className="flex items-center justify-between text-rose-300 text-xs font-semibold mb-2">
            <span>Critical Triage</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-black text-rose-400">{criticalIssues.length}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">Score &ge; 75 (Red Marker)</div>
        </div>

        {/* High Yellow */}
        <div className="bg-amber-950/20 p-4 rounded-2xl border border-amber-900/40 shadow-md">
          <div className="flex items-center justify-between text-amber-300 text-xs font-semibold mb-2">
            <span>High Priority</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          </div>
          <div className="text-2xl font-black text-amber-400">{highIssues.length}</div>
          <div className="text-[11px] text-amber-300/80 mt-1">Score 45 - 74 (Yellow)</div>
        </div>

        {/* Low Green */}
        <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-900/40 shadow-md">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold mb-2">
            <span>Low Priority</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{lowIssues.length}</div>
          <div className="text-[11px] text-emerald-300/80 mt-1">Score &lt; 45 (Green)</div>
        </div>

        {/* Est Total Budget */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-cyan-300 text-xs font-semibold mb-2">
            <span>Est. Total Budget</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
            ₹{(totalBudget / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Municipal SOR Est.</div>
        </div>

        {/* Total Workforce */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-indigo-300 text-xs font-semibold mb-2">
            <span>Workforce Load</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300">{totalWorkers}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active Crew Deployed</div>
        </div>

      </div>

      {/* Critical Fast-Track Alert Queue (if critical items exist) */}
      {criticalIssues.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-900/60 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h2 className="text-base font-bold text-rose-200">
                  Critical Infrastructure Emergency Queue ({criticalIssues.length} Items)
                </h2>
                <p className="text-xs text-rose-300/80">
                  Automated priority threshold triggered due to trauma route proximity or acute structural collapse.
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-block px-3 py-1 bg-rose-900/50 text-rose-200 text-xs font-mono font-bold rounded-xl border border-rose-700/50">
              DISPATCH OVERRIDE ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalIssues.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/90 p-4 rounded-2xl border border-rose-800/60 flex flex-col justify-between space-y-3 hover:border-rose-600 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500 text-slate-950">
                      SCORE {item.priority.score}/100 • CRITICAL
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      {item.resources.currencySymbol}{item.resources.estimatedBudget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span className="truncate">{item.location.address}</span>
                  </div>
                  {/* People issued this problem */}
                  <div className="flex items-center justify-between text-xs text-amber-300 font-bold bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/60 mt-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.votes} people issued this same problem</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onVote(item.id);
                      }}
                      className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[11px] font-semibold transition-colors"
                      title="I also face this issue"
                    >
                      +1 Me too
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-300 font-medium">
                    Need: <strong className="text-white">{item.resources.workerCount} workers</strong>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewOnMap(item)}
                      className="px-2.5 py-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 rounded-lg border border-cyan-800/60 transition-colors"
                    >
                      View on Map &rarr;
                    </button>
                    <button
                      onClick={() => onSelectIssue(item)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                    >
                      Breakdown
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPREHENSIVE FILTERABLE ISSUE LIST */}
      <div className="space-y-4">
        
        {/* Table / List Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by area, pincode (e.g. 302015), street, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            
            {/* Priority Filter */}
            <select
              aria-label="Filter by priority tier"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical (Red)</option>
              <option value="high">High (Yellow)</option>
              <option value="low">Low (Green)</option>
            </select>

            {/* Category Filter */}
            <select
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Categories</option>
              {Object.keys(CATEGORY_LABELS).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat as IssueCategory]}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              aria-label="Filter by status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="triaged">Triaged</option>
              <option value="dispatched">Dispatched</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Sort by */}
            <select
              aria-label="Sort issues by criteria"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="score">Sort: AI Score (Highest)</option>
              <option value="budget">Sort: Repair Budget</option>
              <option value="reports">Sort: Citizen Votes</option>
              <option value="date">Sort: Most Recent</option>
            </select>

          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{sortedIssues.length}</strong> of {issues.length} registered infrastructure issues
          </span>
          <span className="text-slate-500">
            Click any row to inspect AI rationale or jump to Priority Map pin
          </span>
        </div>

        {/* Issue Cards Table */}
        <div className="space-y-3">
          {sortedIssues.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
              <p className="text-base font-semibold">No issues match the selected filters.</p>
              <p className="text-xs text-slate-500">Try clearing the search query or resetting priority and category filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedPriority('all');
                  setSelectedStatus('all');
                }}
                className="mt-3 px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-xl hover:bg-slate-700"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            sortedIssues.map((issue) => {
              const { level, score } = issue.priority;

              return (
                <div
                  key={issue.id}
                  className="group bg-slate-900/90 hover:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  
                  {/* Left: Score Badge + Details */}
                  <div className="flex items-start gap-4 flex-1">
                    
                    {/* Priority Score badge */}
                    <div className="flex-shrink-0 text-center">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-slate-950 shadow-lg ${
                        level === 'critical'
                          ? 'bg-rose-500 ring-2 ring-rose-400/80 shadow-rose-500/20'
                          : level === 'high'
                          ? 'bg-amber-400 ring-2 ring-amber-300/80 shadow-amber-400/20'
                          : 'bg-emerald-400 ring-2 ring-emerald-300/80 shadow-emerald-400/20'
                      }`}>
                        <span className="text-lg leading-none">{score}</span>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-90">{level}</span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {issue.id}
                        </span>

                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {issue.categoryLabel}
                        </span>

                        {/* People count badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-600/50 text-amber-300 text-xs font-bold">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>{issue.votes} people issued this same problem</span>
                        </div>

                        {/* Quick increment button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onVote(issue.id);
                          }}
                          className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-amber-900/40 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-600/50 text-xs font-medium transition-colors cursor-pointer"
                          title="I also face this problem (+1 report)"
                        >
                          <span>+1 I face this too</span>
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {issue.title}
                      </h3>

                      {/* Location & Pincode captured */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          <span className="truncate">{issue.location.address}</span>
                        </span>
                        <span className="text-slate-500">•</span>
                        <span>Area: <strong className="text-slate-200">{issue.location.area}</strong></span>
                        <span className="text-slate-500">•</span>
                        <span>Pincode: <strong className="text-cyan-400 font-mono">{issue.location.pincode}</strong></span>
                      </div>

                      {/* AI Reason Preview */}
                      {issue.priority.reasons.length > 0 && (
                        <p className="text-xs text-slate-400 line-clamp-1 italic">
                          "{issue.priority.reasons[0]}"
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Right: Budget, Workers & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                    
                    {/* Budget & Workers readout */}
                    <div className="text-left lg:text-right">
                      <div className="text-sm font-extrabold text-cyan-400 font-mono">
                        {issue.resources.currencySymbol}{issue.resources.estimatedBudget.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400 inline" />
                        <span>{issue.resources.workerCount} workers ({issue.resources.estimatedHours}h)</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewOnMap(issue)}
                        title="Locate Pin on Priority Map"
                        className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span className="hidden sm:inline">View on Map</span>
                      </button>

                      <button
                        onClick={() => onSelectIssue(issue)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
