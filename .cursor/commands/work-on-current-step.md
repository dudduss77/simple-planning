# Work On Current Step

Używaj tej komendy wtedy, gdy użytkownik chce dalej pracować nad aktualnym dokumentem bez przechodzenia do kolejnego kroku workflow.

## Zasady
- Uruchom `npx simple-planning work-on-current-step [--feature <slug|id>]`.
- Ta komenda ma wznowić tylko `activeStep` i nie może samodzielnie przygotować następnego etapu.
- Jeśli CLI zwróci wybór feature'a, zapytaj użytkownika zamiast zgadywać.
- Jeśli CLI poinformuje, że nie ma aktywnego kroku, zatrzymaj się i wskaż użytkownikowi `continue-feature` albo `feature-status`.
- Użyj tylko `preparation.targetDocument`, `preparation.requiredFiles` i `preparation.prompt` zwróconych przez CLI.
- Po zaktualizowaniu pliku docelowego wywołaj `preparation.nextCommand` zwrócone przez CLI tylko po to, by oznaczyć bieżący krok jako ukończony.
- Nie przechodź dalej tylko dlatego, że dokument jest już otwarty albo użytkownik dopisał nowe informacje.
