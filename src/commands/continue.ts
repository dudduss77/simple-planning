import {
  type CommandResult,
  type ContinueResultData,
  type FeatureSelectionData,
  type PrepareResultData,
} from "../lib/contracts.js";
import { loadFeatureState, resolveFeatureSelection } from "../lib/state.js";
import { runStepCommand } from "./run.js";

export async function runContinueCommand(args: {
  cwd: string;
  feature?: string;
}): Promise<CommandResult> {
  const selection = await resolveFeatureSelection(args.cwd, args.feature);

  if (selection.kind === "empty") {
    return {
      ok: true,
      command: "continue",
      message:
        "Brak feature'ów w Simple Planning. Jeśli zaczynasz nowy temat, uruchom 'simple-planning start --name <feature-name> --description <text>'.",
      agentAction: "stop_and_ask_user",
      stopReason: "none",
      data: {
        suggestedCommand:
          "simple-planning start --name <feature-name> --description <text>",
      },
    };
  }

  if (selection.kind === "missing") {
    return {
      ok: false,
      command: "continue",
      message:
        `Nie znaleziono feature'a '${selection.featureRef}'. Jeśli to istniejący feature, użyj 'simple-planning list', aby sprawdzić poprawny slug lub id. Jeśli to nowy feature, uruchom 'simple-planning start --name <feature-name> --description <text>'.`,
      agentAction: "stop_and_ask_user",
      stopReason: "none",
    };
  }

  if (selection.kind === "ambiguous") {
    const data: FeatureSelectionData = {
      selectionRequired: true,
      selectionReason: selection.reason,
      suggestedCommand: "simple-planning continue --feature <slug|id>",
      availableFeatures: selection.features,
    };

    return {
      ok: true,
      command: "continue",
      message:
        "Istnieje kilka aktywnych feature'ów. Wskaż, który mam kontynuować.",
      agentAction: "choose_feature",
      stopReason: "none",
      data,
    };
  }

  const state = await loadFeatureState(args.cwd, selection.feature.slug);

  if (state.awaitingUserConfirmation && state.nextSuggestedStep) {
    const result = await runStepCommand({
      cwd: args.cwd,
      stepRaw: state.nextSuggestedStep,
      feature: state.slug,
      complete: false,
      confirmedByUser: true,
    });
    const data = result.data as PrepareResultData | undefined;

    return {
      ok: result.ok,
      command: "continue",
      message:
        `Potwierdzono checkpoint dla '${state.slug}' i przygotowano etap '${state.nextSuggestedStep}'.`,
      agentAction: result.agentAction,
      stopReason: result.stopReason,
      data: data
        ? ({
            ...data,
            resumedFromCheckpoint: true,
          } satisfies ContinueResultData)
        : result.data,
    };
  }

  const stepToPrepare = state.activeStep ?? state.nextSuggestedStep;
  if (stepToPrepare) {
    const result = await runStepCommand({
      cwd: args.cwd,
      stepRaw: stepToPrepare,
      feature: state.slug,
      complete: false,
      confirmedByUser: false,
    });
    const data = result.data as PrepareResultData | undefined;

    return {
      ok: result.ok,
      command: "continue",
      message:
        state.activeStep === stepToPrepare
          ? `Wznowiono aktywny etap '${stepToPrepare}' dla feature'a '${state.slug}'.`
          : `Przygotowano następny legalny etap '${stepToPrepare}' dla feature'a '${state.slug}'.`,
      agentAction: result.agentAction,
      stopReason: result.stopReason,
      data: data
        ? ({
            ...data,
            resumedFromCheckpoint: false,
          } satisfies ContinueResultData)
        : result.data,
    };
  }

  return {
    ok: true,
    command: "continue",
    message: `Feature '${state.slug}' nie ma kolejnego legalnego kroku. Główny pipeline jest domknięty.`,
    agentAction: "pipeline_complete",
    stopReason: "pipeline_completed",
    data: {
      featureId: state.featureId,
      featureName: state.name,
      featureSlug: state.slug,
      activeStep: state.activeStep,
      lastCompletedStep: state.lastCompletedStep,
      nextSuggestedStep: state.nextSuggestedStep,
      awaitingUserConfirmation: state.awaitingUserConfirmation,
      awaitingAfterStep: state.awaitingAfterStep,
    },
  };
}
