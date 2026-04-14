import { type CommandResult } from "../lib/contracts.js";
import { ensureDirectory, ensureFileWithContent } from "../lib/fs-utils.js";
import { getGuideText } from "../lib/guides.js";
import { getFeatureDirectory } from "../lib/project-paths.js";
import {
  createFeatureState,
  ensureProjectIndex,
  saveFeatureState,
  syncFeatureSummary,
} from "../lib/state.js";
import {
  createFeatureDocumentTemplate,
  createIdeaTemplate,
} from "../lib/templates.js";

export async function runIdeaCommand(args: {
  cwd: string;
  name: string;
  description: string;
}): Promise<CommandResult> {
  const index = await ensureProjectIndex(args.cwd);

  const state = createFeatureState(args.cwd, args.name);
  if (index.features.some((feature) => feature.slug === state.slug)) {
    throw new Error(
      `Feature o slugu '${state.slug}' już istnieje. Użyj istniejącego feature'a albo wybierz inną nazwę.`,
    );
  }

  const featureDir = getFeatureDirectory(args.cwd, state.slug);
  await ensureDirectory(featureDir);

  await Promise.all(
    Object.entries(state.documents).map(async ([step, record]) => {
      const content =
        step === "idea"
          ? createIdeaTemplate(args.name, args.description)
          : createFeatureDocumentTemplate(step as keyof typeof state.documents);

      await ensureFileWithContent(record.path, content);
    }),
  );

  state.documents.idea.exists = true;
  state.documents.idea.completed = true;
  state.lastCompletedStep = "idea";
  state.nextSuggestedStep = "discovery";

  await saveFeatureState(args.cwd, state);
  await syncFeatureSummary(args.cwd, state);
  const nextPromptText = await getGuideText(args.cwd, "discovery");

  return {
    ok: true,
    command: "idea",
    message:
      "01-idea.md zostało utworzone. Następny krok: discovery. Użyj promptu @commands/Discovery.md.",
    agentAction: "prepare_next_step",
    stopReason: "none",
    data: {
      featureId: state.featureId,
      featureSlug: state.slug,
      featureName: state.name,
      featureDirectory: featureDir,
      ideaFile: state.documents.idea.path,
      targetDocument: {
        step: "idea",
        path: state.documents.idea.path,
      },
      nextSuggestedStep: state.nextSuggestedStep,
      nextContext: {
        nextStep: state.nextSuggestedStep,
        prompt: {
          path: null,
          ref: "@commands/Discovery.md",
          text: nextPromptText,
        },
      },
      nextPromptRef: "@commands/Discovery.md",
      nextPromptText,
      nextCommand: `simple-planning run discovery --feature ${state.slug}`,
    },
  };
}
