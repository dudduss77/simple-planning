import path from "node:path";

import { type CommandResult } from "../lib/contracts.js";
import {
  copyFileIfMissing,
  ensureDirectory,
  ensureFileWithContent,
} from "../lib/fs-utils.js";
import {
  getCommandSourceRoot,
  getCursorCommandTemplateSource,
  getPlanningRoot,
  getPlanningSourceRoot,
  getProjectCommandsRoot,
  getProductRoot,
} from "../lib/project-paths.js";
import { ensureProjectIndex } from "../lib/state.js";
import {
  buildBootstrapProjectCursorCommandTemplate,
  buildCloseFeatureCursorCommandTemplate,
  buildContinueFeatureCursorCommandTemplate,
  buildFeatureStatusCursorCommandTemplate,
  buildStartFeatureCursorCommandTemplate,
  buildWorkOnCurrentStepCursorCommandTemplate,
  createProductRoadmapTemplate,
  createProductVisionTemplate,
} from "../lib/templates.js";

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

export async function runInitCommand(cwd: string): Promise<CommandResult> {
  await ensureProjectIndex(cwd);

  const planningRoot = getPlanningRoot(cwd);
  const productRoot = getProductRoot(cwd);
  const commandsRoot = getProjectCommandsRoot(cwd);
  const planningSourceRoot = getPlanningSourceRoot();
  const commandSourceRoot = getCommandSourceRoot();

  await Promise.all([
    ensureDirectory(planningRoot),
    ensureDirectory(productRoot),
    ensureDirectory(commandsRoot),
  ]);

  await Promise.all([
    copyFileIfMissing(
      path.join(planningSourceRoot, "README.md"),
      path.join(planningRoot, "README.md"),
    ),
    copyFileIfMissing(
      path.join(planningSourceRoot, "product", "README.md"),
      path.join(productRoot, "README.md"),
    ),
    copyFileIfMissing(
      path.join(planningSourceRoot, "features", "README.md"),
      path.join(planningRoot, "features", "README.md"),
    ),
    ensureFileWithContent(
      path.join(productRoot, "01-vision.md"),
      createProductVisionTemplate(),
    ),
    ensureFileWithContent(
      path.join(productRoot, "02-roadmap.md"),
      createProductRoadmapTemplate(),
    ),
  ]);

  await Promise.all(
    guideFiles.map((guideFile) =>
      copyFileIfMissing(
        path.join(commandSourceRoot, guideFile),
        path.join(commandsRoot, guideFile),
      ),
    ),
  );

  const cursorCommandsRoot = path.join(cwd, ".cursor", "commands");
  await ensureDirectory(cursorCommandsRoot);

  await Promise.all(
    cursorCommandFiles.map(async ({ filename, fallback }) => {
      const targetPath = path.join(cursorCommandsRoot, filename);
      const sourceTemplate = getCursorCommandTemplateSource(filename);
      try {
        await copyFileIfMissing(sourceTemplate, targetPath);
      } catch {
        await ensureFileWithContent(targetPath, fallback());
      }
    }),
  );

  return {
    ok: true,
    command: "init",
    message:
      "Simple Planning został zainicjalizowany w projekcie. Możesz teraz używać CLI i komendy Cursor.",
    agentAction: "initialize_project",
    stopReason: "none",
    data: {
      planningRoot,
      productRoot,
      commandsRoot,
      cursorCommandsRoot,
    },
  };
}
