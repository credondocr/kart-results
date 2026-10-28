import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/app/components/Breadcrumb";
import { db, dbUrl } from "@/lib/db";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  tag: string | null;
  cover_image: string | null;
  published_at: string | null;
}

async function getNews(slug: string): Promise<NewsItem | null> {
  if (!dbUrl()) return null;
  try {
    const sql = db();
    const rows = (await sql`
      SELECT id, slug, title, excerpt, content, tag, cover_image, published_at
      FROM news
      WHERE slug = ${slug} AND status = 'published'
        AND (published_at IS NULL OR published_at <= now())
      LIMIT 1
    `) as unknown as NewsItem[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) return { title: "Noticia | CRKC" };
  return {
    title: `${news.title} | Costa Rica Kart Championship`,
    description: news.excerpt ?? news.title,
    openGraph: {
      title: news.title,
      description: news.excerpt ?? news.title,
      type: "article",
      publishedTime: news.published_at ?? undefined,
      images: news.cover_image ? [{ url: news.cover_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description: news.excerpt ?? news.title,
    },
  };
}

export default async function NoticiaPage({ params }: PageProps) {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) notFound();

  const date = news.published_at
    ? new Date(news.published_at).toLocaleDateString("es-CR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <article className="min-h-screen bg-[var(--ink-950)] pt-24">
      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb />
        <div className="mt-4 flex items-center gap-3">
          {news.tag ? (
            <span className="rounded-md bg-[#4C8DFF]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#4C8DFF]">
              {news.tag}
            </span>
          ) : null}
          <time className="font-mono text-xs text-[var(--text-dim)]">{date}</time>
        </div>
        <h1 className="mt-3 font-display text-3xl font-black uppercase leading-tight tracking-tight text-white sm:text-4xl">
          {news.title}
        </h1>
        {news.excerpt ? (
          <p className="mt-4 text-base leading-relaxed text-[var(--text-dim)]">
            {news.excerpt}
          </p>
        ) : null}

        {news.cover_image ? (
          <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl border border-[var(--line)]">
            <Image src={news.cover_image} alt={news.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority unoptimized />
          </div>
        ) : null}

        <div
          className="prose prose-invert mt-8 max-w-none text-base leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-white [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_p]:mb-4 [&_p]:text-[var(--text)] [&_strong]:text-white [&_a]:text-[#4C8DFF] [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[#4C8DFF] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--text-dim)] [&_img]:my-6 [&_img]:rounded-2xl [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_hr]:my-8 [&_hr]:border-[var(--line)]"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        <div className="mt-12 border-t border-[var(--line)] pt-6">
          <Link href="/noticias" className="text-sm font-semibold text-[#4C8DFF] hover:opacity-80">
            ← Todas las noticias
          </Link>
        </div>
      </div>
    </article>
  );
}
