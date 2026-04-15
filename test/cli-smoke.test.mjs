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

function runCli(cwd, args) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
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
});
