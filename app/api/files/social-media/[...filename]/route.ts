
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { lookup } from 'mime-types';

export async function GET(
  request: Request,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filename = params.filename.join('/');
    const filePath = path.join(process.cwd(), '../uploads/social-media', filename);
    
    try {
      const fileBuffer = await readFile(filePath);
      const mimeType = lookup(filePath) || 'application/octet-stream';
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
