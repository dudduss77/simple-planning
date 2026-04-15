# Bootstrap Project

Używaj tej komendy tylko wtedy, gdy użytkownik chce zbootstrapować istniejący projekt w Simple Planning.

## Zasady
- To nie jest komenda do greenfielda ani do zwykłego nowego feature'a.
- Najpierw uruchom `npx simple-planning bootstrap`.
- Jeśli CLI zatrzyma się z informacją, że `product/01-vision.md` jest puste albo zbyt krótkie, zatrzymaj się i poproś użytkownika o uzupełnienie sensownego seedu vision.
- Jeśli CLI zwróci bundle dokumentów, redaguj je dokładnie w kolejności podanej w `documents`.
- Używaj tylko `targetPath`, `requiredFiles` i `prompt` zwróconych przez CLI.
- Po zaktualizowaniu bootstrapowego discovery zatrzymaj się i oddaj kontrolę użytkownikowi.
- Nie wywołuj `discoveryPreparation.nextCommand` tylko dlatego, że bootstrapowe discovery zostało właśnie zredagowane.
