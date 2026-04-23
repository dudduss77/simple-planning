import {
  assertPrepareResultData,
  type CommandResult,
  type ContinueResultData,
  type FeatureSelectionData,
  type PrepareResultData,
  type RunCommandSuccess,
} from "../lib/contracts.js";
import { isDocumentMeaningful } from "../lib/fs-utils.js";
import { getNextSuggestedStep } from "../lib/pipeline.js";
import {
  clearAwaitingUserConfirmation,
  loadFeatureState,
  resolveFeatureSelection,
  saveFeatureState,
  summarizeFeatureState,
  syncFeatureSummary,
} from "../lib/state.js";
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

  if (selection.kind === "no_active") {
    return {
      ok: true,
      command: "continue",
      message:
        "Brak aktywnych feature'ów do kontynuacji. Zamknięte feature'y nie mogą być dalej prowadzone przez workflow.",
      agentAction: "stop_and_ask_user",
      stopReason: "none",
      data: {
        availableFeatures: selection.features,
        suggestedCommand:
          "simple-planning status --feature <slug|id>",
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

  if (selection.kind === "closed") {
    return {
      ok: true,
      command: "continue",
      message:
        `Feature '${selection.feature.slug}' jest zamknięty z powodem '${selection.feature.closeReason}'. Użyj statusu, jeśli chcesz go obejrzeć, albo rozpocznij nowy temat.`,
      agentAction: "stop_and_ask_user",
      stopReason: "none",
      data: {
        feature: selection.feature,
        suggestedCommands: [
          `simple-planning status --feature ${selection.feature.slug}`,
          "simple-planning start --name <feature-name> --description <text>",
        ],
      },
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

  if (
    state.awaitingUserConfirmation &&
    !state.activeStep &&
    !state.nextSuggestedStep
  ) {
    const inferredNext = getNextSuggestedStep(state);
    if (inferredNext !== null) {
      state.nextSuggestedStep = inferredNext;
      await saveFeatureState(args.cwd, state);
      await syncFeatureSummary(args.cwd, state);
    }
  }

  if (state.awaitingUserConfirmation && state.nextSuggestedStep) {
    const result: RunCommandSuccess = await runStepCommand({
      cwd: args.cwd,
      stepRaw: state.nextSuggestedStep,
      feature: state.slug,
      complete: false,
      confirmedByUser: true,
    });
    const prepareData = assertPrepareResultData(result.data);

    return {
      ok: true,
      command: "continue",
      message:
        `Potwierdzono checkpoint dla '${state.slug}' i przygotowano etap '${state.nextSuggestedStep}'.`,
      agentAction: result.agentAction,
      stopReason: result.stopReason,
      data: {
        ...prepareData,
        resumedFromCheckpoint: true,
      } satisfies ContinueResultData,
    };
  }

  if (state.activeStep) {
    const activeDocPath = state.documents[state.activeStep].path;
    if (await isDocumentMeaningful(activeDocPath)) {
      const completedStep = state.activeStep;
      const completeResult: RunCommandSuccess = await runStepCommand({
        cwd: args.cwd,
        stepRaw: completedStep,
        feature: state.slug,
        complete: true,
        confirmedByUser: false,
      });

      const stateAfter = await loadFeatureState(args.cwd, state.slug);

      if (!stateAfter.nextSuggestedStep) {
        return {
          ok: true,
          command: "continue",
          message: `Domknięto etap '${completedStep}' dla feature'a '${state.slug}'. ${completeResult.message}`,
          agentAction: completeResult.agentAction,
          stopReason: completeResult.stopReason,
          data: completeResult.data,
        };
      }

      const prepareResult: RunCommandSuccess = await runStepCommand({
        cwd: args.cwd,
        stepRaw: stateAfter.nextSuggestedStep,
        feature: stateAfter.slug,
        complete: false,
        confirmedByUser: stateAfter.awaitingUserConfirmation,
      });
      const prepareData = assertPrepareResultData(prepareResult.data);

      return {
        ok: true,
        command: "continue",
        message: `Domknięto etap '${completedStep}' i przygotowano etap '${stateAfter.nextSuggestedStep}' dla feature'a '${state.slug}'.`,
        agentAction: prepareResult.agentAction,
        stopReason: prepareResult.stopReason,
        data: {
          ...prepareData,
          resumedFromCheckpoint: true,
        } satisfies ContinueResultData,
      };
    }
  }

  const stepToPrepare = state.activeStep ?? state.nextSuggestedStep;
  if (stepToPrepare) {
    const result: RunCommandSuccess = await runStepCommand({
      cwd: args.cwd,
      stepRaw: stepToPrepare,
      feature: state.slug,
      complete: false,
      confirmedByUser: false,
    });
    const prepareData = assertPrepareResultData(result.data);

    return {
      ok: true,
      command: "continue",
      message:
        state.activeStep === stepToPrepare
          ? `Wznowiono aktywny etap '${stepToPrepare}' dla feature'a '${state.slug}'.`
          : `Przygotowano następny legalny etap '${stepToPrepare}' dla feature'a '${state.slug}'.`,
      agentAction: result.agentAction,
      stopReason: result.stopReason,
      data: {
        ...prepareData,
        resumedFromCheckpoint: false,
      } satisfies ContinueResultData,
    };
  }

  if (
    state.awaitingUserConfirmation &&
    !state.nextSuggestedStep &&
    !state.activeStep
  ) {
    clearAwaitingUserConfirmation(state);
    await saveFeatureState(args.cwd, state);
    await syncFeatureSummary(args.cwd, state);

    return {
      ok: true,
      command: "continue",
      message: `Feature '${state.slug}' — wszystkie etapy workflow są domknięte.`,
      agentAction: "pipeline_complete",
      stopReason: "pipeline_completed",
      data: summarizeFeatureState(state),
    };
  }

  return {
    ok: true,
    command: "continue",
    message: `Feature '${state.slug}' nie ma kolejnego legalnego etapu. Workflow jest domknięty.`,
    agentAction: "pipeline_complete",
    stopReason: "pipeline_completed",
    data: summarizeFeatureState(state),
  };
}
