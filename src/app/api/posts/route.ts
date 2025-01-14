// src/app/api/posts/route.ts
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { NextResponse } from "next/server";

const postsDirectory = path.join(process.cwd(), "src/content/posts");
console.log(postsDirectory)
export async function GET() {
    try {
        // Lee los nombres de los archivos en el directorio "posts"
        const fileNames = await fs.readdir(postsDirectory);

        // Procesa cada archivo para extraer datos
        const posts = await Promise.all(
            fileNames.map(async (fileName) => {
                const filePath = path.join(postsDirectory, fileName);
                const fileContents = await fs.readFile(filePath, "utf-8");
                const { data, content } = matter(fileContents);

                return {
                    id: fileName.replace(/\.md$/, ""),
                    ...data,
                    content,
                };
            })
        );

        // Devuelve los posts en formato JSON
        return NextResponse.json(posts);
    } catch (error) {
        // Manejo de errores si el directorio no existe o está vacío
        console.error("Error al leer el directorio de posts:", error);
        return NextResponse.json({ error: "No se pudieron cargar los posts." }, { status: 500 });
    }
}