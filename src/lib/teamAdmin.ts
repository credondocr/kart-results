import sharp from "sharp";

export interface TeamAdminRow {
  slug: string;
  name: string;
  visible: boolean;
  has_logo: boolean;
  pilot_count?: number;
  updated_at?: string;
}

export function slugifyTeam(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function toPngLogo(file: File): Promise<Buffer> {
  const bytes = Buffer.from(await file.arrayBuffer());
  return sharp(bytes)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}
