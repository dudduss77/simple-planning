# AGENTS.md

## Cel repo

To repo służy do prowadzenia uporządkowanego workflow dokumentacyjnego produktu i funkcjonalności z pomocą AI.

Celem repo nie jest luźne brainstormowanie ani przypadkowa implementacja.
Celem repo jest doprowadzenie pomysłu lub istniejącej funkcjonalności do stanu, w którym wiadomo:
- co budujemy,
- po co to budujemy,
- co jest MVP,
- jak to wdrożyć,
- jakie zadania trzeba wykonać.

## Struktura repo

Repo zawiera trzy główne obszary:
- `product/` — dokumenty dotyczące całego produktu,
- `features/` — dokumenty dotyczące pojedynczych funkcjonalności,
- `.cursor/commands/bootstrap-project.md`, `.cursor/commands/start-feature.md`, `.cursor/commands/continue-feature.md`, `.cursor/commands/feature-status.md` — główne komendy wejściowe do pracy z CLI,
- `.simple-planning/commands/` — lokalne prompty etapów używane przez zainstalowany workflow,
- `commands/` — źródłowe reguły etapów i promptów bootstrapowych używane przez pakiet `simple-planning`.

## Rola AI

AI ma:
- porządkować informacje,
- redagować dokumenty,
- utrzymywać spójność między plikami,
- pilnować granic między produktem, zakresem, MVP i techniką,
- przygotowywać materiał do implementacji.

AI nie ma:
- wymyślać produktu od zera bez materiału wejściowego,
- rozszerzać zakresu bez wyraźnej decyzji,
- zgadywać brakujących faktów,
- mieszać dokumentów produktowych z technicznymi,
- implementować kodu, jeśli uruchomiona komenda dotyczy etapu dokumentacyjnego.

## Zasady ogólne

Każdy dokument powinien być:
- krótki,
- konkretny,
- łatwy do skanowania,
- spójny z wcześniejszymi dokumentami,
- pozbawiony marketingu i lania wody.

Jeśli czegoś nie da się pewnie ustalić:
- oznacz to jako brak,
- oznacz to jako ryzyko,
- oznacz to jako otwarte pytanie,
- albo zatrzymaj pracę zgodnie z uruchomioną komendą.

Nowe pomysły poza bieżącym zakresem odkładaj do `08-parking-lot.md`.
Istotne decyzje zapisuj do `07-decision-log.md`.

## Priorytet źródeł

Przy pracy nad dokumentami obowiązuje następujący priorytet:
1. Jawne ustalenia właściciela projektu.
2. Bardziej źródłowe dokumenty z repo.
3. Istniejący kod i aktualne zachowanie systemu.
4. Materiały pomocnicze i wcześniejsze notatki.

Jeśli źródła są niespójne:
- popraw bardziej źródłowy dokument,
- dopasuj dokumenty pochodne,
- zapisz ważną zmianę w `07-decision-log.md`, jeśli to rzeczywista decyzja.

## Źródła prawdy

W folderze `product/`:
- `01-vision.md` — źródło prawdy o kierunku produktu,
- `02-roadmap.md` — źródło prawdy o priorytetach produktu.

W folderze feature'a:
- `03-product-spec.md` — źródło prawdy o zachowaniu funkcjonalności,
- `04-mvp.md` — źródło prawdy o bieżącym zakresie,
- `05-tech-spec.md` — źródło prawdy o implementacji,
- `06-tasks.md` — źródło prawdy o pracy do wykonania.

`01-idea.md` i `02-discovery.md` są dokumentami wejściowymi do analizy, a nie finalnym kontraktem.

## Rozstrzyganie problemów

Jeśli problem dotyczy zachowania funkcjonalności, popraw `03-product-spec.md`.
Jeśli problem dotyczy zakresu, popraw `04-mvp.md`.
Jeśli problem dotyczy implementacji, popraw `05-tech-spec.md`.
Jeśli problem dotyczy planu pracy, popraw `06-tasks.md`.

Jeśli problem dotyczy kierunku produktu, popraw `product/01-vision.md`.
Jeśli problem dotyczy priorytetów produktu, popraw `product/02-roadmap.md`.

Nie tuszuj sprzeczności przez dopisywanie obejść w kilku miejscach.

## Tryb pracy

Domyślnym sposobem pracy w tym repo są celowane komendy Cursor i CLI `simple-planning`.

Agent ma zaczynać od odpowiedniej, wąskiej komendy wejściowej:
- bootstrap istniejącego projektu -> `.cursor/commands/bootstrap-project.md`,
- nowy feature -> `.cursor/commands/start-feature.md`,
- zamknięcie lifecycle feature'a -> `.cursor/commands/close-feature.md`,
- dalsza redakcja bieżącego dokumentu -> `.cursor/commands/work-on-current-step.md`,
- kontynuacja -> `.cursor/commands/continue-feature.md`,
- sam status -> `.cursor/commands/feature-status.md`.
Agent ma wykonywać tylko zakres wynikający z uruchomionej komendy i odpowiedzi CLI.
`start-feature` ma tylko przygotować pierwszy etap i zostawić go otwartego.
`work-on-current-step` ma tylko redagować aktualny dokument i nie może sam domykać etapu bez jawnej prośby użytkownika.
`continue-feature` może domknąć wznowiony aktywny etap, ale jeśli po checkpointcie dopiero przygotowuje kolejny etap, ma go zostawić otwartego.
`bootstrap-project` podlega tej samej zasadzie: bootstrapowe `discovery` po redakcji ma pozostać otwarte, dopóki użytkownik jawnie nie zdecyduje o dalszym kroku.
Agent nie ma sam przechodzić do kolejnych etapów bez jawnego użycia komendy kontynuacji.
Agent nie ma sam zamykać feature'a jako efektu ubocznego redakcji dokumentu; zamknięcie wymaga jawnej komendy.
Agent nie ma aktualizować innych dokumentów niż te wymagane przez bieżące polecenie, chyba że użytkownik wyraźnie o to poprosi, np. dla `07-decision-log.md` lub `08-parking-lot.md`.

## Bootstrap istniejącego systemu

Jeśli funkcjonalność już istnieje, nie rekonstruuj sztucznie pełnej historii decyzji.

W takim przypadku:
- traktuj `product/01-vision.md` jako seed od człowieka, a nie materiał do wymyślania od zera,
- jeśli bootstrap CLI zgłasza zbyt słabe vision, zatrzymaj się i poproś użytkownika o mocniejszy input,
- opisz aktualny stan na podstawie kodu, dokumentów i wiedzy właściciela projektu,
- odróżniaj stan obecny od docelowego, jeśli to potrzebne,
- nie udawaj greenfielda, jeśli system już działa.

## Format

Jeśli repo używa standardowego nagłówka, dokument powinien zaczynać się od:

```md
Status: draft
Owner: Rafał
Last updated: YYYY-MM-DD
```