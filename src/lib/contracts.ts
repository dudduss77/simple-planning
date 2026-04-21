/** Wersje zapisów JSON w `.simple-planning/state/` — muszą być zgodne z migracjami w `state.ts`. */
export const PROJECT_INDEX_FORMAT_VERSION = 2;
export const FEATURE_STATE_FORMAT_VERSION = 2;

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
export const featureCloseReasons = [
  "done",
  "wont-do",
  "duplicate",
  "obsolete",
] as const;

export type MainStep = (typeof mainSteps)[number];
export type SideStep = (typeof sideSteps)[number];
export type Step = (typeof allSteps)[number];
export type FeatureStatus = "active" | "closed";
export type FeatureCloseReason = (typeof featureCloseReasons)[number];
export type AgentAction =
  | "initialize_project"
  | "update_project"
  | "choose_feature"
  | "show_status"
  | "show_next_step"
  | "prepare_next_step"
  | "write_bootstrap_documents"
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
  version: number;
  initializedAt: string;
  updatedAt: string;
  lastMigrationAt: string | null;
  features: FeatureSummary[];
}

export interface FeatureSummary {
  featureId: string;
  name: string;
  slug: string;
  status: FeatureStatus;
  closeReason: FeatureCloseReason | null;
  closedAt: string | null;
  activeStep: Step | null;
  lastCompletedStep: Step | null;
  nextSuggestedStep: Step | null;
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
  version: number;
  featureId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  lastMigrationAt: string | null;
  status: FeatureStatus;
  closeReason: FeatureCloseReason | null;
  closedAt: string | null;
  activeStep: Step | null;
  lastCompletedStep: Step | null;
  nextSuggestedStep: Step | null;
  awaitingUserConfirmation: boolean;
  awaitingAfterStep: Step | null;
  documents: Record<Step, DocumentRecord>;
}

// --- Wynik CLI (JSON): dyskryminacja po `command` + `ok` ---

/** Błąd obsługi komendy lub nieobsłużony wyjątek (`cli.ts`). */
export interface CommandFailureResult {
  ok: false;
  command: string;
  message: string;
  agentAction: "stop_and_ask_user";
  stopReason: StopReason;
}

/** Sam komunikat kolejnego polecenia (np. brak feature’ów). */
export interface SuggestedCommandData {
  suggestedCommand: string;
}

/** Lista feature’ów + podpowiedź (np. brak aktywnych / wiele wpisów). */
export interface FeaturesSuggestedCommandData {
  availableFeatures: FeatureSummary[];
  suggestedCommand: string;
}

/** Zamknięty feature z podpowiedzią `continue` / `start`. */
export interface ClosedFeatureSuggestedCommandsData {
  feature: FeatureSummary;
  suggestedCommands: string[];
}

export interface InitResultData {
  planningRoot: string;
  productRoot: string;
  commandsRoot: string;
  cursorCommandsRoot: string;
}

export interface ListResultData {
  count: number;
  features: FeatureSummary[];
}

/** Wynik `idea` — używany także wewnętrznie przez `start`. */
export interface IdeaResultData {
  featureId: string;
  featureSlug: string;
  featureName: string;
  featureDirectory: string;
  ideaFile: string;
  targetDocument: TargetDocument;
  nextSuggestedStep: Step | null;
  nextContext: {
    nextStep: Step | null;
    prompt: PromptContext;
  };
  nextPromptRef: string;
  nextPromptText: string | null;
  nextCommand: string;
}

/** Blokada checkpointu przed zatwierdzeniem (`run` bez `--complete`). */
export interface RunAwaitingCheckpointData extends FeatureWorkflowState {
  requestedStep: Step;
}

/** `next` z kontekstem kolejnego promptu. */
export interface NextWithContextData extends FeatureWorkflowState {
  nextContext: {
    nextStep: Step | null;
    prompt: PromptContext;
  };
}

/** Vision za krótki / brak pliku — bootstrap. */
export interface BootstrapVisionGateData {
  visionFile: string;
  minimumMeaningfulCharacters: number;
  recommendedCharacters: string;
  meaningfulVisionCharacters?: number;
}

/** Brak aktywnego kroku w `work-on-current-step`. */
export interface WorkOnIdleData extends FeatureWorkflowState {
  suggestedCommands: string[];
}

export type RunOkData =
  | RunAwaitingCheckpointData
  | PrepareResultData
  | StepCompletionData;

/** Zwęża wynik `run` do przygotowania etapu — m.in. start, bootstrap, continue, work-on-current-step. */
export function assertPrepareResultData(data: RunOkData): PrepareResultData {
  if ("preparation" in data) {
    return data;
  }
  throw new Error(
    "Oczekiwano wyniku przygotowania etapu z polem 'preparation'. Otrzymano inny wariant wyniku komendy 'run'.",
  );
}

export type ContinueOkData =
  | SuggestedCommandData
  | FeaturesSuggestedCommandData
  | ClosedFeatureSuggestedCommandsData
  | FeatureSelectionData
  | ContinueResultData
  | PrepareResultData
  | StepCompletionData
  | FeatureWorkflowState;

export type NextOkData =
  | SuggestedCommandData
  | FeaturesSuggestedCommandData
  | { feature: FeatureSummary; suggestedCommand: string }
  | FeatureSelectionData
  | FeatureWorkflowState
  | NextWithContextData;

export type StatusOkData =
  | SuggestedCommandData
  | FeatureSelectionData
  | StatusResultData;

export type CloseFeatureOkData =
  | SuggestedCommandData
  | FeaturesSuggestedCommandData
  | { feature: FeatureSummary }
  | FeatureSelectionData
  | FeatureWorkflowState;

export type WorkOnCurrentStepOkData =
  | SuggestedCommandData
  | FeaturesSuggestedCommandData
  | { feature: FeatureSummary; suggestedCommand: string }
  | FeatureSelectionData
  | WorkOnIdleData
  | PrepareResultData;

export interface InitCommandSuccess {
  ok: true;
  command: "init";
  message: string;
  agentAction: "initialize_project";
  stopReason: StopReason;
  data: InitResultData;
}

export interface ListCommandSuccess {
  ok: true;
  command: "list";
  message: string;
  agentAction: "show_status";
  stopReason: StopReason;
  data: ListResultData;
}

export interface UpdateCommandSuccess {
  ok: true;
  command: "update";
  message: string;
  agentAction: "update_project" | "stop_and_ask_user";
  stopReason: StopReason;
  data: UpdateResultData;
}

export interface IdeaCommandSuccess {
  ok: true;
  command: "idea";
  message: string;
  agentAction: "prepare_next_step";
  stopReason: StopReason;
  data: IdeaResultData;
}

export interface StartCommandSuccess {
  ok: true;
  command: "start";
  message: string;
  agentAction: AgentAction;
  stopReason: StopReason;
  data: StartResultData;
}

export interface BootstrapCommandSuccess {
  ok: true;
  command: "bootstrap";
  message: string;
  agentAction: "stop_and_ask_user" | "write_bootstrap_documents";
  stopReason: StopReason;
  data: BootstrapResultData | BootstrapVisionGateData;
}

export interface ContinueCommandSuccess {
  ok: true;
  command: "continue";
  message: string;
  agentAction: AgentAction;
  stopReason: StopReason;
  data: ContinueOkData;
}

export interface RunCommandSuccess {
  ok: true;
  command: "run";
  message: string;
  agentAction: "write_document" | "stop_and_ask_user" | "step_completed";
  stopReason: StopReason;
  data: RunOkData;
}

export interface NextCommandSuccess {
  ok: true;
  command: "next";
  message: string;
  agentAction:
    | "stop_and_ask_user"
    | "choose_feature"
    | "show_next_step"
    | "pipeline_complete";
  stopReason: StopReason;
  data: NextOkData;
}

export interface StatusCommandSuccess {
  ok: true;
  command: "status";
  message: string;
  agentAction: "show_status" | "choose_feature" | "stop_and_ask_user";
  stopReason: StopReason;
  data: StatusOkData;
}

export interface WorkOnCurrentStepCommandSuccess {
  ok: true;
  command: "work-on-current-step";
  message: string;
  agentAction: AgentAction;
  stopReason: StopReason;
  data: WorkOnCurrentStepOkData;
}

export interface CloseFeatureCommandSuccess {
  ok: true;
  command: "close-feature";
  message: string;
  agentAction: AgentAction;
  stopReason: StopReason;
  data: CloseFeatureOkData;
}

/** Skonsolidowany typ wyniku dowolnej komendy CLI (stdout JSON). */
export type CommandResult =
  | CommandFailureResult
  | InitCommandSuccess
  | ListCommandSuccess
  | UpdateCommandSuccess
  | IdeaCommandSuccess
  | StartCommandSuccess
  | BootstrapCommandSuccess
  | ContinueCommandSuccess
  | RunCommandSuccess
  | NextCommandSuccess
  | StatusCommandSuccess
  | WorkOnCurrentStepCommandSuccess
  | CloseFeatureCommandSuccess;

export interface UpdateResultData {
  createdFiles: string[];
  overwrittenFiles: string[];
  unchangedFiles: string[];
  skippedFiles: string[];
  pendingOverwriteFiles: string[];
  migratedIndex: boolean;
  migratedFeatureStates: string[];
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
  featureStatus: FeatureStatus;
  closeReason: FeatureCloseReason | null;
  closedAt: string | null;
  activeStep: Step | null;
  lastCompletedStep: Step | null;
  nextSuggestedStep: Step | null;
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

export type BootstrapDocumentId =
  | "vision"
  | "roadmap"
  | "bootstrap-discovery";

export interface BootstrapDocumentTask {
  id: BootstrapDocumentId;
  title: string;
  targetPath: string;
  requiredFiles: string[];
  prompt: PromptContext;
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

export interface BootstrapResultData extends FeatureWorkflowState {
  bootstrapMode: "existing-project";
  visionFile: string;
  roadmapFile: string;
  featureDirectory: string;
  bootstrapIdeaFile: string;
  documents: BootstrapDocumentTask[];
  discoveryPreparation: WorkflowPreparation;
}

export interface ContinueResultData extends PrepareResultData {
  resumedFromCheckpoint: boolean;
}

export interface StatusResultData extends FeatureWorkflowState {
  documents: Record<Step, DocumentRecord>;
  nextContext: {
    nextStep: Step | null;
    prompt: PromptContext;
  };
}

export interface StepCompletionData extends FeatureWorkflowState {
  completedStep: Step;
  nextContext: {
    nextStep: Step | null;
    prompt: PromptContext;
  };
  nextPromptRef: string | null;
  nextPromptText: string | null;
}
