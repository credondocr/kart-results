import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import Link from 'next/link';

interface Metadata {
  title: string;
  date: string;
  image?: string;
  categories?: string[];
  tags?: string[];
}

// Carga los datos del post desde el archivo Markdown
async function getPostData(slug: string) {
  const filePath = path.join(process.cwd(), 'src/content/posts', `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { content, data } = matter(fileContent);

  const processedContent = await remark()
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(content);

  return {
    metadata: data as Metadata,
    content: processedContent.toString(),
  };
}

// Genera los parámetros estáticos para las rutas dinámicas
export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'src/content/posts');
  const filenames = fs.readdirSync(postsDirectory);

  return filenames.map((filename) => ({
    slug: filename.replace(/\.md$/, ''),
  }));
}


export default async function PostPage(
  {params}: {params: Promise<{slug: string}>}
) {
  const { slug } = await params;
  const { metadata, content } = await getPostData(slug);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 shadow-lg rounded-lg mt-5 mb-5">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
          {metadata.title}
        </h1>
        <p className="text-gray-600 text-sm italic">{metadata.date}</p>
        {metadata.image && (
          <img
            src={metadata.image}
            alt={metadata.title}
            className="w-full h-auto mt-6 rounded-xl shadow-md"
          />
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {metadata.categories?.map((category: string, index: number) => (
            <span
              key={index}
              className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
      </header>
      <article
        className="prose lg:prose-xl max-w-none text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <footer className="mt-12 border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-900">Tags</h4>
        <div className="flex flex-wrap gap-3 mt-3">
          {metadata.tags?.map((tag: string, index: number) => (
            <Link key={index} href={`/tags/${tag}`}>
              <span className="bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded-full cursor-pointer hover:bg-gray-300">
                #{tag}
              </span>
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
