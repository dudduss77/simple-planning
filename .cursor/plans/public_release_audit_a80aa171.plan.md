---
name: public release audit
overview: Doprowadzenie repo do stanu bezpiecznej i profesjonalnej publikacji na publicznym GitHubie oraz npm poprzez usunięcie blockerów release, dopracowanie dokumentacji i domknięcie najważniejszych ryzyk jakościowych w CLI.
todos:
  - id: release-blockers
    content: "Usunąć blockery publikacji: LICENSE, package metadata, lifecycle build przy publish, minimalne CI."
    status: completed
  - id: fix-next-selection
    content: Naprawić błąd logiczny w `next` i dodać test regresyjny dla wieloznacznego wyboru feature'a.
    status: completed
  - id: harden-state
    content: Utwardzić odczyt i walidację plików stanu oraz sanity-check ścieżek w workflow state.
    status: completed
  - id: public-docs
    content: Przerobić README pod publiczny odbiór i dodać dokumenty repo hygiene (`SECURITY.md`, `CHANGELOG.md`, opcjonalnie `CONTRIBUTING.md`).
    status: pending
  - id: release-confidence
    content: Rozszerzyć smoke testy o `next`, `idea` i podstawowe ścieżki CLI oraz przygotować checklistę release.
    status: pending
isProject: false
---

# Public Release Readiness Plan

## Najważniejsze wnioski z audytu

Repo jest blisko używalnego CLI, ale jeszcze nie jest w pełni „public-ready”. Największe ryzyka przed publikacją to:
- brak podstawowych elementów publicznego repo i paczki: `LICENSE`, workflow CI, `SECURITY.md`, `CHANGELOG.md`, oraz metadanych npm w [package.json](package.json),
- brak gwarancji poprawnego artefaktu przy publikacji: `bin` wskazuje na `dist`, ale `dist/` jest ignorowany w [.gitignore](.gitignore), a w [package.json](package.json) nie ma `prepack` / `prepublishOnly`,
- konkretny błąd logiczny w wyborze feature'a dla `next` między [src/commands/next.ts](src/commands/next.ts) i [src/lib/state.ts](src/lib/state.ts),
- nierówne pokrycie testami i brak CI dla komend publicznego API CLI, szczególnie `next` i `idea`,
- README jest merytoryczne, ale słabiej sprzedaje i wyjaśnia pakiet npm na pierwszy kontakt.

## Priorytet 1: Zablokować wtopy przy publikacji

- Uzupełnić legal i package metadata:
  - dodać `LICENSE` zgodny z deklaracją `MIT` z [package.json](package.json),
  - dodać w [package.json](package.json) co najmniej `repository`, `homepage`, `bugs`, opcjonalnie `author`.
- Ustabilizować proces publikacji npm:
  - dodać lifecycle build (`prepack` albo `prepublishOnly`) w [package.json](package.json),
  - sprawdzić tarball przez `npm publish --dry-run`,
  - upewnić się, że `files` naprawdę zawiera wszystko, czego potrzebuje CLI: `dist`, `commands`, `planning`, `.cursor`, `README.md`.
- Dodać minimalne CI w `.github/workflows/`:
  - instalacja zależności,
  - `build`,
  - `check`,
  - testy smoke.

## Priorytet 2: Naprawić realne ryzyka jakościowe w kodzie

- Naprawić niespójność `next`:
  - [src/commands/next.ts](src/commands/next.ts) używa `resolveFeatureSelection`,
  - [src/lib/state.ts](src/lib/state.ts) w `loadFeatureState()` ponownie rozstrzyga wybór przez `resolveAnyFeatureSelection`, co może zwrócić `ambiguous` mimo wcześniejszego poprawnego wyboru.
- Utwardzić obsługę stanu workflow:
  - ograniczyć zaufanie do JSON-ów w [src/lib/fs-utils.ts](src/lib/fs-utils.ts) i [src/lib/state.ts](src/lib/state.ts),
  - dodać walidację runtime albo przynajmniej czytelne błędy dla uszkodzonego stanu,
  - rozważyć sanity-check ścieżek zapisanych w stanie (`slug`, `documents[*].path`).
- Uporządkować kontrakt CLI:
  - albo ustabilizować strukturę `data` w [src/lib/contracts.ts](src/lib/contracts.ts),
  - albo jasno opisać, które pola wyniku JSON są publicznym kontraktem dla automatyzacji.

## Priorytet 3: Podnieść odbiór publicznego repo

- Przebudować początek [README.md](README.md):
  - krótki opis narzędzia,
  - szybki start (`npm` / `pnpm` / `npx`),
  - 1 konkretny flow użycia,
  - wyjaśnienie po co paczka publikuje także `.cursor` i `planning`.
- Dodać dokumenty repo hygiene:
  - `SECURITY.md`,
  - `CHANGELOG.md`,
  - opcjonalnie `CONTRIBUTING.md`.
- Zdecydować świadomie o języku:
  - polski można zostawić,
  - ale warto dodać choć krótki angielski opis projektu w README, jeśli celem jest szerszy odbiór npm/GitHub.

## Priorytet 4: Domknąć testy i release confidence

- Rozszerzyć [test/cli-smoke.test.mjs](test/cli-smoke.test.mjs) o:
  - `next`, zwłaszcza przypadek z wieloma aktywnymi feature'ami i jednym checkpointem,
  - `idea`,
  - ścieżki `help` / nieznana komenda.
- Rozważyć rozbicie dużego pliku smoke testów na bardziej czytelne sekcje, jeśli zakres będzie dalej rósł.
- Dodać checklistę release:
  - build,
  - test,
  - `npm publish --dry-run`,
  - weryfikacja wygenerowanego tarballa,
  - publikacja właściwa.

## Weryfikacja z Context7

Dokumentacja npm potwierdza, że:
- `npm publish` uruchamia lifecycle m.in. `prepublishOnly`, `prepack`, `prepare`,
- `README` i `LICENSE` są zawsze dołączane do paczki,
- `files` kontroluje zawartość tarballa,
- `repository`, `bugs`, `homepage` są standardowymi polami `package.json` poprawiającymi użyteczność paczki.

## Uwaga o nazwie paczki

Szybkie sprawdzenie publiczne nie znalazło istniejącej strony `https://www.npmjs.com/package/simple-planning` (404), więc nazwa wygląda obiecująco, ale przed publikacją i tak warto potwierdzić ją bezpośrednio przez npm registry w finalnym kroku release.