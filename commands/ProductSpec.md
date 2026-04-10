# ProductSpec

Cel: Utwórz lub zaktualizuj `03-product-spec.md` na podstawie `01-idea.md` i `02-discovery.md`.

Reguły:
- Jeśli użytkownik nie wskazał konkretnego pliku  `01-idea.md` zatrzymaj się i napisz tylko: `Brak 01-idea.md. Nie można przygotować 03-product-spec.md.`
- Jeśli użytkownik nie wskazał konkretnego pliku `02-discovery.md` zatrzymaj się i napisz tylko: `Brak 02-discovery.md. Nie można przygotować 03-product-spec.md.`
- Jeśli `02-discovery.md` zawiera otwarte pytania, zatrzymaj się i napisz tylko: `W 02-discovery.md są otwarte pytania. Nie można przygotować 03-product-spec.md.`
- Pisz zwięźle i konkretnie.
- Opisuj zachowanie funkcjonalności z perspektywy użytkownika i kontraktu funkcjonalnego.
- Nie opisuj sposobu implementacji.
- Jeśli funkcjonalność już istnieje, rozdziel obecne zachowanie od docelowego, jeśli to potrzebne.
- Jeśli nie da się czegoś pewnie ustalić, nie zgaduj — dodaj to jako otwarte pytanie albo ograniczenie.

`03-product-spec.md` musi zawierać:
- cel funkcjonalności,
- użytkownika lub użytkowników,
- zakres funkcjonalny,
- główne flow,
- zasady działania,
- edge case'y,
- ograniczenia,
- out of scope,
- kryteria akceptacji.

`03-product-spec.md` nie może zawierać:
- nazw plików źródłowych,
- nazw modułów,
- nazw bibliotek,
- schematu bazy danych,
- algorytmów,
- szczegółów backupu, storage i walidacji wewnętrznej,
- tasków implementacyjnych,
- szczegółowego opisu przetwarzania danych wewnątrz systemu,
- opisu architektury technicznej.

Dodatkowe zasady:
- Jeśli funkcjonalność ma interfejs CLI, API lub UI, opisuj go tylko na poziomie celu i efektu dla użytkownika.
- Nie opisuj pełnej listy flag, parametrów, payloadów, struktur odpowiedzi ani technicznych formatów wejścia/wyjścia, jeśli nie są krytyczne dla zrozumienia funkcjonalności.
- Nie opisuj wewnętrznej mechaniki systemu, jeśli użytkownik widzi tylko efekt końcowy.
- Nie opisuj etapów technicznych przetwarzania, mechanizmów backupu, reguł walidacji wewnętrznej ani kroków pipeline'u systemowego.
- Jeśli jakiś fragment bardziej pasuje do `05-tech-spec.md`, pomiń go.
- Jeśli wahasz się, czy coś należy do product spec czy tech spec, wybierz poziom bardziej produktowy i bardziej zewnętrzny.

Zasady dla sekcji:
- `Główne flow` ma opisywać typowe użycie funkcjonalności krok po kroku z perspektywy użytkownika.
- `Zasady działania` mają opisywać publiczne, obserwowalne reguły zachowania funkcjonalności.
- `Edge case'y` mają opisywać przypadki istotne z perspektywy użytkownika lub publicznego zachowania systemu, a nie błędy wewnętrznej implementacji.
- `Ograniczenia` mają opisywać realne granice funkcjonalności istotne dla użytkownika lub właściciela produktu.
- `Out of scope` ma jasno odcinać rzeczy niewchodzące do tej funkcjonalności.
- `Kryteria akceptacji` mają opisywać obserwowalne zachowanie funkcjonalności, po którym można stwierdzić, że działa zgodnie z celem.

Jeśli funkcjonalność już istnieje:
- możesz opisać `Obecne zachowanie` i `Docelowe zachowanie`,
- ale tylko wtedy, gdy ta różnica jest ważna dla zrozumienia zakresu funkcjonalnego,
- nie zamieniaj dokumentu w analizę istniejącego kodu.

Preferowany styl:
- krótkie sekcje,
- krótkie akapity lub listy,
- zero marketingu,
- zero ogólników,
- zero treści technicznych niepotrzebnych na tym etapie.

Celem `03-product-spec.md` jest odpowiedź na pytanie:
`Co ta funkcjonalność robi, dla kogo, jak ma działać i po czym poznamy, że działa poprawnie?`
Nie celem tego pliku jest odpowiedź na pytanie:
`Jak dokładnie zostanie to zaimplementowane?`