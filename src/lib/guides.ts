import path from "node:path";

import { type Step } from "./contracts.js";
import { fileExists, readTextFile } from "./fs-utils.js";
import { stepDefinitions } from "./pipeline.js";
import {
  getCommandSourceRoot,
  getProjectCommandsRoot,
} from "./project-paths.js";

export function getCommandReference(filename: string): string {
  return `@.simple-planning/commands/${filename}`;
}

export function getProjectCommandPath(cwd: string, filename: string): string {
  return path.join(getProjectCommandsRoot(cwd), filename);
}

export async function getCommandText(
  cwd: string,
  filename: string,
): Promise<string | null> {
  const projectPath = getProjectCommandPath(cwd, filename);
  if (await fileExists(projectPath)) {
    return readTextFile(projectPath);
  }

  const packagePath = path.join(getCommandSourceRoot(), filename);
  if (await fileExists(packagePath)) {
    return readTextFile(packagePath);
  }

  return null;
}

export function getGuideReference(step: Step): string | null {
  const guide = stepDefinitions[step].commandGuide;
  return guide ? getCommandReference(guide) : null;
}

export function getProjectGuidePath(cwd: string, step: Step): string | null {
  const guide = stepDefinitions[step].commandGuide;
  return guide ? getProjectCommandPath(cwd, guide) : null;
}

export async function getGuideText(cwd: string, step: Step): Promise<string | null> {
  const guide = stepDefinitions[step].commandGuide;
  if (!guide) {
    return null;
  }

  return getCommandText(cwd, guide);
}
