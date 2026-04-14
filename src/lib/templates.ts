import path from "node:path";

import { allSteps, type Step } from "./contracts.js";
import { stepDefinitions } from "./pipeline.js";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function baseHeader(owner = "unknown"): string {
  return `Status: draft\nOwner: ${owner}\nLast updated: ${today()}\n`;
}

export function createIdeaTemplate(
  featureName: string,
  description: string,
  owner?: string,
): string {
  return `${baseHeader(owner)}\n# ${featureName}\n\n## Problem / potrzeba\n${description.trim()}\n\n## Kontekst\n- Do uzupełnienia\n\n## Założenia początkowe\n- Do uzupełnienia\n\n## Otwarte pytania\n- Do uzupełnienia\n`;
}

function createSkeleton(title: string, sections: string[], owner?: string): string {
  const body = sections.map((section) => `## ${section}\n- Do uzupełnienia\n`).join("\n");
  return `${baseHeader(owner)}\n# ${title}\n\n${body}`;
}

export function createFeatureDocumentTemplate(step: Step, owner?: string): string {
  switch (step) {
    case "discovery":
      return createSkeleton(
        "Discovery",
        [
          "Tryb pracy",
          "Co już istnieje",
          "Czego brakuje",
          "Pytania otwarte",
          "Luki informacyjne",
          "Ryzyka",
          "Sprzeczności",
          "Alternatywne kierunki",
          "Punkty wymagające decyzji",
        ],
        owner,
      );
    case "product-spec":
      return createSkeleton(
        "Product Spec",
        [
          "Cel funkcjonalności",
          "Użytkownicy",
          "Zakres funkcjonalny",
          "Główne flow",
          "Zasady działania",
          "Edge case'y",
          "Ograniczenia",
          "Out of scope",
          "Kryteria akceptacji",
        ],
        owner,
      );
    case "mvp":
      return createSkeleton(
        "MVP",
        [
          "Status MVP",
          "Elementy wchodzące do MVP",
          "Elementy po MVP",
          "Uzasadnienie cięcia zakresu",
          "Granice MVP",
        ],
        owner,
      );
    case "tech-spec":
      return createSkeleton(
        "Tech Spec",
        [
          "Zakres zmiany",
          "Miejsca w kodzie objęte zmianą",
          "Aktualny stan techniczny",
          "Plan zmian technicznych",
          "Kontrakty i interfejsy",
          "Struktury danych",
          "Integracje",
          "Ograniczenia techniczne",
          "Decyzje techniczne potrzebne do wdrożenia MVP",
        ],
        owner,
      );
    case "tasks":
      return createSkeleton(
        "Tasks",
        ["Lista tasków", "Kolejność realizacji"],
        owner,
      );
    case "decision-log":
      return createSkeleton("Decision Log", ["Wpisy"], owner);
    case "parking-lot":
      return createSkeleton("Parking Lot", ["Pozycje"], owner);
    case "idea":
      return createSkeleton("Idea", ["Opis"], owner);
  }

  return createSkeleton("Document", ["Treść"], owner);
}

export function createProductVisionTemplate(owner?: string): string {
  return createSkeleton(
    "Vision",
    ["Cel produktu", "Docelowi użytkownicy", "Główne problemy", "Kierunek"],
    owner,
  );
}

export function createProductRoadmapTemplate(owner?: string): string {
  return createSkeleton(
    "Roadmap",
    ["Priorytety", "Najbliższe etapy", "Ryzyka", "Out of scope"],
    owner,
  );
}

export function buildCursorCommandTemplate(packageCommand = "npx simple-planning"): string {
  return `# Use Simple Planning\n\nUse this command whenever the user wants to create, review, or organize planning documents managed by Simple Planning.\n\n## Rules\n- Always start by checking the project state with \`${packageCommand} status\` or \`${packageCommand} list\`.\n- Prefer \`${packageCommand} next --feature <slug-or-id>\` to discover the next legal main step.\n- Use \`${packageCommand} run <step> --feature <slug-or-id>\` before editing any planning document so the CLI can tell you which files are required.\n- After you update the target markdown file, call \`${packageCommand} run <step> --feature <slug-or-id> --complete\`.\n- If the CLI says \`Zatrzymaj się i poproś użytkownika o dalsze instrukcje.\`, stop and ask the user.\n- Do not continue to the next main step based only on a casual user reply. Use the dedicated Cursor command \`continue-simple-planning\`.\n- You may update \`decision-log\` or \`parking-lot\` during another step only if the user explicitly asks for it.\n- Do not rely on memory to decide which markdown files are needed. Ask the CLI every time.\n`;
}

export function buildContinueCursorCommandTemplate(
  packageCommand = "npx simple-planning",
): string {
  return `# Continue Simple Planning\n\nUse this command only when the user explicitly wants to continue a feature after a Simple Planning checkpoint.\n\n## Rules\n- Start by checking the project state with \`${packageCommand} status\` or \`${packageCommand} next\`.\n- If multiple feature branches exist and the target feature is unclear, ask the user which feature should continue.\n- If the current feature is not waiting for confirmation, do not invent a continuation. Explain the current state instead.\n- If the feature is waiting for confirmation and \`nextSuggestedStep\` exists, run \`${packageCommand} run <next-step> --feature <slug-or-id> --confirmed-by-user\`.\n- The only purpose of this command is to unlock exactly one next step after a checkpoint.\n- After preparing that next step, continue following the normal \`use-simple-planning\` flow.\n`;
}

export function getFeatureDocumentPaths(featureDir: string): Record<Step, string> {
  const entries = allSteps.map((step) => [
    step,
    path.join(featureDir, stepDefinitions[step].filename),
  ]);

  return Object.fromEntries(entries) as Record<Step, string>;
}
