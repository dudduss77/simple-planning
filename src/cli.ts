#!/usr/bin/env node
import { runCloseFeatureCommand } from "./commands/close-feature.js";
import { runContinueCommand } from "./commands/continue.js";
import { runIdeaCommand } from "./commands/idea.js";
import { runInitCommand } from "./commands/init.js";
import { runListCommand } from "./commands/list.js";
import { runNextCommand } from "./commands/next.js";
import { runStepCommand } from "./commands/run.js";
import { runStartCommand } from "./commands/start.js";
import { runStatusCommand } from "./commands/status.js";
import { runWorkOnCurrentStepCommand } from "./commands/work-on-current-step.js";
import {
  booleanFlag,
  optionalStringFlag,
  parseArgs,
  requireStringFlag,
} from "./lib/args.js";
import { buildErrorResult, printResult } from "./lib/output.js";

function printHelp(): void {
  process.stdout.write(
    `simple-planning <command> [options]

Commands:
  init
  start --name <feature-name> --description <text>
  close-feature --reason <reason> [--feature <slug|id>]
  continue [--feature <slug|id>]
  work-on-current-step [--feature <slug|id>]
  idea --name <feature-name> --description <text>
  list
  status [--feature <slug|id>]
  next [--feature <slug|id>]
  run <step> [--feature <slug|id>] [--confirmed-by-user] [--complete]
`,
  );
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));
  const command = parsed.command;

  if (!command || command === "help" || command === "--help") {
    printHelp();
    return;
  }

  try {
    switch (command) {
      case "init": {
        printResult(await runInitCommand(process.cwd()));
        return;
      }
      case "start": {
        const name = requireStringFlag(
          parsed.flags,
          "name",
          "Zapytaj użytkownika o nazwę feature'a, chyba że wynika ona z kontekstu zadania, wtedy podaj ją jawnie w --name.",
        );
        const description = requireStringFlag(
          parsed.flags,
          "description",
          "Podaj opis idei w --description, aby można było utworzyć feature i przygotować discovery.",
        );
        printResult(
          await runStartCommand({ cwd: process.cwd(), name, description }),
        );
        return;
      }
      case "close-feature": {
        const reasonRaw = requireStringFlag(
          parsed.flags,
          "reason",
          "Podaj powód zamknięcia przez --reason. Dozwolone: done, wont-do, duplicate, obsolete.",
        );
        printResult(
          await runCloseFeatureCommand({
            cwd: process.cwd(),
            feature: optionalStringFlag(parsed.flags, "feature"),
            reasonRaw,
          }),
        );
        return;
      }
      case "continue": {
        printResult(
          await runContinueCommand({
            cwd: process.cwd(),
            feature: optionalStringFlag(parsed.flags, "feature"),
          }),
        );
        return;
      }
      case "work-on-current-step": {
        printResult(
          await runWorkOnCurrentStepCommand({
            cwd: process.cwd(),
            feature: optionalStringFlag(parsed.flags, "feature"),
          }),
        );
        return;
      }
      case "idea": {
        const name = requireStringFlag(
          parsed.flags,
          "name",
          "Zapytaj użytkownika o nazwę folderu, chyba że wynika ona z kontekstu zadania, wtedy podaj ją jawnie w --name.",
        );
        const description = requireStringFlag(
          parsed.flags,
          "description",
          "Podaj opis idei w --description, aby można było utworzyć 01-idea.md.",
        );
        printResult(
          await runIdeaCommand({ cwd: process.cwd(), name, description }),
        );
        return;
      }
      case "list": {
        printResult(await runListCommand(process.cwd()));
        return;
      }
      case "status": {
        printResult(
          await runStatusCommand({
            cwd: process.cwd(),
            feature: optionalStringFlag(parsed.flags, "feature"),
          }),
        );
        return;
      }
      case "next": {
        printResult(
          await runNextCommand({
            cwd: process.cwd(),
            feature: optionalStringFlag(parsed.flags, "feature"),
          }),
        );
        return;
      }
      case "run": {
        const [stepRaw] = parsed.positionals;
        if (!stepRaw) {
          throw new Error(
            "Podaj etap po komendzie 'run', np. 'simple-planning run discovery --feature <slug|id>'.",
          );
        }
        printResult(
          await runStepCommand({
            cwd: process.cwd(),
            stepRaw,
            feature: optionalStringFlag(parsed.flags, "feature"),
            complete: booleanFlag(parsed.flags, "complete"),
            confirmedByUser: booleanFlag(parsed.flags, "confirmed-by-user"),
          }),
        );
        return;
      }
      default: {
        throw new Error(`Nieznana komenda '${command}'. Użyj 'simple-planning help'.`);
      }
    }
  } catch (error) {
    printResult(buildErrorResult(command, error));
    process.exitCode = 1;
  }
}

await main();
