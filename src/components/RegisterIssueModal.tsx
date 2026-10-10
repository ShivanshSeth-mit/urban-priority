import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Sparkles, 
  Check, 
  Navigation, 
  Upload, 
  Camera, 
  Layers, 
  Activity, 
  ShieldAlert, 
  Clock,
  Compass,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { IssueCategory, IssueItem, ScoreFactors } from '../types/issue';
import { 
  MAPBOX_TOKEN, 
  CATEGORY_LABELS, 
  CATEGORY_ICONS, 
  calculatePriorityScore, 
  estimateResources, 
  reverseGeocodeMapbox 
} from '../utils/priorityEngine';

interface RegisterIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueAdded: (newIssue: IssueItem) => void;
  onViewOnMap: (issue: IssueItem) => void;
}

const PRESET_SAMPLE_PHOTOS = [
  {
    name: 'Road Damage / Pothole',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Pipeline / Water Leak',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Drainage / Culvert Void',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Electrical Hazard',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80'
  }
];

export const RegisterIssueModal: React.FC<RegisterIssueModalProps> = ({
  isOpen,
  onClose,
  onIssueAdded,
  onViewOnMap
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const pickerMapRef = useRef<mapboxgl.Map | null>(null);
  const pickerMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>('pothole_road');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('Citizen Field Reporter');
  const [reporterContact, setReporterContact] = useState('+91 98100-XXXXX');
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_SAMPLE_PHOTOS[0].url);

  // Location captured states (Defaults to Jaipur)
  const [lat, setLat] = useState(26.8986);
  const [lng, setLng] = useState(75.8142);
  const [address, setAddress] = useState('Tonk Road Corridor, Near SMS Hospital');
  const [area, setArea] = useState('Ashok Nagar / SMS Hospital');
  const [pincode, setPincode] = useState('302015');
  const [city, setCity] = useState('Jaipur');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // AI Factors
  const [factors, setFactors] = useState<ScoreFactors>({
    severityWeight: 80,
    trafficImpact: 75,
    vulnerabilityScore: 70,
    weatherRisk: 60,
    citizenReportCount: 12
  });

  const [createdIssue, setCreatedIssue] = useState<IssueItem | null>(null);
  const [isAiEstimating, setIsAiEstimating] = useState(false);
  const [aiAssessmentNote, setAiAssessmentNote] = useState<string | null>(null);
  const [aiCustomBudget, setAiCustomBudget] = useState<number | null>(null);
  const [aiCustomWorkers, setAiCustomWorkers] = useState<number | null>(null);

  // Real-time calculated priority & resources
  const priorityResult = calculatePriorityScore(category, factors);
  const baseResourceResult = estimateResources(category, priorityResult.score, factors.severityWeight);
  const resourceResult = {
    ...baseResourceResult,
    estimatedBudget: aiCustomBudget ?? baseResourceResult.estimatedBudget,
    workerCount: aiCustomWorkers ?? baseResourceResult.workerCount
  };

  // Trigger Gemini AI API to estimate severity and budget
  const handleEstimateWithAi = async () => {
    setIsAiEstimating(true);
    try {
      const response = await fetch('/api/estimate-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || CATEGORY_LABELS[category],
          category,
          categoryLabel: CATEGORY_LABELS[category],
          description: description.trim() || `Infrastructure problem reported at ${address}, ${area}, Jaipur.`,
          area,
          address,
          pincode,
          city
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const aiData = resData.data;
        setFactors((prev) => ({
          ...prev,
          severityWeight: Number(aiData.severityWeight) || prev.severityWeight,
          trafficImpact: Number(aiData.trafficImpact) || prev.trafficImpact,
          vulnerabilityScore: Number(aiData.vulnerabilityScore) || prev.vulnerabilityScore,
          weatherRisk: Number(aiData.weatherRisk) || prev.weatherRisk
        }));

        if (aiData.estimatedBudget) {
          setAiCustomBudget(Number(aiData.estimatedBudget));
        }
        if (aiData.workerCount) {
          setAiCustomWorkers(Number(aiData.workerCount));
        }
        if (aiData.aiAssessment) {
          setAiAssessmentNote(aiData.aiAssessment);
        }
      }
    } catch (err) {
      console.error('AI Estimation request failed:', err);
    } finally {
      setIsAiEstimating(false);
    }
  };

  // Initialize interactive location picker Mapbox
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: 13
    });

    // Custom marker element
    const el = document.createElement('div');
    el.className = 'w-8 h-8 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 font-bold text-xs ring-4 ring-cyan-500/30';
    el.innerHTML = '📍';

    const marker = new mapboxgl.Marker({
      element: el,
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(map);

    pickerMarkerRef.current = marker;

    const handleLocationUpdate = async (newLng: number, newLat: number) => {
      setLng(newLng);
      setLat(newLat);
      setIsGeocoding(true);

      const geo = await reverseGeocodeMapbox(newLat, newLng);
      setAddress(geo.address);
      setArea(geo.area);
      setPincode(geo.pincode);
      setCity(geo.city);
      setIsGeocoding(false);
    };

    // Click anywhere on map to move pin
    map.on('click', (e) => {
      marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
      handleLocationUpdate(e.lngLat.lng, e.lngLat.lat);
    });

    // Drag pin to update location
    marker.on('dragend', () => {
      const pos = marker.getLngLat();
      handleLocationUpdate(pos.lng, pos.lat);
    });

    pickerMapRef.current = map;

    return () => {
      map.remove();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickPresetLocation = (targetLat: number, targetLng: number, targetArea: string, targetPin: string, targetAddr: string) => {
    setLat(targetLat);
    setLng(targetLng);
    setArea(targetArea);
    setPincode(targetPin);
    setAddress(targetAddr);
    if (pickerMapRef.current && pickerMarkerRef.current) {
      pickerMapRef.current.flyTo({ center: [targetLng, targetLat], zoom: 14 });
      pickerMarkerRef.current.setLngLat([targetLng, targetLat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newId = `ISSUE-${priorityResult.level.toUpperCase().slice(0, 4)}-${Date.now().toString().slice(-4)}`;

    const newIssue: IssueItem = {
      id: newId,
      title: title.trim() || `${CATEGORY_LABELS[category]} at ${area}`,
      description: description.trim() || `Reported ${CATEGORY_LABELS[category]} requiring inspection and triage.`,
      category,
      categoryLabel: CATEGORY_LABELS[category],
      status: 'reported',
      location: {
        address,
        area,
        pincode,
        city,
        lat,
        lng
      },
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: selectedPhoto,
      factors,
      priority: priorityResult,
      resources: resourceResult,
      reportedBy: reporterName,
      reporterContact,
      votes: factors.citizenReportCount
    };

    onIssueAdded(newIssue);
    setCreatedIssue(newIssue);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Register New Urban Issue
              </h2>
              <p className="text-xs text-slate-400">
                Spatial pin geocoding + Transparent AI priority scoring engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {createdIssue ? (
            /* Success confirmation screen */
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase mb-2 ${
                  createdIssue.priority.level === 'critical'
                    ? 'bg-rose-500 text-slate-950'
                    : createdIssue.priority.level === 'high'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-emerald-400 text-slate-950'
                }`}>
                  Triage Grade: {createdIssue.priority.level} (Score {createdIssue.priority.score}/100)
                </span>
                <h3 className="text-xl font-bold text-white">{createdIssue.title}</h3>
                <p className="text-sm text-slate-300 mt-1 max-w-lg mx-auto">
                  Successfully registered into municipal queue with ID <strong className="text-cyan-400 font-mono">{createdIssue.id}</strong>.
                </p>
              </div>

              {/* Resource estimates recap */}
              <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">AI Budget Estimate</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    {createdIssue.resources.currencySymbol}{createdIssue.resources.estimatedBudget.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">Worker Requirement</div>
                  <div className="text-lg font-bold text-amber-400">
                    {createdIssue.resources.workerCount} Crew Members
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    onViewOnMap(createdIssue);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg hover:brightness-110 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>View Pin on Priority Map</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700"
                >
                  Done &amp; Return
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* SECTION 1: INTERACTIVE MAP LOCATION SELECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>Select Location via Interactive Map Pin</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {isGeocoding ? 'Detecting address...' : 'Click map or drag pin to capture coordinates'}
                  </span>
                </div>

                {/* Mapbox container for location picking */}
                <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
                  <div ref={mapContainerRef} className="w-full h-full" />
                  
                  {/* Floating helper overlay */}
                  <div className="absolute top-2 left-2 z-10 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-cyan-300 font-mono flex items-center gap-1.5 shadow">
                    <Navigation className="w-3 h-3 text-cyan-400 animate-spin" />
                    <span>Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}</span>
                  </div>
                </div>

                {/* Quick Area Presets for Jaipur and Near Area */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-slate-400 font-medium">Quick Jaipur Localities:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetLocation(26.8986, 75.8142, 'SMS Hospital / Ashok Nagar', '302015', 'Tonk Road Corridor')}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                  >
                    SMS Hospital (302015)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetLocation(26.8835, 75.8175, 'JLN Marg / Bapu Nagar', '302004', 'Near Rajasthan University')}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                  >
                    JLN Marg (302004)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetLocation(26.8532, 75.7685, 'Mansarovar', '302020', 'Madhyam Marg Sector 7')}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                  >
                    Mansarovar (302020)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetLocation(26.9078, 75.7420, 'Vaishali Nagar', '302021', 'Queens Road / Ajmer Bypass')}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                  >
                    Vaishali Nagar (302021)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetLocation(26.9239, 75.8267, 'Walled Heritage City', '302003', 'Badi Chaupar / Johari Bazar')}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                  >
                    Badi Chaupar (302003)
                  </button>
                </div>

                {/* Captured Location Fields (User Editable) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Captured Area / Locality</label>
                    <input
                      type="text"
                      required
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Postal Pincode</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-cyan-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Street / Landmark Address</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ISSUE METADATA & CATEGORY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Issue Headline / Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Major Subgrade Cave-in on School Lane"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Category Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Infrastructure Domain Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IssueCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {(Object.keys(CATEGORY_LABELS) as IssueCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Detailed Operational Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe dimensions, public hazards, surface integrity or road blockage..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* SECTION 3: TRANSPARENT AI PRIORITY ENGINE INPUTS & LIVE GAUGES */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                      AI Priority &amp; Budget Engine
                    </h3>
                  </div>

                  {/* Gemini AI Auto-Estimate Action Button */}
                  <button
                    type="button"
                    disabled={isAiEstimating}
                    onClick={handleEstimateWithAi}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiEstimating ? 'animate-spin' : ''}`} />
                    <span>{isAiEstimating ? 'Estimating with Gemini AI...' : 'Estimate Amount & Severity with AI'}</span>
                  </button>
                </div>

                {/* AI Assessment Note Banner if available */}
                {aiAssessmentNote && (
                  <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-700/60 text-xs text-indigo-200 flex items-start gap-2.5 animate-in fade-in">
                    <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-cyan-300">Gemini AI Civil Engineering Assessment:</div>
                      <p className="text-slate-300 mt-0.5">{aiAssessmentNote}</p>
                    </div>
                  </div>
                )}

                {/* Live Output Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-900 rounded-xl border border-slate-700/60 items-center">
                  
                  {/* Score & Tier Badge */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-slate-950 shadow-md ${
                      priorityResult.level === 'critical'
                        ? 'bg-rose-500 ring-2 ring-rose-400'
                        : priorityResult.level === 'high'
                        ? 'bg-amber-400 ring-2 ring-amber-300'
                        : 'bg-emerald-400 ring-2 ring-emerald-300'
                    }`}>
                      <span className="text-base leading-none">{priorityResult.score}</span>
                      <span className="text-[8px] uppercase">{priorityResult.level}</span>
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-200 uppercase tracking-tight">
                        Calculated Priority Tier
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {priorityResult.level === 'critical'
                          ? 'Immediate Hazard Dispatch'
                          : priorityResult.level === 'high'
                          ? 'High Priority Queue'
                          : 'Standard Maintenance'}
                      </div>
                    </div>
                  </div>

                  {/* Budget Projection */}
                  <div className="border-l sm:border-slate-800 sm:pl-3">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-cyan-400" />
                      <span>Estimated Repair Budget</span>
                    </div>
                    <div className="text-lg font-bold text-cyan-400 font-mono">
                      {resourceResult.currencySymbol}{resourceResult.estimatedBudget.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Worker Projection */}
                  <div className="border-l sm:border-slate-800 sm:pl-3">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-400" />
                      <span>Workforce Needed</span>
                    </div>
                    <div className="text-base font-bold text-amber-300">
                      {resourceResult.workerCount} Crew Members <span className="text-xs text-slate-400">({resourceResult.estimatedHours}h)</span>
                    </div>
                  </div>

                </div>

                {/* Real-time factor sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 pt-1 text-xs">
                  
                  {/* Severity Slider */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="font-semibold">Structural Hazard Severity (35% weight)</span>
                      <span className="text-cyan-400 font-mono font-bold">{factors.severityWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={factors.severityWeight}
                      onChange={(e) => setFactors({ ...factors, severityWeight: Number(e.target.value) })}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Traffic Impact Slider */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="font-semibold">Traffic Volume &amp; Disruption (25% weight)</span>
                      <span className="text-cyan-400 font-mono font-bold">{factors.trafficImpact}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={factors.trafficImpact}
                      onChange={(e) => setFactors({ ...factors, trafficImpact: Number(e.target.value) })}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Proximity Slider */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="font-semibold">Proximity to Hospitals/Schools (20% weight)</span>
                      <span className="text-cyan-400 font-mono font-bold">{factors.vulnerabilityScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={factors.vulnerabilityScore}
                      onChange={(e) => setFactors({ ...factors, vulnerabilityScore: Number(e.target.value) })}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Weather Risk Slider */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="font-semibold">Monsoon &amp; Flood Susceptibility (10% weight)</span>
                      <span className="text-cyan-400 font-mono font-bold">{factors.weatherRisk}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={factors.weatherRisk}
                      onChange={(e) => setFactors({ ...factors, weatherRisk: Number(e.target.value) })}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Citizen Reports */}
                  <div className="sm:col-span-2">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="font-semibold">People Who Issued This Problem (10% weight)</span>
                      <span className="text-amber-400 font-mono font-bold">{factors.citizenReportCount} Citizens Issued</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={factors.citizenReportCount}
                      onChange={(e) => setFactors({ ...factors, citizenReportCount: Number(e.target.value) })}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                </div>

              </div>

              {/* SECTION 4: CIVIC PHOTO SELECTION */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Attach Field Verification Photo</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_SAMPLE_PHOTOS.map((photo) => (
                    <button
                      type="button"
                      key={photo.name}
                      onClick={() => setSelectedPhoto(photo.url)}
                      className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all ${
                        selectedPhoto === photo.url
                          ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg'
                          : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-18 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[10px] font-bold text-white leading-tight">
                          {photo.name}
                        </span>
                      </div>
                      {selectedPhoto === photo.url && (
                        <div className="absolute top-1 right-1 bg-cyan-500 text-slate-950 rounded-full p-0.5 shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
                >
                  Submit &amp; Inject to Municipal Queue
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
};
