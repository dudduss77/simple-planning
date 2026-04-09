# Product Docs

Ten folder zawiera dokumenty dotyczące całego produktu.

Ten folder nie opisuje pojedynczych funkcjonalności.
Ten folder nie zawiera tasków implementacyjnych ani szczegółów technicznych feature'ów.

## Cel folderu

Folder `product/` służy do utrzymywania wspólnego kontekstu dla całego produktu.

Folder ma odpowiadać na 2 pytania:
- czym jest produkt i dokąd zmierza,
- jakie są główne priorytety rozwoju.

## Zawartość folderu

Folder `product/` musi zawierać:
- `01-vision.md`
- `02-roadmap.md`

## Zasady ogólne

Dokumenty w `product/` muszą:
- dotyczyć całego produktu,
- być krótkie i konkretne,
- używać prostego języka,
- być spójne ze sobą,
- pomagać podejmować decyzje o kierunku produktu.

Dokumenty w `product/` nie mogą:
- opisywać pojedynczego feature'a w szczególe,
- zawierać architektury technicznej konkretnej funkcjonalności,
- zawierać listy tasków developerskich,
- zawierać nazw modułów, plików i bibliotek,
- być inwentaryzacją aktualnego kodu.

## `01-vision.md`

### Cel pliku

`01-vision.md` definiuje kierunek produktu.

### Plik musi zawierać

`01-vision.md` musi zawierać:
- czym jest produkt,
- dla kogo jest,
- jaki problem rozwiązuje,
- jaka jest jego główna wartość,
- kluczowe założenia produktowe,
- długoterminowy kierunek.

### Plik nie może zawierać

`01-vision.md` nie może zawierać:
- tabel bazy danych,
- nazw modułów i plików,
- nazw bibliotek i frameworków,
- listy komend CLI,
- flag CLI,
- szczegółów implementacyjnych,
- szczegółowej inwentaryzacji stanu kodu,
- backlogu tasków.

### Definition of done

`01-vision.md` jest gotowy, gdy:
- wiadomo czym jest produkt,
- wiadomo dla kogo jest,
- wiadomo jaki problem rozwiązuje,
- wiadomo jaka jest jego główna wartość,
- wiadomo w jakim kierunku ma się rozwijać.

## `02-roadmap.md`

### Cel pliku

`02-roadmap.md` definiuje priorytety rozwoju produktu.

### Plik musi zawierać

`02-roadmap.md` musi zawierać:
- główne obszary rozwoju,
- priorytety uporządkowane od najważniejszych do mniej ważnych,
- podział na `teraz / później / nie teraz` albo równoważny,
- krótkie uzasadnienie priorytetów,
- zależności wysokiego poziomu między obszarami.

### Plik nie może zawierać

`02-roadmap.md` nie może zawierać:
- liczby tabel,
- liczby reguł,
- szczegółów schematu bazy,
- nazw modułów i plików,
- szczegółowego spisu tego, co już istnieje w kodzie,
- tasków implementacyjnych,
- niskopoziomowych decyzji technicznych.

### Definition of done

`02-roadmap.md` jest gotowy, gdy:
- wiadomo co jest teraz priorytetem,
- wiadomo co jest później,
- wiadomo co nie wchodzi teraz,
- roadmapa nie jest backlogiem tasków,
- roadmapa nie jest inwentaryzacją kodu,
- roadmapa jest spójna z `01-vision.md`.

## Bootstrap istniejącego projektu

Jeśli projekt już istnieje:
- `01-vision.md` ma opisać sens produktu, wartość i kierunek,
- `02-roadmap.md` ma opisać kolejny sensowny rozwój produktu,
- nie próbujemy odtwarzać całej historii 1:1,
- nie zamieniamy dokumentów produktowych w opis wnętrza systemu.

## Format nagłówka dokumentu

Każdy plik w `product/` powinien zaczynać się od krótkiego nagłówka:

```md
Status: draft
Owner: Rafał
Last updated: 2026-04-09
```

Dozwolone statusy:
- `draft`
- `in-progress`
- `review`
- `approved`
- `obsolete`