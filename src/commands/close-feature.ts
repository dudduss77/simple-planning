import {
  featureCloseReasons,
  type CommandResult,
  type FeatureCloseReason,
  type FeatureSelectionData,
} from "../lib/contracts.js";
import {
  closeFeatureState,
  loadFeatureState,
  resolveFeatureSelection,
  saveFeatureState,
  summarizeFeatureState,
  syncFeatureSummary,
} from "../lib/state.js";

function assertCloseReason(value: string): FeatureCloseReason {
  if ((featureCloseReasons as readonly string[]).includes(value)) {
    return value as FeatureCloseReason;
  }

  throw new Error(
    `Nieznany powód zamknięcia '${value}'. Użyj jednego z: ${featureCloseReasons.join(", ")}.`,
  );
}

export async function runCloseFeatureCommand(args: {
  cwd: string;
  feature?: string;
  reasonRaw: string;
}): Promise<CommandResult> {
  const reason = assertCloseReason(args.reasonRaw);
  const selection = await resolveFeatureSelection(args.cwd, args.feature);

  if (selection.kind === "empty") {
    return {
      ok: true,
      command: "close-feature",
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
      command: "close-feature",
      message:
        "Brak aktywnych feature'ów do zamknięcia. Zamknięte feature'y pozostają tylko do podglądu statusu.",
      agentAction: "stop_and_ask_user",
      stopReason: "none",
      data: {
        availableFeatures: selection.features,
        suggestedCommand: "simple-planning status --feature <slug|id>",
      },
    };
  }

  if (selection.kind === "missing") {
    return {
      ok: false,
      command: "close-feature",
      message:
        `Nie znaleziono feature'a '${selection.featureRef}'. Jeśli to istniejący feature, użyj 'simple-planning list', aby sprawdzić poprawny slug lub id.`,
      agentAction: "stop_and_ask_user",
      stopReason: "none",
    };
  }

  if (selection.kind === "closed") {
    return {
      ok: true,
      command: "close-feature",
      message:
        `Feature '${selection.feature.slug}' jest już zamknięty z powodem '${selection.feature.closeReason}'.`,
      agentAction: "show_status",
      stopReason: "none",
      data: {
        feature: selection.feature,
      },
    };
  }

  if (selection.kind === "ambiguous") {
    const data: FeatureSelectionData = {
      selectionRequired: true,
      selectionReason: selection.reason,
      suggestedCommand: "simple-planning close-feature --reason <reason> --feature <slug|id>",
      availableFeatures: selection.features,
    };

    return {
      ok: true,
      command: "close-feature",
      message: "Istnieje kilka aktywnych feature'ów. Wskaż, który mam zamknąć.",
      agentAction: "choose_feature",
      stopReason: "none",
      data,
    };
  }

  const state = await loadFeatureState(args.cwd, selection.feature.slug);
  closeFeatureState(state, reason);
  await saveFeatureState(args.cwd, state);
  await syncFeatureSummary(args.cwd, state);

  return {
    ok: true,
    command: "close-feature",
    message:
      `Feature '${state.slug}' został zamknięty z powodem '${reason}'.`,
    agentAction: "show_status",
    stopReason: "none",
    data: {
      ...summarizeFeatureState(state),
    },
  };
}
