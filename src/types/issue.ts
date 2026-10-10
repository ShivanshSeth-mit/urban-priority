export type PriorityLevel = 'critical' | 'high' | 'low';

export type IssueCategory = 
  | 'pothole_road'
  | 'water_burst'
  | 'drainage_sewage'
  | 'electrical_lighting'
  | 'bridge_structural'
  | 'garbage_sanitation';

export type IssueStatus = 'reported' | 'triaged' | 'dispatched' | 'in_progress' | 'resolved';

export interface LocationData {
  address: string;
  area: string;
  pincode: string;
  city: string;
  lat: number;
  lng: number;
}

export interface ScoreFactors {
  severityWeight: number;      // 0 - 100
  trafficImpact: number;       // 0 - 100
  vulnerabilityScore: number;  // 0 - 100 (proximity to schools, hospitals, transit)
  weatherRisk: number;         // 0 - 100 (waterlogging / flood zone)
  citizenReportCount: number;  // raw count
}

export interface PriorityBreakdown {
  score: number; // 0 - 100
  level: PriorityLevel;
  severityScore: number;
  trafficScore: number;
  proximityScore: number;
  weatherRiskScore: number;
  publicDemandScore: number;
  reasons: string[];
}

export interface ResourceEstimate {
  estimatedBudget: number;       // In currency (e.g. ₹ or $)
  currencySymbol: string;
  estimatedHours: number;
  workerCount: number;
  workerRoles: { role: string; count: number }[];
  equipmentNeeded: string[];
}

export interface IssueItem {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  categoryLabel: string;
  status: IssueStatus;
  location: LocationData;
  reportedAt: string;
  updatedAt: string;
  imageUrl?: string;
  factors: ScoreFactors;
  priority: PriorityBreakdown;
  resources: ResourceEstimate;
  reportedBy: string;
  reporterContact?: string;
  votes: number;
}
