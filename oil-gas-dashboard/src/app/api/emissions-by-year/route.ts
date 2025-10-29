import { NextRequest, NextResponse } from 'next/server';
import { getEmissionsByPermitYear } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surfaceOwnership = searchParams.get('surfaceOwnership');

    const data = getEmissionsByPermitYear(surfaceOwnership);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching emissions by year:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}