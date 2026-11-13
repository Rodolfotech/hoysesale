-- Tipo de publicación: evento destacado (false) o experiencia todo el año (true).
ALTER TABLE "events" ADD COLUMN "yearRound" BOOLEAN NOT NULL DEFAULT false;
