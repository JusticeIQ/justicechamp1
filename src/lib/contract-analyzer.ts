// Lightweight, rule-based "AI" contract analyzer for the JusticeChamp demo.
//
// This intentionally does NOT call an external LLM API (this MVP does not have one
// configured — see AIAssistantBox.tsx for the same pattern). Instead it scans the
// pasted contract text for common employment-contract clauses using keyword and
// pattern matching, and produces a plain-language summary. It is a real, functional
// analysis of the text you provide (not a canned response), but it is not legal
// advice and can miss or misread unusual contract language.

export interface ContractFlag {
  topic: "Vacation / paid time off" | "Compensation for dismissal" | "Reasons for dismissal" | "Other notable clause";
  found: boolean;
  summary: string;
  quote?: string;
  risk: "standard" | "review" | "unclear";
  riskReason: string;
}

export interface ContractAnalysis {
  wordCount: number;
  flags: ContractFlag[];
  overallRisk: "standard" | "review" | "unclear";
  overallSummary: string;
}

function findSentence(text: string, keywordRegex: RegExp): string | undefined {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const match = sentences.find((s) => keywordRegex.test(s));
  return match?.trim().slice(0, 320);
}

function analyzeVacation(text: string): ContractFlag {
  const re = /(vacation|paid time off|\bPTO\b|annual leave)/i;
  const quote = findSentence(text, re);
  if (!quote) {
    return {
      topic: "Vacation / paid time off",
      found: false,
      summary: "No vacation or paid-time-off clause was found in the text you provided.",
      risk: "unclear",
      riskReason: "Most employment contracts address vacation entitlement. If this contract genuinely omits it, ask your employer how vacation time is handled — it may be covered by a separate policy or by state/provincial law minimums.",
    };
  }
  const daysMatch = quote.match(/(\d+(\.\d+)?)\s*(paid\s+)?(vacation\s+)?(days|weeks)/i);
  const hasNumber = !!daysMatch;
  return {
    topic: "Vacation / paid time off",
    found: true,
    summary: hasNumber
      ? `The contract specifies a vacation entitlement (around "${daysMatch![0]}"). In plain language: this is the amount of paid time off you're entitled to under this agreement.`
      : "The contract mentions vacation or paid time off, but doesn't state a specific number of days or weeks in this excerpt — the amount may be defined elsewhere (e.g., an employee handbook).",
    quote,
    risk: hasNumber ? "standard" : "review",
    riskReason: hasNumber
      ? "A specific, stated entitlement is standard and generally favorable to you as the employee — it's clear and enforceable."
      : "When vacation entitlement isn't a specific number, it can be harder to enforce. Worth confirming in writing what the actual entitlement is.",
  };
}

function analyzeDismissalCompensation(text: string): ContractFlag {
  const re = /(severance|notice period|in lieu of notice|termination pay|separation pay)/i;
  const quote = findSentence(text, re);
  if (!quote) {
    return {
      topic: "Compensation for dismissal",
      found: false,
      summary: "No severance, notice period, or termination-pay clause was found in the text you provided.",
      risk: "review",
      riskReason: "The absence of any stated severance or notice terms is worth flagging — it may mean you'd only receive whatever the applicable state or provincial minimum law requires, which is often less generous than a negotiated contract term.",
    };
  }
  const weeksMatch = quote.match(/(\d+(\.\d+)?)\s*(weeks?|months?|days?)/i);
  const capped = /sole discretion|company may reduce|no obligation/i.test(quote);
  return {
    topic: "Compensation for dismissal",
    found: true,
    summary: weeksMatch
      ? `The contract states a severance/notice figure (around "${weeksMatch[0]}"). In plain language: this is what you may be owed if your employment ends without cause, subject to the conditions in the clause.`
      : "The contract addresses severance or notice, but doesn't state a specific amount in this excerpt — read the surrounding clause carefully for conditions.",
    quote,
    risk: capped ? "review" : "standard",
    riskReason: capped
      ? "This clause includes language giving the employer discretion over the amount or whether it's paid at all — that's worth having a lawyer review, since it may be less protective than it first appears."
      : "A stated severance/notice term is standard and gives you a clearer basis for what to expect if you're let go.",
  };
}

function analyzeDismissalReasons(text: string): ContractFlag {
  const re = /(for cause|without cause|just cause|at[\s-]will|termination for)/i;
  const quote = findSentence(text, re);
  if (!quote) {
    return {
      topic: "Reasons for dismissal",
      found: false,
      summary: "No clause describing grounds for termination (\"for cause,\" \"without cause,\" \"at-will,\" etc.) was found.",
      risk: "unclear",
      riskReason: "Most contracts distinguish between termination \"for cause\" (misconduct, no severance owed) and \"without cause\" (severance owed). Not finding this distinction makes it harder to know your rights if you're dismissed.",
    };
  }
  const isAtWill = /at[\s-]will/i.test(quote);
  const definesCause = /(for cause).{0,200}(includes?|means?|defined as)/i.test(text);
  return {
    topic: "Reasons for dismissal",
    found: true,
    summary: isAtWill
      ? "The contract uses \"at-will\" language, meaning employment can generally be ended by either party for almost any reason (subject to legal exceptions like discrimination or retaliation)."
      : `The contract distinguishes reasons for dismissal (around "${quote.slice(0, 160)}${quote.length > 160 ? "…" : ""}").`,
    quote,
    risk: isAtWill ? "review" : definesCause ? "standard" : "review",
    riskReason: isAtWill
      ? "At-will language is common and not inherently unfair, but it means the contract itself offers limited protection against dismissal timing — your protections mostly come from separate laws (e.g., anti-retaliation, anti-discrimination statutes)."
      : definesCause
      ? "A defined list of what counts as \"cause\" is generally favorable to you, since it limits the employer's discretion."
      : "The contract distinguishes cause from no-cause termination but doesn't clearly define what \"cause\" means — vague cause definitions can be used broadly. Worth asking for clarification.",
  };
}

export function analyzeContractText(text: string): ContractAnalysis {
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const flags = [analyzeVacation(trimmed), analyzeDismissalCompensation(trimmed), analyzeDismissalReasons(trimmed)];

  const reviewCount = flags.filter((f) => f.risk === "review").length;
  const unclearCount = flags.filter((f) => f.risk === "unclear").length;
  const overallRisk: ContractAnalysis["overallRisk"] = reviewCount > 0 ? "review" : unclearCount > 0 ? "unclear" : "standard";

  const overallSummary =
    wordCount < 30
      ? "That's a short excerpt to analyze — for a more complete picture, paste in more of the contract, especially the termination, compensation, and leave sections."
      : overallRisk === "standard"
      ? "Based on what you pasted, the vacation, dismissal-compensation, and dismissal-reason terms all look like fairly standard, clearly stated language. This is a plain-language summary only — have a lawyer review the full document before signing or relying on it."
      : "Based on what you pasted, at least one section is worth a closer look — either because it's missing, vague, or gives the employer broad discretion. This is a plain-language summary only, not legal advice — a lawyer can tell you what these terms actually mean for your situation.";

  return { wordCount, flags, overallRisk, overallSummary };
}

export const SAMPLE_CONTRACT_TEXT = `This Employment Agreement is entered into between Brightpath Logistics Inc. ("Employer") and the undersigned Employee.

Compensation: Employee shall receive an annual base salary as set forth in the offer letter, paid bi-weekly.

Vacation: Employee is entitled to 15 paid vacation days per calendar year, accrued monthly.

Termination: Employment is at-will and may be terminated by either party at any time, with or without cause. If Employee is terminated without cause, Employer will provide two weeks of notice or pay in lieu of notice, at the Company's sole discretion. If terminated for cause, no notice or severance pay will be provided. "Cause" includes, without limitation, any act the Company deems to be misconduct.

Confidentiality: Employee agrees to keep all Company information confidential during and after employment.`;
