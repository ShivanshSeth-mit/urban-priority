export interface AiEstimationResult {
  severityWeight: number;
  estimatedBudget: number;
  currencySymbol: string;
  workerCount: number;
  workerRoles: { role: string; count: number }[];
  estimatedHours: number;
  equipmentNeeded: string[];
  riskAnalysis: string;
  urgencyTier: 'critical' | 'high' | 'low';
  mitigationSteps?: string[];
}

/**
 * Client helper to call server-side Gemini 3.8 Flash model
 * to estimate the severity rating and budget amount (in ₹) for an issue.
 */
export async function estimateIssueWithAI(params: {
  title: string;
  description: string;
  category: string;
  categoryLabel?: string;
  location: { address: string; area: string; pincode: string; city: string; lat?: number; lng?: number };
  trafficImpact?: number;
  vulnerabilityScore?: number;
  weatherRisk?: number;
  citizenReportCount?: number;
}): Promise<AiEstimationResult> {
  const response = await fetch('/api/ai/estimate-issue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.data) {
    throw new Error('No data received from AI engine');
  }

  return result.data;
}
