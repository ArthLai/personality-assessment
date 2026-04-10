export interface LikertQuestion {
  id: string;
  text: string;
  type: "likert";
  construct: string;
  reverse: boolean;
  scenario?: string;
}

export interface ChoiceOption {
  val: string;
  text: string;
  maps_to: string | null;
}

export interface ChoiceQuestion {
  id: string;
  text: string;
  type: "choice";
  construct: string;
  options: ChoiceOption[];
}

export interface OpenQuestion {
  id: string;
  text: string;
  type: "open";
  construct: null;
  tags: string[];
}

export type Question = LikertQuestion | ChoiceQuestion | OpenQuestion;

export interface Section {
  id: string;
  title: string;
  instruction: string;
  frameworks: string[];
  questions: Question[];
}

export interface ConstructDef {
  label_zh: string;
  label_en: string;
  framework: string;
  pole_high: string;
  pole_low: string;
}

export type Band = "very_low" | "low" | "moderate" | "high" | "very_high";

export interface ConstructScore {
  raw: number;
  count: number;
  avg: number;
  percent: number;
  band: Band;
}

export interface ChoiceAnswer {
  selected: string;
  maps_to: string | null;
  construct_label: string;
}

export interface OpenAnswer {
  text: string;
  tags: string[];
}

export type CrossValidationStatus = "consistent" | "inconsistent" | "pattern_detected";

export interface CrossValidationResult {
  id: string;
  name: string;
  status: CrossValidationStatus;
  detail: string;
  explanation: string;
}

export interface AssessmentScores {
  respondent_id: string;
  computed_at: string;
  construct_scores: Record<string, ConstructScore>;
  choice_answers: Record<string, ChoiceAnswer>;
  open_answers: Record<string, OpenAnswer>;
  cross_validations: CrossValidationResult[];
}

export interface DisplayGroup {
  name: string;
  constructs: string[];
}
