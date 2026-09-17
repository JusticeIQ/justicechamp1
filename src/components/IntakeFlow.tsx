"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, Badge, ProgressBar } from "./ui";
import { AIAssistantBox } from "./AIAssistantBox";
import { useAppState } from "@/lib/store";
import { ClaimCategory, IntakeAnswer, IntakeTool } from "@/lib/types";
import { IntakeField, IntakeStep, COUNTRIES, matchesShowIf, regionsForCountry, stepsForTool } from "@/lib/intake-config";
import { track, anonymizedSessionId, sizeBand } from "@/lib/analytics";

const SKIP_OPTIONS: { label: string; status: IntakeAnswer["status"] }[] = [
  { label: "I don't know", status: "unknown" },
  { label: "Not applicable", status: "not_applicable" },
  { label: "I will provide this later", status: "later" },
];

const ACCEPTED_FILE_TYPES = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const MAX_FILE_MB = 15;

interface ToolMeta {
  category: ClaimCategory;
  defaultSubtype: string;
  submitLabel: string;
  hasSplash: boolean; // show the generic "submitted" interstitial (personal injury only)
  splashTitle: string;
  splashDescription: string;
  resultsHref: (claimId: string) => string;
}

const TOOL_META: Record<IntakeTool, ToolMeta> = {
  personal_injury: {
    category: "personal_injury",
    defaultSubtype: "Personal injury report",
    submitLabel: "Submit incident report",
    hasSplash: true,
    splashTitle: "Your incident report has been submitted",
    splashDescription: "Next, view your Review My Claim results to see a preliminary, informational assessment and recommended next steps.",
    resultsHref: (id) => `/rate-my-claim?claim=${id}`,
  },
  employment_contract: {
    category: "employment",
    defaultSubtype: "Employment contract review",
    submitLabel: "Review my contract",
    hasSplash: false,
    splashTitle: "",
    splashDescription: "",
    resultsHref: (id) => `/employment/contract-review/results?claim=${id}`,
  },
  employment_severance: {
    category: "employment",
    defaultSubtype: "Severance package review",
    submitLabel: "Review my severance package",
    hasSplash: false,
    splashTitle: "",
    splashDescription: "",
    resultsHref: (id) => `/employment/severance-review/results?claim=${id}`,
  },
  employment_other: {
    category: "employment",
    defaultSubtype: "Workplace concern",
    submitLabel: "Get organized information",
    hasSplash: false,
    splashTitle: "",
    splashDescription: "",
    resultsHref: (id) => `/employment/workplace-issue/results?claim=${id}`,
  },
};

function wordCount(value: string): number {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function IntakeFlow({ tool }: { tool: IntakeTool }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { claims, createOrResumeToolClaim, getClaim, updateAnswer, setClaimStep, submitClaim, saveError, retrySave } = useAppState();
  const meta = TOOL_META[tool];

  const claimIdParam = searchParams.get("claim");
  const [claimId, setClaimId] = useState<string | null>(claimIdParam);
  const allSteps = useMemo(() => stepsForTool(tool), [tool]);

  useEffect(() => {
    if (claimId) {
      track({ name: "questionnaire_resumed", props: { tool, sessionId: anonymizedSessionId(claimId) } });
      return;
    }
    const id = createOrResumeToolClaim(tool, meta.defaultSubtype);
    setClaimId(id);
    track({ name: "questionnaire_started", props: { tool, sessionId: anonymizedSessionId(id) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimId, tool]);

  const claim = claimId ? getClaim(claimId) : undefined;
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);

  const visibleSteps = useMemo(() => (claim ? allSteps.filter((s) => matchesShowIf(s.showIf, claim.answers)) : allSteps), [allSteps, claim?.answers]);

  useEffect(() => {
    if (claim) setStepIndex((i) => Math.min(claim.currentStep, visibleSteps.length - 1, i === 0 ? claim.currentStep : i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claim?.id]);

  useEffect(() => {
    if (stepIndex > visibleSteps.length - 1) setStepIndex(Math.max(0, visibleSteps.length - 1));
  }, [visibleSteps.length, stepIndex]);

  // Jurisdiction fields render with a default country/region already visibly
  // selected (e.g. "United States" / the first state), but a <select> only
  // fires onChange when the person actually changes it — so that default
  // was never written to the claim's answers. Without this, "Continue"
  // rejects a field the person can plainly see is filled in. Commit the
  // visible default as the real answer as soon as the field appears.
  useEffect(() => {
    if (!claim) return;
    const currentStepObj = visibleSteps[Math.min(stepIndex, visibleSteps.length - 1)];
    if (!currentStepObj) return;
    currentStepObj.fields.forEach((f) => {
      if (f.type === "jurisdiction" && !claim.answers[f.id]?.value) {
        const country = "United States";
        const region = regionsForCountry(country)[0] ?? "";
        const value = region ? `${region}, ${country}` : country;
        updateAnswer(claim.id, currentStepObj.id, f.id, value, "answered");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claim?.id, stepIndex, visibleSteps]);

  if (!claim) {
    return <div className="py-16 text-center text-navy-700 text-sm">Preparing your workspace...</div>;
  }

  const step: IntakeStep = visibleSteps[Math.min(stepIndex, visibleSteps.length - 1)];
  const isReview = step.id === "review";
  const isFinalStep = stepIndex === visibleSteps.length - 1;
  const countedSteps = visibleSteps.filter((s) => s.id !== "review");
  const totalCounted = countedSteps.length;
  const currentCountedPosition = Math.min(countedSteps.findIndex((s) => s.id === step.id) + 1, totalCounted) || totalCounted;
  const visibleFields = (s: IntakeStep) => s.fields.filter((f) => matchesShowIf(f.showIf, claim.answers));

  function goToStep(i: number) {
    setError(null);
    setStepIndex(i);
    setClaimStep(claim!.id, i);
    track({ name: "questionnaire_saved", props: { tool, sessionId: anonymizedSessionId(claim!.id), questionNumber: i + 1 } });
  }

  function handleNext() {
    if (!isReview) {
      const fields = visibleFields(step).filter((f) => f.type !== "info");
      const missing = fields.filter((f) => !f.allowSkip && !f.optional).filter((f) => {
        const a = claim!.answers[f.id];
        return !a || a.value === "" || a.value === null || (Array.isArray(a.value) && a.value.length === 0);
      });
      if (missing.length > 0) {
        setError(`Please complete: ${missing.map((f) => f.label).join(", ")}`);
        return;
      }
    }
    if (isFinalStep) {
      if (meta.hasSplash) {
        submitClaim(claim!.id);
        setSubmitted(true);
        track({ name: "questionnaire_completed", props: { tool, sessionId: anonymizedSessionId(claim!.id), completionStatus: "submitted" } });
      } else {
        setProcessing(true);
        submitClaim(claim!.id);
        track({ name: "questionnaire_completed", props: { tool, sessionId: anonymizedSessionId(claim!.id), completionStatus: "submitted" } });
        window.setTimeout(() => {
          router.push(meta.resultsHref(claim!.id));
        }, 900);
      }
      return;
    }
    goToStep(stepIndex + 1);
  }

  function handleBack() {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  }

  function setAnswer(fieldId: string, value: IntakeAnswer["value"], status: IntakeAnswer["status"] = "answered") {
    updateAnswer(claim!.id, step.id, fieldId, value, status);
    setError(null);
  }

  function handleFileChange(field: IntakeField, fileList: FileList | null) {
    setFileErrors((prev) => ({ ...prev, [field.id]: "" }));
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const valid: File[] = [];
    const rejected: string[] = [];
    for (const f of files) {
      const ext = "." + (f.name.split(".").pop() ?? "").toLowerCase();
      const tooBig = f.size > MAX_FILE_MB * 1024 * 1024;
      if (!ACCEPTED_FILE_TYPES.includes(ext) || tooBig) {
        rejected.push(`${f.name}${tooBig ? " (too large)" : " (unsupported format)"}`);
        track({ name: "document_upload_failed", props: { tool, fileType: ext, errorCode: tooBig ? "file_too_large" : "unsupported_format" } });
      } else {
        valid.push(f);
      }
    }
    if (rejected.length > 0) {
      setFileErrors((prev) => ({
        ...prev,
        [field.id]: `Couldn't use: ${rejected.join(", ")}. Accepted formats: PDF, DOC, DOCX, JPG, PNG, up to ${MAX_FILE_MB}MB each.`,
      }));
    }
    if (valid.length === 0) return;
    track({ name: "document_upload_started", props: { tool } });
    setUploading((prev) => ({ ...prev, [field.id]: true }));
    window.setTimeout(() => {
      const existing = typeof claim!.answers[field.id]?.value === "string" ? (claim!.answers[field.id].value as string) : "";
      const existingNames = existing ? existing.split(", ").filter(Boolean) : [];
      const names = field.multiple ? [...existingNames, ...valid.map((f) => f.name)] : [valid[0].name];
      setAnswer(field.id, names.join(", "));
      setUploading((prev) => ({ ...prev, [field.id]: false }));
      valid.forEach((f) => track({ name: "document_upload_succeeded", props: { tool, fileType: "." + f.name.split(".").pop(), sizeBand: sizeBand(f.size) } }));
    }, 700);
  }

  function setJurisdiction(field: IntakeField, country: string, region: string) {
    const value = region ? `${region}, ${country}` : country;
    setAnswer(field.id, value);
  }

  function currentJurisdictionParts(field: IntakeField): { country: string; region: string } {
    const raw = claim!.answers[field.id]?.value;
    const value = typeof raw === "string" ? raw : "";
    if (!value) return { country: "United States", region: "" };
    const parts = value.split(", ");
    if (parts.length === 2) return { country: parts[1], region: parts[0] };
    return { country: value, region: "" };
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <Badge>Submitted</Badge>
        <h2 className="text-2xl font-bold text-navy-900 mt-4">{meta.splashTitle}</h2>
        <p className="text-navy-700 mt-2 text-sm">{meta.splashDescription}</p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link href={meta.resultsHref(claim.id)}><Button variant="cta">Review My Claim</Button></Link>
          <Link href="/documents"><Button variant="outline">Upload evidence</Button></Link>
          <Link href="/dashboard"><Button variant="ghost">Return to dashboard</Button></Link>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="max-w-xl mx-auto text-center py-16" role="status" aria-live="polite">
        <span className="h-10 w-10 rounded-full border-4 border-teal-500 border-t-transparent animate-spin inline-block" />
        <h2 className="text-lg font-semibold text-navy-900 mt-4">Preparing your review…</h2>
        <p className="text-navy-700 mt-2 text-sm">This only takes a moment.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <div className="flex items-center justify-between text-xs text-navy-700 mb-2">
            <span>
              {isReview ? "Review your answers" : `${step.section} • Question ${currentCountedPosition} of ${totalCounted}`}
            </span>
            <span>{Math.round((currentCountedPosition / Math.max(1, totalCounted)) * 100)}% complete</span>
          </div>
          <ProgressBar value={(currentCountedPosition / Math.max(1, totalCounted)) * 100} />
          <p className="text-[11px] text-navy-700/60 mt-2" aria-live="polite">
            {saveError ? (
              <span className="text-red-600">
                We could not save this answer yet. Your response is still on this device.{" "}
                <button type="button" className="underline focus-ring rounded" onClick={retrySave}>Try again</button>
              </span>
            ) : (
              "Answers save automatically as you go."
            )}
          </p>
        </Card>

        <Card>
          <h1 className="text-xl font-bold text-navy-900">{step.title}</h1>
          {step.helper && <p className="text-sm text-navy-700 mt-1">{step.helper}</p>}

          {isReview ? (
            <div className="mt-5 space-y-3">
              <p className="text-sm text-navy-700">Review your answers below. Click any step to make changes before submitting.</p>
              <div className="divide-y divide-navy-900/5 border border-navy-900/10 rounded-lg">
                {countedSteps.map((s, idx) => (
                  <button key={s.id} onClick={() => goToStep(idx)} className="w-full text-left px-4 py-3 hover:bg-navy-900/5 focus-ring flex justify-between items-center">
                    <span className="text-sm text-navy-900">{idx + 1}. {s.title}</span>
                    <span className="text-xs text-teal-600">Edit</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              {visibleFields(step).map((field) => {
                const answer = claim.answers[field.id];
                const isSkipped = answer && answer.status !== "answered";
                const wc = field.maxWords && typeof answer?.value === "string" ? wordCount(answer.value) : 0;
                const overLimit = field.maxWords ? wc > field.maxWords : false;

                if (field.type === "info") {
                  return (
                    <div key={field.id} className="rounded-lg border border-teal-200 bg-teal-50 text-teal-900 text-xs p-3 flex gap-2">
                      <span aria-hidden>ⓘ</span>
                      <p>{field.label}</p>
                    </div>
                  );
                }

                return (
                  <div key={field.id}>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium text-navy-900" htmlFor={field.id}>{field.label}</label>
                      {field.optional && <span className="text-[11px] text-navy-700/60 font-normal">Optional</span>}
                    </div>
                    {field.helper && <p className="text-xs text-navy-700 mb-1">{field.helper}</p>}

                    {field.type === "text" && (
                      <input
                        id={field.id}
                        type="text"
                        placeholder={field.placeholder}
                        value={typeof answer?.value === "string" ? answer.value : ""}
                        onChange={(e) => setAnswer(field.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                      />
                    )}
                    {field.type === "number" && (
                      <input
                        id={field.id}
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={typeof answer?.value === "string" ? answer.value : ""}
                        onChange={(e) => setAnswer(field.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                      />
                    )}
                    {field.type === "date" && (
                      <input
                        id={field.id}
                        type="date"
                        max={field.noFutureDate ? new Date().toISOString().slice(0, 10) : undefined}
                        value={typeof answer?.value === "string" ? answer.value : ""}
                        onChange={(e) => setAnswer(field.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                      />
                    )}
                    {field.type === "textarea" && (
                      <>
                        <textarea
                          id={field.id}
                          rows={4}
                          value={typeof answer?.value === "string" ? answer.value : ""}
                          onChange={(e) => setAnswer(field.id, e.target.value)}
                          className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                          aria-describedby={field.maxWords ? `${field.id}-wordcount` : undefined}
                        />
                        {field.maxWords && (
                          <p id={`${field.id}-wordcount`} className={`text-[11px] mt-1 ${overLimit ? "text-amber-700" : "text-navy-700/60"}`} aria-live="polite">
                            {wc}/{field.maxWords} words{overLimit ? ` — consider shortening by about ${wc - field.maxWords} word(s)` : ""}
                          </p>
                        )}
                      </>
                    )}
                    {field.type === "jurisdiction" && (() => {
                      const { country, region } = currentJurisdictionParts(field);
                      const regions = regionsForCountry(country);
                      return (
                        <div className="grid sm:grid-cols-2 gap-2 mt-1">
                          <select
                            aria-label="Country"
                            value={country}
                            onChange={(e) => setJurisdiction(field, e.target.value, regionsForCountry(e.target.value)[0] ?? "")}
                            className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                          >
                            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          {regions.length > 0 ? (
                            <select
                              aria-label="State or province"
                              value={region || regions[0]}
                              onChange={(e) => setJurisdiction(field, country, e.target.value)}
                              className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                            >
                              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                          ) : (
                            <input
                              aria-label="State, province, or region"
                              placeholder="State, province, or region"
                              value={region}
                              onChange={(e) => setJurisdiction(field, country, e.target.value)}
                              className="rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                            />
                          )}
                        </div>
                      );
                    })()}
                    {field.type === "file" && (
                      <div className="mt-1">
                        <input
                          id={field.id}
                          type="file"
                          multiple={field.multiple}
                          accept={ACCEPTED_FILE_TYPES.join(",")}
                          onChange={(e) => handleFileChange(field, e.target.files)}
                          className="w-full text-sm"
                        />
                        <p className="text-[11px] text-navy-700/60 mt-1">Accepted: PDF, DOC, DOCX, JPG, PNG. Up to {MAX_FILE_MB}MB each.</p>
                        {uploading[field.id] && (
                          <p className="text-xs text-teal-700 mt-1" role="status" aria-live="polite">Uploading…</p>
                        )}
                        {!uploading[field.id] && typeof answer?.value === "string" && answer.value && (
                          <p className="text-xs text-teal-700 mt-1">Selected: {answer.value}</p>
                        )}
                        {fileErrors[field.id] && (
                          <div className="text-xs text-red-600 mt-1 flex items-center gap-2" role="alert">
                            <span>{fileErrors[field.id]}</span>
                            <button type="button" className="underline focus-ring rounded" onClick={() => document.getElementById(field.id)?.click()}>Choose another file</button>
                          </div>
                        )}
                      </div>
                    )}
                    {field.type === "radio" && (
                      <div className="mt-2 grid sm:grid-cols-2 gap-2">
                        {field.options?.map((opt) => (
                          <label key={opt} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer focus-ring min-h-[44px] ${answer?.value === opt ? "border-teal-500 bg-teal-50" : "border-navy-900/15"}`}>
                            <input type="radio" name={field.id} checked={answer?.value === opt} onChange={() => setAnswer(field.id, opt)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                    {field.type === "checkboxes" && (
                      <div className="mt-2 grid sm:grid-cols-2 gap-2">
                        {field.options?.map((opt) => {
                          const current = Array.isArray(answer?.value) ? (answer!.value as string[]) : [];
                          const checked = current.includes(opt);
                          return (
                            <label key={opt} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer focus-ring min-h-[44px] ${checked ? "border-teal-500 bg-teal-50" : "border-navy-900/15"}`}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const next = checked ? current.filter((c) => c !== opt) : [...current, opt];
                                  setAnswer(field.id, next);
                                }}
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {field.allowSkip && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {SKIP_OPTIONS.map((opt) => (
                          <button
                            key={opt.status}
                            type="button"
                            onClick={() => setAnswer(field.id, opt.label, opt.status)}
                            className={`text-xs px-2.5 py-1 rounded-full border focus-ring ${
                              isSkipped && answer?.status === opt.status ? "border-teal-500 bg-teal-50 text-teal-700" : "border-navy-900/15 text-navy-700 hover:bg-navy-900/5"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-4" role="alert">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-4 border-t border-navy-900/10">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBack} disabled={stepIndex === 0}>Back</Button>
              <Link href="/dashboard"><Button variant="ghost" size="sm">Save and exit</Button></Link>
            </div>
            <div className="flex gap-2">
              {isReview ? (
                <Button size="sm" onClick={handleNext}>{meta.submitLabel}</Button>
              ) : isFinalStep ? (
                <Button size="sm" onClick={handleNext}>{meta.submitLabel}</Button>
              ) : (
                <Button size="sm" onClick={handleNext}>Continue</Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <AIAssistantBox />
        {!isReview && (
          <Card>
            <h2 className="text-sm font-semibold text-navy-900">Why we ask this</h2>
            <p className="text-xs text-navy-700 mt-2">
              Every answer helps build a clearer, more complete record. Nothing here is legal advice, and you're always in
              control of what you share. Your answers are never shared with a lawyer unless you separately consent.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
