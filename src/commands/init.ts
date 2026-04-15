import { type CommandResult } from "../lib/contracts.js";
import {
  getCursorCommandsRoot,
  getPlanningRoot,
  getProjectCommandsRoot,
  getProductRoot,
} from "../lib/project-paths.js";
import { ensureProjectIndex } from "../lib/state.js";
import {
  applyTemplateFilePlan,
  planTemplateFileSync,
} from "../lib/template-files.js";

export async function runInitCommand(cwd: string): Promise<CommandResult> {
  await ensureProjectIndex(cwd);

  const planningRoot = getPlanningRoot(cwd);
  const productRoot = getProductRoot(cwd);
  const commandsRoot = getProjectCommandsRoot(cwd);
  const cursorCommandsRoot = getCursorCommandsRoot(cwd);
  const plan = await planTemplateFileSync(cwd, "init");
  await applyTemplateFilePlan(plan);

  return {
    ok: true,
    command: "init",
    message:
      "Simple Planning został zainicjalizowany w projekcie. Możesz teraz używać CLI i komendy Cursor.",
    agentAction: "initialize_project",
    stopReason: "none",
    data: {
      planningRoot,
      productRoot,
      commandsRoot,
      cursorCommandsRoot,
    },
  };
}
