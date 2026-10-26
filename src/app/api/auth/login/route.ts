import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let credentials: unknown;

  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON request body' }, { status: 400 });
  }

  if (
    !credentials ||
    typeof credentials !== 'object' ||
    !('username' in credentials) ||
    !('password' in credentials) ||
    typeof credentials.username !== 'string' ||
    typeof credentials.password !== 'string' ||
    !credentials.username.trim() ||
    !credentials.password
  ) {
    return NextResponse.json(
      { message: 'Username and password are required' },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch('https://dummyjson.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'Authentication service is temporarily unavailable. Please try again.' },
      { status: 502 },
    );
  }
}
