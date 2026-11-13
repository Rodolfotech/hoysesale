-- El evento destacado también se muestra en "Hoy se sale" del inicio.
ALTER TABLE "events" ADD COLUMN "hoySeSale" BOOLEAN NOT NULL DEFAULT false;
