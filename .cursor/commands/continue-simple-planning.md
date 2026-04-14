# Kontynuuj Simple Planning

Używaj tej komendy tylko wtedy, gdy użytkownik chce jawnie przejść dalej po checkpointcie Simple Planning.

## Zasady
- Zacznij od sprawdzenia stanu projektu przez `npx simple-planning status` albo `npx simple-planning next`.
- Jeśli istnieje kilka feature'ów i nie wiadomo, który ma być kontynuowany, zapytaj użytkownika.
- Jeśli bieżący feature nie czeka na potwierdzenie, nie wymyślaj kontynuacji. Wyjaśnij aktualny stan.
- Jeśli feature czeka na potwierdzenie i `nextSuggestedStep` istnieje, uruchom `npx simple-planning run <next-step> --feature <slug-or-id> --confirmed-by-user`.
- Jedynym celem tej komendy jest odblokowanie dokładnie jednego następnego kroku po checkpointcie.
- Po przygotowaniu tego kroku wróć do normalnego flow przez `use-simple-planning`.
