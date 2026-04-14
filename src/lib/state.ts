import crypto from "node:crypto";

import {
  allSteps,
  type DocumentRecord,
  type FeatureState,
  type FeatureSummary,
  type FeatureWorkflowState,
  type ProjectIndex,
  type Step,
} from "./contracts.js";
import { ensureDirectory, fileExists, readJsonFile, writeJsonFile } from "./fs-utils.js";
import { getNextMainStep } from "./pipeline.js";
import {
  getFeatureDirectory,
  getFeatureStatePath,
  getFeatureStateRoot,
  getFeaturesRoot,
  getIndexPath,
  getProductRoot,
  getSimplePlanningRoot,
  getStateRoot,
} from "./project-paths.js";
import { getFeatureDocumentPaths } from "./templates.js";

function nowIso(): string {
  return new Date().toISOString();
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function createDocumentRecord(path: string): DocumentRecord {
  return {
    path,
    exists: false,
    completed: false,
    lastPreparedAt: null,
    lastCompletedAt: null,
  };
}

export async function ensureProjectSkeleton(cwd: string): Promise<void> {
  await Promise.all([
    ensureDirectory(getSimplePlanningRoot(cwd)),
    ensureDirectory(getStateRoot(cwd)),
    ensureDirectory(getFeatureStateRoot(cwd)),
    ensureDirectory(getFeaturesRoot(cwd)),
    ensureDirectory(getProductRoot(cwd)),
  ]);
}

export async function ensureProjectIndex(cwd: string): Promise<ProjectIndex> {
  await ensureProjectSkeleton(cwd);

  const indexPath = getIndexPath(cwd);
  if (!(await fileExists(indexPath))) {
    const initialIndex: ProjectIndex = {
      version: 1,
      initializedAt: nowIso(),
      updatedAt: nowIso(),
      features: [],
    };
    await writeJsonFile(indexPath, initialIndex);
    return initialIndex;
  }

  return readJsonFile<ProjectIndex>(indexPath);
}

export async function saveProjectIndex(
  cwd: string,
  index: ProjectIndex,
): Promise<void> {
  index.updatedAt = nowIso();
  await writeJsonFile(getIndexPath(cwd), index);
}

export function createFeatureId(): string {
  return crypto.randomUUID();
}

export function createFeatureState(cwd: string, name: string): FeatureState {
  const featureId = createFeatureId();
  const slug = slugify(name);

  if (!slug) {
    throw new Error(
      "Zapytaj użytkownika o nazwę folderu, chyba że wynika ona z kontekstu zadania, wtedy podaj ją jawnie w --name.",
    );
  }

  const featureDir = getFeatureDirectory(cwd, slug);
  const paths = getFeatureDocumentPaths(featureDir);

  const documents = Object.fromEntries(
    allSteps.map((step) => [step, createDocumentRecord(paths[step])]),
  ) as Record<Step, DocumentRecord>;

  return {
    version: 1,
    featureId,
    name,
    slug,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    status: "active",
    activeStep: null,
    lastCompletedStep: null,
    nextSuggestedStep: "idea",
    awaitingUserConfirmation: false,
    awaitingAfterStep: null,
    documents,
  };
}

export async function saveFeatureState(
  cwd: string,
  state: FeatureState,
): Promise<void> {
  state.updatedAt = nowIso();
  await writeJsonFile(getFeatureStatePath(cwd, state.featureId), state);
}

export async function syncFeatureSummary(
  cwd: string,
  state: FeatureState,
): Promise<void> {
  const index = await ensureProjectIndex(cwd);
  const summary: FeatureSummary = {
    featureId: state.featureId,
    name: state.name,
    slug: state.slug,
    status: state.status,
    activeStep: state.activeStep,
    lastCompletedStep: state.lastCompletedStep,
    nextSuggestedStep: state.nextSuggestedStep,
    awaitingUserConfirmation: state.awaitingUserConfirmation,
    awaitingAfterStep: state.awaitingAfterStep,
    updatedAt: state.updatedAt,
  };

  const existingIndex = index.features.findIndex(
    (feature) => feature.featureId === state.featureId,
  );
  if (existingIndex >= 0) {
    index.features[existingIndex] = summary;
  } else {
    index.features.push(summary);
  }

  await saveProjectIndex(cwd, index);
}

export function summarizeFeatureState(state: FeatureState): FeatureWorkflowState {
  return {
    featureId: state.featureId,
    featureName: state.name,
    featureSlug: state.slug,
    activeStep: state.activeStep,
    lastCompletedStep: state.lastCompletedStep,
    nextSuggestedStep: state.nextSuggestedStep,
    awaitingUserConfirmation: state.awaitingUserConfirmation,
    awaitingAfterStep: state.awaitingAfterStep,
  };
}

export type FeatureSelectionResolution =
  | { kind: "resolved"; feature: FeatureSummary }
  | { kind: "empty" }
  | { kind: "missing"; featureRef: string; features: FeatureSummary[] }
  | { kind: "ambiguous"; reason: string; features: FeatureSummary[] };

function sortFeatureSummaries(features: FeatureSummary[]): FeatureSummary[] {
  return [...features].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

export async function resolveFeatureSelection(
  cwd: string,
  featureRef?: string,
): Promise<FeatureSelectionResolution> {
  const index = await ensureProjectIndex(cwd);
  const features = sortFeatureSummaries(index.features);

  if (featureRef) {
    const matched = features.find(
      (feature) =>
        feature.featureId === featureRef ||
        feature.slug === featureRef ||
        feature.name === featureRef,
    );

    if (!matched) {
      return {
        kind: "missing",
        featureRef,
        features,
      };
    }

    return {
      kind: "resolved",
      feature: matched,
    };
  }

  if (features.length === 0) {
    return { kind: "empty" };
  }

  if (features.length === 1) {
    return {
      kind: "resolved",
      feature: features[0],
    };
  }

  const awaitingConfirmation = features.filter(
    (feature) => feature.awaitingUserConfirmation,
  );
  if (awaitingConfirmation.length === 1) {
    return {
      kind: "resolved",
      feature: awaitingConfirmation[0],
    };
  }

  const activeStepFeatures = features.filter((feature) => feature.activeStep !== null);
  if (activeStepFeatures.length === 1) {
    return {
      kind: "resolved",
      feature: activeStepFeatures[0],
    };
  }

  return {
    kind: "ambiguous",
    reason:
      "Istnieje kilka aktywnych feature'ów i nie da się jednoznacznie wybrać właściwego bez decyzji użytkownika.",
    features,
  };
}

export async function resolveActiveStepFeatureSelection(
  cwd: string,
  featureRef?: string,
): Promise<FeatureSelectionResolution> {
  const index = await ensureProjectIndex(cwd);
  const features = sortFeatureSummaries(index.features);

  if (featureRef) {
    const matched = features.find(
      (feature) =>
        feature.featureId === featureRef ||
        feature.slug === featureRef ||
        feature.name === featureRef,
    );

    if (!matched) {
      return {
        kind: "missing",
        featureRef,
        features,
      };
    }

    return {
      kind: "resolved",
      feature: matched,
    };
  }

  if (features.length === 0) {
    return { kind: "empty" };
  }

  const activeStepFeatures = features.filter((feature) => feature.activeStep !== null);
  if (activeStepFeatures.length === 1) {
    return {
      kind: "resolved",
      feature: activeStepFeatures[0],
    };
  }

  if (activeStepFeatures.length > 1) {
    return {
      kind: "ambiguous",
      reason:
        "Istnieje kilka feature'ów z aktywnym krokiem. Wskaż, nad którym mam dalej pracować.",
      features: activeStepFeatures,
    };
  }

  if (features.length === 1) {
    return {
      kind: "resolved",
      feature: features[0],
    };
  }

  return {
    kind: "ambiguous",
    reason:
      "Nie ma jednoznacznego aktywnego kroku do wznowienia. Wskaż feature albo użyj komendy kontynuacji workflow.",
    features,
  };
}

export async function loadFeatureState(
  cwd: string,
  featureRef?: string,
): Promise<FeatureState> {
  const resolution = await resolveFeatureSelection(cwd, featureRef);
  if (resolution.kind === "empty") {
    throw new Error(
      "Brak feature'ów w Simple Planning. Jeśli to nowy temat, utwórz go przez 'simple-planning start --name <feature-name> --description <text>' albo 'simple-planning idea --name <feature-name> --description <text>'.",
    );
  }

  if (resolution.kind === "missing") {
    throw new Error(
      `Nie znaleziono feature'a '${resolution.featureRef}'. Jeśli to istniejący feature, użyj 'simple-planning list', aby sprawdzić poprawny slug lub id. Jeśli to nowy feature, utwórz go przez 'simple-planning start --name <feature-name> --description <text>' albo 'simple-planning idea --name <feature-name> --description <text>'.`,
    );
  }

  if (resolution.kind === "ambiguous") {
    throw new Error(
      "Zapytaj użytkownika, nad którym feature'em pracujemy, albo podaj --feature <slug|id>.",
    );
  }

  const state = await readJsonFile<FeatureState>(
    getFeatureStatePath(cwd, resolution.feature.featureId),
  );
  await refreshFeatureDocuments(state);
  return state;
}

export async function refreshFeatureDocuments(state: FeatureState): Promise<void> {
  const refreshedEntries = await Promise.all(
    allSteps.map(async (step) => {
      const record = state.documents[step];
      return [step, { ...record, exists: await fileExists(record.path) }] as const;
    }),
  );

  state.documents = Object.fromEntries(refreshedEntries) as Record<
    Step,
    DocumentRecord
  >;
}

export function markPrepared(state: FeatureState, step: Step): void {
  state.activeStep = step;
  state.documents[step].lastPreparedAt = nowIso();
}

export function markCompleted(state: FeatureState, step: Step): void {
  const completedAt = nowIso();
  state.activeStep = null;
  state.lastCompletedStep = step;
  state.documents[step].exists = true;
  state.documents[step].completed = true;
  state.documents[step].lastCompletedAt = completedAt;
  state.nextSuggestedStep = getNextMainStep(state);
}

export function clearAwaitingUserConfirmation(state: FeatureState): void {
  state.awaitingUserConfirmation = false;
  state.awaitingAfterStep = null;
}

export function setAwaitingUserConfirmation(state: FeatureState, step: Step): void {
  state.awaitingUserConfirmation = true;
  state.awaitingAfterStep = step;
}
