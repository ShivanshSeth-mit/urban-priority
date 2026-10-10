import { IssueCategory, PriorityBreakdown, PriorityLevel, ResourceEstimate, ScoreFactors } from '../types/issue';

export const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2hpdmFuc2hiZWFzdDUyIiwiYSI6ImNtdjFhdDF4dDAzNXQyd3F5NzZ0Y2owZTYifQ.bPit2JcI1x9gls5lyiMU8A';

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  pothole_road: 'Pothole & Road Damage',
  water_burst: 'Water Pipeline Burst',
  drainage_sewage: 'Sewage Overflow & Drainage',
  electrical_lighting: 'Electrical Hazard / Outage',
  bridge_structural: 'Structural / Bridge Crack',
  garbage_sanitation: 'Sanitation & Solid Waste'
};

export const CATEGORY_ICONS: Record<IssueCategory, string> = {
  pothole_road: '🚧',
  water_burst: '💧',
  drainage_sewage: '⚠️',
  electrical_lighting: '⚡',
  bridge_structural: '🌉',
  garbage_sanitation: '🗑️'
};

/**
 * Transparent AI-style Multi-Factor Priority Scoring Engine
 * Formula:
 * Final Score (0 - 100) =
 *   (Severity × 0.35) +
 *   (Traffic Impact × 0.25) +
 *   (Vulnerability / Proximity × 0.20) +
 *   (Weather / Environmental Risk × 0.10) +
 *   (Public Demand Scaled × 0.10)
 */
export function calculatePriorityScore(
  category: IssueCategory,
  factors: ScoreFactors,
  weights = {
    severity: 0.35,
    traffic: 0.25,
    proximity: 0.20,
    weather: 0.10,
    publicDemand: 0.10
  }
): PriorityBreakdown {
  // Normalize public demand (reports) from 0 to 100 (cap at 50 reports = 100)
  const normalizedDemand = Math.min(100, Math.round((factors.citizenReportCount / 50) * 100));

  const severityPart = Math.round(factors.severityWeight * weights.severity);
  const trafficPart = Math.round(factors.trafficImpact * weights.traffic);
  const proximityPart = Math.round(factors.vulnerabilityScore * weights.proximity);
  const weatherPart = Math.round(factors.weatherRisk * weights.weather);
  const demandPart = Math.round(normalizedDemand * weights.publicDemand);

  const rawScore = severityPart + trafficPart + proximityPart + weatherPart + demandPart;
  const clampedScore = Math.max(5, Math.min(99, rawScore));

  let level: PriorityLevel = 'low';
  if (clampedScore >= 75) {
    level = 'critical';
  } else if (clampedScore >= 45) {
    level = 'high';
  } else {
    level = 'low';
  }

  // Derive human-understandable audit reasons
  const reasons: string[] = [];

  if (factors.severityWeight >= 70) {
    reasons.push(`High structural hazard rating (${factors.severityWeight}%) requiring immediate containment`);
  }
  if (factors.trafficImpact >= 75) {
    reasons.push(`Located on high-throughput arterial corridor; major risk of traffic bottleneck`);
  } else if (factors.trafficImpact >= 45) {
    reasons.push(`Moderate vehicular flow disruption during peak commute`);
  }
  if (factors.vulnerabilityScore >= 70) {
    reasons.push(`High vulnerability zone: within 300m of emergency services, hospitals, or schools`);
  }
  if (factors.weatherRisk >= 60) {
    reasons.push(`Monsoon flood hazard: high probability of rapid erosion or waterlogging`);
  }
  if (factors.citizenReportCount >= 10) {
    reasons.push(`Community escalation: ${factors.citizenReportCount} citizen verification reports recorded`);
  }

  if (reasons.length === 0) {
    reasons.push('Standard municipal priority queue based on localized low-impact rating');
  }

  return {
    score: clampedScore,
    level,
    severityScore: severityPart,
    trafficScore: trafficPart,
    proximityScore: proximityPart,
    weatherRiskScore: weatherPart,
    publicDemandScore: demandPart,
    reasons
  };
}

/**
 * Heuristic Resource Estimator: Calculates estimated budget & worker count
 * Based on category baseline + severity scaling
 */
export function estimateResources(
  category: IssueCategory,
  score: number,
  severityWeight: number
): ResourceEstimate {
  // Base rates in INR (₹)
  const categoryBase: Record<IssueCategory, { baseCost: number; baseWorkers: number; hours: number; roles: string[]; equipment: string[] }> = {
    pothole_road: {
      baseCost: 18000,
      baseWorkers: 3,
      hours: 12,
      roles: ['Road Patch Technician', 'Asphalt Spreader', 'Traffic Flagger'],
      equipment: ['Mini Roller Compactor', 'Bitumen Sprayer', 'Safety Cones']
    },
    water_burst: {
      baseCost: 35000,
      baseWorkers: 4,
      hours: 18,
      roles: ['Hydraulic Pipe Welder', 'Excavation Operator', 'Plumbing Tech', 'Dewatering Tech'],
      equipment: ['Submersible Mud Pump', 'Mini Excavator (JCB)', 'Pipe Pressure Tester']
    },
    drainage_sewage: {
      baseCost: 28000,
      baseWorkers: 4,
      hours: 14,
      roles: ['Sanitation Tech', 'Drain Desilting Specialist', 'Safety Marshal', 'Driver'],
      equipment: ['Super Sucker Jetting Machine', 'Gas Detector Unit', 'Sludge Tanker']
    },
    electrical_lighting: {
      baseCost: 15000,
      baseWorkers: 2,
      hours: 8,
      roles: ['High-Voltage Lineman', 'Electrical Inspector'],
      equipment: ['Hydraulic Sky-lift Truck', 'Insulated Boom Arm', 'Digital Multimeter']
    },
    bridge_structural: {
      baseCost: 85000,
      baseWorkers: 6,
      hours: 36,
      roles: ['Structural Engineer', 'Reinforced Concrete Mason', 'Welder', 'Scaffolding Crew', 'Site Safety Officer', 'Surveyor'],
      equipment: ['Ultrasonic Crack Detector', 'Hydraulic Jacking Unit', 'Safety Net Rig']
    },
    garbage_sanitation: {
      baseCost: 12000,
      baseWorkers: 3,
      hours: 6,
      roles: ['Sanitation Worker', 'Tipper Driver', 'Vector Control Specialist'],
      equipment: ['Compactor Truck', 'Disinfectant Fogger', 'Mechanical Sweeper']
    }
  };

  const config = categoryBase[category] || categoryBase.pothole_road;
  const multiplier = 0.6 + (score / 100) * 0.9; // 0.6x to 1.5x
  
  const estimatedBudget = Math.round((config.baseCost * multiplier) / 500) * 500;
  const workerCount = Math.max(2, Math.round(config.baseWorkers * (0.8 + (severityWeight / 100) * 0.6)));
  const estimatedHours = Math.round(config.hours * (0.7 + (score / 100) * 0.7));

  // Role distribution
  const workerRoles = config.roles.slice(0, workerCount).map((role, idx) => ({
    role,
    count: idx === 0 ? Math.ceil(workerCount / config.roles.length) : 1
  }));

  return {
    estimatedBudget,
    currencySymbol: '₹',
    estimatedHours,
    workerCount,
    workerRoles,
    equipmentNeeded: config.equipment
  };
}

/**
 * Reverse geocode a latitude & longitude using Mapbox Geocoding API
 * Falls back to estimated realistic address if offline or token limit reached
 */
export async function reverseGeocodeMapbox(lat: number, lng: number): Promise<{ address: string; area: string; pincode: string; city: string }> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,poi,neighborhood,postcode,place`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      let address = data.features[0].place_name || `Near Coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      let area = 'Metropolitan Sector';
      let pincode = '110001';
      let city = 'Urban Metro';

      // Parse context hierarchy
      for (const feat of data.features) {
        if (feat.place_type.includes('neighborhood') || feat.place_type.includes('locality')) {
          area = feat.text;
        }
        if (feat.place_type.includes('postcode')) {
          pincode = feat.text;
        }
        if (feat.place_type.includes('place')) {
          city = feat.text;
        }
      }

      // Check context array on top feature
      const topContext = data.features[0].context || [];
      for (const ctx of topContext) {
        if (ctx.id?.startsWith('postcode')) pincode = ctx.text;
        if (ctx.id?.startsWith('neighborhood')) area = ctx.text;
        if (ctx.id?.startsWith('place')) city = ctx.text;
      }

      return {
        address: address.split(',')[0] || address,
        area: area || 'Sector Corridor',
        pincode: pincode || '302015',
        city: city || 'Jaipur'
      };
    }
  } catch (err) {
    console.warn('Mapbox reverse geocoding fallback triggered:', err);
  }

  // Graceful heuristic fallback based on coords
  return {
    address: `Point [${lat.toFixed(4)}, ${lng.toFixed(4)}] Road Junction`,
    area: `Jaipur Ward ${Math.floor((Math.abs(lat * 100)) % 50) + 1}`,
    pincode: `3020${(Math.floor((Math.abs(lng * 100)) % 30) + 10).toString().padStart(2, '0')}`,
    city: 'Jaipur'
  };
}
