import { NextResponse } from 'next/server';
import { getWellsMapData } from '@/lib/database';

export async function GET() {
  try {
    const data = getWellsMapData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching wells map data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}