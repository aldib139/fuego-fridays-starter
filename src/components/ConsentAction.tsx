/**
 * ConsentAction — the "Consent" humorphic pattern.
 *
 * Gates a response action behind an informed human decision. Shows Sentinel's
 * reasoning (impact + inaction risk) before asking for approval or decline.
 * Urgent actions require an extra confirmation step before declining.
 */

import { useState } from "react";
import { CheckCircle2, XCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ResponseAction } from "@/data/mock-outbreak";

interface ConsentActionProps {
  action: ResponseAction;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
}

export function ConsentAction({ action, onApprove, onDecline }: ConsentActionProps) {
  const [confirmingDecline, setConfirmingDecline] = useState(false);

  if (action.status === "approved") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800"
      >
        <CheckCircle2 className="size-4 shrink-0 text-green-600" />
        <span className="font-medium">{action.label}</span>
        <span className="text-green-600">— approved and dispatched</span>
      </motion.div>
    );
  }

  if (action.status === "declined") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground"
      >
        <XCircle className="size-4 shrink-0" />
        <span>{action.label}</span>
        <span>— declined</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm",
        action.urgent && "border-fuego-300 ring-1 ring-fuego-200",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {action.urgent && (
            <Zap className="size-4 shrink-0 text-fuego-500" />
          )}
          <span className="text-sm font-semibold text-foreground">
            {action.label}
          </span>
        </div>
        {action.urgent && (
          <Badge className="shrink-0 bg-fuego-500 text-white text-[10px] uppercase tracking-wider">
            Urgent
          </Badge>
        )}
      </div>

      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {action.description}
      </p>

      {/* Impact / inaction reasoning — Sentinel's "show your work" */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-green-700 mb-1">
            If approved
          </p>
          <p className="text-xs text-green-900 leading-relaxed">{action.impact}</p>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-red-700 mb-1">
            If delayed
          </p>
          <p className="text-xs text-red-900 leading-relaxed">{action.inactionRisk}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex items-center gap-2">
        <Button
          size="sm"
          className="bg-fuego-500 text-white hover:bg-fuego-600 shadow-sm"
          onClick={() => onApprove(action.id)}
        >
          <CheckCircle2 className="size-4" />
          Approve & Dispatch
        </Button>

        <AnimatePresence mode="wait">
          {confirmingDecline ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs text-muted-foreground">
                Are you sure? This is urgent.
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDecline(action.id)}
              >
                Yes, decline
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmingDecline(false)}
              >
                Cancel
              </Button>
            </motion.div>
          ) : (
            <motion.div key="decline" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() =>
                  action.urgent ? setConfirmingDecline(true) : onDecline(action.id)
                }
              >
                Decline
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
