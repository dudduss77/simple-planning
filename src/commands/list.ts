import { type CommandResult } from "../lib/contracts.js";
import { ensureProjectIndex } from "../lib/state.js";

export async function runListCommand(cwd: string): Promise<CommandResult> {
  const index = await ensureProjectIndex(cwd);

  return {
    ok: true,
    command: "list",
    message:
      index.features.length === 0
        ? "Brak feature'ów w Simple Planning. Jeśli zaczynasz nowy temat, użyj 'simple-planning start --name <feature-name> --description <text>' albo 'simple-planning idea --name <feature-name> --description <text>'."
        : "Znaleziono feature'y w Simple Planning.",
    agentAction: "show_status",
    stopReason: "none",
    data: {
      count: index.features.length,
      features: index.features,
    },
  };
}
