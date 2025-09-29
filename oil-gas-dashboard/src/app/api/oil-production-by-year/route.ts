import { NextResponse } from 'next/server';
import { getOilProductionByPermitYear } from '@/lib/database';

export async function GET() {
  try {
    const data = getOilProductionByPermitYear();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching oil production by year:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}