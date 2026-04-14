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
  return `# Użyj Simple Planning\n\nUżywaj tej komendy zawsze wtedy, gdy użytkownik chce tworzyć, przeglądać albo porządkować dokumenty zarządzane przez Simple Planning.\n\n## Zasady\n- Zawsze zacznij od sprawdzenia stanu projektu przez \`${packageCommand} status\` albo \`${packageCommand} list\`.\n- Preferuj \`${packageCommand} next --feature <slug-or-id>\`, aby ustalić kolejny legalny główny etap.\n- Użyj \`${packageCommand} run <step> --feature <slug-or-id>\` przed edycją dokumentu, aby CLI zwróciło wymagane pliki oraz pełny prompt etapu.\n- Po zaktualizowaniu pliku docelowego wywołaj \`${packageCommand} run <step> --feature <slug-or-id> --complete\`.\n- Jeśli CLI zwróci \`Zatrzymaj się i poproś użytkownika o dalsze instrukcje.\`, zatrzymaj się i zapytaj użytkownika.\n- Nie przechodź do kolejnego głównego etapu tylko na podstawie luźnej odpowiedzi użytkownika. Użyj dedykowanej komendy Cursor \`continue-simple-planning\`.\n- Możesz aktualizować \`decision-log\` albo \`parking-lot\` podczas innego etapu tylko wtedy, gdy użytkownik wyraźnie o to poprosi.\n- Nie polegaj na pamięci, żeby ustalić, które pliki są potrzebne. Za każdym razem pytaj CLI.\n`;
}

export function buildContinueCursorCommandTemplate(
  packageCommand = "npx simple-planning",
): string {
  return `# Kontynuuj Simple Planning\n\nUżywaj tej komendy tylko wtedy, gdy użytkownik chce jawnie przejść dalej po checkpointcie Simple Planning.\n\n## Zasady\n- Zacznij od sprawdzenia stanu projektu przez \`${packageCommand} status\` albo \`${packageCommand} next\`.\n- Jeśli istnieje kilka feature'ów i nie wiadomo, który ma być kontynuowany, zapytaj użytkownika.\n- Jeśli bieżący feature nie czeka na potwierdzenie, nie wymyślaj kontynuacji. Wyjaśnij aktualny stan.\n- Jeśli feature czeka na potwierdzenie i \`nextSuggestedStep\` istnieje, uruchom \`${packageCommand} run <next-step> --feature <slug-or-id> --confirmed-by-user\`.\n- Jedynym celem tej komendy jest odblokowanie dokładnie jednego następnego kroku po checkpointcie.\n- Po przygotowaniu tego kroku wróć do normalnego flow przez \`use-simple-planning\`.\n`;
}

export function getFeatureDocumentPaths(featureDir: string): Record<Step, string> {
  const entries = allSteps.map((step) => [
    step,
    path.join(featureDir, stepDefinitions[step].filename),
  ]);

  return Object.fromEntries(entries) as Record<Step, string>;
}
