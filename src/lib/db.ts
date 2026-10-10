import { neon } from "@neondatabase/serverless";

export function dbUrl(): string | undefined {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  );
}

export function db() {
  const url = dbUrl();
  if (!url) {
    throw new Error(
      "POSTGRES_URL no configurada (Neon). Ejecuta `vercel env pull` o define la variable."
    );
  }
  return neon(url);
}
