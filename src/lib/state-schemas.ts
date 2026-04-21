import path from "node:path";
import { z } from "zod";

import {
  FEATURE_STATE_FORMAT_VERSION,
  PROJECT_INDEX_FORMAT_VERSION,
  allSteps,
  featureCloseReasons,
  type FeatureState,
  type ProjectIndex,
  type Step,
} from "./contracts.js";
import { getFeatureDirectory } from "./project-paths.js";
import { getFeatureDocumentPaths } from "./templates.js";

const stepEnum = z.enum(allSteps as unknown as [Step, ...Step[]]);

const featureCloseReasonEnum = z.enum(
  featureCloseReasons as unknown as [
    (typeof featureCloseReasons)[number],
    ...(typeof featureCloseReasons)[number][],
  ],
);

const featureStatusEnum = z.enum(["active", "closed"]);

/** Slug generowany przez `slugify` w `state.ts` — odrzuca segmenty path traversal w nazwie folderu. */
const slugSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "slug musi być niepusty i składać się z małych liter, cyfr i pojedynczych myślników (np. feature-alpha)",
  );

const stepOrNullSchema = z.union([stepEnum, z.null()]);

const documentRecordSchema = z
  .object({
    path: z.string().min(1),
    exists: z.boolean(),
    completed: z.boolean(),
    lastPreparedAt: z.union([z.string(), z.null()]),
    lastCompletedAt: z.union([z.string(), z.null()]),
  })
  .strict();

function buildDocumentsSchema(): z.ZodObject<Record<string, typeof documentRecordSchema>> {
  const shape: Record<string, typeof documentRecordSchema> = {};
  for (const step of allSteps) {
    shape[step] = documentRecordSchema;
  }
  return z.object(shape).strict();
}

const documentsSchema = buildDocumentsSchema();

export const featureSummarySchema = z
  .object({
    featureId: z.uuid(),
    name: z.string(),
    slug: slugSchema,
    status: featureStatusEnum,
    closeReason: z.union([featureCloseReasonEnum, z.null()]),
    closedAt: z.union([z.string(), z.null()]),
    activeStep: stepOrNullSchema,
    lastCompletedStep: stepOrNullSchema,
    nextSuggestedStep: stepOrNullSchema,
    awaitingUserConfirmation: z.boolean(),
    awaitingAfterStep: stepOrNullSchema,
    updatedAt: z.string().min(1),
  })
  .strict();

export const projectIndexSchema = z
  .object({
    version: z.literal(PROJECT_INDEX_FORMAT_VERSION),
    initializedAt: z.string().min(1),
    updatedAt: z.string().min(1),
    lastMigrationAt: z.union([z.string(), z.null()]),
    features: z.array(featureSummarySchema),
  })
  .strict();

export const featureStateSchema = z
  .object({
    version: z.literal(FEATURE_STATE_FORMAT_VERSION),
    featureId: z.uuid(),
    name: z.string(),
    slug: slugSchema,
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    lastMigrationAt: z.union([z.string(), z.null()]),
    status: featureStatusEnum,
    closeReason: z.union([featureCloseReasonEnum, z.null()]),
    closedAt: z.union([z.string(), z.null()]),
    activeStep: stepOrNullSchema,
    lastCompletedStep: stepOrNullSchema,
    nextSuggestedStep: stepOrNullSchema,
    awaitingUserConfirmation: z.boolean(),
    awaitingAfterStep: stepOrNullSchema,
    documents: documentsSchema,
  })
  .strict();

function formatStateValidationError(filePath: string, error: z.ZodError): Error {
  const relativePath = path.basename(filePath);
  const lines = error.issues.map((issue) => {
    const pathStr =
      issue.path.length > 0 ? issue.path.map(String).join(".") : "(root)";
    return `${pathStr}: ${issue.message}`;
  });
  return new Error(
    `Niepoprawny plik stanu '${relativePath}' (${filePath}):\n${lines.join("\n")}`,
  );
}

export function parseValidatedProjectIndex(
  filePath: string,
  input: unknown,
): ProjectIndex {
  const result = projectIndexSchema.safeParse(input);
  if (!result.success) {
    throw formatStateValidationError(filePath, result.error);
  }
  return result.data as ProjectIndex;
}

export function parseValidatedFeatureState(
  filePath: string,
  input: unknown,
): FeatureState {
  const result = featureStateSchema.safeParse(input);
  if (!result.success) {
    throw formatStateValidationError(filePath, result.error);
  }
  return result.data as FeatureState;
}

/** Czy wpisane w JSON ścieżki dokumentów różnią się od kanonicznych dla danego `slug` (nie ufamy JSON). */
export function documentPathsNeedRewrite(cwd: string, state: FeatureState): boolean {
  const canonical = getFeatureDocumentPaths(getFeatureDirectory(cwd, state.slug));
  return allSteps.some((step) => state.documents[step].path !== canonical[step]);
}

/**
 * Przelicza ścieżki plików dokumentów wyłącznie z `cwd` + `slug` + konwencji nazw plików.
 * Zachowuje metadane (`exists`, `completed`, znaczniki czasu) z poprzedniego stanu dla każdego kroku.
 */
export function reconstructFeatureDocumentPaths(
  cwd: string,
  state: FeatureState,
): FeatureState {
  const paths = getFeatureDocumentPaths(getFeatureDirectory(cwd, state.slug));
  const documents = {} as FeatureState["documents"];

  for (const step of allSteps) {
    const prev = state.documents[step];
    documents[step] = {
      path: paths[step],
      exists: prev.exists,
      completed: prev.completed,
      lastPreparedAt: prev.lastPreparedAt,
      lastCompletedAt: prev.lastCompletedAt,
    };
  }

  return { ...state, documents };
}
