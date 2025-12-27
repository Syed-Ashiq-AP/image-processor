import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;
    const backgroundColor = formData.get('backgroundColor') as string || 'transparent';
    const width = formData.get('width') as string;
    const height = formData.get('height') as string;
    const format = formData.get('format') as string || 'png';

    if (!imageFile && !imageUrl) {
      return NextResponse.json(
        { error: 'No image file or URL provided' },
        { status: 400 }
      );
    }

    // Prepare form data for Python API
    const pythonFormData = new FormData();
    
    if (imageFile) {
      pythonFormData.append('file', imageFile);
    } else if (imageUrl) {
      // Fetch image from URL and convert to blob
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      pythonFormData.append('file', blob, 'image.jpg');
    }

    // Convert RGB format if needed
    let bgColor = backgroundColor;
    if (backgroundColor.startsWith('rgb(')) {
      bgColor = backgroundColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, '$1,$2,$3');
    }

    pythonFormData.append('bg_color', bgColor);
    if (width) pythonFormData.append('width', width);
    if (height) pythonFormData.append('height', height);
    pythonFormData.append('format', format);

    // Call Python API
    const pythonApiUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.PYTHON_API_URL || 'http://localhost:8000');
    
    const response = await fetch(`${pythonApiUrl}/api/remove-background`, {
      method: 'POST',
      body: pythonFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Python API error: ${error}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    );
  }
}
