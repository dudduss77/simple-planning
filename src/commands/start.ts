import {
  type CommandResult,
  type PrepareResultData,
  type StartResultData,
} from "../lib/contracts.js";
import { runIdeaCommand } from "./idea.js";
import { runStepCommand } from "./run.js";
import { loadFeatureState, summarizeFeatureState } from "../lib/state.js";

export async function runStartCommand(args: {
  cwd: string;
  name: string;
  description: string;
}): Promise<CommandResult> {
  const ideaResult = await runIdeaCommand(args);
  const ideaData = ideaResult.data as
    | {
        featureSlug: string;
        featureDirectory: string;
        ideaFile: string;
      }
    | undefined;

  if (!ideaData) {
    throw new Error("Komenda 'idea' nie zwróciła danych potrzebnych do startu feature'a.");
  }

  const prepareResult = await runStepCommand({
    cwd: args.cwd,
    stepRaw: "discovery",
    feature: ideaData.featureSlug,
    complete: false,
    confirmedByUser: false,
  });

  const state = await loadFeatureState(args.cwd, ideaData.featureSlug);
  const prepareData = prepareResult.data as PrepareResultData | undefined;
  if (!prepareData) {
    throw new Error(
      "Komenda 'run discovery' nie zwróciła danych potrzebnych do przygotowania startu feature'a.",
    );
  }

  const data: StartResultData = {
    ...summarizeFeatureState(state),
    createdFeature: true,
    featureDirectory: ideaData.featureDirectory,
    ideaFile: ideaData.ideaFile,
    preparation: prepareData.preparation,
  };

  return {
    ok: true,
    command: "start",
    message:
      `Utworzono feature '${state.slug}', zapisano 01-idea.md i przygotowano etap 'discovery'.`,
    agentAction: prepareResult.agentAction,
    stopReason: prepareResult.stopReason,
    data,
  };
}
