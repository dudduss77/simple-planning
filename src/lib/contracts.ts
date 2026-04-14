export const mainSteps = [
  "idea",
  "discovery",
  "product-spec",
  "mvp",
  "tech-spec",
  "tasks",
] as const;

export const sideSteps = ["decision-log", "parking-lot"] as const;

export const allSteps = [...mainSteps, ...sideSteps] as const;

export type MainStep = (typeof mainSteps)[number];
export type SideStep = (typeof sideSteps)[number];
export type Step = (typeof allSteps)[number];
export type AgentAction =
  | "initialize_project"
  | "choose_feature"
  | "show_status"
  | "show_next_step"
  | "prepare_next_step"
  | "write_document"
  | "step_completed"
  | "stop_and_ask_user"
  | "pipeline_complete";
export type StopReason =
  | "awaiting_user_confirmation"
  | "pipeline_completed"
  | "none";

export interface StepDefinition {
  step: Step;
  kind: "main" | "side";
  title: string;
  filename: string;
  commandGuide?: string;
  dependencies: Step[];
  requiresUserConfirmation: boolean;
}

export interface ProjectIndex {
  version: 1;
  initializedAt: string;
  updatedAt: string;
  features: FeatureSummary[];
}

export interface FeatureSummary {
  featureId: string;
  name: string;
  slug: string;
  status: "active";
  activeStep: Step | null;
  lastCompletedStep: Step | null;
  nextSuggestedStep: MainStep | null;
  awaitingUserConfirmation: boolean;
  awaitingAfterStep: Step | null;
  updatedAt: string;
}

export interface DocumentRecord {
  path: string;
  exists: boolean;
  completed: boolean;
  lastPreparedAt: string | null;
  lastCompletedAt: string | null;
}

export interface FeatureState {
  version: 1;
  featureId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  status: "active";
  activeStep: Step | null;
  lastCompletedStep: Step | null;
  nextSuggestedStep: MainStep | null;
  awaitingUserConfirmation: boolean;
  awaitingAfterStep: Step | null;
  documents: Record<Step, DocumentRecord>;
}

export interface CommandResult {
  ok: boolean;
  command: string;
  message: string;
  agentAction: AgentAction;
  stopReason: StopReason;
  data?: unknown;
}

export interface PromptContext {
  path: string | null;
  ref: string | null;
  text: string | null;
}

export interface TargetDocument {
  step: Step;
  path: string;
}

export interface SourceContext {
  requiredFiles: string[];
  prompt: PromptContext;
}

export interface FeatureWorkflowState {
  featureId: string;
  featureName: string;
  featureSlug: string;
  activeStep: Step | null;
  lastCompletedStep: Step | null;
  nextSuggestedStep: MainStep | null;
  awaitingUserConfirmation: boolean;
  awaitingAfterStep: Step | null;
}

export interface WorkflowPreparation {
  step: Step;
  targetDocument: TargetDocument;
  requiredFiles: string[];
  prompt: PromptContext;
  nextCommand: string;
  confirmedByUser: boolean;
}

export interface FeatureSelectionData {
  selectionRequired: true;
  selectionReason: string;
  suggestedCommand: string;
  availableFeatures: FeatureSummary[];
}

export interface PrepareResultData extends FeatureWorkflowState {
  step: Step;
  preparation: WorkflowPreparation;
}

export interface StartResultData extends FeatureWorkflowState {
  createdFeature: true;
  featureDirectory: string;
  ideaFile: string;
  preparation: WorkflowPreparation;
}

export interface ContinueResultData extends PrepareResultData {
  resumedFromCheckpoint: boolean;
}

export interface StatusResultData extends FeatureWorkflowState {
  documents: Record<Step, DocumentRecord>;
  nextContext: {
    nextStep: MainStep | null;
    prompt: PromptContext;
  };
}

export interface StepCompletionData extends FeatureWorkflowState {
  completedStep: Step;
  nextContext: {
    nextStep: MainStep | null;
    prompt: PromptContext;
  };
  nextPromptRef: string | null;
  nextPromptText: string | null;
}
