-- Publicación en "Lo nuevo en la región" (empresas de servicios, productos y comercio funcional).
ALTER TABLE "events" ADD COLUMN "news" BOOLEAN NOT NULL DEFAULT false;
