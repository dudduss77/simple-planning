# TechSpec

Cel: Utwórz lub zaktualizuj `05-tech-spec.md` na podstawie `03-product-spec.md`, `04-mvp.md` oraz istniejącego kodu oraz dokumentacji technicznej potrzebnej do poprawnej implementacji MVP.

Reguły:
- Jeśli użytkownik nie wskazał konkretnego pliku `03-product-spec.md`, zatrzymaj się i napisz tylko: `Brak 03-product-spec.md. Nie można przygotować 05-tech-spec.md.`
- Jeśli użytkownik nie wskazał konkretnego pliku `04-mvp.md`, zatrzymaj się i napisz tylko: `Brak 04-mvp.md. Nie można przygotować 05-tech-spec.md.`
- Pisz zwięźle i konkretnie.
- Nie dodawaj nowych funkcji spoza MVP.
- Nie twórz backlogu pomysłów.
- Nie rozpisuj tasków.
- Opisuj tylko to, co jest potrzebne do implementacji bieżącego MVP.
- Nie opisuj całego systemu, jeśli zmiana dotyczy tylko jego fragmentu.

Źródła pracy:
- `03-product-spec.md` i `04-mvp.md` określają zakres i granice zmiany.
- Kod istniejącego systemu jest źródłem prawdy o stanie obecnym.
- Dokumentacja techniczna, oficjalne źródła i wiarygodny research służą do potwierdzenia poprawnego użycia technologii. (WEB, Context7 MCP, Skills)
- Jeśli zmiana dotyczy istniejącego systemu, nie projektuj rozwiązania w oderwaniu od kodu.

Kiedy użyć dokumentacji technicznej lub researchu:
- gdy zmiana dotyczy frameworka, biblioteki, integracji, publicznego API albo narzędzia,
- gdy trzeba potwierdzić poprawny sposób użycia technologii,
- gdy trzeba zweryfikować ograniczenia, best practices albo kompatybilność rozwiązania,
- gdy bez tego istnieje ryzyko błędnej specyfikacji technicznej.

Jak używać dokumentacji technicznej lub researchu:
- wykorzystaj WEB, oraz o ile dostępne, Context7 MCP i Skills,
- nie kopiuj dokumentacji do specyfikacji,
- zapisuj tylko wnioski potrzebne do implementacji MVP,
- jeśli dokumentacja przeczy założeniu, popraw spec albo oznacz otwartą decyzję techniczną,
- traktuj research jako weryfikację, nie jako pretekst do rozszerzania scope'u.

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

Zasady dla sekcji:
- `Zakres zmiany` ma jasno opisać, czego dotyczy implementacja i czego nie dotyczy.
- `Miejsca w kodzie objęte zmianą` mają wskazywać najbardziej prawdopodobne pliki, moduły lub warstwy systemu.
- `Aktualny stan techniczny` ma opisywać tylko to, co jest istotne dla tej zmiany.
- `Plan zmian technicznych` ma opisywać, co trzeba zmodyfikować, dodać albo zachować bez zmian.
- `Kontrakty i interfejsy` mają opisywać publiczne i wewnętrzne punkty styku istotne dla MVP.
- `Struktury danych` opisuj tylko wtedy, gdy zmiana faktycznie ich dotyka.
- `Integracje` opisuj tylko wtedy, gdy mają wpływ na wdrożenie tej zmiany.
- `Ograniczenia techniczne` mają wskazywać realne granice wynikające z kodu, technologii albo przyjętego scope'u.
- `Decyzje techniczne potrzebne do wdrożenia MVP` mają zawierać tylko rzeczy, które faktycznie trzeba rozstrzygnąć.

Jeśli projekt jest w trybie bootstrap, oznaczaj tylko elementy istotne dla tej zmiany jako:
- `istnieje`,
- `do zmiany`,
- `do dodania`.
- `do weryfikacji`
- `do usunięcia`

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

Preferowany styl:
- krótkie sekcje,
- krótkie listy,
- zero marketingu,
- zero ogólników,
- zero niepotrzebnej teorii,
- maksymalnie dużo konkretu potrzebnego do wdrożenia.

Celem `05-tech-spec.md` jest odpowiedź na pytanie:
`Co dokładnie trzeba zmienić w systemie, gdzie to zmienić, jakie kontrakty trzeba zachować i jakie techniczne decyzje są potrzebne, żeby wdrożyć MVP zgodnie z kodem i dokumentacją?`