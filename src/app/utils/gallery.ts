import { google } from "googleapis";

/**
 * Galería de fotos desde Google Drive, agrupada por subcarpeta.
 * Cada subcarpeta = una sub-galería en /galeria/[folderId].
 * Las imágenes se sirven vía proxy autenticado /api/gallery/[fileId].
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
  photoCount: number;
  cover?: string;
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

function drive() {
  const jwt = auth();
  if (!jwt) return null;
  return google.drive({ version: "v3", auth: jwt });
}

/** Lista las subcarpetas de la raíz (cada una = una sub-galería). */
export async function fetchGalleryFolders(): Promise<GalleryGroup[]> {
  const folderId = process.env.GALLERY_FOLDER_ID;
  const d = drive();
  if (!folderId || !d) return [];

  try {
    const folders = await d.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id,name,createdTime)",
      pageSize: 60,
      orderBy: "name",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const groups: GalleryGroup[] = [];
    for (const folder of folders.data.files ?? []) {
      if (!folder.id) continue;
      // Contar fotos + cover de la subcarpeta
      const files = await d.files.list({
        q: `'${folder.id}' in parents and mimeType contains 'image/' and trashed = false`,
        fields: "files(id,name)",
        pageSize: 1,
        orderBy: "createdTime desc",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      const count = files.data.files?.length ?? 0;
      // Contar total real (el pageSize1 solo da el cover; para count usamos un approach ligero)
      const all = await d.files.list({
        q: `'${folder.id}' in parents and mimeType contains 'image/' and trashed = false`,
        fields: "files(id)",
        pageSize: 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      const total = all.data.files?.length ?? 0;
      if (total > 0) {
        groups.push({
          id: folder.id,
          name: folder.name ?? "Sin nombre",
          photoCount: total,
          cover: files.data.files?.[0]?.id
            ? `/api/gallery/${files.data.files[0].id}?sz=w600`
            : undefined,
        });
      }
      void count;
    }
    return groups;
  } catch (err) {
    console.error("[gallery] folders failed", err);
    return [];
  }
}

/** Fotos de una subcarpeta específica. */
export async function fetchFolderPhotos(
  folderId: string,
  limit = 100
): Promise<{ name: string; photos: GalleryPhoto[] } | null> {
  const d = drive();
  if (!d) return null;

  try {
    // Nombre de la carpeta
    const meta = await d.files.get({
      fileId: folderId,
      fields: "name,mimeType",
      supportsAllDrives: true,
    });
    if (meta.data.mimeType !== "application/vnd.google-apps.folder") {
      return null;
    }

    const files = await d.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "files(id,name,createdTime)",
      pageSize: limit,
      orderBy: "createdTime desc",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const photos: GalleryPhoto[] = (files.data.files ?? [])
      .filter((f) => f.id)
      .map((f) => ({
        id: f.id as string,
        name: f.name ?? "",
        createdTime: f.createdTime ?? undefined,
        thumb: `/api/gallery/${f.id}?sz=w600`,
        full: `/api/gallery/${f.id}?sz=w1600`,
      }));

    return { name: meta.data.name ?? "Galería", photos };
  } catch (err) {
    console.error("[gallery] folder photos failed", err);
    return null;
  }
}
