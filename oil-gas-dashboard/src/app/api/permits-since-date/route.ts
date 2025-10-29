import { NextRequest, NextResponse } from 'next/server';
import { getPermitsSinceDate } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const since = searchParams.get('since') || '2022-03-15';

    const data = getPermitsSinceDate(since);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching permits since date:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}