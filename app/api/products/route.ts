import { NextResponse } from 'next/server';
import { getProductsFromCSV } from '@/lib/csv';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const products = await getProductsFromCSV();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
