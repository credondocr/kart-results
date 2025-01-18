import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';


// Configuración para la paginación
const POSTS_PER_PAGE = 5;

// Obtiene todos los posts desde la carpeta de contenido
async function getAllPosts() {
  const postsDirectory = path.join(process.cwd(), 'src/content/posts');
  const filenames = fs.readdirSync(postsDirectory);

  return filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);

    return {
      title: data.title,
      slug: filename.replace(/\.md$/, ''), // Elimina la extensión .md
      date: data.date,
      excerpt: data.excerpt || '',
      coverImage: data.coverImage || '',
    };
  });
}

export default async function BlogPage(
    {params}: {params: Promise<{page: string}>}
) {
  const allPosts = await getAllPosts();
  const { page } = await params;
  // Lógica de paginación
  const currentPage = parseInt(page || '1', 10);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);



  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 shadow-lg rounded-lg mt-5 mb-5">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
        Todos los Posts
      </h1>
      <div className="space-y-6">
        {paginatedPosts.map((post) => (
          <div key={post.slug} className="p-4 bg-white shadow-md rounded-lg">
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-60 w-full object-cover rounded-t-lg"
              />
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="text-gray-600 text-sm mb-2">{post.date}</p>
            <p className="text-gray-700">{post.excerpt}</p>
          </div>
        ))}
      </div>

      
    </div>
  );
}
