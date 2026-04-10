# Discovery

Cel: Utwórz lub zaktualizuj `02-discovery.md` na podstawie `01-idea.md`, istniejącego kodu oraz lokalnych dokumentów powiązanych z funkcjonalnością.

Reguły:
- Jeśli użytkownik nie wskazał konkretnego pliku `01-idea.md` zatrzymaj się i napisz tylko: `Brak 01-idea.md. Nie można przygotować 02-discovery.md.`
- Pisz zwięźle i konkretnie, ale musi być kontekst, aby móc odpowiedzieć na pytania czy podjąć decyzje.
- To jest etap analizy, nie finalnych decyzji.
- Nie twórz architektury technicznej.
- Nie twórz tasków.
- Nie opisuj szczegółowych rozwiązań implementacyjnych.
- Nie zamieniaj discovery w `03-product-spec.md` ani `05-tech-spec.md`.

Źródła pracy:
- Najpierw analizuj `01-idea.md`.
- Następnie sprawdź istniejący kod, jeśli funkcjonalność już istnieje.
- Następnie uwzględnij lokalne dokumenty repo, jeśli pomagają zrozumieć kontekst.
- Użyj researchu zewnętrznego tylko wtedy, gdy jest potrzebny do sensownej analizy problemu.

Kiedy użyć researchu zewnętrznego:
- gdy trzeba sprawdzić możliwości lub ograniczenia zewnętrznego narzędzia, biblioteki, API albo platformy,
- gdy trzeba porównać alternatywne kierunki rozwiązania,
- gdy trzeba potwierdzić aktualne ograniczenia technologii,
- gdy bez tego nie da się rzetelnie ocenić ryzyk lub luk informacyjnych.

Jak używać researchu zewnętrznego:
- traktuj go jako źródło potwierdzeń, ograniczeń, ryzyk i alternatyw,
- nie przepisuj dokumentacji,
- nie buduj na tym gotowej architektury,
- nie rozszerzaj scope'u tylko dlatego, że pojawiły się nowe możliwości.

`02-discovery.md` musi zawierać:
- tryb pracy,
- co już istnieje,
- czego brakuje,
- pytania otwarte,
- luki informacyjne,
- ryzyka,
- sprzeczności,
- alternatywne kierunki,
- punkty wymagające decyzji.

Zasady dla sekcji:
- `Tryb pracy` ma jasno wskazać, czy to greenfield, czy bootstrap istniejącego systemu.
- `Co już istnieje` ma opisywać fakty potwierdzone w kodzie, dokumentach albo wiarygodnych źródłach.
- `Czego brakuje` ma wskazywać brakujące elementy potrzebne do przejścia do product spec.
- `Pytania otwarte` mają zawierać tylko pytania, na które brak jeszcze decyzji.
- `Luki informacyjne` mają wskazywać, czego nie da się jeszcze pewnie ustalić.
- `Ryzyka` mają opisywać realne zagrożenia dla funkcjonalności, zakresu albo jakości rozwiązania.
- `Sprzeczności` mają wskazywać rozjazdy między ideą, kodem, dokumentami albo założeniami.
- `Alternatywne kierunki` mają pokazywać realne opcje do decyzji, nie luźne pomysły.
- `Punkty wymagające decyzji` mają jasno wskazywać, co musi zostać rozstrzygnięte przed przejściem dalej.

Jeśli funkcjonalność już istnieje w kodzie, uwzględnij obecne zachowanie i wskaż:
- co już istnieje,
- czego brakuje,
- co jest niejasne,
- co wymaga decyzji,
- jakie są rozjazdy między ideą a stanem obecnym.

Jeśli użyto researchu zewnętrznego:
- odnotuj tylko wnioski istotne dla discovery,
- zaznacz ograniczenia i ryzyka wynikające z researchu,
- nie zamieniaj discovery w notatkę z researchu.

Preferowany styl:
- krótkie sekcje,
- krótkie listy,
- zero marketingu,
- zero ogólników,
- zero technicznego lania wody,
- zero decyzji udających analizę.

Celem `02-discovery.md` jest odpowiedź na pytanie:
`Co już wiemy, czego nie wiemy, gdzie są ryzyka, jakie są sensowne kierunki i co trzeba zdecydować, zanim opiszemy finalną funkcjonalność?`