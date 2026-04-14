import {
  type CommandResult,
  type FeatureSelectionData,
} from "../lib/contracts.js";
import { getGuideReference, getGuideText, getProjectGuidePath } from "../lib/guides.js";
import {
  loadFeatureState,
  resolveFeatureSelection,
  saveFeatureState,
  summarizeFeatureState,
  syncFeatureSummary,
} from "../lib/state.js";

export async function runNextCommand(args: {
  cwd: string;
  feature?: string;
}): Promise<CommandResult> {
  const selection = await resolveFeatureSelection(args.cwd, args.feature);
  if (selection.kind === "empty") {
    return {
      ok: true,
      command: "next",
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
      command: "next",
      message:
        "Brak aktywnych feature'ów do dalszej pracy. Zamknięte feature'y nie mają kolejnego kroku.",
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
      command: "next",
      message:
        `Nie znaleziono feature'a '${selection.featureRef}'. Jeśli to istniejący feature, użyj 'simple-planning list', aby sprawdzić poprawny slug lub id. Jeśli to nowy feature, uruchom 'simple-planning start --name <feature-name> --description <text>'.`,
      agentAction: "stop_and_ask_user",
      stopReason: "none",
    };
  }

  if (selection.kind === "closed") {
    return {
      ok: true,
      command: "next",
      message:
        `Feature '${selection.feature.slug}' jest zamknięty z powodem '${selection.feature.closeReason}'. Zamknięte feature'y nie mają kolejnego kroku.`,
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
      suggestedCommand: "simple-planning next --feature <slug|id>",
      availableFeatures: selection.features,
    };

    return {
      ok: true,
      command: "next",
      message:
        "Istnieje kilka aktywnych feature'ów. Wskaż, dla którego mam wyznaczyć następny krok.",
      agentAction: "choose_feature",
      stopReason: "none",
      data,
    };
  }

  const state = await loadFeatureState(args.cwd, args.feature);
  await saveFeatureState(args.cwd, state);
  await syncFeatureSummary(args.cwd, state);

  if (state.awaitingUserConfirmation) {
    return {
      ok: true,
      command: "next",
      message: "Zatrzymaj się i poproś użytkownika o dalsze instrukcje.",
      agentAction: "stop_and_ask_user",
      stopReason: "awaiting_user_confirmation",
      data: {
        ...summarizeFeatureState(state),
      },
    };
  }

  const promptPath = state.nextSuggestedStep
    ? getProjectGuidePath(args.cwd, state.nextSuggestedStep)
    : null;
  const promptRef = state.nextSuggestedStep
    ? getGuideReference(state.nextSuggestedStep)
    : null;
  const promptText = state.nextSuggestedStep
    ? await getGuideText(args.cwd, state.nextSuggestedStep)
    : null;

  return {
    ok: true,
    command: "next",
    message: state.nextSuggestedStep
      ? `Następny legalny etap to '${state.nextSuggestedStep}'.`
      : "Brak kolejnego głównego etapu. Główny pipeline jest domknięty.",
    agentAction: state.nextSuggestedStep ? "show_next_step" : "pipeline_complete",
    stopReason: state.nextSuggestedStep ? "none" : "pipeline_completed",
    data: {
      ...summarizeFeatureState(state),
      nextContext: {
        nextStep: state.nextSuggestedStep,
        prompt: {
          path: promptPath,
          ref: promptRef,
          text: promptText,
        },
      },
    },
  };
}
