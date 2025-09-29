import { NextResponse } from 'next/server';
import { getCounties } from '@/lib/database';

export async function GET() {
  try {
    const data = getCounties();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching counties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}