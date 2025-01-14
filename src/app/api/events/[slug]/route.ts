import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  try {
    const filePath = path.join(process.cwd(), 'src/content/events', `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Events not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { content, data } = matter(fileContent);

    return NextResponse.json({
      metadata: data,
      content,
    });
  } catch (error) {
    console.error(`Error loading Events: ${slug}`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
