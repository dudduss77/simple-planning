# TechSpec

Cel: Utwórz lub zaktualizuj `05-tech-spec.md` na podstawie `03-product-spec.md`, `04-mvp.md` oraz istniejącego kodu, jeśli funkcjonalność już istnieje.

Reguły:
- Jeśli użytkownik nie wskazał konkretnego pliku `03-product-spec.md`, zatrzymaj się i napisz tylko: `Brak 03-product-spec.md. Nie można przygotować 05-tech-spec.md.`
- Jeśli użytkownik nie wskazał konkretnego pliku `04-mvp.md`, zatrzymaj się i napisz tylko: `Brak 04-mvp.md. Nie można przygotować 05-tech-spec.md.`
- Pisz zwięźle i konkretnie.
- Nie dodawaj nowych funkcji spoza MVP.
- Nie twórz backlogu pomysłów.
- Nie rozpisuj tasków.
- Opisuj tylko to, co jest potrzebne do implementacji bieżącego MVP.

`05-tech-spec.md` musi zawierać:
- zakres zmiany,
- miejsca w kodzie objęte zmianą,
- aktualny stan techniczny istotny dla zmiany,
- plan zmian technicznych,
- kontrakty i interfejsy objęte zmianą,
- struktury danych objęte zmianą, jeśli są potrzebne,
- integracje istotne dla zmiany,
- ograniczenia techniczne,
- decyzje techniczne potrzebne do wdrożenia MVP.

`05-tech-spec.md` powinien zawierać, jeśli to możliwe:
- stack lub runtime istotny dla tej zmiany,
- konkretne pliki lub moduły do modyfikacji,
- pliki do weryfikacji zależne od zmian, nawet jeśli nie będą zmieniane.

`05-tech-spec.md` nie może zawierać:
- pełnej inwentaryzacji całego systemu, jeśli nie jest potrzebna do MVP,
- tasków implementacyjnych,
- pomysłów spoza MVP,
- opisu całej architektury od zera, jeśli zmiana dotyczy tylko fragmentu systemu.

Jeśli projekt jest w trybie bootstrap, oznaczaj tylko elementy istotne dla tej zmiany jako:
- `istnieje`,
- `do zmiany`,
- `do dodania`.

Jeśli kod już istnieje:
- dopasuj specyfikację do aktualnej architektury,
- wskaż wymagane zmiany,
- wskaż konkretne pliki, moduły i kontrakty dotknięte zmianą,
- nie opisuj szeroko obszarów niezwiązanych z MVP.

Jeśli zmiana dotyczy tylko części systemu:
- skup się na tej części,
- opisz punkty integracji z resztą systemu,
- pomiń resztę.

Jeśli fragment nie jest potrzebny do implementacji MVP, pomiń go.