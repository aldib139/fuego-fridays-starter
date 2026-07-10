/**
 * OutbreakDashboard — main shell for the Outbreak Intelligence system.
 *
 * Layout:
 *   Left column  — Sentinel AI feed (Communicate + Notice)
 *   Right column — Alert cards sorted by severity (Escalate + Consent)
 *
 * Sentinel simulates a live AI teammate: messages stream in on mount, and
 * the user can type replies that trigger canned Sentinel responses.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Baby,
  BrainCircuit,
  Send,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

import { AlertCard } from "@/components/AlertCard";

import {
  mockAlerts,
  mockActions,
  mockCaseReports,
  mockRegions,
  sentinelMessages,
  sentinelReplies,
  severityRank,
  type OutbreakAlert,
  type ResponseAction,
} from "@/data/mock-outbreak";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "sentinel";
  content: string;
  streaming?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const totalCases = mockCaseReports.reduce((s, r) => s + r.totalCases, 0);
const totalDeaths = mockCaseReports.reduce((s, r) => s + r.deaths, 0);
const totalUnder5 = mockCaseReports.reduce((s, r) => s + r.casesUnder5, 0);
const totalPregnant = mockCaseReports.reduce((s, r) => s + r.casesPregnant, 0);

// ─── Component ────────────────────────────────────────────────────────────────

export function OutbreakDashboard() {
  // Alert state
  const [alerts, setAlerts] = useState<OutbreakAlert[]>(
    [...mockAlerts].sort((a, b) => severityRank(b.severity) - severityRank(a.severity)),
  );
  const [actions, setActions] = useState<ResponseAction[]>(mockActions);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sentinelTyping, setSentinelTyping] = useState(false);
  const replyIndexRef = useRef(0);

  // Stream Sentinel's opening messages in on mount
  useEffect(() => {
    let cancelled = false;
    sentinelMessages.forEach((msg, i) => {
      setTimeout(() => {
        if (cancelled) return;
        setChatMessages((prev) => [
          ...prev,
          { id: msg.id, role: "sentinel", content: msg.content },
        ]);
      }, i * 900);
    });
    return () => { cancelled = true; };
  }, []);

  // Alert handlers
  function handleAcknowledge(alertId: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "acknowledged" } : a)),
    );
  }

  function handleApprove(actionId: string) {
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: "approved" } : a)),
    );
    // Sentinel reacts
    triggerSentinelReply(
      `Approved. I've dispatched the action and flagged the responding team. I'll report back when I have a status update.`,
    );
  }

  function handleDecline(actionId: string) {
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: "declined" } : a)),
    );
    triggerSentinelReply(
      `Noted — I've logged the decision. I'll continue monitoring and re-escalate if the situation changes.`,
    );
  }

  // Chat handlers
  function triggerSentinelReply(text?: string) {
    setSentinelTyping(true);
    const reply =
      text ?? sentinelReplies[replyIndexRef.current % sentinelReplies.length];
    replyIndexRef.current += 1;

    setTimeout(() => {
      setSentinelTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `s-${Date.now()}`,
          role: "sentinel",
          content: reply,
        },
      ]);
    }, 1400);
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text) return;
    setChatMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text },
    ]);
    setInputValue("");
    triggerSentinelReply();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const criticalCount = alerts.filter((a) => a.severity === "critical" && a.status === "new").length;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-green-600">
              <ShieldAlert className="size-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none tracking-tight">
                Sentinel
              </h1>
              <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                Outbreak Intelligence · Africa Region
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Badge className="bg-red-600 text-white gap-1.5 text-xs">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex size-full rounded-full bg-white opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-white" />
                  </span>
                  {criticalCount} critical
                </Badge>
              </motion.div>
            )}
            <Badge variant="outline" className="text-xs text-muted-foreground hidden sm:inline-flex">
              <Activity className="size-3 mr-1 text-green-500" />
              Live monitoring
            </Badge>
          </div>
        </div>
      </header>

      {/* ── Summary bar ── */}
      <div className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-px sm:grid-cols-4 px-4 sm:px-6">
          <SummaryCell label="Active cases" value={totalCases.toLocaleString()} icon={<Activity className="size-3.5" />} />
          <SummaryCell label="Deaths" value={totalDeaths.toLocaleString()} icon={<ShieldAlert className="size-3.5" />} danger />
          <SummaryCell label="Children under 5" value={totalUnder5.toLocaleString()} icon={<Baby className="size-3.5" />} highlight />
          <SummaryCell label="Pregnant women" value={totalPregnant.toLocaleString()} icon={<Users className="size-3.5" />} highlight />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 overflow-hidden px-0 sm:gap-6 sm:px-6 sm:py-6">

        {/* Left: Sentinel chat feed */}
        <aside className="flex w-full flex-col border-r border-border/60 sm:w-80 sm:shrink-0 sm:rounded-2xl sm:border sm:shadow-sm lg:w-96">
          {/* Chat header */}
          <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3">
            <div className="relative">
              <Avatar size="sm">
                <AvatarFallback className="bg-fuego-100 text-fuego-700 text-xs font-bold">
                  AI
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-green-500 ring-2 ring-background" />
            </div>
            <div>
              <p className="text-xs font-semibold leading-none">Sentinel</p>
              <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                AI Outbreak Analyst
              </p>
            </div>
          </div>

          {/* Message thread */}
          <MessageScrollerProvider>
            <MessageScroller className="flex-1">
              <MessageScrollerViewport>
                <MessageScrollerContent className="gap-4 px-4 py-4">
                  <Marker variant="separator">
                    <MarkerContent>Today · 07:30</MarkerContent>
                  </Marker>

                  {chatMessages.map((msg) => (
                    <MessageScrollerItem key={msg.id} scrollAnchor={false}>
                      {msg.role === "sentinel" ? (
                        <Message align="start">
                          <MessageAvatar>
                            <Avatar size="sm">
                              <AvatarFallback className="bg-fuego-100 text-fuego-700 text-xs font-bold">
                                AI
                              </AvatarFallback>
                            </Avatar>
                          </MessageAvatar>
                          <MessageContent>
                            <MessageHeader>Sentinel</MessageHeader>
                            <Bubble variant="secondary" align="start">
                              <BubbleContent>{msg.content}</BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      ) : (
                        <Message align="end">
                          <MessageContent>
                            <Bubble variant="default" align="end">
                              <BubbleContent>{msg.content}</BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      )}
                    </MessageScrollerItem>
                  ))}

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {sentinelTyping && (
                      <MessageScrollerItem key="typing" scrollAnchor>
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                        >
                          <Message align="start">
                            <MessageAvatar>
                              <Avatar size="sm">
                                <AvatarFallback className="bg-fuego-100 text-fuego-700 text-xs font-bold">
                                  AI
                                </AvatarFallback>
                              </Avatar>
                            </MessageAvatar>
                            <MessageContent>
                              <Bubble variant="secondary" align="start">
                                <BubbleContent>
                                  <TypingDots />
                                </BubbleContent>
                              </Bubble>
                            </MessageContent>
                          </Message>
                        </motion.div>
                      </MessageScrollerItem>
                    )}
                  </AnimatePresence>

                  {/* Scroll anchor — keeps view pinned to bottom */}
                  <MessageScrollerItem scrollAnchor>
                    <div className="h-1" />
                  </MessageScrollerItem>
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton direction="end" />
            </MessageScroller>
          </MessageScrollerProvider>

          {/* Composer */}
          <div className="border-t border-border/60 p-3">
            <InputGroup>
              <InputGroupInput
                placeholder="Ask Sentinel…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  variant="ghost"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  aria-label="Send"
                >
                  <Send className="size-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </aside>

        {/* Right: Alert cards */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-0 sm:py-0">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Active alerts</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {alerts.filter((a) => a.status === "new").length} new ·{" "}
                {alerts.filter((a) => a.status === "acknowledged").length} acknowledged
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              <BrainCircuit className="size-3 mr-1" />
              Sentinel monitoring {mockRegions.length} regions
            </Badge>
          </div>

          <div className="space-y-4 pb-8">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                actions={actions.filter((a) => a.alertId === alert.id)}
                onApprove={handleApprove}
                onDecline={handleDecline}
                onAcknowledge={handleAcknowledge}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCell({
  label,
  value,
  icon,
  danger = false,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  danger?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span className={highlight ? "text-fuego-500" : danger ? "text-red-500" : ""}>{icon}</span>
        {label}
      </div>
      <p
        className={`text-lg font-bold tabular-nums leading-none ${
          danger ? "text-red-600" : highlight ? "text-fuego-600" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 h-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block size-1.5 rounded-full bg-muted-foreground/60"
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}
