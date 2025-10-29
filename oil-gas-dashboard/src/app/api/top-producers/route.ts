import { NextRequest, NextResponse } from 'next/server';
import { getTopProducers } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const since = searchParams.get('since') || '2022-03-15';
    const limit = parseInt(searchParams.get('limit') || '5');

    const data = getTopProducers(since, limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching top producers:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}