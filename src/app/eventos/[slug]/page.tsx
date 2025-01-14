import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

interface Metadata {
  title: string;
  date: string;
  image?: string;
  categories?: string[];
  tags?: string[];
}

async function getEventData(slug: string) {
  const filePath = path.join(process.cwd(), 'src/content/events', `${slug}.md`);
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
  const postsDirectory = path.join(process.cwd(), 'src/content/events');
  const filenames = fs.readdirSync(postsDirectory);

  return filenames.map((filename) => ({
    slug: filename.replace(/\.md$/, ''),
  }));
}


export default async function EventPage(
  {params}: {params: Promise<{slug: string}>}
) {
  const { slug } = await params;
  const { metadata, content } = await getEventData(slug);

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
      </header>
      <article
        className="prose lg:prose-xl max-w-none text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
