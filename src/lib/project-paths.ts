import path from "node:path";
import { fileURLToPath } from "node:url";

const cliFile = fileURLToPath(import.meta.url);
const distDir = path.resolve(path.dirname(cliFile), "..");
const packageRoot = path.resolve(distDir, "..");

export function getPackageRoot(): string {
  return packageRoot;
}

export function getWorkspaceRoot(cwd: string): string {
  return cwd;
}

export function getSimplePlanningRoot(cwd: string): string {
  return path.join(getWorkspaceRoot(cwd), ".simple-planning");
}

export function getPlanningRoot(cwd: string): string {
  return path.join(getSimplePlanningRoot(cwd), "planning");
}

export function getFeaturesRoot(cwd: string): string {
  return path.join(getPlanningRoot(cwd), "features");
}

export function getProductRoot(cwd: string): string {
  return path.join(getPlanningRoot(cwd), "product");
}

export function getProjectCommandsRoot(cwd: string): string {
  return path.join(getSimplePlanningRoot(cwd), "commands");
}

export function getCursorCommandsRoot(cwd: string): string {
  return path.join(getWorkspaceRoot(cwd), ".cursor", "commands");
}

export function getStateRoot(cwd: string): string {
  return path.join(getSimplePlanningRoot(cwd), "state");
}

export function getFeatureStateRoot(cwd: string): string {
  return path.join(getStateRoot(cwd), "features");
}

export function getIndexPath(cwd: string): string {
  return path.join(getStateRoot(cwd), "index.json");
}

export function getFeatureDirectory(cwd: string, slug: string): string {
  return path.join(getFeaturesRoot(cwd), slug);
}

export function getFeatureStatePath(cwd: string, featureId: string): string {
  return path.join(getFeatureStateRoot(cwd), `${featureId}.json`);
}

export function getCommandSourceRoot(): string {
  return path.join(getPackageRoot(), "commands");
}

export function getPlanningSourceRoot(): string {
  return path.join(getPackageRoot(), "planning");
}

export function getCursorCommandTemplateSource(filename: string): string {
  return path.join(
    getPackageRoot(),
    ".cursor",
    "commands",
    filename,
  );
}
