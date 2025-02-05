import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }

    const title = generateTitleFromMessage(message);

    return NextResponse.json({ title });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

function generateTitleFromMessage(message: string): string {
  let words = message
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter((word) => word.length > 3);

  if (words.length === 0) return 'New Chat';

  let title = words.slice(0, 5).join(' ');
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return title.length > 50 ? title.slice(0, 50) + '...' : title;
}
