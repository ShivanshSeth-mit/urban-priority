import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  AlertTriangle, 
  MapPin, 
  Layers, 
  Search, 
  Maximize2, 
  RotateCcw, 
  DollarSign, 
  Users, 
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Navigation
} from 'lucide-react';
import { IssueItem, PriorityLevel, IssueCategory } from '../types/issue';
import { MAPBOX_TOKEN, CATEGORY_LABELS } from '../utils/priorityEngine';

interface PriorityMapViewProps {
  issues: IssueItem[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: IssueItem) => void;
  onOpenRegister: () => void;
  onVote?: (issueId: string) => void;
}

export const PriorityMapView: React.FC<PriorityMapViewProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  onOpenRegister,
  onVote
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: mapboxgl.Marker }>({});

  const [activeFilter, setActiveFilter] = useState<'all' | PriorityLevel>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [clickedMapLocation, setClickedMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filtered issues for the map
  const filteredIssues = issues.filter((issue) => {
    if (activeFilter !== 'all' && issue.priority.level !== activeFilter) return false;
    if (activeCategory !== 'all' && issue.category !== activeCategory) return false;
    return true;
  });

  // Center on Jaipur Metropolitan Area where sample points reside
  const defaultCenter: [number, number] = [75.7950, 26.8850];
  const defaultZoom = 12.0;

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: defaultCenter,
      zoom: defaultZoom,
      pitch: 35, // Subtle 3D tilt for command-center look
      bearing: -10
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);
      map.resize();
    });

    // Allow user to click anywhere on map to inspect coordinates
    map.on('click', (e) => {
      // If clicked on empty space (not a marker)
      setClickedMapLocation({
        lat: e.lngLat.lat,
        lng: e.lngLat.lng
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Sync Markers on Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    filteredIssues.forEach((issue) => {
      const { level, score } = issue.priority;
      const isSelected = issue.id === selectedIssueId;

      // Create custom DOM element for marker
      const el = document.createElement('div');
      el.className = 'cursor-pointer group select-none transition-transform duration-200';
      el.style.width = '42px';
      el.style.height = '42px';

      // Determine marker color schemes
      let pinColor = '#10b981'; // green low
      let bgColor = 'bg-emerald-500';
      let ringColor = 'ring-emerald-400';
      let glowColor = 'shadow-[0_0_15px_rgba(16,185,129,0.6)]';
      let pulseRing = '';

      if (level === 'critical') {
        pinColor = '#ef4444'; // red critical
        bgColor = 'bg-rose-500';
        ringColor = 'ring-rose-400';
        glowColor = 'shadow-[0_0_25px_rgba(239,68,68,0.85)]';
        pulseRing = `
          <span class="absolute -inset-2.5 rounded-full bg-rose-500/30 animate-ping"></span>
          <span class="absolute -inset-1 rounded-full bg-rose-500/50"></span>
        `;
      } else if (level === 'high') {
        pinColor = '#f59e0b'; // yellow / amber high
        bgColor = 'bg-amber-500';
        ringColor = 'ring-amber-400';
        glowColor = 'shadow-[0_0_20px_rgba(245,158,11,0.7)]';
        pulseRing = `
          <span class="absolute -inset-1.5 rounded-full bg-amber-500/20 animate-pulse"></span>
        `;
      }

      el.innerHTML = `
        <div class="relative flex items-center justify-center w-full h-full">
          ${pulseRing}
          <div class="relative z-10 flex flex-col items-center justify-center w-9 h-9 rounded-full ${bgColor} text-slate-950 font-black text-xs shadow-lg ${glowColor} ring-2 ring-white/90 transform transition-transform group-hover:scale-125 ${
            isSelected ? 'scale-125 ring-4 ring-cyan-400' : ''
          }">
            <span class="leading-none tracking-tighter">${score}</span>
            <span class="text-[8px] font-extrabold uppercase leading-none opacity-85">
              ${level === 'critical' ? 'CRIT' : level === 'high' ? 'HIGH' : 'LOW'}
            </span>
          </div>
          <!-- Pointer tip -->
          <div class="w-2 h-2 ${bgColor} rotate-45 -mt-1 shadow-md"></div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectIssue(issue);
        map.flyTo({
          center: [issue.location.lng, issue.location.lat],
          zoom: Math.max(map.getZoom(), 14),
          speed: 1.2,
          curve: 1.4
        });
      });

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat([issue.location.lng, issue.location.lat])
        .addTo(map);

      markersRef.current[issue.id] = marker;
    });
  }, [filteredIssues, mapLoaded, selectedIssueId]);

  // Center map on selected issue when selected outside or on mount
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !selectedIssueId) return;
    const issue = issues.find((i) => i.id === selectedIssueId);
    if (issue) {
      mapRef.current.flyTo({
        center: [issue.location.lng, issue.location.lat],
        zoom: 15,
        speed: 1.4,
        curve: 1.2,
        essential: true
      });
    }
  }, [selectedIssueId, mapLoaded, issues]);

  const resetMap = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: defaultCenter,
      zoom: defaultZoom,
      pitch: 35,
      bearing: -10
    });
  };

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-950">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Filter Pills */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl">
          <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" />
            <span>Priority:</span>
          </span>

          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All ({issues.length})
          </button>

          <button
            onClick={() => setActiveFilter('critical')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'critical'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-400'
                : 'text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Critical Red ({issues.filter((i) => i.priority.level === 'critical').length})
          </button>

          <button
            onClick={() => setActiveFilter('high')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'high'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-1 ring-amber-400'
                : 'text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            High Yellow ({issues.filter((i) => i.priority.level === 'high').length})
          </button>

          <button
            onClick={() => setActiveFilter('low')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'low'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Low Green ({issues.filter((i) => i.priority.level === 'low').length})
          </button>
        </div>

        {/* Quick Issue Picker & Reset */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="relative">
            <select
              aria-label="Jump to specific urban issue on map"
              value={selectedIssueId || ''}
              onChange={(e) => {
                const target = issues.find((i) => i.id === e.target.value);
                if (target) onSelectIssue(target);
              }}
              className="bg-slate-900/90 backdrop-blur-md text-slate-200 text-xs font-medium px-3 py-2 pr-8 rounded-xl border border-slate-700/80 shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Jump to Sample / Logged Issue...</option>
              {issues.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.priority.level.toUpperCase()} - {i.priority.score}] {i.title.slice(0, 36)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={resetMap}
            title="Reset Map View"
            className="p-2 bg-slate-900/90 backdrop-blur-md text-slate-300 hover:text-white rounded-xl border border-slate-700/80 shadow-xl hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Mapbox Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom Floating Legend & Map Info */}
      <div className="absolute bottom-6 left-4 z-20 pointer-events-none hidden sm:block">
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl text-xs space-y-2 max-w-xs">
          <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Map Marker Priority Tiers</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Mapbox GL</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-rose-300 bg-rose-950/30 px-2 py-1 rounded-lg border border-rose-900/40">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400/50"></span>
                Critical (Score &ge; 75)
              </span>
              <span className="text-slate-400">Immediate Hazard</span>
            </div>

            <div className="flex items-center justify-between text-amber-300 bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-900/40">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-300/50"></span>
                High (Score 45 - 74)
              </span>
              <span className="text-slate-400">Arterial / Commute</span>
            </div>

            <div className="flex items-center justify-between text-emerald-300 bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-900/40">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-300/50"></span>
                Low (Score &lt; 45)
              </span>
              <span className="text-slate-400">Standard Queue</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
            Click any pin to inspect transparent AI score, repair budget &amp; crew needs.
          </p>
        </div>
      </div>

      {/* Selected Issue Preview Card on Map (Bottom Right Drawer) */}
      {selectedIssue && (
        <div className="absolute bottom-6 right-4 left-4 sm:left-auto sm:w-[420px] z-20 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 p-4 shadow-2xl space-y-3.5 transition-all animate-in fade-in slide-in-from-bottom-4">
            
            {/* Header with Title and Priority Badge */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wide ${
                    selectedIssue.priority.level === 'critical'
                      ? 'bg-rose-500 text-slate-950'
                      : selectedIssue.priority.level === 'high'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-emerald-400 text-slate-950'
                  }`}>
                    {selectedIssue.priority.level} • {selectedIssue.priority.score}/100
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedIssue.id}
                  </span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-snug line-clamp-1">
                  {selectedIssue.title}
                </h3>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-base font-extrabold text-cyan-400 font-mono">
                  {selectedIssue.resources.currencySymbol}{selectedIssue.resources.estimatedBudget.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">
                  Est. Repair Budget
                </div>
              </div>
            </div>

            {/* Location capture readout */}
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className="truncate">{selectedIssue.location.address}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pl-5">
                <span>Area: <strong className="text-slate-300">{selectedIssue.location.area}</strong></span>
                <span>Pincode: <strong className="text-cyan-300 font-mono">{selectedIssue.location.pincode}</strong></span>
              </div>
            </div>

            {/* Quick Metrics: Workers & Factor Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <Users className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-bold text-slate-200">{selectedIssue.resources.workerCount} Crew Members</div>
                  <div className="text-[10px] text-slate-400">{selectedIssue.resources.estimatedHours} hrs turnaround</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold text-slate-200">Score {selectedIssue.priority.score}/100</div>
                  <div className="text-[10px] text-slate-400">AI Priority Grade</div>
                </div>
              </div>
            </div>

            {/* How many people issued this problem */}
            <div className="flex items-center justify-between p-2.5 bg-amber-950/40 rounded-xl border border-amber-800/60">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="font-extrabold text-amber-200 text-xs">
                    {selectedIssue.votes} people issued this same problem
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Verified citizen reports in this area
                  </div>
                </div>
              </div>
              {onVote && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVote(selectedIssue.id);
                  }}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-colors"
                  title="I also face this problem"
                >
                  +1 Me too
                </button>
              )}
            </div>

            {/* Top AI Decision Factor */}
            {selectedIssue.priority.reasons.length > 0 && (
              <div className="text-xs text-slate-300 bg-slate-850/80 px-2.5 py-1.5 rounded-lg border-l-2 border-cyan-400">
                <span className="font-semibold text-cyan-300">AI Priority Factor: </span>
                <span className="text-slate-300">{selectedIssue.priority.reasons[0]}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onSelectIssue(selectedIssue)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
              >
                <span>View Full AI Breakdown</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenRegister}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                + Register New
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Coordinate Click Inspector Notification */}
      {clickedMapLocation && !selectedIssue && (
        <div className="absolute bottom-6 right-4 z-20 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700 text-xs text-slate-300 shadow-2xl max-w-sm animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>Map Coordinate Inspected</span>
            </span>
            <button
              onClick={() => setClickedMapLocation(null)}
              className="text-slate-400 hover:text-white"
            >
              &times;
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-2 font-mono">
            Lat: {clickedMapLocation.lat.toFixed(5)}, Lng: {clickedMapLocation.lng.toFixed(5)}
          </p>
          <button
            onClick={onOpenRegister}
            className="w-full py-1.5 px-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
          >
            Report New Infrastructure Issue Here
          </button>
        </div>
      )}

    </div>
  );
};
