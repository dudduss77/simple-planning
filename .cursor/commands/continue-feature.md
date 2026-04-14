# Continue Feature

Używaj tej komendy wtedy, gdy użytkownik chce kontynuować dokładnie jeden legalny krok dla istniejącego feature'a.

## Zasady
- Uruchom `npx simple-planning continue [--feature <slug|id>]`.
- Jeśli CLI zwróci wybór feature'a, zapytaj użytkownika zamiast zgadywać.
- Jeśli CLI wznowi aktywny etap albo odblokuje krok po checkpointcie, wykonaj dokładnie ten krok i nic więcej.
- Użyj tylko `preparation.targetDocument`, `preparation.requiredFiles` i `preparation.prompt` zwróconych przez CLI.
- Po zaktualizowaniu pliku docelowego wywołaj `preparation.nextCommand` zwrócone przez CLI.
- Nie przechodź sam do kolejnego etapu poza tym, co zwrócił CLI.
