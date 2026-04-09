Utwórz lub zaktualizuj `05-tech-spec.md` na podstawie `03-product-spec.md`, `04-mvp.md` oraz istniejącego kodu, jeśli funkcjonalność już istnieje.

Reguły:
- Jeśli `03-product-spec.md` nie istnieje, zatrzymaj się i napisz tylko: `Brak 03-product-spec.md. Nie można przygotować 05-tech-spec.md.`
- Jeśli `04-mvp.md` nie istnieje, zatrzymaj się i napisz tylko: `Brak 04-mvp.md. Nie można przygotować 05-tech-spec.md.`
- Pisz zwięźle i konkretnie.
- Nie dodawaj nowych funkcji spoza MVP.
- Nie twórz backlogu pomysłów.
- Nie rozpisuj tasków.

`05-tech-spec.md` musi zawierać:
- architekturę,
- moduły lub komponenty,
- przepływ danych,
- kontrakty i interfejsy,
- struktury danych,
- integracje,
- ograniczenia techniczne,
- decyzje potrzebne do implementacji MVP.

Jeśli projekt jest w trybie bootstrap, każdy większy element techniczny powinien być oznaczony jako jedno z:
- `istnieje`,
- `do zmiany`,
- `do dodania`.

Jeśli kod już istnieje:
- dopasuj specyfikację do aktualnej architektury,
- wskaż wymagane zmiany,
- nie projektuj całego systemu od zera bez potrzeby.

Jeśli fragment nie jest potrzebny do implementacji MVP, pomiń go.