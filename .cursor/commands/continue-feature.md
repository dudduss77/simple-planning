# Continue Feature

Używaj tej komendy wtedy, gdy użytkownik chce kontynuować dokładnie jeden legalny krok dla istniejącego feature'a.

## Zasady
- Uruchom `npx simple-planning continue [--feature <slug|id>]`.
- Jeśli CLI zwróci wybór feature'a, zapytaj użytkownika zamiast zgadywać.
- Jeśli CLI wznowi aktywny etap albo odblokuje krok po checkpointcie, wykonaj dokładnie ten krok i nic więcej.
- Użyj tylko `preparation.targetDocument`, `preparation.requiredFiles` i `preparation.prompt` zwróconych przez CLI.
- Jeśli `resumedFromCheckpoint` jest `true`, potraktuj to jako przygotowanie nowego etapu: zredaguj dokument i zatrzymaj się bez wywoływania `preparation.nextCommand`.
- Jeśli `resumedFromCheckpoint` jest `false` i CLI wznowiło już aktywny etap, po zaktualizowaniu pliku docelowego możesz wywołać `preparation.nextCommand`, aby domknąć właśnie ten bieżący etap.
- Nie przechodź sam do kolejnego etapu poza tym, co zwrócił CLI.
