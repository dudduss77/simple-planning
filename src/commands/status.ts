import {
  type CommandResult,
  type FeatureSelectionData,
  type StatusResultData,
} from "../lib/contracts.js";
import {
  loadFeatureState,
  resolveFeatureSelection,
  saveFeatureState,
  summarizeFeatureState,
  syncFeatureSummary,
} from "../lib/state.js";
import { getGuideReference, getGuideText, getProjectGuidePath } from "../lib/guides.js";

export async function runStatusCommand(args: {
  cwd: string;
  feature?: string;
}): Promise<CommandResult> {
  const selection = await resolveFeatureSelection(args.cwd, args.feature);
  if (selection.kind === "empty") {
    return {
      ok: true,
      command: "status",
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
      command: "status",
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
      suggestedCommand: "simple-planning status --feature <slug|id>",
      availableFeatures: selection.features,
    };

    return {
      ok: true,
      command: "status",
      message:
        "Istnieje kilka aktywnych feature'ów. Wskaż, dla którego mam pokazać status.",
      agentAction: "choose_feature",
      stopReason: "none",
      data,
    };
  }

  const state = await loadFeatureState(args.cwd, args.feature);
  await saveFeatureState(args.cwd, state);
  await syncFeatureSummary(args.cwd, state);

  const promptPath = state.nextSuggestedStep
    ? getProjectGuidePath(args.cwd, state.nextSuggestedStep)
    : null;
  const promptRef = state.nextSuggestedStep
    ? getGuideReference(state.nextSuggestedStep)
    : null;
  const promptText = state.nextSuggestedStep
    ? await getGuideText(args.cwd, state.nextSuggestedStep)
    : null;

  const data: StatusResultData = {
    ...summarizeFeatureState(state),
    documents: state.documents,
    nextContext: {
      nextStep: state.nextSuggestedStep,
      prompt: {
        path: promptPath,
        ref: promptRef,
        text: promptText,
      },
    },
  };

  return {
    ok: true,
    command: "status",
    message: state.awaitingUserConfirmation
      ? "Feature czeka na decyzję użytkownika."
      : "Pobrano status feature'a.",
    agentAction: state.awaitingUserConfirmation
      ? "stop_and_ask_user"
      : "show_status",
    stopReason: state.awaitingUserConfirmation
      ? "awaiting_user_confirmation"
      : "none",
    data,
  };
}
