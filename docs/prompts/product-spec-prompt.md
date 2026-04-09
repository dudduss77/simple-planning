Utwórz lub zaktualizuj `03-product-spec.md` na podstawie `01-idea.md` i `02-discovery.md`.

Reguły:
- Jeśli `01-idea.md` nie istnieje, zatrzymaj się i napisz tylko: `Brak 01-idea.md. Nie można przygotować 03-product-spec.md.`
- Jeśli `02-discovery.md` nie istnieje, zatrzymaj się i napisz tylko: `Brak 02-discovery.md. Nie można przygotować 03-product-spec.md.`
- Pisz zwięźle i konkretnie.
- Opisuj zachowanie funkcjonalności z perspektywy użytkownika i kontraktu funkcjonalnego.
- Nie opisuj sposobu implementacji.
- Jeśli funkcjonalność już istnieje, rozdziel obecne zachowanie od docelowego, jeśli to potrzebne.

`03-product-spec.md` musi zawierać:
- cel funkcjonalności,
- użytkownika lub użytkowników,
- zakres funkcjonalny,
- główne flow,
- zasady działania,
- edge case'y,
- ograniczenia,
- out of scope.

`03-product-spec.md` nie może zawierać:
- nazw plików źródłowych,
- nazw modułów,
- nazw bibliotek,
- schematu bazy danych,
- algorytmów,
- szczegółów backupu, storage i walidacji wewnętrznej,
- tasków implementacyjnych.

CLI commands i ich publiczne zachowanie mogą być opisane tylko wtedy, gdy są częścią interfejsu użytkownika.
Jeśli fragment opisuje sposób implementacji zamiast zachowania funkcjonalności, pomiń go albo zostaw do `05-tech-spec.md`.