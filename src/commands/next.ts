import { type CommandResult } from "../lib/contracts.js";
import { getGuideReference, getGuideText, getProjectGuidePath } from "../lib/guides.js";
import { loadFeatureState, saveFeatureState, syncFeatureSummary } from "../lib/state.js";

export async function runNextCommand(args: {
  cwd: string;
  feature?: string;
}): Promise<CommandResult> {
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
        featureId: state.featureId,
        featureSlug: state.slug,
        awaitingAfterStep: state.awaitingAfterStep,
        nextSuggestedStep: state.nextSuggestedStep,
        awaitingUserConfirmation: true,
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
      featureId: state.featureId,
      featureSlug: state.slug,
      nextSuggestedStep: state.nextSuggestedStep,
      awaitingUserConfirmation: false,
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
