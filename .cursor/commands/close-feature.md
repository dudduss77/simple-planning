# Close Feature

Używaj tej komendy wtedy, gdy użytkownik chce jawnie zamknąć feature w lifecycle Simple Planning.

## Zasady
- Jeśli nie wiadomo, który feature ma zostać zamknięty, zapytaj użytkownika albo pozwól CLI zwrócić wybór feature'a.
- Jeśli powód zamknięcia nie jest jawny, poproś użytkownika o jeden z powodów: `done`, `wont-do`, `duplicate`, `obsolete`.
- Uruchom `npx simple-planning close-feature --reason <reason> [--feature <slug|id>]`.
- Ta komenda zamyka feature w stanie CLI i nie aktualizuje automatycznie `07-decision-log.md`.
- Po zamknięciu nie próbuj uruchamiać `continue` ani `work-on-current-step` dla tego feature'a.
