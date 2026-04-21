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

Jeśli temat jest szeroki, zanim zadasz pytania:
- najpierw wypisz 3-6 głównych obszarów decyzji,
- potem zadawaj pytania przypisane do tych obszarów,
- nie mieszaj pytań z różnych obszarów bez oznaczenia kontekstu.

Jeśli użyto researchu zewnętrznego:
- odnotuj tylko wnioski istotne dla discovery,
- zaznacz ograniczenia i ryzyka wynikające z researchu,
- nie zamieniaj discovery w notatkę z researchu.

Jeśli musisz zadać pytania:
- zanim zapytasz użytkownika, przejdź priorytet źródeł: jawne ustalenia właściciela → bardziej źródłowe dokumenty w repo → kod i aktualne zachowanie → dopiero wtedy pytanie (zgodnie z `planning/AGENTS.md`),
- zadawaj tylko pytania, które realnie wpływają na wynik `02-discovery.md`,
- grupuj je w małe partie, maksymalnie 3-5 naraz,
- każde pytanie zakotwicz w konkretnym miejscu analizy: wskaż, czy dotyczy `Luki informacyjne`, `Ryzyka`, `Sprzeczności`, `Alternatywnego kierunku` albo `Punktu wymagającego decyzji`, i dlaczego nie da się tego wiarygodnie domknąć z kodu, dokumentów albo researchu,
- przy każdym pytaniu podaj krótki blok kontekstu (2-4 zdania, nadal konkretnie):
  - o co chodzi i co już wiemy albo co ze sobą koliduje,
  - czego dotyczy pytanie i po co jest zadane,
  - co w `02-discovery.md` zmieni odpowiedź (którą sekcję doprecyzuje albo co usunie z list otwartych),
- jeśli pytanie jest w stylu wyboru (kilka opcji albo „tak/nie” z istotnymi konsekwencjami):
  - dla każdej sensownej opcji podaj krótki opis (kiedy opcja ma sens),
  - przy każdej opcji: główna zaleta i główna wada (trade-off),
  - na końcu możesz podać **wstępną rekomendację** opartą na znanych faktach i ryzykach — to tylko podpowiedź analityczna na etapie discovery, nie decyzja właściciela i nie zastępuje jawnego rozstrzygnięcia w dokumencie,
- oznacz pytania jako:
  - `blokujące` — bez odpowiedzi nie da się sensownie domknąć discovery; takie kwestie mają trafić do `Pytania otwarte` w pliku i mogą później zatrzymać przygotowanie `03-product-spec.md`,
  - `doprecyzowujące` — poprawiają jakość discovery, ale nie blokują przejścia dalej,
- nie zadawaj pytań, jeśli odpowiedź można wiarygodnie ustalić z kodu, dokumentów albo researchu,
- po uzyskaniu odpowiedzi przenieś ustalenia do odpowiednich sekcji `02-discovery.md` (fakty vs założenia vs otwarte pytania), zamiast zostawiać wiedzę tylko w wątku czatu.

Preferowany styl:
- krótkie sekcje,
- krótkie listy,
- zero marketingu,
- zero ogólników,
- zero technicznego lania wody,
- zero decyzji udających analizę.

Celem `02-discovery.md` jest odpowiedź na pytanie:
`Co już wiemy, czego nie wiemy, gdzie są ryzyka, jakie są sensowne kierunki i co trzeba zdecydować, zanim opiszemy finalną funkcjonalność?`