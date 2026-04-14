# Użyj Simple Planning

Używaj tej komendy zawsze wtedy, gdy użytkownik chce tworzyć, przeglądać albo porządkować dokumenty zarządzane przez Simple Planning.

## Zasady
- Zawsze zacznij od sprawdzenia stanu projektu przez `npx simple-planning status` albo `npx simple-planning list`.
- Preferuj `npx simple-planning next --feature <slug-or-id>`, aby ustalić kolejny legalny główny etap.
- Użyj `npx simple-planning run <step> --feature <slug-or-id>` przed edycją dokumentu, aby CLI zwróciło wymagane pliki oraz pełny prompt etapu, np. `@.simple-planning/commands/Discovery.md`.
- Po zaktualizowaniu pliku docelowego wywołaj `npx simple-planning run <step> --feature <slug-or-id> --complete`.
- Jeśli CLI zwróci `Zatrzymaj się i poproś użytkownika o dalsze instrukcje.`, zatrzymaj się i zapytaj użytkownika.
- Nie przechodź do kolejnego głównego etapu tylko na podstawie luźnej odpowiedzi użytkownika. Użyj dedykowanej komendy Cursor `continue-simple-planning`.
- Możesz aktualizować `decision-log` albo `parking-lot` podczas innego etapu tylko wtedy, gdy użytkownik wyraźnie o to poprosi.
- Nie polegaj na pamięci, żeby ustalić, które pliki są potrzebne. Za każdym razem pytaj CLI.
