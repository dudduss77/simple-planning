import readline from "node:readline/promises";

import {
  type CommandResult,
  type UpdateResultData,
} from "../lib/contracts.js";
import {
  applyTemplateFilePlan,
  planTemplateFileSync,
} from "../lib/template-files.js";
import { migrateProjectStateFiles } from "../lib/state.js";

async function confirmManagedOverwrite(paths: string[]): Promise<boolean> {
  if (paths.length === 0) {
    return true;
  }

  process.stderr.write(
    [
      "Komenda update wykryła pliki zarządzane przez pakiet, które różnią się od lokalnej wersji.",
      "Te pliki zostaną nadpisane tylko po potwierdzeniu:",
      ...paths.map((filePath) => `- ${filePath}`),
      "",
    ].join("\n"),
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  try {
    const answer = await rl.question("Czy chcesz kontynuować overwrite? [y/N] ");
    return ["y", "yes"].includes(answer.trim().toLowerCase());
  } finally {
    rl.close();
  }
}

function buildResultData(
  appliedPlan: Awaited<ReturnType<typeof applyTemplateFilePlan>>,
  migrations: Awaited<ReturnType<typeof migrateProjectStateFiles>>,
): UpdateResultData {
  return {
    createdFiles: appliedPlan
      .filter((entry) => entry.action === "create")
      .map((entry) => entry.targetPath),
    overwrittenFiles: appliedPlan
      .filter((entry) => entry.action === "overwrite")
      .map((entry) => entry.targetPath),
    unchangedFiles: appliedPlan
      .filter((entry) => entry.action === "unchanged")
      .map((entry) => entry.targetPath),
    skippedFiles: appliedPlan
      .filter((entry) => entry.action === "skip")
      .map((entry) => entry.targetPath),
    pendingOverwriteFiles: appliedPlan
      .filter((entry) => entry.action === "awaiting_confirmation")
      .map((entry) => entry.targetPath),
    migratedIndex: migrations.migratedIndex,
    migratedFeatureStates: migrations.migratedFeatureStates,
  };
}

function buildUpdateMessage(data: UpdateResultData, confirmed: boolean): string {
  const parts: string[] = [];

  if (data.createdFiles.length > 0) {
    parts.push(`utworzono ${data.createdFiles.length} plik(ów)`);
  }
  if (data.overwrittenFiles.length > 0) {
    parts.push(`nadpisano ${data.overwrittenFiles.length} plik(ów)`);
  }
  if (data.pendingOverwriteFiles.length > 0 && !confirmed) {
    parts.push(
      `pominięto ${data.pendingOverwriteFiles.length} plik(ów) wymagających potwierdzenia`,
    );
  }
  if (data.migratedIndex || data.migratedFeatureStates.length > 0) {
    parts.push(
      `wykonano migracje stanu (${Number(data.migratedIndex) + data.migratedFeatureStates.length})`,
    );
  }

  if (parts.length === 0) {
    return "Projekt jest już aktualny. Nie było zmian do zastosowania.";
  }

  return `Zakończono update projektu: ${parts.join(", ")}.`;
}

export async function runUpdateCommand(cwd: string): Promise<CommandResult> {
  const plan = await planTemplateFileSync(cwd, "update");
  const managedDiffs = plan
    .filter((entry) => entry.action === "awaiting_confirmation")
    .map((entry) => entry.targetPath);

  const confirmed = await confirmManagedOverwrite(managedDiffs);
  const appliedPlan = await applyTemplateFilePlan(plan, {
    confirmedManagedPaths: confirmed ? new Set(managedDiffs) : new Set<string>(),
  });
  const migrations = await migrateProjectStateFiles(cwd);
  const data = buildResultData(appliedPlan, migrations);

  return {
    ok: true,
    command: "update",
    message: confirmed
      ? buildUpdateMessage(data, true)
      : data.pendingOverwriteFiles.length > 0
        ? buildUpdateMessage(data, false)
        : buildUpdateMessage(data, true),
    agentAction:
      confirmed || data.pendingOverwriteFiles.length === 0
        ? "update_project"
        : "stop_and_ask_user",
    stopReason: "none",
    data,
  };
}
