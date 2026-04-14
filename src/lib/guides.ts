import path from "node:path";

import { type Step } from "./contracts.js";
import { fileExists, readTextFile } from "./fs-utils.js";
import { stepDefinitions } from "./pipeline.js";
import {
  getCommandSourceRoot,
  getProjectCommandsRoot,
} from "./project-paths.js";

export function getGuideReference(step: Step): string | null {
  const guide = stepDefinitions[step].commandGuide;
  return guide ? `@.simple-planning/commands/${guide}` : null;
}

export function getProjectGuidePath(cwd: string, step: Step): string | null {
  const guide = stepDefinitions[step].commandGuide;
  return guide ? path.join(getProjectCommandsRoot(cwd), guide) : null;
}

export async function getGuideText(cwd: string, step: Step): Promise<string | null> {
  const guide = stepDefinitions[step].commandGuide;
  if (!guide) {
    return null;
  }

  const projectPath = path.join(getProjectCommandsRoot(cwd), guide);
  if (await fileExists(projectPath)) {
    return readTextFile(projectPath);
  }

  const packagePath = path.join(getCommandSourceRoot(), guide);
  if (await fileExists(packagePath)) {
    return readTextFile(packagePath);
  }

  return null;
}
