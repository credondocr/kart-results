import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/app/components/Breadcrumb";
import { db, dbUrl } from "@/lib/db";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Noticias | Costa Rica Kart Championship",
  description:
    "Últimas noticias del Costa Rica Kart Championship: inscripciones, resultados y más.",
};

interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  tag: string | null;
  cover_image: string | null;
  published_at: string | null;
}

async function getNews(): Promise<NewsItem[]> {
  if (!dbUrl()) return [];
  try {
    const sql = db();
    return (await sql`
      SELECT id, slug, title, excerpt, tag, cover_image, published_at
      FROM news
      WHERE status = 'published' AND (published_at IS NULL OR published_at <= now())
      ORDER BY published_at DESC NULLS LAST
      LIMIT 30
    `) as unknown as NewsItem[];
  } catch {
    return [];
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function NoticiasPage() {
  const news = await getNews();

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-24">
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb />
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4C8DFF]">
          CRKC
        </p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Noticias
        </h1>

        {news.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)]/30 p-10 text-center">
            <p className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
              Aún no hay noticias
            </p>
            <p className="mt-2 text-sm text-[var(--text-dim)]">
              Pronto publicaremos novedades del campeonato.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {news.map((n) => (
              <Link
                key={n.id}
                href={`/noticias/${n.slug}`}
                className="group flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-5 transition-colors hover:border-[#4C8DFF]/50 sm:flex-row"
              >
                {n.cover_image ? (
                  <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-44">
                    <Image src={n.cover_image} alt={n.title} fill sizes="176px" className="object-cover" unoptimized />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    {n.tag ? (
                      <span className="rounded-md bg-[#4C8DFF]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#4C8DFF]">
                        {n.tag}
                      </span>
                    ) : null}
                    <time className="font-mono text-[11px] text-[var(--text-dim)]">
                      {formatDate(n.published_at)}
                    </time>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-extrabold uppercase leading-tight tracking-tight text-white group-hover:text-[#4C8DFF]">
                    {n.title}
                  </h2>
                  {n.excerpt ? (
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--text-dim)]">
                      {n.excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
