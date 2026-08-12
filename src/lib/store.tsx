"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityLogItem,
  Claim,
  ClaimCategory,
  ClaimDocument,
  DemoUser,
  ImportantDate,
  IntakeAnswer,
  Notice,
  NotificationItem,
  TimelineEvent,
} from "./types";
import { buildDemoClaim1, buildDemoClaim2, DEMO_USER } from "./demo-data";
import { computeClaimScore } from "./scoring";
import { stepsForCategory } from "./intake-config";

const STORAGE_KEY = "justicechamp-demo-state-v1";

interface AppState {
  isAuthenticated: boolean;
  user: DemoUser | null;
  claims: Claim[];
  notifications: NotificationItem[];
  activityLog: ActivityLogItem[];
  readNoticeIds: string[];
}

function emptyState(): AppState {
  return { isAuthenticated: false, user: null, claims: [], notifications: [], activityLog: [], readNoticeIds: [] };
}

function seededState(): AppState {
  const claim1 = buildDemoClaim1();
  const claim2 = buildDemoClaim2();
  return {
    isAuthenticated: true,
    user: DEMO_USER,
    claims: [claim1, claim2],
    notifications: [
      { id: "n1", message: "New match available for your employment claim.", createdAt: "2026-06-09T10:00:00Z", read: false, type: "match" },
      { id: "n2", message: "Reminder: California personal injury filing deadline is approaching.", createdAt: "2026-06-11T08:00:00Z", read: false, type: "deadline" },
      { id: "n3", message: "Your motor vehicle claim summary is ready to review.", createdAt: "2026-06-10T15:30:00Z", read: true, type: "task" },
      { id: "n4", message: "New secure message from Devon Whitmore about your employment claim.", createdAt: "2026-06-12T09:15:00Z", read: false, type: "message" },
    ],
    activityLog: [
      { id: "a1", message: "Submitted personal injury incident report", timestamp: "2026-05-15T10:00:00Z" },
      { id: "a2", message: "Uploaded 5 documents to motor vehicle claim", timestamp: "2026-05-22T11:10:00Z" },
      { id: "a3", message: "Submitted employment incident report", timestamp: "2026-04-05T09:00:00Z" },
      { id: "a4", message: "Generated claim-readiness score for both claims", timestamp: "2026-06-10T15:30:00Z" },
    ],
    readNoticeIds: [],
  };
}

interface AppContextValue extends AppState {
  hydrated: boolean;
  loginDemo: () => void;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (fullName: string, email: string, password: string, confirmPassword: string) => { ok: boolean; error?: string };
  logout: () => void;
  createClaim: (category: ClaimCategory, subtype: string) => string;
  getClaim: (claimId: string) => Claim | undefined;
  updateAnswer: (claimId: string, stepId: string, fieldId: string, value: IntakeAnswer["value"], status: IntakeAnswer["status"]) => void;
  setClaimStep: (claimId: string, step: number) => void;
  submitClaim: (claimId: string) => void;
  addTimelineEvent: (claimId: string, event: Omit<TimelineEvent, "id" | "claimId">) => void;
  updateTimelineEvent: (claimId: string, eventId: string, updates: Partial<TimelineEvent>) => void;
  deleteTimelineEvent: (claimId: string, eventId: string) => void;
  addDocument: (claimId: string, doc: Omit<ClaimDocument, "id" | "claimId" | "uploadedAt" | "status">) => void;
  toggleDocumentImportant: (claimId: string, docId: string) => void;
  deleteDocument: (claimId: string, docId: string) => void;
  sendDocumentToLawyer: (claimId: string, docId: string) => void;
  recomputeScore: (claimId: string) => void;
  requestConsultation: (claimId: string, lawyerId: string, lawyerName: string) => void;
  logActivity: (message: string) => void;
  markNotificationRead: (id: string) => void;
  markLawyerMessageRead: (claimId: string, messageId: string) => void;
  notices: Notice[];
  importantDates: ImportantDate[];
  unreadNoticeCount: number;
  markNoticeRead: (id: string) => void;
  refreshBridgeData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState());
  const [hydrated, setHydrated] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Merge onto emptyState() so fields added after a user's session was
        // last persisted (e.g. readNoticeIds) are never undefined.
        setState({ ...emptyState(), ...JSON.parse(raw) });
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage may be unavailable (e.g. private browsing quota) — fail silently
    }
  }, [state, hydrated]);

  const refreshBridgeData = useCallback(async () => {
    try {
      const [noticesRes, datesRes] = await Promise.all([
        fetch("/api/bridge/notices", { cache: "no-store" }),
        fetch("/api/bridge/important-dates", { cache: "no-store" }),
      ]);
      if (noticesRes.ok) {
        const data = await noticesRes.json();
        setNotices(data.notices ?? []);
      }
      if (datesRes.ok) {
        const data = await datesRes.json();
        setImportantDates(data.importantDates ?? []);
      }
    } catch {
      // JusticeIQ / the bridge may be unavailable — fail silently and retry on the next poll
    }
  }, []);

  // Feature 1 & 2: JusticeIQ -> JusticeChamp bridge. Notices and Important
  // Dates are pushed in from JusticeIQ server-side (see src/app/api/bridge),
  // so this app polls its own bridge API on an interval to pick up new
  // items without needing a full page reload — a lightweight stand-in for
  // real-time updates for the demo.
  useEffect(() => {
    if (!hydrated || !state.isAuthenticated) return;
    refreshBridgeData();
    const interval = setInterval(refreshBridgeData, 4000);
    return () => clearInterval(interval);
  }, [hydrated, state.isAuthenticated, refreshBridgeData]);

  const logActivity = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      activityLog: [{ id: `a-${Date.now()}`, message, timestamp: new Date().toISOString() }, ...prev.activityLog].slice(0, 50),
    }));
  }, []);

  const loginDemo = useCallback(() => {
    setState(seededState());
  }, []);

  const login = useCallback((email: string, _password: string) => {
    if (!email || !_password) return { ok: false, error: "Enter both email and password." };
    setState(seededState());
    return { ok: true };
  }, []);

  const signup = useCallback((fullName: string, email: string, password: string, confirmPassword: string) => {
    if (!fullName || !email || !password) return { ok: false, error: "Please complete all required fields." };
    if (password !== confirmPassword) return { ok: false, error: "Passwords do not match." };
    const newUser: DemoUser = {
      id: `user-${Date.now()}`,
      fullName,
      email,
      createdAt: new Date().toISOString(),
      consentClaimComms: true,
      accountType: "consumer",
    };
    setState({ isAuthenticated: true, user: newUser, claims: [], notifications: [], activityLog: [{ id: "a1", message: "Account created", timestamp: new Date().toISOString() }], readNoticeIds: [] });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setState(emptyState());
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const getClaim = useCallback((claimId: string) => state.claims.find((c) => c.id === claimId), [state.claims]);

  const createClaim = useCallback(
    (category: ClaimCategory, subtype: string) => {
      const id = `claim-${Date.now()}`;
      const steps = stepsForCategory(category);
      const newClaim: Claim = {
        id,
        userId: state.user?.id ?? "guest",
        category,
        subtype,
        title: subtype || (category === "personal_injury" ? "New personal injury report" : "New employment report"),
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentStep: 0,
        totalSteps: steps.length,
        answers: {},
        timeline: [],
        documents: [],
        score: null,
        goals: "",
        jurisdiction: "",
        incidentDate: "",
        lawyerMessages: [],
      };
      setState((prev) => ({ ...prev, claims: [newClaim, ...prev.claims] }));
      logActivity(`Started a new ${category === "personal_injury" ? "personal injury" : "employment"} incident report`);
      return id;
    },
    [state.user, logActivity]
  );

  const updateAnswer = useCallback(
    (claimId: string, stepId: string, fieldId: string, value: IntakeAnswer["value"], status: IntakeAnswer["status"]) => {
      setState((prev) => ({
        ...prev,
        claims: prev.claims.map((c) => {
          if (c.id !== claimId) return c;
          const answers = { ...c.answers, [fieldId]: { stepId, fieldId, value, status } };
          const jurisdiction = fieldId === "jurisdiction" && typeof value === "string" ? value : c.jurisdiction;
          const incidentDate = fieldId === "incidentDate" && typeof value === "string" ? value : c.incidentDate;
          const goals = fieldId === "goals" && typeof value === "string" ? value : c.goals;
          return { ...c, answers, jurisdiction, incidentDate, goals, updatedAt: new Date().toISOString(), status: c.status === "draft" ? "in_progress" : c.status };
        }),
      }));
    },
    []
  );

  const setClaimStep = useCallback((claimId: string, step: number) => {
    setState((prev) => ({
      ...prev,
      claims: prev.claims.map((c) => (c.id === claimId ? { ...c, currentStep: step, updatedAt: new Date().toISOString() } : c)),
    }));
  }, []);

  const submitClaim = useCallback(
    (claimId: string) => {
      setState((prev) => ({
        ...prev,
        claims: prev.claims.map((c) => {
          if (c.id !== claimId) return c;
          const updated = { ...c, status: "submitted" as const, updatedAt: new Date().toISOString() };
          updated.score = computeClaimScore(updated);
          return updated;
        }),
      }));
      logActivity("Submitted incident report for review");
    },
    [logActivity]
  );

  const addTimelineEvent = useCallback((claimId: string, event: Omit<TimelineEvent, "id" | "claimId">) => {
    setState((prev) => ({
      ...prev,
      claims: prev.claims.map((c) => {
        if (c.id !== claimId) return c;
        const newEvent: TimelineEvent = { ...event, id: `t-${Date.now()}`, claimId };
        const timeline = [...c.timeline, newEvent].sort((a, b) => a.date.localeCompare(b.date));
        return { ...c, timeline, updatedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const updateTimelineEvent = useCallback((claimId: string, eventId: string, updates: Partial<TimelineEvent>) => {
    setState((prev) => ({
      ...prev,
      claims: prev.claims.map((c) => {
        if (c.id !== claimId) return c;
        const timeline = c.timeline
          .map((e) => (e.id === eventId ? { ...e, ...updates } : e))
          .sort((a, b) => a.date.localeCompare(b.date));
        return { ...c, timeline, updatedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const deleteTimelineEvent = useCallback((claimId: string, eventId: string) => {
    setState((prev) => ({
      ...prev,
      claims: prev.claims.map((c) => (c.id === claimId ? { ...c, timeline: c.timeline.filter((e) => e.id !== eventId), updatedAt: new Date().toISOString() } : c)),
    }));
  }, []);

  const addDocument = useCallback(
    (claimId: string, doc: Omit<ClaimDocument, "id" | "claimId" | "uploadedAt" | "status">) => {
      setState((prev) => ({
        ...prev,
        claims: prev.claims.map((c) => {
          if (c.id !== claimId) return c;
          const newDoc: ClaimDocument = { ...doc, id: `d-${Date.now()}`, claimId, uploadedAt: new Date().toISOString(), status: "uploaded" };
          return { ...c, documents: [newDoc, ...c.documents], updatedAt: new Date().toISOString() };
        }),
      }));
      logActivity(`Uploaded document: ${doc.name}`);
    },
    [logActivity]
  );

  const toggleDocumentImportant = useCallback((claimId: string, docId: string) => {
    setState((prev) => ({
      ...prev,
      claims: prev.claims.map((c) =>
        c.id !== claimId
          ? c
          : { ...c, documents: c.documents.map((d) => (d.id === docId ? { ...d, important: !d.important } : d)) }
      ),
    }));
  }, []);

  const deleteDocument = useCallback((claimId: string, docId: string) => {
    setState((prev) => ({
      ...prev,
      claims: prev.claims.map((c) => (c.id === claimId ? { ...c, documents: c.documents.filter((d) => d.id !== docId) } : c)),
    }));
  }, []);

  const sendDocumentToLawyer = useCallback(
    (claimId: string, docId: string) => {
      let docName = "";
      setState((prev) => ({
        ...prev,
        claims: prev.claims.map((c) => {
          if (c.id !== claimId) return c;
          const documents = c.documents.map((d) => {
            if (d.id !== docId) return d;
            docName = d.name;
            return { ...d, sentToLawyer: true, sentToLawyerAt: new Date().toISOString() };
          });
          return { ...c, documents, updatedAt: new Date().toISOString() };
        }),
      }));
      logActivity(`Sent document to your lawyer's JusticeIQ dashboard: ${docName || docId}`);
    },
    [logActivity]
  );

  const recomputeScore = useCallback((claimId: string) => {
    setState((prev) => ({
      ...prev,
      claims: prev.claims.map((c) => (c.id === claimId ? { ...c, score: computeClaimScore(c) } : c)),
    }));
    logActivity("Generated an updated claim-readiness score");
  }, [logActivity]);

  const requestConsultation = useCallback(
    (claimId: string, lawyerId: string, lawyerName: string) => {
      logActivity(`Requested a consultation with ${lawyerName}`);
      setState((prev) => ({
        ...prev,
        notifications: [
          { id: `n-${Date.now()}`, message: `Consultation request sent to ${lawyerName}.`, createdAt: new Date().toISOString(), read: false, type: "match" },
          ...prev.notifications,
        ],
      }));
    },
    [logActivity]
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({ ...prev, notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  }, []);

  const markLawyerMessageRead = useCallback((claimId: string, messageId: string) => {
    setState((prev) => ({
      ...prev,
      claims: prev.claims.map((c) =>
        c.id !== claimId ? c : { ...c, lawyerMessages: c.lawyerMessages.map((m) => (m.id === messageId ? { ...m, read: true } : m)) }
      ),
    }));
  }, []);

  const markNoticeRead = useCallback((id: string) => {
    setState((prev) => ((prev.readNoticeIds ?? []).includes(id) ? prev : { ...prev, readNoticeIds: [...(prev.readNoticeIds ?? []), id] }));
  }, []);

  const unreadNoticeCount = notices.filter((n) => !(state.readNoticeIds ?? []).includes(n.id)).length;

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      hydrated,
      loginDemo,
      login,
      signup,
      logout,
      createClaim,
      getClaim,
      updateAnswer,
      setClaimStep,
      submitClaim,
      addTimelineEvent,
      updateTimelineEvent,
      deleteTimelineEvent,
      addDocument,
      toggleDocumentImportant,
      deleteDocument,
      sendDocumentToLawyer,
      recomputeScore,
      requestConsultation,
      logActivity,
      markNotificationRead,
      markLawyerMessageRead,
      notices,
      importantDates,
      unreadNoticeCount,
      markNoticeRead,
      refreshBridgeData,
    }),
    [
      state,
      hydrated,
      loginDemo,
      login,
      signup,
      logout,
      createClaim,
      getClaim,
      updateAnswer,
      setClaimStep,
      submitClaim,
      addTimelineEvent,
      updateTimelineEvent,
      deleteTimelineEvent,
      addDocument,
      toggleDocumentImportant,
      deleteDocument,
      sendDocumentToLawyer,
      recomputeScore,
      requestConsultation,
      logActivity,
      markNotificationRead,
      markLawyerMessageRead,
      notices,
      importantDates,
      unreadNoticeCount,
      markNoticeRead,
      refreshBridgeData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
