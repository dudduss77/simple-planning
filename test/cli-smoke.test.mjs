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
    fs.access(path.join(cwd, ".cursor", "commands", "use-simple-planning.md")),
  );
  await assert.doesNotReject(() =>
    fs.access(
      path.join(cwd, ".cursor", "commands", "continue-simple-planning.md"),
    ),
  );
  await assert.doesNotReject(() =>
    fs.access(
      path.join(cwd, ".simple-planning", "commands", "Discovery.md"),
    ),
  );
});

test("init copies cursor command with explicit new feature guidance", async () => {
  const cwd = await createTempWorkspace();

  const initResult = runCli(cwd, ["init"]);
  assert.equal(initResult.status, 0);

  const commandText = await fs.readFile(
    path.join(cwd, ".cursor", "commands", "use-simple-planning.md"),
    "utf8",
  );

  assert.match(
    commandText,
    /Jeśli użytkownik opisuje nowy feature albo potwierdza, że chodzi o nowy feature/,
  );
  assert.match(
    commandText,
    /simple-planning idea --name <feature-name> --description/,
  );
});

test("list suggests idea command when project has no features", async () => {
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
    /simple-planning idea --name <feature-name> --description <text>/,
  );
});

test("missing feature error suggests list for existing and idea for new feature", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  const statusResult = runCli(cwd, [
    "status",
    "--feature",
    "result-presentation",
  ]);

  assert.equal(statusResult.status, 1);
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
    /Jeśli to nowy feature, utwórz go przez 'simple-planning idea --name <feature-name> --description <text>'\./,
  );
});

test("discovery completion blocks next step until user confirmation", async () => {
  const cwd = await createTempWorkspace();

  runCli(cwd, ["init"]);
  const ideaResult = runCli(cwd, [
    "idea",
    "--name",
    "Feature Alpha",
    "--description",
    "Opis idei.",
  ]);
  assert.equal(ideaResult.status, 0);
  assert.equal(ideaResult.parsed.agentAction, "prepare_next_step");
  assert.equal(ideaResult.parsed.stopReason, "none");
  assert.equal(
    ideaResult.parsed.data.nextPromptRef,
    "@.simple-planning/commands/Discovery.md",
  );
  assert.match(ideaResult.parsed.data.nextPromptText, /# Discovery/);
  assert.equal(ideaResult.parsed.data.nextContext.nextStep, "discovery");

  const prepareDiscovery = runCli(cwd, [
    "run",
    "discovery",
    "--feature",
    "feature-alpha",
  ]);
  assert.equal(prepareDiscovery.status, 0);
  assert.equal(prepareDiscovery.parsed.agentAction, "write_document");
  assert.equal(prepareDiscovery.parsed.stopReason, "none");
  assert.equal(prepareDiscovery.parsed.data.step, "discovery");
  assert.equal(
    prepareDiscovery.parsed.data.commandGuideRef,
    "@.simple-planning/commands/Discovery.md",
  );
  assert.match(prepareDiscovery.parsed.data.commandGuideText, /# Discovery/);
  assert.equal(
    prepareDiscovery.parsed.data.targetDocument.step,
    "discovery",
  );
  assert.equal(
    prepareDiscovery.parsed.data.sourceContext.prompt.ref,
    "@.simple-planning/commands/Discovery.md",
  );

  const discoveryFile = path.join(
    cwd,
    ".simple-planning",
    "planning",
    "features",
    "feature-alpha",
    "02-discovery.md",
  );
  await fs.writeFile(
    discoveryFile,
    "Status: draft\nOwner: test\nLast updated: 2026-04-13\n\n# Discovery\n\n## Co już istnieje\n- Konkret\n",
    "utf8",
  );

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

  const blockedNext = runCli(cwd, [
    "run",
    "product-spec",
    "--feature",
    "feature-alpha",
  ]);
  assert.equal(blockedNext.status, 0);
  assert.equal(blockedNext.parsed.agentAction, "stop_and_ask_user");
  assert.equal(blockedNext.parsed.stopReason, "awaiting_user_confirmation");
  assert.equal(
    blockedNext.parsed.message,
    "Zatrzymaj się i poproś użytkownika o dalsze instrukcje.",
  );

  const confirmedNext = runCli(cwd, [
    "run",
    "product-spec",
    "--feature",
    "feature-alpha",
    "--confirmed-by-user",
  ]);
  assert.equal(confirmedNext.status, 0);
  assert.equal(confirmedNext.parsed.agentAction, "write_document");
  assert.equal(confirmedNext.parsed.stopReason, "none");
  assert.equal(confirmedNext.parsed.data.step, "product-spec");
  assert.equal(
    completeDiscovery.parsed.data.nextPromptRef,
    "@.simple-planning/commands/ProductSpec.md",
  );
  assert.match(completeDiscovery.parsed.data.nextPromptText, /# ProductSpec/);
});
