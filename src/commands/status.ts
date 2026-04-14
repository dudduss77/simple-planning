import { type CommandResult } from "../lib/contracts.js";
import { loadFeatureState, saveFeatureState, syncFeatureSummary } from "../lib/state.js";

export async function runStatusCommand(args: {
  cwd: string;
  feature?: string;
}): Promise<CommandResult> {
  const state = await loadFeatureState(args.cwd, args.feature);
  await saveFeatureState(args.cwd, state);
  await syncFeatureSummary(args.cwd, state);

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
    data: {
      featureId: state.featureId,
      featureName: state.name,
      featureSlug: state.slug,
      activeStep: state.activeStep,
      lastCompletedStep: state.lastCompletedStep,
      nextSuggestedStep: state.nextSuggestedStep,
      awaitingUserConfirmation: state.awaitingUserConfirmation,
      awaitingAfterStep: state.awaitingAfterStep,
      documents: state.documents,
    },
  };
}
