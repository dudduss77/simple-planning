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
- być aktualizowane świadomie,
- być spójne ze sobą.

Dokumenty w `product/` nie mogą:
- opisywać pojedynczego feature'a w szczególe,
- zawierać architektury technicznej konkretnej funkcjonalności,
- zawierać listy tasków developerskich,
- zawierać luźnych notatek implementacyjnych,
- mieszać poziomu produktu z poziomem feature'a.

## `01-vision.md`

### Cel pliku

`01-vision.md` definiuje kierunek produktu.

Musi zawierać:
- krótki opis produktu,
- opis docelowego użytkownika lub grupy użytkowników,
- opis problemu, który produkt rozwiązuje,
- główną wartość produktu,
- kluczowe założenia produktowe,
- długoterminowy kierunek rozwoju.

### Definition of done

`01-vision.md` jest gotowy, gdy:
- po przeczytaniu wiadomo czym jest produkt,
- po przeczytaniu wiadomo dla kogo jest produkt,
- po przeczytaniu wiadomo jaki problem rozwiązuje,
- po przeczytaniu wiadomo jaka jest jego główna wartość,
- po przeczytaniu wiadomo w jakim kierunku ma się rozwijać.

## `02-roadmap.md`

### Cel pliku

`02-roadmap.md` definiuje priorytety rozwoju produktu.

Musi zawierać:
- listę głównych obszarów rozwoju,
- priorytety uporządkowane od najważniejszych do mniej ważnych,
- podział na teraz / później / nie teraz albo równoważny,
- krótkie uzasadnienie priorytetów,
- zależności wysokiego poziomu między obszarami.

### Definition of done

`02-roadmap.md` jest gotowy, gdy:
- wiadomo co jest teraz priorytetem,
- wiadomo co jest później,
- wiadomo co nie wchodzi teraz,
- roadmapa nie jest backlogiem tasków,
- roadmapa jest spójna z `01-vision.md`.

## Relacja między plikami

`01-vision.md` definiuje kierunek produktu.
`02-roadmap.md` definiuje kolejność rozwoju produktu.

Jeżeli jakaś informacja:
- dotyczy całego produktu, trafia do `product/`,
- dotyczy jednej funkcjonalności, trafia do `features/<feature-name>/`.

## Źródła prawdy

W folderze `product/` obowiązuje następujący model:
- `01-vision.md` = źródło prawdy o kierunku produktu,
- `02-roadmap.md` = źródło prawdy o priorytetach rozwoju.

Jeżeli dokumenty są niespójne, najpierw popraw `01-vision.md`, a potem dostosuj `02-roadmap.md`.

## Format nagłówka dokumentu

Każdy plik w `product/` powinien zaczynać się od krótkiego nagłówka:

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

Dokumenty w `product/` mają być użyteczne do podejmowania decyzji.
Jeżeli dokument jest zbyt ogólny, zbyt długi albo nie pozwala ustalić priorytetów, wymaga poprawy.