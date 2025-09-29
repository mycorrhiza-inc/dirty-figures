import { NextResponse } from 'next/server';
import { getPermitsByYear } from '@/lib/database';

export async function GET() {
  try {
    const data = getPermitsByYear();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching permits by year:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}