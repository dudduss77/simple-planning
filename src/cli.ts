#!/usr/bin/env node
import { runIdeaCommand } from "./commands/idea.js";
import { runInitCommand } from "./commands/init.js";
import { runListCommand } from "./commands/list.js";
import { runNextCommand } from "./commands/next.js";
import { runStepCommand } from "./commands/run.js";
import { runStatusCommand } from "./commands/status.js";
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
