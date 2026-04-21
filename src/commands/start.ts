import {
  assertPrepareResultData,
  type IdeaCommandSuccess,
  type PrepareResultData,
  type StartCommandSuccess,
  type StartResultData,
} from "../lib/contracts.js";
import { runIdeaCommand } from "./idea.js";
import { runStepCommand } from "./run.js";
import { loadFeatureState, summarizeFeatureState } from "../lib/state.js";

export async function runStartCommand(args: {
  cwd: string;
  name: string;
  description: string;
}): Promise<StartCommandSuccess> {
  const ideaResult: IdeaCommandSuccess = await runIdeaCommand(args);
  const ideaData = ideaResult.data;

  const prepareResult = await runStepCommand({
    cwd: args.cwd,
    stepRaw: "discovery",
    feature: ideaData.featureSlug,
    complete: false,
    confirmedByUser: false,
  });

  const state = await loadFeatureState(args.cwd, ideaData.featureSlug);
  const prepareData: PrepareResultData = assertPrepareResultData(
    prepareResult.data,
  );

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
