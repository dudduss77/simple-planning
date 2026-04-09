# Feature Docs

Każdy folder w `features/` opisuje jedną konkretną funkcjonalność.

Jeden folder feature'a musi prowadzić od pomysłu do wdrożenia.
Folder feature'a nie jest archiwum luźnych notatek.

## Cel folderu

Folder `features/<feature-name>/` służy do przeprowadzenia funkcjonalności przez stały proces:
- pomysł,
- doprecyzowanie,
- pełny opis produktowy,
- wycięcie MVP,
- decyzje techniczne,
- rozpisanie zadań,
- zapisanie decyzji,
- odkładanie rzeczy poza zakresem.

## Standardowa zawartość folderu

Każdy folder feature'a musi zawierać:
- `01-idea.md`
- `02-discovery.md`
- `03-product-spec.md`
- `04-mvp.md`
- `05-tech-spec.md`
- `06-tasks.md`
- `07-decision-log.md`
- `08-parking-lot.md`

## Zasady ogólne

Dokumenty w folderze feature'a muszą:
- dotyczyć jednej funkcjonalności,
- być spójne między sobą,
- być aktualizowane w kolejności etapów,
- oddzielać produkt od techniki,
- oddzielać MVP od pełnego zakresu.

Dokumenty w folderze feature'a nie mogą:
- mieszać wielu funkcjonalności w jednym miejscu,
- dublować tej samej treści bez potrzeby,
- rozszerzać MVP przypadkiem,
- zawierać niekontrolowanego scope creepu,
- mieszać luźnych pomysłów z zatwierdzonym zakresem.

## `01-idea.md`

### Cel pliku

`01-idea.md` zapisuje surowy pomysł na funkcjonalność.

### Plik musi zawierać

`01-idea.md` musi zawierać:
- krótki opis pomysłu,
- problem, który funkcjonalność ma rozwiązać,
- powód, dla którego warto ją zbudować,
- wstępne hipotezy i założenia,
- kontekst biznesowy lub produktowy, jeśli istnieje.

### Plik nie może zawierać

`01-idea.md` nie może zawierać:
- architektury technicznej,
- szczegółów implementacji,
- modeli danych,
- szczegółowej listy tasków,
- finalnych decyzji udających pewniki.

### Definition of done

`01-idea.md` jest gotowy, gdy:
- wiadomo jaki jest pomysł,
- wiadomo jaki problem ma rozwiązać,
- wiadomo dlaczego temat w ogóle istnieje,
- istnieje wystarczający materiał do wejścia w discovery.

## `02-discovery.md`

### Cel pliku

`02-discovery.md` służy do doprecyzowania pomysłu przed wejściem w finalny opis funkcjonalności.

### Plik musi zawierać

`02-discovery.md` musi zawierać:
- najważniejsze pytania otwarte,
- luki informacyjne,
- ryzyka,
- sprzeczności,
- alternatywne kierunki,
- punkty wymagające decyzji.

### Plik nie może zawierać

`02-discovery.md` nie może zawierać:
- finalnego zakresu zapisanego jako zatwierdzony,
- technicznej architektury,
- tasków implementacyjnych,
- nowych pomysłów wrzuconych bez oceny.

### Definition of done

`02-discovery.md` jest gotowy, gdy:
- najważniejsze niejasności są ujawnione,
- wiadomo co trzeba doprecyzować,
- wiadomo jakie są główne ryzyka,
- da się przejść do `03-product-spec.md` bez zgadywania podstaw.

## `03-product-spec.md`

### Cel pliku

`03-product-spec.md` definiuje finalne zachowanie funkcjonalności na poziomie produktu.

### Plik musi zawierać

`03-product-spec.md` musi zawierać:
- cel funkcjonalności,
- użytkownika lub użytkowników funkcjonalności,
- zakres funkcjonalny,
- główne flow działania,
- zasady działania,
- edge case'y,
- ograniczenia,
- out of scope.

### Plik nie może zawierać

`03-product-spec.md` nie może zawierać:
- architektury technicznej,
- szczegółów bazy danych,
- listy klas, modułów i plików,
- tasków,
- pomysłów niezatwierdzonych jako część zakresu.

### Definition of done

`03-product-spec.md` jest gotowy, gdy:
- wiadomo co funkcjonalność robi,
- wiadomo jak ma się zachowywać,
- wiadomo co jest w zakresie,
- wiadomo co jest poza zakresem,
- dokument pozwala wyciąć MVP bez domysłów.

## `04-mvp.md`

### Cel pliku

`04-mvp.md` definiuje minimalny zakres pierwszej sensownej wersji funkcjonalności.

### Plik musi zawierać

`04-mvp.md` musi zawierać:
- listę elementów wchodzących do MVP,
- listę elementów niewchodzących do MVP,
- listę elementów odkładanych na później,
- krótkie uzasadnienie cięcia zakresu,
- jasne granice MVP.

### Plik nie może zawierać

`04-mvp.md` nie może zawierać:
- pełnej wishlisty funkcjonalności,
- architektury technicznej,
- tasków implementacyjnych,
- nowych funkcji nieobecnych w `03-product-spec.md`.

### Definition of done

`04-mvp.md` jest gotowy, gdy:
- zakres pierwszej wersji jest jednoznaczny,
- wiadomo co wchodzi teraz,
- wiadomo co nie wchodzi teraz,
- MVP jest małe, ale nadal daje realną wartość.

## `05-tech-spec.md`

### Cel pliku

`05-tech-spec.md` definiuje sposób implementacji MVP.

### Plik musi zawierać

`05-tech-spec.md` musi zawierać:
- opis architektury,
- podział na moduły lub komponenty,
- przepływ danych,
- kontrakty i interfejsy,
- wymagane struktury danych,
- integracje,
- ograniczenia techniczne,
- decyzje potrzebne do implementacji MVP.

### Plik nie może zawierać

`05-tech-spec.md` nie może zawierać:
- nowych funkcji spoza `03-product-spec.md`,
- rozszerzeń wykraczających poza `04-mvp.md`,
- backlogu luźnych pomysłów,
- tasków niskiego poziomu.

### Definition of done

`05-tech-spec.md` jest gotowy, gdy:
- wiadomo jak zbudować MVP,
- wiadomo jakie są główne elementy techniczne,
- dokument jest spójny z `03-product-spec.md`,
- dokument jest spójny z `04-mvp.md`,
- można przejść do rozpisywania tasków bez zgadywania architektury.

## `06-tasks.md`

### Cel pliku

`06-tasks.md` zamienia MVP i tech spec na konkretną pracę do wykonania.

### Plik musi zawierać

`06-tasks.md` musi zawierać:
- listę konkretnych zadań,
- kolejność lub zależności między zadaniami,
- zadania małe i możliwe do odhaczenia,
- zadania odnoszące się do MVP i tech specu,
- jasny zakres każdego zadania.

### Plik nie może zawierać

`06-tasks.md` nie może zawierać:
- luźnych pomysłów bez decyzji,
- pytań discovery,
- nowych funkcji spoza MVP,
- zadań zbyt ogólnych do wykonania.

### Definition of done

`06-tasks.md` jest gotowy, gdy:
- da się zacząć implementację bez zgadywania,
- zadania są konkretne,
- zadania są ułożone sensownie,
- zadania pokrywają cały zakres MVP.

## `07-decision-log.md`

### Cel pliku

`07-decision-log.md` zapisuje ważne decyzje dotyczące funkcjonalności.

### Każdy wpis musi zawierać

Każdy wpis musi zawierać:
- datę kiedy decyzja została podjęta,
- krótki tytuł decyzji,
- status decyzji,
- kontekst problemu,
- samą decyzję,
- uzasadnienie,
- alternatywy,
- konsekwencje.

### Dozwolone statusy

Dozwolone statusy:
- `proposed`
- `accepted`
- `changed`
- `deprecated`

### Plik nie może zawierać

`07-decision-log.md` nie może zawierać:
- drobnych zmian redakcyjnych,
- przypadkowych notatek bez decyzji,
- luźnych pomysłów bez oceny,
- pełnych tasków implementacyjnych.

### Definition of done

`07-decision-log.md` jest prowadzony poprawnie, gdy:
- każda ważna decyzja ma osobny wpis,
- wpisy mają daty,
- wpisy mają uzasadnienie,
- po czasie da się zrozumieć dlaczego decyzja została podjęta.

## `08-parking-lot.md`

### Cel pliku

`08-parking-lot.md` przechowuje rzeczy odłożone poza bieżący zakres.

### Plik musi zawierać

`08-parking-lot.md` musi zawierać:
- pomysły nie mieszczące się w obecnym MVP,
- rozszerzenia na później,
- tematy wymagające osobnego przemyślenia,
- rzeczy warte zachowania, ale niewchodzące teraz do realizacji.

### Plik nie może zawierać

`08-parking-lot.md` nie może zawierać:
- elementów już zatwierdzonych do MVP,
- decyzji architektonicznych,
- aktywnych tasków implementacyjnych,
- rzeczy bez krótkiego opisu.

### Definition of done

`08-parking-lot.md` jest prowadzony poprawnie, gdy:
- chroni zakres przed scope creepem,
- nie gubi dobrych pomysłów,
- oddziela rzeczy „na później” od rzeczy „na teraz”.

## Kolejność pracy

Domyślna kolejność pracy musi być następująca:
1. `01-idea.md`
2. `02-discovery.md`
3. `03-product-spec.md`
4. `04-mvp.md`
5. `05-tech-spec.md`
6. `06-tasks.md`

`07-decision-log.md` i `08-parking-lot.md` są aktualizowane równolegle przez cały czas pracy.

## Źródła prawdy

W folderze feature'a obowiązuje następujący model:
- `03-product-spec.md` = źródło prawdy o zachowaniu funkcjonalności,
- `04-mvp.md` = źródło prawdy o bieżącym zakresie,
- `05-tech-spec.md` = źródło prawdy o implementacji,
- `06-tasks.md` = źródło prawdy o pracy do wykonania.

`01-idea.md` i `02-discovery.md` są wejściem do analizy, a nie finalnym kontraktem.

## Rozstrzyganie niespójności

Jeżeli dokumenty są niespójne, obowiązuje następująca kolejność:
1. popraw `03-product-spec.md`, jeśli problem dotyczy zachowania funkcjonalności,
2. popraw `04-mvp.md`, jeśli problem dotyczy zakresu,
3. popraw `05-tech-spec.md`, jeśli problem dotyczy implementacji,
4. popraw `06-tasks.md`, jeśli problem dotyczy pracy do wykonania,
5. zapisz ważną zmianę w `07-decision-log.md`.

## Nazewnictwo folderów

Nazwy folderów feature'ów muszą być:
- krótkie,
- stabilne,
- opisowe,
- zapisane w kebab-case.

Przykłady:
- `history-export`
- `cursor-sync`
- `rules-review`

## Bootstrap istniejącej funkcjonalności

Jeżeli funkcjonalność już istnieje:
- można utworzyć dokumenty retroaktywnie,
- `01-idea.md` opisuje pierwotny lub obecny cel funkcjonalności,
- `02-discovery.md` identyfikuje luki, ryzyka i niespójności względem kodu,
- `03-product-spec.md` opisuje aktualne lub docelowe zachowanie,
- `05-tech-spec.md` musi odnosić się do istniejącej implementacji,
- `06-tasks.md` może zawierać także refaktor, integrację i porządkowanie obecnego rozwiązania.

W trybie bootstrap nie rekonstruujemy całej historii zmian.
Opisujemy aktualny stan i kolejny sensowny krok.

## Format nagłówka dokumentu

Każdy plik w folderze feature'a powinien zaczynać się od krótkiego nagłówka:

```md
Status: draft
Owner: Rafał
Last updated: 2026-04-08
```

Dozwolone statusy:
- `draft`
- `in-progress`
- `review`
- `approved`
- `obsolete`

## Zasada jakości

Folder feature'a jest gotowy do wdrożenia, gdy:
- zakres funkcjonalności jest jednoznaczny,
- MVP jest świadomie wycięte,
- architektura jest wystarczająco opisana,
- taski pozwalają zacząć pracę bez zgadywania.