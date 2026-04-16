import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const cliPath = path.join(repoRoot, "dist", "cli.js");

async function createTempWorkspace() {
  return fs.mkdtemp(path.join(os.tmpdir(), "simple-planning-"));
}

function runCli(cwd, args, options = {}) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    input: options.input,
  });

  const stdout = result.stdout.trim();
  const parsed = stdout ? JSON.parse(stdout) : null;

  return {
    ...result,
    parsed,
  };
}

async function writeMeaningfulDoc(filePath, title, section = "Treść") {
  await fs.writeFile(
    filePath,
    `Status: draft\nOwner: test\nLast updated: 2026-04-13\n\n# ${title}\n\n## ${section}\n- Konkret\n`,
    "utf8",
  );
}

async function writeVisionSeed(filePath, text) {
  await fs.writeFile(
    filePath,
    `Status: draft\nOwner: test\nLast updated: 2026-04-13\n\n# Vision\n\n## Cel produktu\n${text}\n`,
    "utf8",
  );
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

test("init creates project skeleton and cursor command", async () => {
  const cwd = await createTempWorkspace();

  const initResult = runCli(cwd, ["init"]);
  assert.equal(initResult.status, 0);
  assert.equal(initResult.parsed.ok, true);
  assert.equal(initResult.parsed.agentAction, "initialize_project");
  assert.equal(initResult.parsed.stopReason, "none");

  await assert.doesNotReject(() =>
    fs.access(path.join(cwd, ".simple-planning", "state", "index.json")),
  );
  await assert.doesNotReject(() =>
    fs.access(path.join(cwd, ".simple-planning", "AGENTS.md")),
  );
  await assert.doesNotReject(() =>
    fs.access(path.join(cwd, ".cursor", "commands", "start-feature.md")),
  );
  await assert.doesNotReject(() =>
    fs.access(path.join(cwd, ".cursor", "commands", "close-feature.md")),
  );
  await assert.doesNotReject(() =>
    fs.access(path.join(cwd, ".cursor", "commands", "continue-feature.md")),
  );
  await assert.doesNotReject(() =>
    fs.access(path.join(cwd, ".cursor", "commands", "work-on-current-step.md")),
  );
  await assert.doesNotReject(() =>
    fs.access(path.join(cwd, ".cursor", "commands", "feature-status.md")),
  );
  await assert.doesNotReject(() =>
    fs.access(path.join(cwd, ".cursor", "commands", "bootstrap-project.md")),
  );
  await assert.doesNotReject(() =>
    fs.access(
      path.join(cwd, ".simple-planning", "commands", "Discovery.md"),
    ),
  );
  await assert.doesNotReject(() =>
    fs.access(path.join(cwd, ".simple-planning", "commands", "Vision.md")),
  );
  await assert.doesNotReject(() =>
    fs.access(path.join(cwd, ".simple-planning", "commands", "Roadmap.md")),
  );
});

test("init copies dedicated cursor commands", async () => {
  const cwd = await createTempWorkspace();

  const initResult = runCli(cwd, ["init"]);
  assert.equal(initResult.status, 0);

  const startCommandText = await fs.readFile(
    path.join(cwd, ".cursor", "commands", "start-feature.md"),
    "utf8",
  );
  const closeCommandText = await fs.readFile(
    path.join(cwd, ".cursor", "commands", "close-feature.md"),
    "utf8",
  );
  const continueCommandText = await fs.readFile(
    path.join(cwd, ".cursor", "commands", "continue-feature.md"),
    "utf8",
  );
  const workCommandText = await fs.readFile(
    path.join(cwd, ".cursor", "commands", "work-on-current-step.md"),
    "utf8",
  );
  const statusCommandText = await fs.readFile(
    path.join(cwd, ".cursor", "commands", "feature-status.md"),
    "utf8",
  );
  const bootstrapCommandText = await fs.readFile(
    path.join(cwd, ".cursor", "commands", "bootstrap-project.md"),
    "utf8",
  );

  assert.match(startCommandText, /npx simple-planning start --name <feature-name>/);
  assert.match(
    closeCommandText,
    /npx simple-planning close-feature --reason <reason> \[--feature <slug\|id>\]/,
  );
  assert.match(continueCommandText, /npx simple-planning continue \[--feature <slug\|id>\]/);
  assert.match(workCommandText, /npx simple-planning work-on-current-step \[--feature <slug\|id>\]/);
  assert.match(statusCommandText, /npx simple-planning status \[--feature <slug\|id>\]/);
  assert.match(bootstrapCommandText, /npx simple-planning bootstrap/);
  assert.match(
    startCommandText,
    /Po zaktualizowaniu pliku docelowego zatrzymaj się i oddaj kontrolę użytkownikowi\./,
  );
  assert.doesNotMatch(
    startCommandText,
    /Po zaktualizowaniu pliku docelowego wywołaj `preparation\.nextCommand`/,
  );
  assert.match(
    continueCommandText,
    /Jeśli `resumedFromCheckpoint` jest `true`, potraktuj to jako przygotowanie nowego etapu:/,
  );
  assert.match(
    continueCommandText,
    /Jeśli `resumedFromCheckpoint` jest `false` i CLI wznowiło już aktywny etap/,
  );
  assert.match(
    workCommandText,
    /Nie wywołuj `preparation\.nextCommand`, chyba że użytkownik wyraźnie poprosi o zamknięcie bieżącego etapu\./,
  );
  assert.doesNotMatch(
    workCommandText,
    /wywołaj `preparation\.nextCommand` zwrócone przez CLI tylko po to, by oznaczyć bieżący krok jako ukończony/,
  );
  assert.match(
    bootstrapCommandText,
    /Po zaktualizowaniu bootstrapowego discovery zatrzymaj się i oddaj kontrolę użytkownikowi\./,
  );
  assert.doesNotMatch(
    bootstrapCommandText,
    /Po zaktualizowaniu bootstrapowego discovery uruchom `discoveryPreparation\.nextCommand`/,
  );
});

test("list suggests start command when project has no features", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  const listResult = runCli(cwd, ["list"]);

  assert.equal(listResult.status, 0);
  assert.equal(listResult.parsed.ok, true);
  assert.equal(listResult.parsed.data.count, 0);
  assert.match(
    listResult.parsed.message,
    /Brak feature'ów w Simple Planning\./,
  );
  assert.match(
    listResult.parsed.message,
    /simple-planning start --name <feature-name> --description <text>/,
  );
  assert.match(
    listResult.parsed.message,
    /simple-planning idea --name <feature-name> --description <text>/,
  );
});

test("missing feature status suggests list for existing and start for new feature", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  const statusResult = runCli(cwd, [
    "status",
    "--feature",
    "result-presentation",
  ]);

  assert.equal(statusResult.status, 0);
  assert.equal(statusResult.parsed.ok, false);
  assert.match(
    statusResult.parsed.message,
    /Nie znaleziono feature'a 'result-presentation'\./,
  );
  assert.match(
    statusResult.parsed.message,
    /Jeśli to istniejący feature, użyj 'simple-planning list'/,
  );
  assert.match(
    statusResult.parsed.message,
    /Jeśli to nowy feature, uruchom 'simple-planning start --name <feature-name> --description <text>'\./,
  );
});

test("start creates feature and prepares discovery immediately", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  const startResult = runCli(cwd, [
    "start",
    "--name",
    "Feature Alpha",
    "--description",
    "Opis idei.",
  ]);
  assert.equal(startResult.status, 0);
  assert.equal(startResult.parsed.agentAction, "write_document");
  assert.equal(startResult.parsed.stopReason, "none");
  assert.equal(startResult.parsed.data.createdFeature, true);
  assert.equal(startResult.parsed.data.preparation.step, "discovery");
  assert.equal(
    startResult.parsed.data.preparation.prompt.ref,
    "@.simple-planning/commands/Discovery.md",
  );
  assert.match(startResult.parsed.data.preparation.prompt.text, /# Discovery/);
  assert.equal(
    startResult.parsed.data.preparation.targetDocument.step,
    "discovery",
  );
  assert.deepEqual(startResult.parsed.data.preparation.requiredFiles, [
    path.join(
      cwd,
      ".simple-planning",
      "planning",
      "features",
      "feature-alpha",
      "01-idea.md",
    ),
  ]);
});

test("continue asks user when multiple active features are possible", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, [
    "start",
    "--name",
    "Feature Alpha",
    "--description",
    "Opis idei.",
  ]);
  runCli(cwd, [
    "start",
    "--name",
    "Feature Beta",
    "--description",
    "Drugi opis idei.",
  ]);

  const continueResult = runCli(cwd, ["continue"]);
  assert.equal(continueResult.status, 0);
  assert.equal(continueResult.parsed.ok, true);
  assert.equal(continueResult.parsed.agentAction, "choose_feature");
  assert.equal(continueResult.parsed.data.selectionRequired, true);
  assert.equal(continueResult.parsed.data.availableFeatures.length, 2);
  assert.match(
    continueResult.parsed.data.suggestedCommand,
    /simple-planning continue --feature <slug\|id>/,
  );
});

test("bootstrap stops when vision is still a placeholder", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  const bootstrapResult = runCli(cwd, ["bootstrap"]);

  assert.equal(bootstrapResult.status, 0);
  assert.equal(bootstrapResult.parsed.ok, true);
  assert.equal(bootstrapResult.parsed.agentAction, "stop_and_ask_user");
  assert.match(bootstrapResult.parsed.message, /Bootstrap zatrzymany/i);
  assert.equal(bootstrapResult.parsed.data.minimumMeaningfulCharacters, 500);
});

test("bootstrap prepares product docs and bootstrap discovery", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  const visionFile = path.join(
    cwd,
    ".simple-planning",
    "planning",
    "product",
    "01-vision.md",
  );
  const roadmapFile = path.join(
    cwd,
    ".simple-planning",
    "planning",
    "product",
    "02-roadmap.md",
  );
  const longVision = "To jest istniejący produkt do planowania prac i porządkowania wiedzy o projekcie. ".repeat(
    10,
  );
  await writeVisionSeed(visionFile, longVision);

  const bootstrapResult = runCli(cwd, ["bootstrap"]);
  assert.equal(bootstrapResult.status, 0);
  assert.equal(bootstrapResult.parsed.ok, true);
  assert.equal(bootstrapResult.parsed.agentAction, "write_bootstrap_documents");
  assert.equal(bootstrapResult.parsed.data.bootstrapMode, "existing-project");
  assert.equal(bootstrapResult.parsed.data.featureSlug, "bootstrap");
  assert.equal(bootstrapResult.parsed.data.activeStep, "discovery");
  assert.equal(bootstrapResult.parsed.data.documents.length, 3);
  assert.deepEqual(
    bootstrapResult.parsed.data.documents.map((entry) => entry.id),
    ["vision", "roadmap", "bootstrap-discovery"],
  );
  assert.equal(bootstrapResult.parsed.data.documents[0].targetPath, visionFile);
  assert.equal(bootstrapResult.parsed.data.documents[1].targetPath, roadmapFile);
  assert.equal(
    bootstrapResult.parsed.data.documents[0].prompt.ref,
    "@.simple-planning/commands/Vision.md",
  );
  assert.equal(
    bootstrapResult.parsed.data.documents[1].prompt.ref,
    "@.simple-planning/commands/Roadmap.md",
  );
  assert.equal(
    bootstrapResult.parsed.data.discoveryPreparation.prompt.ref,
    "@.simple-planning/commands/Discovery.md",
  );
  assert.match(
    bootstrapResult.parsed.message,
    /bootstrapowe discovery, potem zatrzymaj się i oddaj kontrolę użytkownikowi/i,
  );
  assert.match(
    bootstrapResult.parsed.data.discoveryPreparation.nextCommand,
    /simple-planning run discovery --feature bootstrap --complete/,
  );

  await assert.doesNotReject(() =>
    fs.access(
      path.join(
        cwd,
        ".simple-planning",
        "planning",
        "features",
        "bootstrap",
        "01-idea.md",
      ),
    ),
  );
  await assert.doesNotReject(() =>
    fs.access(
      path.join(
        cwd,
        ".simple-planning",
        "planning",
        "features",
        "bootstrap",
        "02-discovery.md",
      ),
    ),
  );
});

test("bootstrap can refresh existing bootstrap feature after it was closed", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  const visionFile = path.join(
    cwd,
    ".simple-planning",
    "planning",
    "product",
    "01-vision.md",
  );
  await writeVisionSeed(
    visionFile,
    "Produkt porządkuje wymagania, odkrycia i kolejne kroki w istniejącym systemie. ".repeat(
      10,
    ),
  );

  runCli(cwd, ["bootstrap"]);
  runCli(cwd, [
    "close-feature",
    "--feature",
    "bootstrap",
    "--reason",
    "obsolete",
  ]);

  const rerunResult = runCli(cwd, ["bootstrap"]);
  assert.equal(rerunResult.status, 0);
  assert.equal(rerunResult.parsed.ok, true);
  assert.equal(rerunResult.parsed.data.featureSlug, "bootstrap");
  assert.equal(rerunResult.parsed.data.featureStatus, "active");
  assert.equal(rerunResult.parsed.data.closeReason, null);
  assert.equal(rerunResult.parsed.data.activeStep, "discovery");
});

test("close-feature closes active feature and status reports closure", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, [
    "start",
    "--name",
    "Feature Alpha",
    "--description",
    "Opis idei.",
  ]);

  const closeResult = runCli(cwd, [
    "close-feature",
    "--feature",
    "feature-alpha",
    "--reason",
    "wont-do",
  ]);
  assert.equal(closeResult.status, 0);
  assert.equal(closeResult.parsed.ok, true);
  assert.equal(closeResult.parsed.data.featureStatus, "closed");
  assert.equal(closeResult.parsed.data.closeReason, "wont-do");

  const statusResult = runCli(cwd, ["status", "--feature", "feature-alpha"]);
  assert.equal(statusResult.status, 0);
  assert.equal(statusResult.parsed.ok, true);
  assert.equal(statusResult.parsed.data.featureStatus, "closed");
  assert.equal(statusResult.parsed.data.closeReason, "wont-do");
  assert.match(statusResult.parsed.message, /Feature jest zamknięty/);
});

test("continue and work-on-current-step refuse closed features", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, [
    "start",
    "--name",
    "Feature Alpha",
    "--description",
    "Opis idei.",
  ]);
  runCli(cwd, [
    "close-feature",
    "--feature",
    "feature-alpha",
    "--reason",
    "obsolete",
  ]);

  const continueResult = runCli(cwd, ["continue", "--feature", "feature-alpha"]);
  assert.equal(continueResult.status, 0);
  assert.equal(continueResult.parsed.ok, true);
  assert.equal(continueResult.parsed.agentAction, "stop_and_ask_user");
  assert.match(continueResult.parsed.message, /jest zamknięty z powodem 'obsolete'/);

  const workResult = runCli(cwd, ["work-on-current-step", "--feature", "feature-alpha"]);
  assert.equal(workResult.status, 0);
  assert.equal(workResult.parsed.ok, true);
  assert.equal(workResult.parsed.agentAction, "stop_and_ask_user");
  assert.match(workResult.parsed.message, /jest zamknięty z powodem 'obsolete'/);
});

test("work-on-current-step resumes only the active step", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, [
    "start",
    "--name",
    "Feature Alpha",
    "--description",
    "Opis idei.",
  ]);

  const workResult = runCli(cwd, ["work-on-current-step"]);
  assert.equal(workResult.status, 0);
  assert.equal(workResult.parsed.ok, true);
  assert.equal(workResult.parsed.agentAction, "write_document");
  assert.equal(workResult.parsed.data.step, "discovery");
  assert.equal(workResult.parsed.data.preparation.step, "discovery");
  assert.equal(
    workResult.parsed.data.preparation.prompt.ref,
    "@.simple-planning/commands/Discovery.md",
  );
});

test("work-on-current-step stops when there is no active step", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, [
    "start",
    "--name",
    "Feature Alpha",
    "--description",
    "Opis idei.",
  ]);

  const discoveryFile = path.join(
    cwd,
    ".simple-planning",
    "planning",
    "features",
    "feature-alpha",
    "02-discovery.md",
  );
  await writeMeaningfulDoc(discoveryFile, "Discovery", "Co już istnieje");
  runCli(cwd, [
    "run",
    "discovery",
    "--feature",
    "feature-alpha",
    "--complete",
  ]);

  const workResult = runCli(cwd, ["work-on-current-step", "--feature", "feature-alpha"]);
  assert.equal(workResult.status, 0);
  assert.equal(workResult.parsed.ok, true);
  assert.equal(workResult.parsed.agentAction, "stop_and_ask_user");
  assert.match(workResult.parsed.message, /nie ma aktywnego kroku do dalszej redakcji/i);
  assert.match(
    workResult.parsed.data.suggestedCommands[0],
    /simple-planning continue --feature feature-alpha/,
  );
});

test("continue resumes checkpoint for the single feature awaiting confirmation", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, [
    "start",
    "--name",
    "Feature Alpha",
    "--description",
    "Opis idei.",
  ]);

  const discoveryFile = path.join(
    cwd,
    ".simple-planning",
    "planning",
    "features",
    "feature-alpha",
    "02-discovery.md",
  );
  await writeMeaningfulDoc(discoveryFile, "Discovery", "Co już istnieje");

  const completeDiscovery = runCli(cwd, [
    "run",
    "discovery",
    "--feature",
    "feature-alpha",
    "--complete",
  ]);
  assert.equal(completeDiscovery.status, 0);
  assert.equal(completeDiscovery.parsed.agentAction, "stop_and_ask_user");
  assert.equal(
    completeDiscovery.parsed.stopReason,
    "awaiting_user_confirmation",
  );
  assert.equal(
    completeDiscovery.parsed.message,
    "Zatrzymaj się i poproś użytkownika o dalsze instrukcje.",
  );

  runCli(cwd, [
    "start",
    "--name",
    "Feature Beta",
    "--description",
    "Drugi opis idei.",
  ]);

  const continueResult = runCli(cwd, ["continue"]);
  assert.equal(continueResult.status, 0);
  assert.equal(continueResult.parsed.agentAction, "write_document");
  assert.equal(continueResult.parsed.stopReason, "none");
  assert.equal(continueResult.parsed.data.resumedFromCheckpoint, true);
  assert.equal(continueResult.parsed.data.activeStep, "product-spec");
  assert.equal(
    continueResult.parsed.data.preparation.step,
    "product-spec",
  );
  assert.equal(
    continueResult.parsed.data.preparation.prompt.ref,
    "@.simple-planning/commands/ProductSpec.md",
  );
  assert.match(
    continueResult.parsed.data.preparation.prompt.text,
    /# ProductSpec/,
  );

  const workResult = runCli(cwd, ["work-on-current-step", "--feature", "feature-alpha"]);
  assert.equal(workResult.status, 0);
  assert.equal(workResult.parsed.ok, true);
  assert.equal(workResult.parsed.agentAction, "write_document");
  assert.equal(workResult.parsed.data.activeStep, "product-spec");
  assert.equal(workResult.parsed.data.preparation.step, "product-spec");
  assert.match(
    workResult.parsed.message,
    /Wznowiono aktywny etap 'product-spec'/,
  );
});

test("continue completes meaningful active step and prepares next without run --complete", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, [
    "start",
    "--name",
    "Feature Alpha",
    "--description",
    "Opis idei.",
  ]);

  const discoveryFile = path.join(
    cwd,
    ".simple-planning",
    "planning",
    "features",
    "feature-alpha",
    "02-discovery.md",
  );
  await writeMeaningfulDoc(discoveryFile, "Discovery", "Co już istnieje");

  const continueResult = runCli(cwd, [
    "continue",
    "--feature",
    "feature-alpha",
  ]);
  assert.equal(continueResult.status, 0);
  assert.equal(continueResult.parsed.ok, true);
  assert.equal(continueResult.parsed.agentAction, "write_document");
  assert.equal(continueResult.parsed.stopReason, "none");
  assert.equal(continueResult.parsed.data.resumedFromCheckpoint, true);
  assert.equal(continueResult.parsed.data.activeStep, "product-spec");
  assert.equal(continueResult.parsed.data.preparation.step, "product-spec");
  assert.match(
    continueResult.parsed.message,
    /Domknięto etap 'discovery' i przygotowano etap 'product-spec'/,
  );
});

test("continue does not auto-complete when active document is not meaningful", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, [
    "start",
    "--name",
    "Feature Alpha",
    "--description",
    "Opis idei.",
  ]);

  const continueResult = runCli(cwd, [
    "continue",
    "--feature",
    "feature-alpha",
  ]);
  assert.equal(continueResult.status, 0);
  assert.equal(continueResult.parsed.ok, true);
  assert.equal(continueResult.parsed.agentAction, "write_document");
  assert.equal(continueResult.parsed.data.resumedFromCheckpoint, false);
  assert.equal(continueResult.parsed.data.activeStep, "discovery");
  assert.equal(continueResult.parsed.data.preparation.step, "discovery");
  assert.match(
    continueResult.parsed.message,
    /Wznowiono aktywny etap 'discovery'/,
  );
});

test("update shows managed files and overwrites them after confirmation", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  const managedFile = path.join(
    cwd,
    ".cursor",
    "commands",
    "start-feature.md",
  );
  await fs.writeFile(managedFile, "# local override\n", "utf8");

  const updateResult = runCli(cwd, ["update"], { input: "y\n" });
  assert.equal(updateResult.status, 0);
  assert.equal(updateResult.parsed.ok, true);
  assert.equal(updateResult.parsed.agentAction, "update_project");
  assert.match(updateResult.stderr, /start-feature\.md/);
  assert.equal(
    updateResult.parsed.data.overwrittenFiles.includes(managedFile),
    true,
  );

  const updatedContents = await fs.readFile(managedFile, "utf8");
  assert.match(updatedContents, /# Start Feature/);
});

test("update does not overwrite managed files after rejection", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  const managedFile = path.join(
    cwd,
    ".simple-planning",
    "commands",
    "Vision.md",
  );
  await fs.writeFile(managedFile, "# lokalna zmiana\n", "utf8");

  const updateResult = runCli(cwd, ["update"], { input: "n\n" });
  assert.equal(updateResult.status, 0);
  assert.equal(updateResult.parsed.ok, true);
  assert.equal(updateResult.parsed.agentAction, "stop_and_ask_user");
  assert.equal(
    updateResult.parsed.data.pendingOverwriteFiles.includes(managedFile),
    true,
  );

  const updatedContents = await fs.readFile(managedFile, "utf8");
  assert.equal(updatedContents, "# lokalna zmiana\n");
});

test("update preserves local planning documents", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  const visionFile = path.join(
    cwd,
    ".simple-planning",
    "planning",
    "product",
    "01-vision.md",
  );
  await fs.writeFile(visionFile, "# moja vision\n", "utf8");

  const updateResult = runCli(cwd, ["update"], { input: "y\n" });
  assert.equal(updateResult.status, 0);
  assert.equal(updateResult.parsed.ok, true);
  assert.equal(updateResult.parsed.data.skippedFiles.includes(visionFile), true);

  const updatedContents = await fs.readFile(visionFile, "utf8");
  assert.equal(updatedContents, "# moja vision\n");
});

test("update migrates existing state files without losing feature data", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, [
    "start",
    "--name",
    "Feature Gamma",
    "--description",
    "Opis idei.",
  ]);

  const indexPath = path.join(cwd, ".simple-planning", "state", "index.json");
  const index = JSON.parse(await fs.readFile(indexPath, "utf8"));
  index.version = 1;
  delete index.lastMigrationAt;
  await writeJson(indexPath, index);

  const featureStatePath = path.join(
    cwd,
    ".simple-planning",
    "state",
    "features",
    `${index.features[0].featureId}.json`,
  );
  const featureState = JSON.parse(await fs.readFile(featureStatePath, "utf8"));
  featureState.version = 1;
  delete featureState.lastMigrationAt;
  await writeJson(featureStatePath, featureState);

  const updateResult = runCli(cwd, ["update"], { input: "y\n" });
  assert.equal(updateResult.status, 0);
  assert.equal(updateResult.parsed.ok, true);
  assert.equal(updateResult.parsed.data.migratedIndex, true);
  assert.equal(updateResult.parsed.data.migratedFeatureStates.length, 1);

  const migratedIndex = JSON.parse(await fs.readFile(indexPath, "utf8"));
  const migratedFeatureState = JSON.parse(await fs.readFile(featureStatePath, "utf8"));
  assert.equal(migratedIndex.version, 2);
  assert.equal(typeof migratedIndex.lastMigrationAt, "string");
  assert.equal(migratedFeatureState.version, 2);
  assert.equal(typeof migratedFeatureState.lastMigrationAt, "string");
  assert.equal(migratedFeatureState.slug, "feature-gamma");
});
