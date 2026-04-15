# Project Docs Workflow

To repo służy do uporządkowanego rozwijania produktu i funkcjonalności z pomocą AI.
W praktyce te materiały są teraz źródłem dla CLI `simple-planning`, które dostarcza workflow do innych projektów.

Celem nie jest tworzenie „ładnej dokumentacji”, tylko utrzymywanie jednego, spójnego procesu:
- od pomysłu,
- przez doprecyzowanie i decyzje,
- do MVP,
- architektury,
- i listy zadań do wdrożenia.

Dokumenty są podzielone na dwa poziomy:
- `product/` — rzeczy dotyczące całego produktu,
- `features/` — rzeczy dotyczące konkretnej funkcjonalności.

## Użycie przez CLI

W docelowym użyciu agent nie powinien polegać na ręcznym dołączaniu plików.

Zamiast tego:
1. projekt jest inicjalizowany przez `simple-planning init`,
2. istniejący system można zbootstrapować przez `simple-planning bootstrap`,
3. nowy feature powstaje przez `simple-planning start --name ... --description ...`,
4. kolejne etapy są prowadzone przede wszystkim przez `simple-planning continue`, `status` i `run <step>`,
5. po każdym etapie od `discovery` dalej agent ma się zatrzymać i poprosić użytkownika o dalsze instrukcje.

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
2. Utwórz feature przez `simple-planning start --name <feature-name> --description "<opis>"`.
3. Pozwól agentowi wykonać przygotowany przez CLI etap `discovery`.
4. Po redakcji bieżącego etapu zatrzymaj się; samo zredagowanie dokumentu nie powinno automatycznie zamykać kroku.
5. Przechodź do kolejnych etapów dopiero po jawnej decyzji użytkownika.
6. Nie zaczynaj od `05-tech-spec.md`, jeśli nie ma jeszcze sensownego `03-product-spec.md` i `04-mvp.md`.

## Praca z istniejącym projektem

Ten workflow może być używany nie tylko dla nowych funkcjonalności, ale również do uporządkowania już istniejącego projektu.

W takim przypadku nie próbujemy odtwarzać całej historii 1:1.
Stosujemy tryb bootstrap.

### Zasady bootstrapu

Przy zasilaniu istniejącego projektu:
- najpierw seedujemy `product/01-vision.md` ręcznie,
- bootstrap zatrzymuje się, jeśli vision jest zbyt ubogie,
- `simple-planning bootstrap` porządkuje vision, buduje roadmapę i tworzy specjalny feature `bootstrap`,
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