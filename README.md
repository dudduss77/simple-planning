# Project Docs Workflow

To repo służy do uporządkowanego rozwijania produktu i funkcjonalności z pomocą AI.
Jest też źródłem pakietu CLI `simple-planning`, który przenosi ten workflow do innych projektów bez ręcznego kopiowania folderów.

Celem nie jest tworzenie „ładnej dokumentacji”, tylko utrzymywanie jednego, spójnego procesu:
- od pomysłu,
- przez doprecyzowanie i decyzje,
- do MVP,
- architektury,
- i listy zadań do wdrożenia.

Dokumenty są podzielone na dwa poziomy:
- `product/` — rzeczy dotyczące całego produktu,
- `features/` — rzeczy dotyczące konkretnej funkcjonalności.

## Simple Planning CLI

### Instalacja

Pakiet przeznaczony jest do użycia jako zależność narzędziowa w projekcie docelowym (**Node.js 20+**, patrz `engines` w `package.json`).

```bash
pnpm add -D simple-planning
```

```bash
npm install --save-dev simple-planning
```

Inicjalizacja workflow w bieżącym repozytorium:

```bash
npx simple-planning init
```

Kod jest na licencji **MIT** (`LICENSE`). Zgłoszenia usterek: przez pole `bugs` / Issues w repozytorium z `package.json`.

### Rozwój źródeł CLI (ten repo)

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
```

Przed publikacją warto sprawdzić paczkę: `npm publish --dry-run` (przed pakowaniem uruchomi się skrypt `prepack` → budowa `dist/`).

Docelowy sposób użycia workflow to CLI:

1. Zainstaluj pakiet w projekcie (jak wyżej).
2. Uruchom `simple-planning init`.
3. Używaj małych komend Cursor: `.cursor/commands/bootstrap-project.md`, `.cursor/commands/start-feature.md`, `.cursor/commands/close-feature.md`, `.cursor/commands/work-on-current-step.md`, `.cursor/commands/continue-feature.md` i `.cursor/commands/feature-status.md`.
4. Pozwól agentowi sterować kolejnymi etapami przez `simple-planning bootstrap`, `start`, `close-feature`, `work-on-current-step`, `continue`, `status`, `idea`, `next`, `list` i `run`.
5. CLI zwraca też pełny prompt tekstowy dla etapu oraz referencję, np. `@.simple-planning/commands/Discovery.md`, żeby agent nie musiał dodatkowo czytać pliku, ale użytkownik nadal widział źródło instrukcji.
6. Po ukończeniu głównego etapu `tasks` kolejne kroki to `decision-log` i `parking-lot`; `continue` przygotuje `07` i `08` po kolei (jeden plik na jedno wywołanie), chyba że użyjesz jawnego `run decision-log` / `run parking-lot`.

W repo źródłowym folder `commands/` jest źródłem promptów używanych przez CLI, w tym promptów bootstrapowych `Vision.md` i `Roadmap.md`. Po `simple-planning init` projekt dostaje własny folder `.simple-planning/commands/`, więc lokalne zmiany promptów są respektowane i nie są hardcoded w kodzie.

## Struktura repo

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

## Główne zasady

### 1. Jeden plik = jeden cel
Każdy plik ma jedno konkretne zadanie.
Nie mieszaj poziomów.

Przykład:
- `03-product-spec.md` opisuje **co** ma działać,
- `05-tech-spec.md` opisuje **jak** to zostanie zrobione,
- `06-tasks.md` opisuje **co trzeba wykonać**.

### 2. Najpierw produkt, potem technika
Nie wchodź w architekturę, dopóki nie jest ustalone:
- co budujemy,
- po co to budujemy,
- dla kogo to jest,
- co jest MVP,
- co jest poza zakresem.

### 3. Jeden aktualny stan dokumentu
Nie twórz plików typu:
- `mvp-v2.md`,
- `mvp-final.md`,
- `mvp-final-final.md`.

Każdy plik ma jedną aktualną wersję.
Historia zmian powinna być trzymana w Git.
Ważne decyzje dopisuj do `07-decision-log.md`.

### 4. Nowe pomysły nie rozwalają ustaleń
Jeżeli podczas pracy pojawi się nowy pomysł:
- nie dopisuj go od razu do `product-spec`,
- nie rozszerzaj MVP w locie,
- wrzuć go do `08-parking-lot.md`,
- wróć do niego później świadomie.

### 5. Dokumenty mają być krótkie i konkretne
Każdy dokument powinien być:
- czytelny,
- skanowalny,
- bez lania wody,
- bez marketingowego stylu,
- bez powtarzania tych samych rzeczy w kilku miejscach.

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

## Jak pracować z AI

AI ma pomagać porządkować i doprecyzowywać dokumenty, a nie wymyślać całego produktu od nowa.

### Dobre zasady pracy z AI
- dawaj modelowi tylko pliki potrzebne do danego etapu,
- pracuj etapami, nie wszystkim naraz,
- każ modelowi najpierw zadawać pytania, potem redagować,
- każ rozdzielać:
  - fakty,
  - założenia,
  - decyzje,
  - ryzyka,
  - otwarte pytania,
- pilnuj, żeby model nie dodawał nowych funkcji poza zakresem.

### Zła praktyka
Nie wrzucaj do jednego promptu:
- całego projektu,
- historii rozmów,
- pełnego kodu,
- pomysłu,
- architektury,
- tasków,
- i prośby „zrób wszystko”.

To prawie zawsze kończy się chaosem.

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