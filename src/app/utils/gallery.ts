import { google } from "googleapis";

/**
 * Galería de fotos desde Google Drive, agrupada por subcarpeta.
 * Requiere env:
 * - GOOGLE_PROJECT_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY
 * - GALLERY_FOLDER_ID (carpeta raíz, compartida "Cualquiera con el link")
 *
 * Estructura esperada en Drive:
 *   Raíz/
 *     ├── 2026-10-31 Cartama/   ← fotos sueltas aquí
 *     ├── 2026-09-20 Autódromo/
 *     └── sueltas.jpg            ← fotos en la raíz van a "Sin fecha"
 */

export interface GalleryPhoto {
  id: string;
  name: string;
  createdTime?: string;
  thumb: string;
  full: string;
}

export interface GalleryGroup {
  id: string;
  name: string;
  photos: GalleryPhoto[];
}

function auth() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;
  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

function toPhoto(f: { id?: string | null; name?: string | null; createdTime?: string | null }): GalleryPhoto | null {
  if (!f.id) return null;
  return {
    id: f.id,
    name: f.name ?? "",
    createdTime: f.createdTime ?? undefined,
    thumb: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1000`,
    full: `https://drive.google.com/thumbnail?id=${f.id}&sz=w2048`,
  };
}

/**
 * Fotos agrupadas por subcarpeta. Las subcarpetas se ordenan por nombre
 * (usá prefijo de fecha ISO: "2026-10-31 Carrera" para orden natural).
 * Fotos sueltas en la raíz van al grupo "Sin fecha".
 */
export async function fetchGalleryGroups(
  limitPerFolder = 60
): Promise<GalleryGroup[]> {
  const folderId = process.env.GALLERY_FOLDER_ID;
  if (!folderId) return [];
  const jwt = auth();
  if (!jwt) return [];

  try {
    const drive = google.drive({ version: "v3", auth: jwt });

    // Fotos directas en la raíz
    const rootFiles = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "files(id,name,createdTime)",
      pageSize: 30,
      orderBy: "createdTime desc",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    // Subcarpetas
    const folders = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id,name,createdTime)",
      pageSize: 50,
      orderBy: "name",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const groups: GalleryGroup[] = [];

    // Raíz: fotos sueltas
    const rootPhotos = (rootFiles.data.files ?? [])
      .map(toPhoto)
      .filter((p): p is GalleryPhoto => p !== null);
    if (rootPhotos.length) {
      groups.push({ id: folderId, name: "Sin fecha", photos: rootPhotos });
    }

    // Cada subcarpeta → grupo
    for (const folder of folders.data.files ?? []) {
      if (!folder.id) continue;
      const files = await drive.files.list({
        q: `'${folder.id}' in parents and mimeType contains 'image/' and trashed = false`,
        fields: "files(id,name,createdTime)",
        pageSize: limitPerFolder,
        orderBy: "createdTime desc",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      const photos = (files.data.files ?? [])
        .map(toPhoto)
        .filter((p): p is GalleryPhoto => p !== null);
      if (photos.length) {
        groups.push({
          id: folder.id,
          name: folder.name ?? "Sin nombre",
          photos,
        });
      }
    }

    return groups;
  } catch (err) {
    console.error("[gallery] drive list failed", err);
    return [];
  }
}
