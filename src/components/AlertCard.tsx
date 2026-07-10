/**
 * AlertCard — the "Notice + Escalate" humorphic pattern.
 *
 * Surfaces what Sentinel detected, its reasoning chain, and the vulnerable
 * population note. Expandable to reveal response actions (ConsentAction).
 */

import { useState } from "react";
import {
  AlertTriangle,
  Baby,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  HeartPulse,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConsentAction } from "@/components/ConsentAction";
import { cn } from "@/lib/utils";
import {
  type OutbreakAlert,
  type ResponseAction,
  getRegionById,
  getCaseReportByRegion,
} from "@/data/mock-outbreak";

interface AlertCardProps {
  alert: OutbreakAlert;
  actions: ResponseAction[];
  onApprove: (actionId: string) => void;
  onDecline: (actionId: string) => void;
  onAcknowledge: (alertId: string) => void;
}

const SEVERITY_CONFIG = {
  critical: {
    label: "Critical",
    badgeClass: "bg-red-600 text-white",
    borderClass: "border-red-300 ring-1 ring-red-200",
    iconClass: "text-red-600",
    dotClass: "bg-red-500",
  },
  warning: {
    label: "Warning",
    badgeClass: "bg-amber-500 text-white",
    borderClass: "border-amber-200 ring-1 ring-amber-100",
    iconClass: "text-amber-600",
    dotClass: "bg-amber-400",
  },
  watch: {
    label: "Watch",
    badgeClass: "bg-blue-500 text-white",
    borderClass: "border-blue-200",
    iconClass: "text-blue-500",
    dotClass: "bg-blue-400",
  },
} as const;

function formatMinutesAgo(m: number): string {
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${h}h ago`;
  return `${h}h ${rem}m ago`;
}

export function AlertCard({
  alert,
  actions,
  onApprove,
  onDecline,
  onAcknowledge,
}: AlertCardProps) {
  const [expanded, setExpanded] = useState(alert.severity === "critical");

  const cfg = SEVERITY_CONFIG[alert.severity];
  const region = getRegionById(alert.regionId);
  const caseReport = getCaseReportByRegion(alert.regionId);
  const pendingActions = actions.filter((a) => a.status === "pending");
  const isNew = alert.status === "new";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border bg-card shadow-sm overflow-hidden",
        cfg.borderClass,
      )}
    >
      {/* Top bar */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {/* Pulsing dot for new critical alerts */}
        <div className="relative mt-1 shrink-0">
          <span className={cn("block size-2.5 rounded-full", cfg.dotClass)} />
          {isNew && alert.severity === "critical" && (
            <span
              className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-60",
                cfg.dotClass,
              )}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge className={cn("text-[10px] uppercase tracking-wider shrink-0", cfg.badgeClass)}>
              {cfg.label}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-medium">
              {alert.disease}
            </Badge>
            {isNew && (
              <Badge variant="secondary" className="text-[10px] font-medium">
                New
              </Badge>
            )}
          </div>

          <p className="text-sm font-semibold leading-snug text-foreground">
            {alert.headline}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {region && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {region.name}, {region.country}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatMinutesAgo(alert.minutesAgo)}
            </span>
            {caseReport && (
              <span className="flex items-center gap-1">
                <TrendingUp className="size-3" />
                +{caseReport.weeklyChangePct}% this week
              </span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
      </div>

      {/* Stats row — always visible */}
      {caseReport && (
        <div className="mx-4 mb-3 grid grid-cols-3 gap-2">
          <StatPill
            label="Total cases"
            value={caseReport.totalCases.toLocaleString()}
            sub={`+${caseReport.newCases} today`}
          />
          <StatPill
            label="Deaths"
            value={caseReport.deaths.toLocaleString()}
            sub={`${((caseReport.deaths / caseReport.totalCases) * 100).toFixed(1)}% CFR`}
            highlight={caseReport.deaths / caseReport.totalCases > 0.01}
          />
          <StatPill
            label="Under-5 cases"
            value={caseReport.casesUnder5.toLocaleString()}
            sub={`${Math.round((caseReport.casesUnder5 / caseReport.totalCases) * 100)}% of total`}
            highlight
          />
        </div>
      )}

      {/* Expanded: Sentinel's reasoning + vulnerable note + actions */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <Separator />
            <div className="p-4 space-y-4">
              {/* Sentinel's observation */}
              <section>
                <SectionLabel icon={<Eye className="size-3.5" />} label="What Sentinel noticed" />
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {alert.observation}
                </p>
              </section>

              {/* Reasoning */}
              <section>
                <SectionLabel icon={<HeartPulse className="size-3.5" />} label="Why this is urgent" />
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {alert.reasoning}
                </p>
              </section>

              {/* Vulnerable population note */}
              {alert.vulnerableNote && (
                <div className="rounded-lg border border-fuego-200 bg-fuego-50 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Baby className="size-3.5 text-fuego-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-fuego-700">
                      Vulnerable populations
                    </span>
                  </div>
                  <p className="text-xs text-fuego-900 leading-relaxed">
                    {alert.vulnerableNote}
                  </p>
                </div>
              )}

              {/* Consent actions */}
              {actions.length > 0 && (
                <section>
                  <SectionLabel
                    icon={<AlertTriangle className="size-3.5" />}
                    label={`Response actions (${pendingActions.length} pending your decision)`}
                  />
                  <div className="mt-2 space-y-3">
                    {actions.map((action) => (
                      <ConsentAction
                        key={action.id}
                        action={action}
                        onApprove={onApprove}
                        onDecline={onDecline}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Acknowledge button for new alerts with no actions */}
              {isNew && actions.length === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAcknowledge(alert.id)}
                >
                  Acknowledge
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Acknowledge strip on collapsed new alerts */}
      {!expanded && isNew && (
        <div className="border-t px-4 py-2 flex justify-end">
          <Button
            size="xs"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => onAcknowledge(alert.id)}
          >
            Acknowledge
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        highlight ? "border-fuego-200 bg-fuego-50" : "border-border bg-secondary/50",
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground truncate">
        {label}
      </p>
      <p className={cn("text-base font-bold tabular-nums", highlight ? "text-fuego-700" : "text-foreground")}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
    </div>
  );
}

function SectionLabel({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {icon}
      {label}
    </div>
  );
}
