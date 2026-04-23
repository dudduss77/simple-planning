import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import {
  FEATURE_STATE_FORMAT_VERSION,
  PROJECT_INDEX_FORMAT_VERSION,
  allSteps,
  type FeatureCloseReason,
  type DocumentRecord,
  type FeatureState,
  type FeatureSummary,
  type FeatureWorkflowState,
  type ProjectIndex,
  type Step,
} from "./contracts.js";
import { ensureDirectory, fileExists, readJsonFile, writeJsonFile } from "./fs-utils.js";
import { getNextSuggestedStep } from "./pipeline.js";
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
import {
  documentPathsNeedRewrite,
  parseValidatedFeatureState,
  parseValidatedProjectIndex,
  reconstructFeatureDocumentPaths,
} from "./state-schemas.js";

export const CURRENT_PROJECT_INDEX_VERSION = PROJECT_INDEX_FORMAT_VERSION;
export const CURRENT_FEATURE_STATE_VERSION = FEATURE_STATE_FORMAT_VERSION;

type RawProjectIndex = Omit<ProjectIndex, "version" | "lastMigrationAt"> & {
  version?: number;
  lastMigrationAt?: string | null;
};

type RawFeatureState = Omit<FeatureState, "version" | "lastMigrationAt"> & {
  version?: number;
  lastMigrationAt?: string | null;
};

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
      version: PROJECT_INDEX_FORMAT_VERSION,
      initializedAt: nowIso(),
      updatedAt: nowIso(),
      lastMigrationAt: null,
      features: [],
    };
    await writeJsonFile(indexPath, initialIndex);
    return initialIndex;
  }

  const migration = await readMigratedProjectIndex(indexPath);
  if (migration.changed) {
    await writeJsonFile(indexPath, migration.state);
  }

  return migration.state;
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
    version: FEATURE_STATE_FORMAT_VERSION,
    featureId,
    name,
    slug,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    lastMigrationAt: null,
    status: "active",
    closeReason: null,
    closedAt: null,
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
    closeReason: state.closeReason,
    closedAt: state.closedAt,
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
    featureStatus: state.status,
    closeReason: state.closeReason,
    closedAt: state.closedAt,
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
  | { kind: "no_active"; features: FeatureSummary[] }
  | { kind: "missing"; featureRef: string; features: FeatureSummary[] }
  | { kind: "closed"; feature: FeatureSummary; features: FeatureSummary[] }
  | { kind: "ambiguous"; reason: string; features: FeatureSummary[] };

function sortFeatureSummaries(features: FeatureSummary[]): FeatureSummary[] {
  return [...features].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

function selectFeatureByRef(
  features: FeatureSummary[],
  featureRef: string,
): FeatureSummary | undefined {
  return features.find(
    (feature) =>
      feature.featureId === featureRef ||
      feature.slug === featureRef ||
      feature.name === featureRef,
  );
}

export async function resolveAnyFeatureSelection(
  cwd: string,
  featureRef?: string,
): Promise<FeatureSelectionResolution> {
  const index = await ensureProjectIndex(cwd);
  const features = sortFeatureSummaries(index.features);

  if (featureRef) {
    const matched = selectFeatureByRef(features, featureRef);
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

  const activeFeatures = features.filter((feature) => feature.status === "active");
  if (activeFeatures.length === 1) {
    return {
      kind: "resolved",
      feature: activeFeatures[0],
    };
  }

  return {
    kind: "ambiguous",
    reason:
      "Istnieje kilka feature'ów i nie da się jednoznacznie wybrać właściwego bez decyzji użytkownika.",
    features,
  };
}

export async function resolveFeatureSelection(
  cwd: string,
  featureRef?: string,
): Promise<FeatureSelectionResolution> {
  const index = await ensureProjectIndex(cwd);
  const features = sortFeatureSummaries(index.features);
  const activeFeatures = features.filter((feature) => feature.status === "active");

  if (featureRef) {
    const matched = selectFeatureByRef(features, featureRef);

    if (!matched) {
      return {
        kind: "missing",
        featureRef,
        features,
      };
    }

    if (matched.status === "closed") {
      return {
        kind: "closed",
        feature: matched,
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

  if (activeFeatures.length === 0) {
    return {
      kind: "no_active",
      features,
    };
  }

  if (activeFeatures.length === 1) {
    return {
      kind: "resolved",
      feature: activeFeatures[0],
    };
  }

  const awaitingConfirmation = activeFeatures.filter(
    (feature) => feature.awaitingUserConfirmation,
  );
  if (awaitingConfirmation.length === 1) {
    return {
      kind: "resolved",
      feature: awaitingConfirmation[0],
    };
  }

  const activeStepFeatures = activeFeatures.filter(
    (feature) => feature.activeStep !== null,
  );
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
  const activeFeatures = features.filter((feature) => feature.status === "active");

  if (featureRef) {
    const matched = selectFeatureByRef(features, featureRef);

    if (!matched) {
      return {
        kind: "missing",
        featureRef,
        features,
      };
    }

    if (matched.status === "closed") {
      return {
        kind: "closed",
        feature: matched,
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

  if (activeFeatures.length === 0) {
    return {
      kind: "no_active",
      features,
    };
  }

  const activeStepFeatures = activeFeatures.filter(
    (feature) => feature.activeStep !== null,
  );
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

  if (activeFeatures.length === 1) {
    return {
      kind: "resolved",
      feature: activeFeatures[0],
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
  const resolution = await resolveAnyFeatureSelection(cwd, featureRef);
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

  if (resolution.kind === "closed" || resolution.kind === "no_active") {
    throw new Error("Nie udało się załadować aktywnego feature'a.");
  }

  if (resolution.kind === "ambiguous") {
    throw new Error(
      "Zapytaj użytkownika, nad którym feature'em pracujemy, albo podaj --feature <slug|id>.",
    );
  }

  const statePath = getFeatureStatePath(cwd, resolution.feature.featureId);
  const migration = await readMigratedFeatureState(cwd, statePath);
  if (migration.changed) {
    await writeJsonFile(statePath, migration.state);
  }

  const state = migration.state;
  await refreshFeatureDocuments(state);
  return state;
}

function migrateProjectIndex(raw: RawProjectIndex): {
  state: ProjectIndex;
  changed: boolean;
} {
  const sourceVersion = raw.version ?? 1;
  if (sourceVersion > PROJECT_INDEX_FORMAT_VERSION) {
    throw new Error(
      `Wykryto nowszą wersję index.json (${sourceVersion}) niż obsługiwana przez CLI (${PROJECT_INDEX_FORMAT_VERSION}).`,
    );
  }

  let state: ProjectIndex = {
    version: sourceVersion,
    initializedAt: raw.initializedAt,
    updatedAt: raw.updatedAt,
    lastMigrationAt: raw.lastMigrationAt ?? null,
    features: raw.features ?? [],
  };
  let changed = raw.version === undefined || raw.lastMigrationAt === undefined;

  while (state.version < PROJECT_INDEX_FORMAT_VERSION) {
    switch (state.version) {
      case 1: {
        state = {
          ...state,
          version: 2,
          lastMigrationAt: nowIso(),
        };
        changed = true;
        break;
      }
      default: {
        throw new Error(`Brak migracji dla index.json v${state.version}.`);
      }
    }
  }

  return { state, changed };
}

function migrateFeatureState(raw: RawFeatureState): {
  state: FeatureState;
  changed: boolean;
} {
  const sourceVersion = raw.version ?? 1;
  if (sourceVersion > FEATURE_STATE_FORMAT_VERSION) {
    throw new Error(
      `Wykryto nowszą wersję feature state (${sourceVersion}) niż obsługiwana przez CLI (${FEATURE_STATE_FORMAT_VERSION}).`,
    );
  }

  let state: FeatureState = {
    version: sourceVersion,
    featureId: raw.featureId,
    name: raw.name,
    slug: raw.slug,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    lastMigrationAt: raw.lastMigrationAt ?? null,
    status: raw.status,
    closeReason: raw.closeReason,
    closedAt: raw.closedAt,
    activeStep: raw.activeStep,
    lastCompletedStep: raw.lastCompletedStep,
    nextSuggestedStep: raw.nextSuggestedStep,
    awaitingUserConfirmation: raw.awaitingUserConfirmation,
    awaitingAfterStep: raw.awaitingAfterStep,
    documents: raw.documents,
  };
  let changed = raw.version === undefined || raw.lastMigrationAt === undefined;

  while (state.version < FEATURE_STATE_FORMAT_VERSION) {
    switch (state.version) {
      case 1: {
        state = {
          ...state,
          version: 2,
          lastMigrationAt: nowIso(),
        };
        changed = true;
        break;
      }
      default: {
        throw new Error(`Brak migracji dla feature state v${state.version}.`);
      }
    }
  }

  return { state, changed };
}

async function readMigratedProjectIndex(indexPath: string): Promise<{
  state: ProjectIndex;
  changed: boolean;
}> {
  const raw = await readJsonFile(indexPath);
  const migration = migrateProjectIndex(raw as RawProjectIndex);
  const state = parseValidatedProjectIndex(indexPath, migration.state);
  return { state, changed: migration.changed };
}

async function readMigratedFeatureState(
  cwd: string,
  statePath: string,
): Promise<{
  state: FeatureState;
  changed: boolean;
}> {
  const raw = await readJsonFile(statePath);
  const migration = migrateFeatureState(raw as RawFeatureState);
  const validated = parseValidatedFeatureState(statePath, migration.state);
  const pathsUntrusted = documentPathsNeedRewrite(cwd, validated);
  const state = reconstructFeatureDocumentPaths(cwd, validated);
  const changed = migration.changed || pathsUntrusted;
  return { state, changed };
}

export async function migrateProjectStateFiles(cwd: string): Promise<{
  migratedIndex: boolean;
  migratedFeatureStates: string[];
}> {
  await ensureProjectSkeleton(cwd);

  const indexPath = getIndexPath(cwd);
  let migratedIndex = false;
  if (await fileExists(indexPath)) {
    const indexMigration = await readMigratedProjectIndex(indexPath);
    if (indexMigration.changed) {
      await writeJsonFile(indexPath, indexMigration.state);
      migratedIndex = true;
    }
  }

  const featureStateRoot = getFeatureStateRoot(cwd);
  const migratedFeatureStates: string[] = [];
  if (!(await fileExists(featureStateRoot))) {
    return { migratedIndex, migratedFeatureStates };
  }

  const entries = await fs.readdir(featureStateRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || path.extname(entry.name) !== ".json") {
      continue;
    }

    const statePath = path.join(featureStateRoot, entry.name);
    const stateMigration = await readMigratedFeatureState(cwd, statePath);
    if (!stateMigration.changed) {
      continue;
    }

    await writeJsonFile(statePath, stateMigration.state);
    migratedFeatureStates.push(statePath);
  }

  return { migratedIndex, migratedFeatureStates };
}

export async function refreshFeatureDocuments(state: FeatureState): Promise<void> {
  const refreshedEntries = await Promise.all(
    allSteps.map(async (step) => {
      const record = state.documents[step];
      if (!record) {
        throw new Error(
          `Brak wpisu documents['${step}'] w stanie feature'a '${state.slug}'. Plik stanu jest uszkodzony lub niekompletny.`,
        );
      }
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
  state.nextSuggestedStep = getNextSuggestedStep(state);
}

export function clearAwaitingUserConfirmation(state: FeatureState): void {
  state.awaitingUserConfirmation = false;
  state.awaitingAfterStep = null;
}

export function setAwaitingUserConfirmation(state: FeatureState, step: Step): void {
  state.awaitingUserConfirmation = true;
  state.awaitingAfterStep = step;
}

export function closeFeatureState(
  state: FeatureState,
  reason: FeatureCloseReason,
): void {
  state.status = "closed";
  state.closeReason = reason;
  state.closedAt = nowIso();
  state.activeStep = null;
  state.nextSuggestedStep = null;
  clearAwaitingUserConfirmation(state);
}
