import path from "node:path";

import {
  fileExists,
  readTextFile,
  writeTextFile,
} from "./fs-utils.js";
import {
  getCommandSourceRoot,
  getCursorCommandTemplateSource,
  getCursorCommandsRoot,
  getPlanningRoot,
  getPlanningSourceRoot,
  getProductRoot,
  getProjectCommandsRoot,
  getSimplePlanningRoot,
} from "./project-paths.js";
import {
  buildBootstrapProjectCursorCommandTemplate,
  buildCloseFeatureCursorCommandTemplate,
  buildContinueFeatureCursorCommandTemplate,
  buildFeatureStatusCursorCommandTemplate,
  buildStartFeatureCursorCommandTemplate,
  buildWorkOnCurrentStepCursorCommandTemplate,
  createProductRoadmapTemplate,
  createProductVisionTemplate,
} from "./templates.js";

export type TemplateSyncMode = "init" | "update";
export type TemplateUpdatePolicy = "overwrite-managed" | "preserve-local";
export type TemplatePlanAction =
  | "create"
  | "overwrite"
  | "skip"
  | "unchanged"
  | "awaiting_confirmation";

interface BaseTemplateFileDefinition {
  targetPath: string;
  updatePolicy: TemplateUpdatePolicy;
  requiresConfirmation: boolean;
}

interface TemplateFileWithSource extends BaseTemplateFileDefinition {
  sourcePath: string;
  fallbackContent?: () => string;
}

interface TemplateFileWithContent extends BaseTemplateFileDefinition {
  content: () => string;
}

export type TemplateFileDefinition =
  | TemplateFileWithSource
  | TemplateFileWithContent;

export interface TemplateFilePlanEntry {
  targetPath: string;
  updatePolicy: TemplateUpdatePolicy;
  requiresConfirmation: boolean;
  action: TemplatePlanAction;
  desiredContent: string;
}

const guideFiles = [
  "Vision.md",
  "Roadmap.md",
  "Discovery.md",
  "ProductSpec.md",
  "MVP.md",
  "TechSpec.md",
  "Tasks.md",
  "DecisionLog.md",
  "ParkingLot.md",
] as const;

const cursorCommandFiles = [
  {
    filename: "start-feature.md",
    fallback: () => buildStartFeatureCursorCommandTemplate(),
  },
  {
    filename: "close-feature.md",
    fallback: () => buildCloseFeatureCursorCommandTemplate(),
  },
  {
    filename: "continue-feature.md",
    fallback: () => buildContinueFeatureCursorCommandTemplate(),
  },
  {
    filename: "work-on-current-step.md",
    fallback: () => buildWorkOnCurrentStepCursorCommandTemplate(),
  },
  {
    filename: "feature-status.md",
    fallback: () => buildFeatureStatusCursorCommandTemplate(),
  },
  {
    filename: "bootstrap-project.md",
    fallback: () => buildBootstrapProjectCursorCommandTemplate(),
  },
] as const;

async function resolveTemplateContent(
  definition: TemplateFileDefinition,
): Promise<string> {
  if ("content" in definition) {
    return definition.content();
  }

  if (await fileExists(definition.sourcePath)) {
    return readTextFile(definition.sourcePath);
  }

  if (definition.fallbackContent) {
    return definition.fallbackContent();
  }

  throw new Error(`Nie znaleziono pliku źródłowego '${definition.sourcePath}'.`);
}

export function getTemplateFileDefinitions(cwd: string): TemplateFileDefinition[] {
  const planningRoot = getPlanningRoot(cwd);
  const productRoot = getProductRoot(cwd);
  const commandsRoot = getProjectCommandsRoot(cwd);
  const simplePlanningRoot = getSimplePlanningRoot(cwd);
  const cursorCommandsRoot = getCursorCommandsRoot(cwd);
  const planningSourceRoot = getPlanningSourceRoot();
  const commandSourceRoot = getCommandSourceRoot();

  const planningFiles: TemplateFileDefinition[] = [
    {
      sourcePath: path.join(planningSourceRoot, "README.md"),
      targetPath: path.join(planningRoot, "README.md"),
      updatePolicy: "preserve-local",
      requiresConfirmation: false,
    },
    {
      sourcePath: path.join(planningSourceRoot, "product", "README.md"),
      targetPath: path.join(productRoot, "README.md"),
      updatePolicy: "preserve-local",
      requiresConfirmation: false,
    },
    {
      sourcePath: path.join(planningSourceRoot, "features", "README.md"),
      targetPath: path.join(planningRoot, "features", "README.md"),
      updatePolicy: "preserve-local",
      requiresConfirmation: false,
    },
    {
      sourcePath: path.join(planningSourceRoot, "AGENTS.md"),
      targetPath: path.join(simplePlanningRoot, "AGENTS.md"),
      updatePolicy: "overwrite-managed",
      requiresConfirmation: true,
    },
    {
      content: () => createProductVisionTemplate(),
      targetPath: path.join(productRoot, "01-vision.md"),
      updatePolicy: "preserve-local",
      requiresConfirmation: false,
    },
    {
      content: () => createProductRoadmapTemplate(),
      targetPath: path.join(productRoot, "02-roadmap.md"),
      updatePolicy: "preserve-local",
      requiresConfirmation: false,
    },
  ];

  const commandFiles: TemplateFileDefinition[] = guideFiles.map((filename) => ({
    sourcePath: path.join(commandSourceRoot, filename),
    targetPath: path.join(commandsRoot, filename),
    updatePolicy: "overwrite-managed",
    requiresConfirmation: true,
  }));

  const cursorFiles: TemplateFileDefinition[] = cursorCommandFiles.map(
    ({ filename, fallback }) => ({
      sourcePath: getCursorCommandTemplateSource(filename),
      targetPath: path.join(cursorCommandsRoot, filename),
      updatePolicy: "overwrite-managed",
      requiresConfirmation: true,
      fallbackContent: fallback,
    }),
  );

  return [...planningFiles, ...commandFiles, ...cursorFiles];
}

export async function planTemplateFileSync(
  cwd: string,
  mode: TemplateSyncMode,
): Promise<TemplateFilePlanEntry[]> {
  const definitions = getTemplateFileDefinitions(cwd);

  return Promise.all(
    definitions.map(async (definition) => {
      const desiredContent = await resolveTemplateContent(definition);
      const targetExists = await fileExists(definition.targetPath);

      if (mode === "init") {
        return {
          targetPath: definition.targetPath,
          updatePolicy: definition.updatePolicy,
          requiresConfirmation: definition.requiresConfirmation,
          action: targetExists ? "skip" : "create",
          desiredContent,
        };
      }

      if (definition.updatePolicy === "preserve-local") {
        return {
          targetPath: definition.targetPath,
          updatePolicy: definition.updatePolicy,
          requiresConfirmation: definition.requiresConfirmation,
          action: "skip",
          desiredContent,
        };
      }

      if (!targetExists) {
        return {
          targetPath: definition.targetPath,
          updatePolicy: definition.updatePolicy,
          requiresConfirmation: definition.requiresConfirmation,
          action: "create",
          desiredContent,
        };
      }

      const currentContent = await readTextFile(definition.targetPath);
      if (currentContent === desiredContent) {
        return {
          targetPath: definition.targetPath,
          updatePolicy: definition.updatePolicy,
          requiresConfirmation: definition.requiresConfirmation,
          action: "unchanged",
          desiredContent,
        };
      }

      return {
        targetPath: definition.targetPath,
        updatePolicy: definition.updatePolicy,
        requiresConfirmation: definition.requiresConfirmation,
        action: definition.requiresConfirmation
          ? "awaiting_confirmation"
          : "overwrite",
        desiredContent,
      };
    }),
  );
}

export async function applyTemplateFilePlan(
  plan: TemplateFilePlanEntry[],
  options?: {
    confirmedManagedPaths?: Set<string>;
  },
): Promise<TemplateFilePlanEntry[]> {
  const confirmedManagedPaths = options?.confirmedManagedPaths ?? new Set<string>();
  const applied: TemplateFilePlanEntry[] = [];

  for (const entry of plan) {
    if (entry.action === "create") {
      await writeTextFile(entry.targetPath, entry.desiredContent);
      applied.push(entry);
      continue;
    }

    if (entry.action === "overwrite") {
      await writeTextFile(entry.targetPath, entry.desiredContent);
      applied.push(entry);
      continue;
    }

    if (
      entry.action === "awaiting_confirmation" &&
      confirmedManagedPaths.has(entry.targetPath)
    ) {
      await writeTextFile(entry.targetPath, entry.desiredContent);
      applied.push({ ...entry, action: "overwrite" });
      continue;
    }

    applied.push(entry);
  }

  return applied;
}
