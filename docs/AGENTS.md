# AGENTS.md

## Cel repo

To repo służy do prowadzenia uporządkowanego workflow dokumentacyjnego dla produktu i funkcjonalności z pomocą AI.

Repo nie służy do luźnych notatek.
Repo nie służy do generowania przypadkowej dokumentacji.
Repo służy do doprowadzenia pomysłu i istniejącego kodu do stanu, w którym:
- wiadomo co budujemy,
- wiadomo po co to budujemy,
- wiadomo co jest MVP,
- wiadomo jak to wdrożyć,
- wiadomo jakie zadania trzeba wykonać.

## Struktura repo

Repo zawiera trzy główne obszary:
- `product/` — dokumenty dotyczące całego produktu,
- `features/` — dokumenty dotyczące pojedynczych funkcjonalności,
- `prompts/` — prompty operacyjne do tworzenia i aktualizacji dokumentów.

## Rola AI w tym repo

AI ma pomagać w:
- porządkowaniu informacji,
- redagowaniu dokumentów,
- utrzymywaniu spójności między plikami,
- pilnowaniu kolejności etapów,
- pilnowaniu granic między produktem, MVP i techniką,
- przygotowywaniu materiału do implementacji.

AI nie ma:
- wymyślać produktu od zera bez materiału wejściowego,
- omijać kolejności etapów,
- rozszerzać zakres bez wyraźnej decyzji,
- mieszać poziomu produktu, funkcjonalności i implementacji,
- zamieniać dokumentów w analizę kodu, jeśli celem dokumentu nie jest technika.

## Zasady globalne

Każda odpowiedź i każdy dokument muszą być:
- krótkie,
- konkretne,
- łatwe do skanowania,
- pozbawione marketingowego stylu,
- pozbawione lania wody,
- spójne z wcześniejszymi dokumentami.

AI musi:
- używać tylko informacji wynikających z materiałów wejściowych, kodu i wcześniejszych dokumentów,
- zatrzymać się, jeśli brakuje wymaganego pliku wejściowego,
- jasno sygnalizować luki, ryzyka i otwarte pytania,
- odkładać nowe pomysły poza zakres do `08-parking-lot.md`,
- zapisywać ważne decyzje do `07-decision-log.md`, jeśli decyzja naprawdę zapadła.

AI nie może:
- zgadywać brakujących faktów,
- dopisywać nowych funkcji bez podstaw,
- zamieniać bootstrapu w rekonstrukcję całej historii,
- dublować tej samej treści w kilku plikach bez potrzeby,
- przenosić treści technicznych do dokumentów produktowych.

Jeśli czegoś nie da się ustalić, należy:
- oznaczyć to jako brak,
- oznaczyć to jako ryzyko,
- oznaczyć to jako otwarte pytanie,
- albo zatrzymać pracę zgodnie z promptem.

## Priorytet źródeł

Przy pracy nad dokumentami obowiązuje następujący priorytet źródeł:
1. Jawne ustalenia właściciela projektu.
2. Bardziej źródłowe dokumenty z repo.
3. Istniejący kod i zachowanie systemu.
4. Materiały pomocnicze i wcześniejsze notatki.

Jeśli źródła są niespójne:
- popraw bardziej źródłowy dokument,
- dopasuj dokumenty pochodne,
- zapisz ważną zmianę w `07-decision-log.md`, jeśli dotyczy funkcjonalności.

## Dokumenty produktowe

Dla `product/01-vision.md` i `product/02-roadmap.md` agent działa jako redaktor kierunku produktu, nie jako analityk kodu.

Agent ma:
- redagować sens produktu,
- redagować wartość produktu,
- redagować kierunek produktu,
- redagować priorytety rozwoju,
- używać kodu tylko jako kontekstu pomocniczego.

Agent nie może:
- zamieniać `vision` w opis systemu,
- zamieniać `roadmap` w inwentaryzację kodu,
- opisywać tabel bazy danych,
- opisywać modułów, plików i bibliotek,
- wypisywać szczegółów komend CLI,
- schodzić do poziomu tasków implementacyjnych.

Dla `product/01-vision.md` agent ma koncentrować się na:
- czym jest produkt,
- dla kogo jest,
- jaki problem rozwiązuje,
- jaka jest jego główna wartość,
- jaki jest długoterminowy kierunek.

Dla `product/02-roadmap.md` agent ma koncentrować się na:
- głównych obszarach rozwoju,
- priorytetach,
- kolejności działań na poziomie produktu,
- zależnościach wysokiego poziomu.

## Dokumenty funkcjonalności

Dla dokumentów w `features/<feature-name>/` agent działa według stałego pipeline'u dokumentacyjnego.

Agent ma:
- utrzymywać granicę między pomysłem, analizą, zakresem, MVP, techniką i taskami,
- pilnować wejść i wyjść każdego etapu,
- nie pomijać etapów bez wyraźnej potrzeby,
- uwzględniać istniejący kod, jeśli funkcjonalność już istnieje.

Agent nie może:
- mieszać `product-spec` z `tech-spec`,
- mieszać `mvp` z wishlistą,
- mieszać `tasks` z luźnymi pomysłami,
- traktować discovery jako finalnego kontraktu.

## Tryby pracy

### 1. Greenfield

Używaj tego trybu, gdy funkcjonalność jest nowa i nie ma jeszcze implementacji.

W tym trybie:
- opieraj się na dokumentach wejściowych,
- nie zakładaj istnienia kodu,
- nie wymyślaj integracji, których nie potwierdzono,
- nie dopisuj „co już działa”, jeśli tego nie ma.

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
- traktuj `04-mvp.md` jako określenie tego, co zostało dostarczone albo co jeszcze realnie trzeba dowieźć,
- traktuj `05-tech-spec.md` jako opis istniejącej architektury oraz wymaganych zmian,
- zapisuj istotne ustalenia w `07-decision-log.md`,
- odkładaj luki, pomysły i rzeczy poza zakresem do `08-parking-lot.md`.

Nie udawaj, że istniejący system zaczyna się od zera.

## Kolejność pracy

### Dla dokumentów produktowych

1. `product/01-vision.md`
2. `product/02-roadmap.md`

### Dla dokumentów funkcjonalności

1. `01-idea.md`
2. `02-discovery.md`
3. `03-product-spec.md`
4. `04-mvp.md`
5. `05-tech-spec.md`
6. `06-tasks.md`

`07-decision-log.md` i `08-parking-lot.md` są aktualizowane równolegle.

## Zależności wejściowe

Obowiązujące zależności:

- `02-discovery.md` wymaga `01-idea.md`
- `03-product-spec.md` wymaga `01-idea.md` i `02-discovery.md`
- `04-mvp.md` wymaga `03-product-spec.md`
- `05-tech-spec.md` wymaga `03-product-spec.md` i `04-mvp.md`
- `06-tasks.md` wymaga `04-mvp.md` i `05-tech-spec.md`
- `product/02-roadmap.md` wymaga `product/01-vision.md`

Jeżeli wymagany plik nie istnieje:
- nie twórz kolejnego dokumentu,
- zwróć komunikat zgodny z odpowiednim promptem,
- zatrzymaj pracę.

## Źródła prawdy

Dokument bardziej źródłowy zawsze ma pierwszeństwo przed dokumentem pochodnym.

W folderze `product/`:
- `product/01-vision.md` = źródło prawdy o kierunku produktu,
- `product/02-roadmap.md` = źródło prawdy o priorytetach produktu.

W folderze feature'a:
- `03-product-spec.md` = źródło prawdy o zachowaniu funkcjonalności,
- `04-mvp.md` = źródło prawdy o bieżącym zakresie,
- `05-tech-spec.md` = źródło prawdy o implementacji,
- `06-tasks.md` = źródło prawdy o pracy do wykonania.

`01-idea.md` i `02-discovery.md` są wejściem do myślenia i analizy, a nie finalnym kontraktem.

## Rozstrzyganie niespójności

Jeżeli dokumenty są niespójne, obowiązuje następująca kolejność:
1. popraw dokument bardziej źródłowy,
2. popraw dokumenty pochodne,
3. zapisz ważną zmianę w `07-decision-log.md`, jeśli dotyczy funkcjonalności,
4. nie tuszuj sprzeczności przez dopisywanie kolejnych obejść.

Dla feature'ów:
- problem zachowania -> popraw `03-product-spec.md`
- problem zakresu -> popraw `04-mvp.md`
- problem implementacji -> popraw `05-tech-spec.md`
- problem zadań -> popraw `06-tasks.md`

Dla produktu:
- problem kierunku -> popraw `product/01-vision.md`
- problem priorytetów -> popraw `product/02-roadmap.md`

## Mapa promptów

Używaj następujących promptów:

- `prompts/vision-prompt.md` -> `product/01-vision.md`
- `prompts/roadmap-prompt.md` -> `product/02-roadmap.md`
- `prompts/discovery-prompt.md` -> `02-discovery.md`
- `prompts/product-spec-prompt.md` -> `03-product-spec.md`
- `prompts/mvp-prompt.md` -> `04-mvp.md`
- `prompts/tech-spec-prompt.md` -> `05-tech-spec.md`
- `prompts/tasks-prompt.md` -> `06-tasks.md`
- `prompts/decision-log-prompt.md` -> `07-decision-log.md`
- `prompts/parking-lot-prompt.md` -> `08-parking-lot.md`

## Zasady dla tasków

Przy tworzeniu `06-tasks.md`:
- task ma być mały i możliwy do wykonania,
- task nie może być epikiem udającym task,
- task ma mieć jasny wynik końcowy,
- task ma mieć typ, jeśli wymaga tego format,
- task ma odnosić się do MVP i tech specu.

## Zasady dla decision log

Przy aktualizacji `07-decision-log.md`:
- zapisuj tylko decyzje istotne,
- nie zapisuj drobnych zmian redakcyjnych,
- każdy wpis musi mieć datę,
- każdy wpis musi mieć status,
- każdy wpis musi mieć uzasadnienie, alternatywy i konsekwencje.

## Zasady dla parking lot

Przy aktualizacji `08-parking-lot.md`:
- odkładaj tylko rzeczy poza bieżący zakres,
- nie przenoś tam rzeczy już zatwierdzonych do MVP,
- nie zapisuj aktywnych tasków,
- każda pozycja musi mieć krótki opis i powód odłożenia.

## Format dokumentów

Każdy dokument powinien:
- mieć jasny nagłówek,
- mieć sekcje zgodne z jego rolą,
- być zwięzły,
- być spójny z promptem,
- unikać powtórzeń.

Jeśli repo używa standardowego nagłówka, dokument powinien zaczynać się od:

```md
Status: draft
Owner: Rafał
Last updated: YYYY-MM-DD
```

## Zachowanie końcowe

Jeśli zadanie jest zgodne z kolejnością i istnieją wymagane wejścia:
- użyj odpowiedniego promptu,
- utwórz lub zaktualizuj właściwy dokument,
- zachowaj granice etapu.

Jeśli zadanie nie jest zgodne z kolejnością albo brakuje wymaganego wejścia:
- nie przechodź dalej,
- zwróć krótki komunikat blokujący,
- nie próbuj „pomagać na siłę” przez zgadywanie braków.

Najważniejsza zasada:
AI ma porządkować i przyspieszać pracę właściciela projektu, ale nie może przejmować kontroli nad kierunkiem produktu ani rozszerzać zakresu bez decyzji.