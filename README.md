# Project Docs Workflow

> **To jest eksperyment na prywatne potrzeby** — nie obiecuję stabilnego API ani długiego wsparcia. Kod jest na **MIT** (`LICENSE`); jeśli forma Ci pasuje, możesz forkować i prowadzić własną wersję. Zgłoszenia usterek: pole `bugs` / Issues repozytorium z `package.json`. Projekt powstał pod CursorAI i jest oparty o commands. Ma on na celu zorganizowanie pracy nad daną funkcjonalnością. Aktualne testy na prostym projekcie dały wymierne rezultaty, w wiekszych projektach nie testowano. Projekt stworzony przy wykorzystaniu AI.

**simple-planning** to małe CLI które **inicjalizuje szkielet planistyczny** w Twoim repozytorium (`product/`, `features/` pod `.simple-planning/planning/`) i **krok po kroku przygotowuje kolejne dokumenty** (discovery, MVP, tasks itd.), tak żeby praca z modelem AI była na stałych plikach zamiast na rozproszonych notatkach.

## Szybki start

Zależność deweloperska (zalecane — stała wersja w projekcie):

Aby nie zaśmiecać npmjs, aktualnie instalacja po przez komendę

```bash
pnpm add -D -w github:dudduss77/simple-planning#tag_wersji
```

Następnie inicjowanie simple-planning w projekcie
```bash
pnpm simple-planning init
```

## Przykładowy flow (jeden konkretny przebieg)

1. W katalogu repozytorium: `**pnpm simple-planning init**` — powstaje m.in. `.simple-planning/planning/` (dokumenty), `.simple-planning/commands/` (prompty dla CLI), `**.cursor/commands/**` (skróty pod Cursor).
2. Ustal kontekst produktu (wizja, roadmapę): `**pnpm simple-planning bootstrap**` — CLI przygotuje kolejne pliki i podpowie, co otworzyć w edytorze.
3. Nowa funkcjonalność: `**pnpm simple-planning start nazwa-feature**` — zakłada feature i od razu przygotowuje etap discovery.
4. Dalej bez uruchamiania „wszystkiego naraz”: `**pnpm simple-planning work-on-current-step**` lub `**pnpm simple-planning continue**` — przejście przez checkpointy kolejnych dokumentów (`status`, `next`, `list` pomagają orientacji).

Szczegóły etapów i dobrych praktyk z AI są niżej w tym pliku („Kolejność pracy”, „Jak pracować z AI”).

### Rozwój źródeł CLI (ten repo)

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
```

Przed publikacją warto sprawdzić paczkę: `npm publish --dry-run` (przed pakowaniem uruchomi się skrypt `prepack` → budowa `dist/`).

## Struktura repo

Poniżej — układ **względem katalogu planistycznego** (po `simple-planning init` leży on pod `.simple-planning/planning/`).

```text
product/
  01-vision.md
  02-roadmap.md

features/
  <feature-name>/
    01-idea.md
    02-discovery.md
    03-product-spec.md
    04-mvp.md
    05-tech-spec.md
    06-tasks.md
    07-decision-log.md
    08-parking-lot.md
```

## Po co istnieje ten system

Ten układ ma rozwiązać kilka typowych problemów:

- mieszanie pomysłu, analizy, architektury i tasków w jednym miejscu,
- gubienie ustaleń po długich rozmowach z AI,
- dokładanie nowych pomysłów w trakcie implementacji,
- brak jasnej granicy między pełnym rozwiązaniem a MVP,
- brak stabilnego formatu, przez co AI za każdym razem pracuje inaczej.

## Kolejność pracy nad funkcjonalnością

Każda funkcjonalność przechodzi przez ten sam pipeline:

1. `01-idea.md`
  Surowy pomysł, potrzeba, intuicja, luźne założenia.
2. `02-discovery.md`
  Pytania, luki, ryzyka, alternatywy, doprecyzowanie.
3. `03-product-spec.md`
  Pełny opis funkcjonalności na poziomie produktu.
4. `04-mvp.md`
  Wycięcie minimalnego zakresu dającego realną wartość.
5. `05-tech-spec.md`
  Decyzje techniczne potrzebne do zbudowania MVP.
6. `06-tasks.md`
  Konkretne zadania implementacyjne.
7. `07-decision-log.md`
  Najważniejsze decyzje i ich uzasadnienie.
8. `08-parking-lot.md`
  Pomysły odłożone poza bieżący zakres.

## Co gdzie trafia

### `product/`

Tutaj trafiają rzeczy wspólne dla całego produktu:

- kierunek,
- cele,
- obszary rozwoju,
- priorytety wysokiego poziomu.

### `features/`

Tutaj trafiają rzeczy specyficzne dla konkretnej funkcjonalności:

- pomysł,
- analiza,
- zakres,
- MVP,
- technika,
- taski,
- decyzje.

## Źródła prawdy

W tym repo obowiązuje prosty model:

- `product/` = źródło prawdy o kierunku produktu,
- `features/<feature>/03-product-spec.md` = źródło prawdy o zachowaniu funkcjonalności,
- `features/<feature>/04-mvp.md` = źródło prawdy o bieżącym zakresie,
- `features/<feature>/05-tech-spec.md` = źródło prawdy o implementacji,
- `features/<feature>/06-tasks.md` = źródło prawdy o pracy do wykonania.

Jeżeli coś nie zgadza się między plikami, popraw dokument bardziej „źródłowy”, a nie przypadkowy plik poboczny.

## Styl dokumentów

Każdy dokument powinien:

- używać prostego języka,
- mieć krótkie sekcje,
- jasno oddzielać decyzje od pomysłów,
- zawierać tylko informacje potrzebne na danym etapie.

Preferowany styl:

- krótkie akapity,
- listy punktowane,
- nagłówki opisowe,
- konkret zamiast ogólników.

## Czego nie robić

- Nie mieszaj produktu z architekturą.
- Nie opisuj bazy danych w `idea.md`.
- Nie zapisuj luźnych pomysłów w `tasks.md`.
- Nie rozszerzaj MVP bez świadomej decyzji.
- Nie powielaj tej samej treści w kilku plikach.
- Nie twórz alternatywnych wersji tych samych dokumentów bez potrzeby.

## Jak zacząć nową funkcjonalność

1. Uruchom `simple-planning init`.
2. Utwórz nowy feature przez `simple-planning start --name <feature-name> --description "<opis>"`.
3. Pozwól agentowi zredagować przygotowany przez CLI etap `discovery`.
4. Po redakcji bieżącego etapu zatrzymaj się; samo zredagowanie dokumentu nie powinno automatycznie zamykać kroku.
5. Po każdym etapie od `discovery` dalej zatrzymaj się, przejrzyj dokument i dopiero wtedy każ agentowi iść dalej.
6. Nie przechodź do `05-tech-spec`, jeśli nie ma jeszcze sensownego `03-product-spec.md` i `04-mvp.md`.

## Jak zacząć nową funkcjonalność, wykorzystując CursorAI

1. W trybie agent użyj komendy `/start-feature` i opisz, co chcesz zrobić.
2. Agent sam utworzy feature oraz pliki `idea.md` i `discovery.md`.
3. Przeczytaj `discovery.md`.
  a. Jeśli wszystko się zgadza, kontynuuj pracę przez komendę `/continue-feature`.
  b. Jeśli chcesz odpowiedzieć na pytanie, coś dodać lub usunąć, użyj komendy `/work-on-current-step`.
4. Kontynuuj pracę nad kolejnymi etapami.
5. Jeśli wszystkie pliki zostały zaakceptowane, wykonaj `tasks.md`.
6. Zakończ daną funkcjonalność przez komendę `/close-feature`.

## Praca z istniejącym projektem

Ten workflow może być używany nie tylko dla nowych funkcjonalności, ale również do uporządkowania już istniejącego projektu.

W takim przypadku nie próbujemy odtwarzać całej historii 1:1.
Stosujemy tryb bootstrap.

### Zasady bootstrapu

Przy zasilaniu istniejącego projektu:

- najpierw człowiek seeduje `product/01-vision.md`,
- `simple-planning bootstrap` zatrzymuje się, jeśli `01-vision.md` nie ma jeszcze sensownego materiału wejściowego,
- bootstrap porządkuje `01-vision.md`, tworzy `02-roadmap.md` oraz specjalny feature `features/bootstrap/`,
- po redakcji bootstrapowego `discovery` agent ma się zatrzymać, a nie domykać ten etap automatycznie,
- opisujemy aktualny stan zamiast rekonstruować pełną historię,
- opieramy się na kodzie, istniejącej dokumentacji i wiedzy właściciela projektu,
- możemy tworzyć `01-idea.md` retroaktywnie jako opis celu lub intencji istniejącej funkcjonalności,
- `03-product-spec.md` może opisywać obecne zachowanie, zachowanie docelowe albo różnicę między nimi,
- `04-mvp.md` może służyć do określenia minimalnego zakresu dalszych prac,
- `05-tech-spec.md` musi uwzględniać aktualną architekturę i istniejący kod,
- ważne ustalenia zapisujemy w `07-decision-log.md`,
- rzeczy poza bieżącym zakresem odkładamy do `08-parking-lot.md`.

### Kiedy używać kodu jako źródła

Jeżeli funkcjonalność już istnieje albo rozwija istniejący moduł:

- kod jest jednym ze źródeł prawdy o obecnym stanie,
- dokumenty powinny być dopasowane do realnego systemu,
- AI nie powinno proponować rozwiązania od zera bez odniesienia do obecnej implementacji.

### Cel bootstrapu

Celem bootstrapu nie jest idealne opisanie przeszłości.
Celem bootstrapu jest doprowadzenie repo do stanu, w którym:

- wiadomo co już istnieje,
- wiadomo jak to działa,
- wiadomo czego brakuje,
- wiadomo jak dalej rozwijać projekt w uporządkowany sposób.
- a specjalny feature `bootstrap` kończy pierwszy przebieg na przygotowaniu `02-discovery.md`, po czym dalsza praca wraca do zwykłego `work-on-current-step` albo `continue-feature`.

## Status dokumentów

Dobrą praktyką jest dodanie na początku każdego pliku krótkiego statusu, np.:

- `draft`
- `in-progress`
- `review`
- `approved`
- `obsolete`

Przykład:

```md
Status: draft
Owner: Rafał
Last updated: 2026-04-08
```

## Cel końcowy

Celem tego repo jest doprowadzenie każdej funkcjonalności do stanu, w którym:

- wiadomo po co istnieje,
- wiadomo jak ma działać,
- wiadomo co wchodzi do MVP,
- wiadomo jak to zbudować,
- wiadomo co dokładnie trzeba zrobić.

Feature może też zostać jawnie zamknięty w CLI, jeśli temat został świadomie zakończony albo odrzucony. Zamknięcie lifecycle nie zastępuje wpisu w `07-decision-log.md`, jeśli decyzja ma znaczenie historyczne.