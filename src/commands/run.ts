import {
  type PrepareResultData,
  type RunCommandSuccess,
  type Step,
  type StepCompletionData,
} from "../lib/contracts.js";
import {
  ensureFileWithContent,
  isDocumentMeaningful,
} from "../lib/fs-utils.js";
import {
  getGuideReference,
  getGuideText,
  getProjectGuidePath,
} from "../lib/guides.js";
import {
  assertKnownStep,
  collectMissingDependencies,
  shouldBlockForApproval,
  stepDefinitions,
} from "../lib/pipeline.js";
import {
  clearAwaitingUserConfirmation,
  loadFeatureState,
  markCompleted,
  markPrepared,
  saveFeatureState,
  setAwaitingUserConfirmation,
  summarizeFeatureState,
  syncFeatureSummary,
} from "../lib/state.js";
import { createFeatureDocumentTemplate } from "../lib/templates.js";

function missingDependencyMessage(step: Step, missingDependencies: Step[]): string {
  const missing = missingDependencies.map((dependency) => `'${dependency}'`).join(", ");
  return `Nie można przejść do '${step}', dopóki nie zostaną domknięte etapy: ${missing}.`;
}

export async function runStepCommand(args: {
  cwd: string;
  stepRaw: string;
  feature?: string;
  complete: boolean;
  confirmedByUser: boolean;
}): Promise<RunCommandSuccess> {
  const step = assertKnownStep(args.stepRaw);
  if (step === "idea") {
    throw new Error(
      "Dla etapu 'idea' użyj komendy 'simple-planning idea --name <feature-name> --description <text>'.",
    );
  }

  const state = await loadFeatureState(args.cwd, args.feature);

  if (shouldBlockForApproval(state, step, args.confirmedByUser)) {
    return {
      ok: true,
      command: "run",
      message: "Zatrzymaj się i poproś użytkownika o dalsze instrukcje.",
      agentAction: "stop_and_ask_user",
      stopReason: "awaiting_user_confirmation",
      data: {
        ...summarizeFeatureState(state),
        awaitingAfterStep: state.awaitingAfterStep,
        requestedStep: step,
        nextSuggestedStep: state.nextSuggestedStep,
      },
    };
  }

  if (args.confirmedByUser) {
    clearAwaitingUserConfirmation(state);
  }

  const missingDependencies = collectMissingDependencies(state, step);
  if (missingDependencies.length > 0) {
    throw new Error(missingDependencyMessage(step, missingDependencies));
  }

  const targetFile = state.documents[step].path;
  await ensureFileWithContent(targetFile, createFeatureDocumentTemplate(step));

  const guideFile = getProjectGuidePath(args.cwd, step);
  const guideReference = getGuideReference(step);
  const guideText = await getGuideText(args.cwd, step);
  const requiredFiles = stepDefinitions[step].dependencies.map(
    (dependency) => state.documents[dependency].path,
  );

  if (!args.complete) {
    markPrepared(state, step);
    await saveFeatureState(args.cwd, state);
    await syncFeatureSummary(args.cwd, state);

    const data: PrepareResultData = {
      ...summarizeFeatureState(state),
      step,
      preparation: {
        step,
        targetDocument: {
          step,
          path: targetFile,
        },
        requiredFiles,
        prompt: {
          path: guideFile,
          ref: guideReference,
          text: guideText,
        },
        nextCommand: `simple-planning run ${step} --feature ${state.slug} --complete`,
        confirmedByUser: args.confirmedByUser,
      },
    };

    return {
      ok: true,
      command: "run",
      message: guideReference
        ? `Przygotowano etap '${step}'. Użyj promptu ${guideReference}, zaktualizuj plik docelowy i oznacz etap jako ukończony.`
        : `Przygotowano etap '${step}'. Zaktualizuj plik docelowy i oznacz etap jako ukończony.`,
      agentAction: "write_document",
      stopReason: "none",
      data,
    };
  }

  if (!(await isDocumentMeaningful(targetFile))) {
    throw new Error(
      `Plik docelowy '${targetFile}' nadal wygląda na pusty lub szkicowy. Uzupełnij go przed oznaczeniem etapu '${step}' jako ukończonego.`,
    );
  }

  markCompleted(state, step);
  if (stepDefinitions[step].requiresUserConfirmation) {
    setAwaitingUserConfirmation(state, step);
  } else {
    clearAwaitingUserConfirmation(state);
  }

  await saveFeatureState(args.cwd, state);
  await syncFeatureSummary(args.cwd, state);

  const completionData: StepCompletionData = {
    ...summarizeFeatureState(state),
    completedStep: step,
    nextContext: {
      nextStep: state.nextSuggestedStep,
      prompt: {
        path: state.nextSuggestedStep
          ? getProjectGuidePath(args.cwd, state.nextSuggestedStep)
          : null,
        ref: state.nextSuggestedStep
          ? getGuideReference(state.nextSuggestedStep)
          : null,
        text: state.nextSuggestedStep
          ? await getGuideText(args.cwd, state.nextSuggestedStep)
          : null,
      },
    },
    nextPromptRef: state.nextSuggestedStep
      ? getGuideReference(state.nextSuggestedStep)
      : null,
    nextPromptText: state.nextSuggestedStep
      ? await getGuideText(args.cwd, state.nextSuggestedStep)
      : null,
  };

  return {
    ok: true,
    command: "run",
    message: state.awaitingUserConfirmation
      ? "Zatrzymaj się i poproś użytkownika o dalsze instrukcje."
      : `Etap '${step}' został oznaczony jako ukończony.`,
    agentAction: state.awaitingUserConfirmation
      ? "stop_and_ask_user"
      : "step_completed",
    stopReason: state.awaitingUserConfirmation
      ? "awaiting_user_confirmation"
      : "none",
    data: completionData,
  };
}
