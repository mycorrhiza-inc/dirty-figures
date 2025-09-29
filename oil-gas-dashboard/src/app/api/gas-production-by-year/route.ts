import { NextResponse } from 'next/server';
import { getGasProductionByPermitYear } from '@/lib/database';

export async function GET() {
  try {
    const data = getGasProductionByPermitYear();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching gas production by year:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}