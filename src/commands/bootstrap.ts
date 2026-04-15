import path from "node:path";

import {
  type BootstrapDocumentTask,
  type BootstrapResultData,
  type CommandResult,
  type PrepareResultData,
} from "../lib/contracts.js";
import {
  ensureFileWithContent,
  fileExists,
  getMeaningfulDocumentCharacterCount,
} from "../lib/fs-utils.js";
import {
  getCommandReference,
  getCommandText,
  getProjectCommandPath,
} from "../lib/guides.js";
import { getFeatureDirectory, getProductRoot } from "../lib/project-paths.js";
import {
  clearAwaitingUserConfirmation,
  ensureProjectIndex,
  loadFeatureState,
  saveFeatureState,
  syncFeatureSummary,
} from "../lib/state.js";
import {
  createFeatureDocumentTemplate,
  createIdeaTemplate,
} from "../lib/templates.js";
import { runIdeaCommand } from "./idea.js";
import { runInitCommand } from "./init.js";
import { runStepCommand } from "./run.js";

const BOOTSTRAP_FEATURE_NAME = "Bootstrap";
const BOOTSTRAP_FEATURE_SLUG = "bootstrap";
const MIN_VISION_CHARACTERS = 500;
const RECOMMENDED_VISION_GUIDANCE = "500-1000+";
const BOOTSTRAP_IDEA_DESCRIPTION =
  "Uporządkowanie istniejącego projektu przez doprecyzowanie vision, roadmapy oraz discovery stanu obecnego i dalszego kierunku rozwoju.";

async function buildPromptContext(cwd: string, filename: string) {
  return {
    path: getProjectCommandPath(cwd, filename),
    ref: getCommandReference(filename),
    text: await getCommandText(cwd, filename),
  };
}

async function ensureBootstrapFeature(cwd: string): Promise<{
  featureDirectory: string;
  bootstrapIdeaFile: string;
}> {
  const index = await ensureProjectIndex(cwd);
  if (!index.features.some((feature) => feature.slug === BOOTSTRAP_FEATURE_SLUG)) {
    await runIdeaCommand({
      cwd,
      name: BOOTSTRAP_FEATURE_NAME,
      description: BOOTSTRAP_IDEA_DESCRIPTION,
    });
  }

  const state = await loadFeatureState(cwd, BOOTSTRAP_FEATURE_SLUG);
  state.status = "active";
  state.closeReason = null;
  state.closedAt = null;
  clearAwaitingUserConfirmation(state);

  const featureDirectory = getFeatureDirectory(cwd, state.slug);
  await ensureFileWithContent(
    state.documents.idea.path,
    createIdeaTemplate(BOOTSTRAP_FEATURE_NAME, BOOTSTRAP_IDEA_DESCRIPTION),
  );
  await ensureFileWithContent(
    state.documents.discovery.path,
    createFeatureDocumentTemplate("discovery"),
  );

  state.documents.idea.exists = true;
  state.documents.idea.completed = true;
  state.nextSuggestedStep = state.nextSuggestedStep ?? "discovery";

  await saveFeatureState(cwd, state);
  await syncFeatureSummary(cwd, state);

  return {
    featureDirectory,
    bootstrapIdeaFile: state.documents.idea.path,
  };
}

export async function runBootstrapCommand(args: {
  cwd: string;
}): Promise<CommandResult> {
  await runInitCommand(args.cwd);

  const productRoot = getProductRoot(args.cwd);
  const visionFile = path.join(productRoot, "01-vision.md");
  const roadmapFile = path.join(productRoot, "02-roadmap.md");

  if (!(await fileExists(visionFile))) {
    return {
      ok: true,
      command: "bootstrap",
      message:
        "Brakuje `product/01-vision.md`. Najpierw uzupełnij ręcznie seed vision dla istniejącego produktu.",
      agentAction: "stop_and_ask_user",
      stopReason: "none",
      data: {
        visionFile,
        minimumMeaningfulCharacters: MIN_VISION_CHARACTERS,
        recommendedCharacters: RECOMMENDED_VISION_GUIDANCE,
      },
    };
  }

  const meaningfulVisionCharacters =
    await getMeaningfulDocumentCharacterCount(visionFile);
  if (meaningfulVisionCharacters < MIN_VISION_CHARACTERS) {
    return {
      ok: true,
      command: "bootstrap",
      message:
        `Bootstrap zatrzymany: \`product/01-vision.md\` ma tylko około ${meaningfulVisionCharacters} znaków sensownej treści. Uzupełnij seed vision do co najmniej ${MIN_VISION_CHARACTERS} znaków; najlepszy efekt zwykle daje ${RECOMMENDED_VISION_GUIDANCE} znaków konkretnego opisu produktu.`,
      agentAction: "stop_and_ask_user",
      stopReason: "none",
      data: {
        visionFile,
        meaningfulVisionCharacters,
        minimumMeaningfulCharacters: MIN_VISION_CHARACTERS,
        recommendedCharacters: RECOMMENDED_VISION_GUIDANCE,
      },
    };
  }

  const bootstrapFeature = await ensureBootstrapFeature(args.cwd);
  const prepareDiscovery = await runStepCommand({
    cwd: args.cwd,
    stepRaw: "discovery",
    feature: BOOTSTRAP_FEATURE_SLUG,
    complete: false,
    confirmedByUser: false,
  });
  const prepareData = prepareDiscovery.data as PrepareResultData | undefined;
  if (!prepareData) {
    throw new Error(
      "Komenda 'bootstrap' nie otrzymała danych przygotowania bootstrapowego discovery.",
    );
  }

  const documents: BootstrapDocumentTask[] = [
    {
      id: "vision",
      title: "Vision",
      targetPath: visionFile,
      requiredFiles: [],
      prompt: await buildPromptContext(args.cwd, "Vision.md"),
    },
    {
      id: "roadmap",
      title: "Roadmap",
      targetPath: roadmapFile,
      requiredFiles: [visionFile],
      prompt: await buildPromptContext(args.cwd, "Roadmap.md"),
    },
    {
      id: "bootstrap-discovery",
      title: "Bootstrap Discovery",
      targetPath: prepareData.preparation.targetDocument.path,
      requiredFiles: prepareData.preparation.requiredFiles,
      prompt: prepareData.preparation.prompt,
    },
  ];

  const data: BootstrapResultData = {
    ...prepareData,
    bootstrapMode: "existing-project",
    visionFile,
    roadmapFile,
    featureDirectory: bootstrapFeature.featureDirectory,
    bootstrapIdeaFile: bootstrapFeature.bootstrapIdeaFile,
    documents,
    discoveryPreparation: prepareData.preparation,
  };

  return {
    ok: true,
    command: "bootstrap",
    message:
      "Przygotowano bootstrap istniejącego projektu. Zredaguj kolejno vision, roadmapę i bootstrapowe discovery, potem zatrzymaj się i oddaj kontrolę użytkownikowi.",
    agentAction: "write_bootstrap_documents",
    stopReason: "none",
    data,
  };
}
