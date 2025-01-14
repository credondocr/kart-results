import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

interface Post {
  coverImage?: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  excerpt: string;
}


// Genera los parámetros dinámicos para todas las rutas de tags
export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'src/content/posts');
  const filenames = fs.readdirSync(postsDirectory);

  const allTags = new Set<string>();

  filenames.forEach((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);

    if (data.tags) {
      data.tags.forEach((tag: string) => allTags.add(tag));
    }
  });

  return Array.from(allTags).map((tag) => ({ tag }));
}

// Página dinámica para un tag específico
export default async function TagPage(
    {params}: {params: Promise<{tag: string}>}
) {
  const { tag } = await params;

  // Leer todos los archivos Markdown
  const postsDirectory = path.join(process.cwd(), 'src/content/posts');
  const filenames = fs.readdirSync(postsDirectory);
  const relatedPosts: Post[] = [];

  filenames.forEach((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);

    if (data.tags && data.tags.includes(tag)) {
      relatedPosts.push({
        coverImage: data.coverImage,
        title: data.title,
        slug: data.slug,
        date: data.date,
        tags: data.tags,
        excerpt: data.excerpt || '',
      });
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 shadow-lg rounded-lg mt-5 mb-5">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
          Posts relacionados con el tag: {tag}
        </h1>
      </header>
      <div className="space-y-6">
        {relatedPosts.map((post) => (
          <div key={post.slug} className="p-4 bg-white shadow-md rounded-lg">
            <img
              src={post.coverImage || '/default-thumbnail.jpg'}
              alt={post.title}
              className="h-48 w-full object-cover"
            />
            <h2 className="text-2xl font-bold text-gray-900">
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="text-gray-600 text-sm mb-2">{post.date}</p>
            <p className="text-gray-700">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/tags/${tag}`}>
                  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
