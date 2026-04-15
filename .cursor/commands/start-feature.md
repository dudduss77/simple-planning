# Start Feature

Używaj tej komendy tylko wtedy, gdy użytkownik chce rozpocząć nowy feature w Simple Planning.

## Zasady
- Jeśli nazwa feature'a nie jest jednoznaczna, zapytaj użytkownika o nazwę.
- Jeśli opis jest zbyt krótki albo nie istnieje, poproś o krótki opis do `01-idea.md`.
- Uruchom `npx simple-planning start --name <feature-name> --description "<opis>"`.
- CLI samo ma utworzyć feature, `01-idea.md` i przygotować `discovery`.
- Użyj tylko `preparation.targetDocument`, `preparation.requiredFiles` i `preparation.prompt` zwróconych przez CLI.
- Po zaktualizowaniu pliku docelowego zatrzymaj się i oddaj kontrolę użytkownikowi.
- Nie wywołuj `preparation.nextCommand` tylko dlatego, że etap został właśnie zredagowany.
- Jeśli CLI zwróci konieczność zatrzymania albo doprecyzowania, zatrzymaj się i zapytaj użytkownika.
