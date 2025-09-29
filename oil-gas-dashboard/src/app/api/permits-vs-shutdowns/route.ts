import { NextResponse } from 'next/server';
import { getPermitsVsShutdowns } from '@/lib/database';

export async function GET() {
  try {
    const data = getPermitsVsShutdowns();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching permits vs shutdowns data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}