-- El evento se muestra en Eventos destacados (casilla independiente de Hoy se sale y de Experiencias todo el año).
ALTER TABLE "events" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT true;
-- Las experiencias todo el año publicadas antes no eran destacadas.
UPDATE "events" SET "featured" = false WHERE "yearRound" = true;
