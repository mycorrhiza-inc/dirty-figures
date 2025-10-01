import { NextResponse } from 'next/server';
import { getWellTypes } from '@/lib/database';

export async function GET() {
  try {
    const data = getWellTypes();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching well types data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}