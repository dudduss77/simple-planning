# Tasks

Cel: Utwórz lub zaktualizuj `06-tasks.md` na podstawie `04-mvp.md` i `05-tech-spec.md`.

Reguły:
- Jeśli użytkownik nie wskazał konkretnego pliku `04-mvp.md`, zatrzymaj się i napisz tylko: `Brak 04-mvp.md. Nie można przygotować 06-tasks.md.`
- Jeśli użytkownik nie wskazał konkretnego pliku `05-tech-spec.md`, zatrzymaj się i napisz tylko: `Brak 05-tech-spec.md. Nie można przygotować 06-tasks.md.`
- Pisz zwięźle i konkretnie.
- Nie dodawaj nowych funkcji spoza MVP.
- Nie zapisuj luźnych pomysłów.
- Nie twórz epików udających taski.

Każdy task musi zawierać:
- identyfikator,
- krótki tytuł,
- typ: `new`, `refactor`, `test`, `docs`, `infra`,
- cel,
- zakres,
- pliki do zmiany, jeśli da się je wskazać,
- wynik końcowy,
- check po wykonaniu,
- zależności, jeśli istnieją.

Zasady:
- Task ma być mały i możliwy do wykonania w jednym sensownym kroku pracy.
- Jeśli zadanie jest zbyt szerokie, podziel je na mniejsze.
- `Zakres` ma opisywać, co robimy, ale bez przepisywania całego tech specu.
- `Pliki do zmiany` mają wskazywać najbardziej prawdopodobne miejsca pracy, nie pełną listę całego repo.
- `Check po wykonaniu` ma opisywać, po czym poznamy, że task został poprawnie wykonany.
- Nie schodź do poziomu pojedynczych linii kodu.
- Nie opisuj implementacji bardziej szczegółowo niż wymaga to wykonanie taska.

Jeśli funkcjonalność rozwija istniejący kod, uwzględnij:
- refaktor,
- integrację,
- migracje,
- porządkowanie obecnego rozwiązania,
jeśli są konieczne do MVP.

Na końcu dodaj kolejność realizacji tasków, jeśli wynika z zależności.