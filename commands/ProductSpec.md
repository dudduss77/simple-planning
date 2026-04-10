# ProductSpec

Cel: Utwórz lub zaktualizuj `03-product-spec.md` na podstawie `01-idea.md` i `02-discovery.md`.

Reguły:
- Jeśli użytkownik nie wskazał konkretnego pliku `01-idea.md`, zatrzymaj się i napisz tylko: `Brak 01-idea.md. Nie można przygotować 03-product-spec.md.`
- Jeśli użytkownik nie wskazał konkretnego pliku `02-discovery.md`, zatrzymaj się i napisz tylko: `Brak 02-discovery.md. Nie można przygotować 03-product-spec.md.`
- Jeśli `02-discovery.md` zawiera otwarte pytania blokujące definicję funkcjonalności, zatrzymaj się i napisz tylko, co pozostało do ustalenia.
- Pisz zwięźle i konkretnie.
- Opisuj zachowanie funkcjonalności z perspektywy użytkownika i kontraktu funkcjonalnego.
- Nie opisuj implementacji ani architektury.
- Jeśli funkcjonalność już istnieje, rozdziel obecne zachowanie od docelowego tylko wtedy, gdy to pomaga zrozumieć zmianę.
- Jeśli czegoś nie da się pewnie ustalić, nie zgaduj — dodaj to jako otwarte pytanie albo ograniczenie.

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
- Jeśli fragment bardziej pasuje do `05-tech-spec.md`, pomiń go.
- Jeśli wahasz się, czy coś należy do product spec czy tech spec, wybierz poziom bardziej produktowy.

Zasady dla sekcji:
- `Główne flow` opisuje typowe użycie funkcjonalności krok po kroku z perspektywy użytkownika.
- `Zasady działania` opisują publiczne, obserwowalne reguły zachowania.
- `Edge case'y` opisują przypadki istotne z perspektywy użytkownika.
- `Ograniczenia` opisują granice działania funkcjonalności, które nadal należą do jej zakresu.
- `Out of scope` opisuje rzeczy całkowicie niewchodzące do tej funkcjonalności.
- Nie powielaj tych samych punktów w `Ograniczenia` i `Out of scope`.
- `Kryteria akceptacji` opisują obserwowalne zachowanie, po którym można stwierdzić, że funkcjonalność działa poprawnie.

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