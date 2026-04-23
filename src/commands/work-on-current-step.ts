import {
  assertPrepareResultData,
  type CommandResult,
  type FeatureSelectionData,
  type RunCommandSuccess,
} from "../lib/contracts.js";
import {
  loadFeatureState,
  resolveActiveStepFeatureSelection,
  summarizeFeatureState,
} from "../lib/state.js";
import { runStepCommand } from "./run.js";

export async function runWorkOnCurrentStepCommand(args: {
  cwd: string;
  feature?: string;
}): Promise<CommandResult> {
  const selection = await resolveActiveStepFeatureSelection(args.cwd, args.feature);

  if (selection.kind === "empty") {
    return {
      ok: true,
      command: "work-on-current-step",
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
      command: "work-on-current-step",
      message:
        "Brak aktywnych feature'ów z krokiem do dalszej pracy. Zamknięte feature'y nie mogą być redagowane jak aktywny workflow.",
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
      command: "work-on-current-step",
      message:
        `Nie znaleziono feature'a '${selection.featureRef}'. Jeśli to istniejący feature, użyj 'simple-planning list', aby sprawdzić poprawny slug lub id.`,
      agentAction: "stop_and_ask_user",
      stopReason: "none",
    };
  }

  if (selection.kind === "closed") {
    return {
      ok: true,
      command: "work-on-current-step",
      message:
        `Feature '${selection.feature.slug}' jest zamknięty z powodem '${selection.feature.closeReason}'. Nie można wznowić dla niego aktywnego kroku.`,
      agentAction: "stop_and_ask_user",
      stopReason: "none",
      data: {
        feature: selection.feature,
        suggestedCommand: `simple-planning status --feature ${selection.feature.slug}`,
      },
    };
  }

  if (selection.kind === "ambiguous") {
    const data: FeatureSelectionData = {
      selectionRequired: true,
      selectionReason: selection.reason,
      suggestedCommand: "simple-planning work-on-current-step --feature <slug|id>",
      availableFeatures: selection.features,
    };

    return {
      ok: true,
      command: "work-on-current-step",
      message:
        "Nie da się jednoznacznie wskazać aktywnego kroku. Wskaż feature, nad którym mam pracować.",
      agentAction: "choose_feature",
      stopReason: "none",
      data,
    };
  }

  const state = await loadFeatureState(args.cwd, selection.feature.slug);
  if (!state.activeStep) {
    return {
      ok: true,
      command: "work-on-current-step",
      message:
        `Feature '${state.slug}' nie ma aktywnego kroku do dalszej redakcji. Użyj 'continue-feature', aby przygotować kolejny legalny etap, albo 'feature-status', aby sprawdzić stan.`,
      agentAction: "stop_and_ask_user",
      stopReason: "none",
      data: {
        ...summarizeFeatureState(state),
        suggestedCommands: [
          `simple-planning continue --feature ${state.slug}`,
          `simple-planning status --feature ${state.slug}`,
        ],
      },
    };
  }

  const result: RunCommandSuccess = await runStepCommand({
    cwd: args.cwd,
    stepRaw: state.activeStep,
    feature: state.slug,
    complete: false,
    confirmedByUser: false,
  });

  return {
    ok: true,
    command: "work-on-current-step",
    message: `Wznowiono aktywny etap '${state.activeStep}' dla feature'a '${state.slug}'. Nie przygotowano żadnego kolejnego kroku.`,
    agentAction: result.agentAction,
    stopReason: result.stopReason,
    data: assertPrepareResultData(result.data),
  };
}
