import { NextResponse } from 'next/server';
import { getStateLandPermits } from '@/lib/database';

export async function GET() {
  try {
    const data = getStateLandPermits();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching state land permits:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}