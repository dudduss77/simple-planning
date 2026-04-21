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

export function buildStartFeatureCursorCommandTemplate(
  packageCommand = "npx simple-planning",
): string {
  return `# Start Feature\n\nUżywaj tej komendy tylko wtedy, gdy użytkownik chce rozpocząć nowy feature w Simple Planning.\n\n## Zasady\n- Jeśli nazwa feature'a nie jest jednoznaczna, zapytaj użytkownika o nazwę.\n- Jeśli opis jest zbyt krótki albo nie istnieje, poproś o krótki opis do \`01-idea.md\`.\n- Uruchom \`${packageCommand} start --name <feature-name> --description "<opis>"\`.\n- CLI samo ma utworzyć feature, \`01-idea.md\` i przygotować \`discovery\`.\n- Użyj tylko \`preparation.targetDocument\`, \`preparation.requiredFiles\` i \`preparation.prompt\` zwróconych przez CLI.\n- Po zaktualizowaniu pliku docelowego zatrzymaj się i oddaj kontrolę użytkownikowi.\n- Nie wywołuj \`preparation.nextCommand\` tylko dlatego, że etap został właśnie zredagowany.\n- Jeśli CLI zwróci konieczność zatrzymania albo doprecyzowania, zatrzymaj się i zapytaj użytkownika.\n`;
}

export function buildCloseFeatureCursorCommandTemplate(
  packageCommand = "npx simple-planning",
): string {
  return `# Close Feature\n\nUżywaj tej komendy wtedy, gdy użytkownik chce jawnie zamknąć feature w lifecycle Simple Planning.\n\n## Zasady\n- Jeśli nie wiadomo, który feature ma zostać zamknięty, zapytaj użytkownika albo pozwól CLI zwrócić wybór feature'a.\n- Jeśli powód zamknięcia nie jest jawny, poproś użytkownika o jeden z powodów: \`done\`, \`wont-do\`, \`duplicate\`, \`obsolete\`.\n- Uruchom \`${packageCommand} close-feature --reason <reason> [--feature <slug|id>]\`.\n- Ta komenda zamyka feature w stanie CLI i nie aktualizuje automatycznie \`07-decision-log.md\`.\n- Po zamknięciu nie próbuj uruchamiać \`continue\` ani \`work-on-current-step\` dla tego feature'a.\n`;
}

export function buildContinueFeatureCursorCommandTemplate(
  packageCommand = "npx simple-planning",
): string {
  return `# Continue Feature\n\nUżywaj tej komendy wtedy, gdy użytkownik chce kontynuować dokładnie jeden legalny krok dla istniejącego feature'a.\n\n## Zasady\n- Uruchom \`${packageCommand} continue [--feature <slug|id>]\`.\n- Jeśli CLI zwróci wybór feature'a, zapytaj użytkownika zamiast zgadywać.\n- Jedno wywołanie \`continue\` może domknąć bieżący etap i od razu przygotować następny, gdy plik docelowy jest już uznany przez CLI za wystarczająco wypełniony (nie musisz wtedy osobno wołać \`run <krok> --complete\` przed kolejnym \`continue\`).\n- Po domknięciu głównego etapu \`tasks\` CLI przez ten sam \`continue\` kolejno przygotuje \`07-decision-log.md\`, a w osobnym wywołaniu \`08-parking-lot.md\` (jeden dokument na jedno \`continue\`); możesz też użyć \`run decision-log\` / \`run parking-lot\`.\n- Jeśli CLI wznowi aktywny etap albo odblokuje krok po checkpointcie, wykonaj dokładnie ten krok i nic więcej.\n- Użyj tylko \`preparation.targetDocument\`, \`preparation.requiredFiles\` i \`preparation.prompt\` zwróconych przez CLI.\n- Jeśli \`resumedFromCheckpoint\` jest \`true\`, potraktuj to jako przygotowanie nowego etapu: zredaguj dokument i zatrzymaj się bez wywoływania \`preparation.nextCommand\`.\n- Jeśli \`resumedFromCheckpoint\` jest \`false\` i CLI wznowiło już aktywny etap, po zaktualizowaniu pliku docelowego możesz wywołać \`preparation.nextCommand\`, aby domknąć właśnie ten bieżący etap.\n- Nie przechodź sam do kolejnego etapu poza tym, co zwrócił CLI.\n`;
}

export function buildWorkOnCurrentStepCursorCommandTemplate(
  packageCommand = "npx simple-planning",
): string {
  return `# Work On Current Step\n\nUżywaj tej komendy wtedy, gdy użytkownik chce dalej pracować nad aktualnym dokumentem bez przechodzenia do kolejnego kroku workflow.\n\n## Zasady\n- Uruchom \`${packageCommand} work-on-current-step [--feature <slug|id>]\`.\n- Ta komenda ma wznowić tylko \`activeStep\` i nie może samodzielnie przygotować następnego etapu.\n- Jeśli CLI zwróci wybór feature'a, zapytaj użytkownika zamiast zgadywać.\n- Jeśli CLI poinformuje, że nie ma aktywnego kroku, zatrzymaj się i wskaż użytkownikowi \`continue-feature\` albo \`feature-status\`.\n- Użyj tylko \`preparation.targetDocument\`, \`preparation.requiredFiles\` i \`preparation.prompt\` zwróconych przez CLI.\n- Po zaktualizowaniu pliku docelowego zatrzymaj się i oddaj kontrolę użytkownikowi.\n- Nie wywołuj \`preparation.nextCommand\`, chyba że użytkownik wyraźnie poprosi o zamknięcie bieżącego etapu.\n- Nie przechodź dalej tylko dlatego, że dokument jest już otwarty albo użytkownik dopisał nowe informacje.\n`;
}

export function buildFeatureStatusCursorCommandTemplate(
  packageCommand = "npx simple-planning",
): string {
  return `# Feature Status\n\nUżywaj tej komendy, gdy użytkownik chce tylko sprawdzić stan feature'a albo ustalić następny legalny krok.\n\n## Zasady\n- Uruchom \`${packageCommand} status [--feature <slug|id>]\`.\n- Jeśli CLI zwróci wybór feature'a, zapytaj użytkownika zamiast zgadywać.\n- Jeśli CLI zwróci \`nextContext\`, użyj tego tylko do raportowania stanu, a nie do samodzielnego przechodzenia dalej.\n- Ta komenda nie służy do redagowania dokumentów ani do odblokowywania checkpointów.\n`;
}

export function buildBootstrapProjectCursorCommandTemplate(
  packageCommand = "npx simple-planning",
): string {
  return `# Bootstrap Project\n\nUżywaj tej komendy tylko wtedy, gdy użytkownik chce zbootstrapować istniejący projekt w Simple Planning.\n\n## Zasady\n- To nie jest komenda do greenfielda ani do zwykłego nowego feature'a.\n- Najpierw uruchom \`${packageCommand} bootstrap\`.\n- Jeśli CLI zatrzyma się z informacją, że \`product/01-vision.md\` jest puste albo zbyt krótkie, zatrzymaj się i poproś użytkownika o uzupełnienie sensownego seedu vision.\n- Jeśli CLI zwróci bundle dokumentów, redaguj je dokładnie w kolejności podanej w \`documents\`.\n- Używaj tylko \`targetPath\`, \`requiredFiles\` i \`prompt\` zwróconych przez CLI.\n- Po zaktualizowaniu bootstrapowego discovery zatrzymaj się i oddaj kontrolę użytkownikowi.\n- Nie wywołuj \`discoveryPreparation.nextCommand\` tylko dlatego, że bootstrapowe discovery zostało właśnie zredagowane.\n`;
}

export function getFeatureDocumentPaths(featureDir: string): Record<Step, string> {
  const entries = allSteps.map((step) => [
    step,
    path.join(featureDir, stepDefinitions[step].filename),
  ]);

  return Object.fromEntries(entries) as Record<Step, string>;
}
