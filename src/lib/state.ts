import crypto from "node:crypto";

import {
  allSteps,
  type DocumentRecord,
  type FeatureState,
  type FeatureSummary,
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

export async function loadFeatureState(
  cwd: string,
  featureRef?: string,
): Promise<FeatureState> {
  const index = await ensureProjectIndex(cwd);

  if (!featureRef) {
    if (index.features.length === 1) {
      featureRef = index.features[0].slug;
    } else {
      throw new Error(
        "Zapytaj użytkownika, nad którym feature'em pracujemy, albo podaj --feature <slug|id>.",
      );
    }
  }

  const matched = index.features.find(
    (feature) =>
      feature.featureId === featureRef ||
      feature.slug === featureRef ||
      feature.name === featureRef,
  );

  if (!matched) {
    throw new Error(
      `Nie znaleziono feature'a '${featureRef}'. Użyj 'simple-planning list', aby zobaczyć dostępne feature'y.`,
    );
  }

  const state = await readJsonFile<FeatureState>(
    getFeatureStatePath(cwd, matched.featureId),
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
