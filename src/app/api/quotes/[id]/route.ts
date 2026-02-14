import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const quote = await request.json();
        const itemsJson = typeof quote.items === 'string' ? quote.items : JSON.stringify(quote.items);

        await pool.query(
            `UPDATE quotes 
             SET client_name = ?, items = ?, subtotal = ?, total_price = ?, status = ? 
             WHERE id = ?`,
            [
                quote.clientName,
                itemsJson,
                quote.totalCost || 0,
                quote.totalClientPrice,
                quote.status,
                id
            ]
        );

        return NextResponse.json({ message: 'Quote updated' });
    } catch (error: any) {
        console.error('Error updating quote:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await pool.query('DELETE FROM quotes WHERE id = ?', [id]);
        return NextResponse.json({ message: 'Quote deleted' });
    } catch (error: any) {
        console.error('Error deleting quote:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
