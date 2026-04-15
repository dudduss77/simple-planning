import { type CommandResult } from "./contracts.js";

export function printResult(result: CommandResult): void {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

export function buildErrorResult(
  command: string,
  error: unknown,
): CommandResult {
  const message = error instanceof Error ? error.message : "Nieznany błąd.";
  return {
    ok: false,
    command,
    message,
    agentAction: "stop_and_ask_user",
    stopReason: "none",
  };
}
