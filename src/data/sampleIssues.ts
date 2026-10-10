import { IssueItem } from '../types/issue';
import { calculatePriorityScore, estimateResources } from '../utils/priorityEngine';

/**
 * Three core sample issue markers specifically set for Jaipur & near areas:
 * 1. Red Critical (Score 92) - High-Pressure Water Main Rupture & Subgrade Void on Tonk Road near SMS Hospital
 * 2. Yellow High (Score 64) - Severe Pothole Cluster on JLN Marg near University of Rajasthan & Malviya Nagar
 * 3. Green Low (Score 28) - Streetlight Intermittent Fault & Minor Sidewalk Kerb in Mansarovar
 * Plus authentic supplemental issues in Vaishali Nagar, Walled Heritage City, and Jagatpura.
 */

const baseSampleData = [
  {
    id: 'JPR-CRIT-001',
    title: 'High-Pressure PHED Water Main Rupture & Subgrade Cave-in',
    description: '400mm Public Health Engineering Dept (PHED) ductile water line burst under heavy morning pressure. Water flooding 4 lanes of Tonk Road with active soil subsidence causing a 1.8m deep void. Severe hazard to SMS Hospital emergency ambulance corridor.',
    category: 'water_burst' as const,
    categoryLabel: 'Water Pipeline Burst',
    status: 'dispatched' as const,
    location: {
      address: 'Tonk Road Junction, Opposite SMS Medical College & Hospital',
      area: 'Ashok Nagar / SMS Hospital Corridor',
      pincode: '302015',
      city: 'Jaipur',
      lat: 26.8986,
      lng: 75.8142
    },
    reportedAt: '2026-10-09T08:15:00Z',
    updatedAt: '2026-10-09T10:45:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=800&q=80',
    factors: {
      severityWeight: 95,
      trafficImpact: 92,
      vulnerabilityScore: 94, // Next to SMS Hospital
      weatherRisk: 70,
      citizenReportCount: 42
    },
    reportedBy: 'Jaipur Municipal Corp (JMC Heritage) Field Unit 2',
    reporterContact: '+91 94140-XXXXX',
    votes: 46
  },
  {
    id: 'JPR-HIGH-002',
    title: 'Severe Multi-Pothole Cluster on JLN Marg Arterial Corridor',
    description: 'Cluster of 5 deep potholes (depth 18-25cm) spanning 16 meters near University gate. Peak commute traffic and student buses forced into single-lane congestion with multiple two-wheeler skid hazards.',
    category: 'pothole_road' as const,
    categoryLabel: 'Pothole & Road Damage',
    status: 'triaged' as const,
    location: {
      address: 'JLN Marg, Near University of Rajasthan Main Gate',
      area: 'Bapu Nagar / JLN Marg',
      pincode: '302004',
      city: 'Jaipur',
      lat: 26.8835,
      lng: 75.8175
    },
    reportedAt: '2026-10-09T09:30:00Z',
    updatedAt: '2026-10-09T11:10:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    factors: {
      severityWeight: 68,
      trafficImpact: 76,
      vulnerabilityScore: 68, // Adjacent to major university campus
      weatherRisk: 42,
      citizenReportCount: 22
    },
    reportedBy: 'Devendra Shekhawat (Citizen Vigilance)',
    reporterContact: '+91 98290-XXXXX',
    votes: 29
  },
  {
    id: 'JPR-LOW-003',
    title: 'Intermittent LED Streetlight Pole & Sidewalk Paver Displacement',
    description: 'Municipal streetlight pole #MSR-18 flickering intermittently after 10 PM. Minor paver block displacement on sidewalk edge with zero roadway traffic hindrance.',
    category: 'electrical_lighting' as const,
    categoryLabel: 'Electrical Hazard / Outage',
    status: 'reported' as const,
    location: {
      address: 'Madhyam Marg, Sector 7 Market Corner',
      area: 'Mansarovar',
      pincode: '302020',
      city: 'Jaipur',
      lat: 26.8532,
      lng: 75.7685
    },
    reportedAt: '2026-10-08T18:40:00Z',
    updatedAt: '2026-10-08T18:40:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    factors: {
      severityWeight: 26,
      trafficImpact: 16,
      vulnerabilityScore: 22,
      weatherRisk: 12,
      citizenReportCount: 4
    },
    reportedBy: 'Sunita Sharma (Mansarovar RWA)',
    reporterContact: '+91 94142-XXXXX',
    votes: 5
  },
  {
    id: 'JPR-CRIT-004',
    title: 'Open Heavy Stormwater Drain Sump Collapse at Ajmer Road Bypass',
    description: 'Concrete inspection slab over primary stormwater culvert caved in near Queens Road intersection. Uncovered 3.4m drop obscured by monsoon runoff with severe hazard to vehicular and two-wheeler traffic.',
    category: 'drainage_sewage' as const,
    categoryLabel: 'Sewage Overflow & Drainage',
    status: 'dispatched' as const,
    location: {
      address: 'Queens Road Crossing, Near 200 Feet Ajmer Bypass',
      area: 'Vaishali Nagar',
      pincode: '302021',
      city: 'Jaipur',
      lat: 26.9078,
      lng: 75.7420
    },
    reportedAt: '2026-10-09T07:15:00Z',
    updatedAt: '2026-10-09T09:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    factors: {
      severityWeight: 93,
      trafficImpact: 84,
      vulnerabilityScore: 82,
      weatherRisk: 86,
      citizenReportCount: 34
    },
    reportedBy: 'JDA Patrol Squad (West Division)',
    reporterContact: '+91 98292-XXXXX',
    votes: 38
  },
  {
    id: 'JPR-HIGH-005',
    title: 'Heritage Drainage Chokage & Commercial Waste Overflow',
    description: 'Solid commercial packaging and debris clogging historic masonry stormwater channel outside Badi Chaupar, causing dirty backflow onto pedestrian bazaar footpaths.',
    category: 'garbage_sanitation' as const,
    categoryLabel: 'Sanitation & Solid Waste',
    status: 'in_progress' as const,
    location: {
      address: 'Badi Chaupar Heritage Market, Near Hawa Mahal Corridor',
      area: 'Johari Bazar / Walled City',
      pincode: '302003',
      city: 'Jaipur',
      lat: 26.9239,
      lng: 75.8267
    },
    reportedAt: '2026-10-09T06:30:00Z',
    updatedAt: '2026-10-09T10:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    factors: {
      severityWeight: 60,
      trafficImpact: 58,
      vulnerabilityScore: 66,
      weatherRisk: 68,
      citizenReportCount: 18
    },
    reportedBy: 'Walled City Merchant Union',
    reporterContact: '+91 94144-XXXXX',
    votes: 21
  },
  {
    id: 'JPR-LOW-006',
    title: 'Minor Edge Erosion on Service Lane near Jagatpura Flyover',
    description: 'Subgrade settling along 4 meters of service lane curb. No impact to main carriage-way of the Jagatpura railway overbridge.',
    category: 'pothole_road' as const,
    categoryLabel: 'Pothole & Road Damage',
    status: 'reported' as const,
    location: {
      address: 'Railway Overbridge Service Lane, Near Jagatpura Station',
      area: 'Jagatpura',
      pincode: '302017',
      city: 'Jaipur',
      lat: 26.8320,
      lng: 75.8450
    },
    reportedAt: '2026-10-08T14:20:00Z',
    updatedAt: '2026-10-08T14:20:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    factors: {
      severityWeight: 28,
      trafficImpact: 20,
      vulnerabilityScore: 25,
      weatherRisk: 18,
      citizenReportCount: 5
    },
    reportedBy: 'Kunal Meena (Resident)',
    reporterContact: '+91 97850-XXXXX',
    votes: 6
  }
];

export const INITIAL_ISSUES: IssueItem[] = baseSampleData.map((item) => {
  const priority = calculatePriorityScore(item.category, item.factors);
  const resources = estimateResources(item.category, priority.score, item.factors.severityWeight);
  return {
    ...item,
    priority,
    resources
  };
});
