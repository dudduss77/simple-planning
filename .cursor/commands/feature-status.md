# Feature Status

Używaj tej komendy, gdy użytkownik chce tylko sprawdzić stan feature'a albo ustalić następny legalny krok.

## Zasady
- Uruchom `npx simple-planning status [--feature <slug|id>]`.
- Jeśli CLI zwróci wybór feature'a, zapytaj użytkownika zamiast zgadywać.
- Jeśli CLI zwróci `nextContext`, użyj tego tylko do raportowania stanu, a nie do samodzielnego przechodzenia dalej.
- Ta komenda nie służy do redagowania dokumentów ani do odblokowywania checkpointów.
