import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

// Configuración para la paginación
const EVENTS_PER_PAGE = 5;

// Obtiene todos los eventos desde la carpeta de contenido
async function getAllEvents() {
  const eventsDirectory = path.join(process.cwd(), 'src/content/events');
  const filenames = fs.readdirSync(eventsDirectory);

  return filenames.map((filename) => {
    const filePath = path.join(eventsDirectory, filename);
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

export default async function EventsPage(
  { params }: { params: Promise<{ page: string }> }
) {
  const allEvents = await getAllEvents();
  const { page } = await params;

  // Lógica de paginación
  const currentPage = parseInt(page || '1', 10);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const endIndex = startIndex + EVENTS_PER_PAGE;
  const paginatedEvents = allEvents.slice(startIndex, endIndex);

  const totalPages = Math.ceil(allEvents.length / EVENTS_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 shadow-lg rounded-lg mt-5 mb-5">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
        Todos los Eventos
      </h1>
      <div className="space-y-6">
        {paginatedEvents.map((event) => (
          <div key={event.slug} className="p-4 bg-white shadow-md rounded-lg">
            {event.coverImage && (
              <img
                src={event.coverImage}
                alt={event.title}
                className=" w-full object-cover rounded-t-lg"
              />
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              <Link href={`/eventos/${event.slug}`}>{event.title}</Link>
            </h2>
            <p className="text-gray-600 text-sm mb-2">{event.date}</p>
            <p className="text-gray-700">{event.excerpt}</p>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="mt-8 flex justify-center items-center space-x-4">
        {currentPage > 1 && (
          <Link
            href={`/events?page=${currentPage - 1}`}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Anterior
          </Link>
        )}
        <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded">
          Página {currentPage} de {totalPages}
        </span>
        {currentPage < totalPages && (
          <Link
            href={`/events?page=${currentPage + 1}`}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Siguiente
          </Link>
        )}
      </div>
    </div>
  );
}
