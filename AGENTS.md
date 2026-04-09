# AGENTS.md

## Cel repo

To repo służy do prowadzenia uporządkowanego workflow dokumentacyjnego dla produktu i funkcjonalności.

AI ma pomagać w:
- doprecyzowaniu pomysłów,
- redakcji dokumentów,
- utrzymaniu spójności między plikami,
- pilnowaniu zakresu,
- przygotowaniu materiału do implementacji.

AI nie ma:
- wymyślać produktu od zera bez podstaw,
- omijać kolejności etapów,
- rozszerzać MVP bez wyraźnej decyzji,
- mieszać poziomu produktu, funkcjonalności i implementacji.

## Zasady globalne

- Pisz krótko i konkretnie.
- Nie lej wody.
- Nie używaj stylu marketingowego.
- Nie dodawaj nowych funkcji poza materiałem wejściowym.
- Jeśli brakuje wymaganego pliku wejściowego, zatrzymaj się.
- Jeśli dokument dotyczy istniejącej funkcjonalności, uwzględnij aktualny kod i obecne zachowanie systemu.
- Jeśli dokument dotyczy nowej funkcjonalności, pracuj tylko na dostarczonych materiałach wejściowych.
- Oddzielaj produkt od techniki.
- Oddzielaj pełny zakres od MVP.
- Luźne pomysły trafiają do `08-parking-lot.md`, nie do dokumentów źródłowych.

## Tryby pracy

### 1. Greenfield
Używaj tego trybu, gdy funkcjonalność jest nowa i nie ma jeszcze implementacji.

W tym trybie:
- opieraj się na dokumentach wejściowych,
- nie zakładaj istnienia kodu,
- nie wymyślaj integracji, których nie potwierdzono.

### 2. Existing system
Używaj tego trybu, gdy funkcjonalność już istnieje albo rozwija istniejący moduł.

W tym trybie:
- uwzględnij aktualny kod,
- uwzględnij istniejące zachowanie,
- dopasuj propozycje do obecnej architektury,
- jeśli proponujesz zmianę architektury, zaznacz to wprost jako zmianę.

## Bootstrap istniejącego projektu

Jeśli repo lub funkcjonalność już istnieje, nie próbuj rekonstruować pełnej historii decyzji.

Zastosuj tryb bootstrap:
- opisz aktualny stan produktu i funkcjonalności,
- uzupełnij dokumenty retroaktywnie na podstawie kodu, istniejącej dokumentacji i wiedzy właściciela projektu,
- traktuj `01-idea.md` jako opis intencji lub celu istniejącej funkcjonalności,
- traktuj `03-product-spec.md` jako opis aktualnego lub docelowego zachowania,
- traktuj `04-mvp.md` jako określenie tego, co jeszcze realnie trzeba dowieźć lub uprościć,
- zapisuj istotne ustalenia w `07-decision-log.md`,
- luki, pomysły i rzeczy poza zakresem odkładaj do `08-parking-lot.md`.

Nie udawaj, że istniejący system zaczyna się od zera.

## Kolejność pracy

Dla feature'ów obowiązuje kolejność:
1. `01-idea.md`
2. `02-discovery.md`
3. `03-product-spec.md`
4. `04-mvp.md`
5. `05-tech-spec.md`
6. `06-tasks.md`

`07-decision-log.md` i `08-parking-lot.md` są aktualizowane równolegle.

Dla dokumentów produktowych obowiązuje kolejność:
1. `product/01-vision.md`
2. `product/02-roadmap.md`

## Zależności wejściowe

- `02-discovery.md` wymaga `01-idea.md`
- `03-product-spec.md` wymaga `01-idea.md` i `02-discovery.md`
- `04-mvp.md` wymaga `03-product-spec.md`
- `05-tech-spec.md` wymaga `03-product-spec.md` i `04-mvp.md`
- `06-tasks.md` wymaga `04-mvp.md` i `05-tech-spec.md`
- `product/02-roadmap.md` wymaga `product/01-vision.md`

Jeżeli wymagany plik nie istnieje, nie twórz kolejnego dokumentu.

## Mapa promptów

Używaj następujących promptów:
- `prompts/discovery-prompt.md` -> `02-discovery.md`
- `prompts/product-spec-prompt.md` -> `03-product-spec.md`
- `prompts/mvp-prompt.md` -> `04-mvp.md`
- `prompts/tech-spec-prompt.md` -> `05-tech-spec.md`
- `prompts/tasks-prompt.md` -> `06-tasks.md`
- `prompts/decision-log-prompt.md` -> `07-decision-log.md`
- `prompts/parking-lot-prompt.md` -> `08-parking-lot.md`
- `prompts/vision-prompt.md` -> `product/01-vision.md`
- `prompts/roadmap-prompt.md` -> `product/02-roadmap.md`

## Źródła prawdy

W folderze feature'a:
- `03-product-spec.md` = źródło prawdy o zachowaniu,
- `04-mvp.md` = źródło prawdy o zakresie,
- `05-tech-spec.md` = źródło prawdy o implementacji,
- `06-tasks.md` = źródło prawdy o pracy do wykonania.

W folderze produktu:
- `product/01-vision.md` = źródło prawdy o kierunku,
- `product/02-roadmap.md` = źródło prawdy o priorytetach.

## Rozstrzyganie niespójności

Jeśli dokumenty są niespójne:
1. popraw bardziej źródłowy dokument,
2. dopasuj dokumenty pochodne,
3. zapisz ważną zmianę w `07-decision-log.md`, jeśli dotyczy feature'a.

## Styl odpowiedzi

Każdy dokument ma być:
- krótki,
- konkretny,
- łatwy do skanowania,
- bez powtórzeń,
- bez ogólników.

Jeśli czegoś nie da się ustalić, zapisz to jako brak, ryzyko albo otwarte pytanie.
Nie zgaduj.