/**
 * Mock outbreak data for the Outbreak Intelligence Dashboard.
 *
 * Simulates a disease surveillance system monitoring regions across sub-Saharan
 * Africa. The AI teammate "Sentinel" watches these signals and surfaces clusters,
 * escalations, and response actions.
 *
 * High-risk populations: children under 5, pregnant women.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertSeverity = "watch" | "warning" | "critical";
export type AlertStatus = "new" | "acknowledged" | "actioned" | "resolved";
export type RegionRisk = "low" | "moderate" | "high" | "critical";
export type ActionStatus = "pending" | "approved" | "declined";

export interface Region {
  id: string;
  name: string;
  country: string;
  population: number;
  /** Estimated children under 5 in the region */
  childrenUnder5: number;
  /** Estimated pregnant women in the region */
  pregnantWomen: number;
  risk: RegionRisk;
  /** Latitude / longitude for display labels */
  lat: number;
  lng: number;
}

export interface CaseReport {
  id: string;
  regionId: string;
  disease: string;
  /** New cases in the last 24 hours */
  newCases: number;
  /** Total confirmed cases this outbreak */
  totalCases: number;
  /** Deaths this outbreak */
  deaths: number;
  /** Cases in children under 5 */
  casesUnder5: number;
  /** Cases in pregnant women */
  casesPregnant: number;
  /** ISO timestamp of last report */
  reportedAt: string;
  /** Week-over-week change in case count, as a percentage */
  weeklyChangePct: number;
}

export interface OutbreakAlert {
  id: string;
  regionId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  disease: string;
  headline: string;
  /** What Sentinel noticed that triggered this */
  observation: string;
  /** Why this is urgent */
  reasoning: string;
  /** Specific concern about vulnerable populations */
  vulnerableNote: string | null;
  triggeredAt: string;
  /** Minutes ago, kept relative so the UI stays "live" */
  minutesAgo: number;
}

export interface ResponseAction {
  id: string;
  alertId: string;
  label: string;
  description: string;
  /** What will happen if approved */
  impact: string;
  /** Risk of NOT taking this action */
  inactionRisk: string;
  status: ActionStatus;
  /** True = high urgency, confirm before declining */
  urgent: boolean;
}

export interface SentinelMessage {
  id: string;
  content: string;
  /** Links to an alert or action if relevant */
  refAlertId?: string;
  refActionId?: string;
  minutesAgo: number;
  /** If true, Sentinel is still "typing" — used to animate in */
  streaming?: boolean;
}

// ─── Regions ─────────────────────────────────────────────────────────────────

export const mockRegions: Region[] = [
  {
    id: "r1",
    name: "Karamoja",
    country: "Uganda",
    population: 1_200_000,
    childrenUnder5: 240_000,
    pregnantWomen: 54_000,
    risk: "critical",
    lat: 3.5,
    lng: 34.7,
  },
  {
    id: "r2",
    name: "Sahel Belt — Tillabéri",
    country: "Niger",
    population: 890_000,
    childrenUnder5: 198_000,
    pregnantWomen: 40_000,
    risk: "high",
    lat: 14.2,
    lng: 1.5,
  },
  {
    id: "r3",
    name: "North Kivu",
    country: "DRC",
    population: 2_100_000,
    childrenUnder5: 441_000,
    pregnantWomen: 95_000,
    risk: "high",
    lat: -1.0,
    lng: 29.1,
  },
  {
    id: "r4",
    name: "Oromia — West Hararghe",
    country: "Ethiopia",
    population: 740_000,
    childrenUnder5: 155_000,
    pregnantWomen: 33_000,
    risk: "moderate",
    lat: 8.6,
    lng: 41.4,
  },
  {
    id: "r5",
    name: "Diffa",
    country: "Niger",
    population: 610_000,
    childrenUnder5: 128_000,
    pregnantWomen: 27_500,
    risk: "moderate",
    lat: 13.3,
    lng: 12.6,
  },
];

// ─── Case Reports ─────────────────────────────────────────────────────────────

export const mockCaseReports: CaseReport[] = [
  {
    id: "cr1",
    regionId: "r1",
    disease: "Cholera",
    newCases: 214,
    totalCases: 1_847,
    deaths: 63,
    casesUnder5: 741,
    casesPregnant: 98,
    reportedAt: "2026-07-10T06:30:00Z",
    weeklyChangePct: +82,
  },
  {
    id: "cr2",
    regionId: "r2",
    disease: "Meningitis",
    newCases: 47,
    totalCases: 312,
    deaths: 28,
    casesUnder5: 89,
    casesPregnant: 14,
    reportedAt: "2026-07-10T05:00:00Z",
    weeklyChangePct: +34,
  },
  {
    id: "cr3",
    regionId: "r3",
    disease: "Mpox",
    newCases: 131,
    totalCases: 988,
    deaths: 19,
    casesUnder5: 312,
    casesPregnant: 61,
    reportedAt: "2026-07-10T07:15:00Z",
    weeklyChangePct: +57,
  },
  {
    id: "cr4",
    regionId: "r4",
    disease: "Measles",
    newCases: 29,
    totalCases: 203,
    deaths: 4,
    casesUnder5: 178,
    casesPregnant: 6,
    reportedAt: "2026-07-10T04:00:00Z",
    weeklyChangePct: +11,
  },
  {
    id: "cr5",
    regionId: "r5",
    disease: "Acute Watery Diarrhea",
    newCases: 18,
    totalCases: 97,
    deaths: 1,
    casesUnder5: 62,
    casesPregnant: 8,
    reportedAt: "2026-07-10T03:30:00Z",
    weeklyChangePct: +6,
  },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const mockAlerts: OutbreakAlert[] = [
  {
    id: "a1",
    regionId: "r1",
    severity: "critical",
    status: "new",
    disease: "Cholera",
    headline: "Cholera cluster doubling every 4 days — Karamoja, Uganda",
    observation:
      "214 new cases in 24 h. Case velocity has increased 82% week-over-week. Three sub-counties (Kotido, Moroto, Napak) now reporting simultaneously — consistent with a shared water-source event.",
    reasoning:
      "At current doubling rate the cluster will exceed district health system capacity within 6 days. The CFR (3.4%) is above the 1% threshold that triggers WHO emergency classification.",
    vulnerableNote:
      "741 of 1,847 cases (40%) are children under 5. Case-fatality in this cohort is 5.1% — nearly double the overall rate. 98 pregnant women affected; dehydration risk is severe.",
    triggeredAt: "2026-07-10T07:42:00Z",
    minutesAgo: 8,
  },
  {
    id: "a2",
    regionId: "r3",
    severity: "warning",
    status: "new",
    disease: "Mpox",
    headline: "Mpox spreading beyond displacement camps — North Kivu, DRC",
    observation:
      "131 new cases today; first confirmed cases now appearing outside the 3 displacement camps tracked last week, indicating community transmission.",
    reasoning:
      "Cross-camp movement corridors are amplifying spread. Ring vaccination coverage in affected zones is estimated at 34% — well below the 80% threshold needed to interrupt transmission.",
    vulnerableNote:
      "312 of 988 cases (32%) are children under 5, who face higher risk of severe complications. 61 pregnant women confirmed; vertical transmission risk is not yet quantified in this cluster.",
    triggeredAt: "2026-07-10T07:00:00Z",
    minutesAgo: 50,
  },
  {
    id: "a3",
    regionId: "r2",
    severity: "warning",
    status: "acknowledged",
    disease: "Meningitis",
    headline: "Meningitis CFR above epidemic threshold — Tillabéri, Niger",
    observation:
      "CFR has reached 9% (28 deaths / 312 cases). The meningitis belt seasonal window closes in 6 weeks; reactive vaccination is most effective in this window.",
    reasoning:
      "WHO A/C/W/Y vaccine stockpile at the regional depot covers ~60,000 doses. Tillabéri's at-risk population is estimated at 210,000. A targeted campaign needs to start within 72 hours to stay within the window.",
    vulnerableNote:
      "89 cases in children under 5; this age group has the highest risk of permanent neurological sequelae from N. meningitidis.",
    triggeredAt: "2026-07-09T14:00:00Z",
    minutesAgo: 1060,
  },
  {
    id: "a4",
    regionId: "r4",
    severity: "watch",
    status: "new",
    disease: "Measles",
    headline: "Measles cluster detected — West Hararghe, Ethiopia",
    observation:
      "29 new cases today, up from 6 last week. Cases are concentrated in 2 rural kebeles with reported vaccination coverage below 60%.",
    reasoning:
      "Early-stage cluster. At current trajectory this may remain contained if vaccination is accelerated. Monitoring closely.",
    vulnerableNote:
      "178 of 203 cases (88%) are children under 5 — expected for measles, but concentration is high. No pregnant women cases yet flagged but surveillance is incomplete.",
    triggeredAt: "2026-07-10T06:00:00Z",
    minutesAgo: 110,
  },
];

// ─── Response Actions ─────────────────────────────────────────────────────────

export const mockActions: ResponseAction[] = [
  {
    id: "act1",
    alertId: "a1",
    label: "Deploy Emergency WASH Team",
    description:
      "Dispatch a 12-person Water, Sanitation & Hygiene team to Kotido, Moroto, and Napak sub-counties. Estimated on-ground arrival: 18 hours.",
    impact:
      "Chlorination of identified water sources can interrupt the shared-source transmission within 48–72 hours, cutting new case rate by an estimated 60–70%.",
    inactionRisk:
      "Without source control, the outbreak is projected to reach 8,000+ cases by Day 14 and overwhelm the district's 2 functional health facilities.",
    status: "pending",
    urgent: true,
  },
  {
    id: "act2",
    alertId: "a1",
    label: "Pre-position ORS & IV fluids for children",
    description:
      "Release emergency stockpile of 50,000 ORS sachets and 2,000 IV fluid sets from the Kampala buffer stock to Karamoja district hospital.",
    impact:
      "Oral rehydration is the primary life-saving intervention for cholera in children. Current district stock covers ~3 days at current case load.",
    inactionRisk:
      "Stock exhaustion in 3 days. Without resupply, case-fatality in under-5s is expected to rise from 5.1% to 12–15%.",
    status: "pending",
    urgent: true,
  },
  {
    id: "act3",
    alertId: "a2",
    label: "Activate ring vaccination — Mpox",
    description:
      "Initiate ring vaccination protocol for contacts of confirmed Mpox cases outside displacement camps. Request 15,000 additional MVA-BN doses from WHO stockpile.",
    impact:
      "Ring vaccination at 80%+ coverage interrupts transmission chains within 2–3 generations. Community spread can be contained within 3–4 weeks.",
    inactionRisk:
      "At current spread rate, cases will exit containable range within 10–14 days, requiring a mass vaccination response that is 4–6× more resource-intensive.",
    status: "pending",
    urgent: false,
  },
  {
    id: "act4",
    alertId: "a3",
    label: "Launch reactive meningitis vaccination campaign",
    description:
      "Coordinate with Niger MoH and UNICEF to launch a 72-hour reactive vaccination campaign in Tillabéri using available WHO depot stock (~60,000 doses). Prioritize children 2–15.",
    impact:
      "Reactive campaigns during the meningitis belt window reduce attack rates by 70–80% in targeted age groups within 2 weeks.",
    inactionRisk:
      "Missing the seasonal window reduces vaccine effectiveness significantly. Each week of delay narrows the optimal campaign window.",
    status: "pending",
    urgent: false,
  },
];

// ─── Sentinel messages ────────────────────────────────────────────────────────

export const sentinelMessages: SentinelMessage[] = [
  {
    id: "sm1",
    content:
      "Good morning. I've flagged 2 critical situations that need your attention before the 9 AM coordination call.",
    minutesAgo: 10,
  },
  {
    id: "sm2",
    content:
      "Karamoja cholera is accelerating — 82% week-over-week. The cluster pattern matches a shared water-source event. CFR in children under 5 is 5.1%, nearly double the overall rate. I've prepared two response actions for your approval.",
    refAlertId: "a1",
    minutesAgo: 8,
  },
  {
    id: "sm3",
    content:
      "North Kivu mpox has crossed out of displacement camps into the surrounding community. Ring vaccination coverage is 34% — well below what's needed. I'd recommend acting on this within 48 hours before it becomes harder to contain.",
    refAlertId: "a2",
    minutesAgo: 6,
  },
  {
    id: "sm4",
    content:
      "Tillabéri meningitis was acknowledged yesterday. The 72-hour reactive vaccination window is now at 47 hours. I'll re-escalate if no action is taken.",
    refAlertId: "a3",
    minutesAgo: 2,
  },
];

/** Canned Sentinel replies to simulate a live exchange */
export const sentinelReplies: string[] = [
  "Understood. I'll notify the WASH coordinator and flag the supply request as urgent in the logistics system. Estimated confirmation in 2 hours.",
  "Noted. I'll keep monitoring and re-alert if the Karamoja CFR rises above 6% or new sub-counties report cases.",
  "Ring vaccination request drafted and ready to send to WHO stockpile coordination. I'll need your authorization to transmit.",
  "West Hararghe measles is still early-stage. I recommend a community vaccination drive in the 2 affected kebeles within the next 5 days. Want me to draft the deployment plan?",
];

// ─── Derived helpers ───────────────────────────────────────────────────────────

export function getRegionById(id: string): Region | undefined {
  return mockRegions.find((r) => r.id === id);
}

export function getCaseReportByRegion(regionId: string): CaseReport | undefined {
  return mockCaseReports.find((c) => c.regionId === regionId);
}

export function getActionsByAlert(alertId: string): ResponseAction[] {
  return mockActions.filter((a) => a.alertId === alertId);
}

export function severityRank(s: AlertSeverity): number {
  return { critical: 3, warning: 2, watch: 1 }[s];
}
