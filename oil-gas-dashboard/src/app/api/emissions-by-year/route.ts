import { NextResponse } from 'next/server';
import { getEmissionsByPermitYear } from '@/lib/database';

export async function GET() {
  try {
    const data = getEmissionsByPermitYear();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching emissions by year:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}