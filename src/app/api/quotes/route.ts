import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM quotes ORDER BY created_at DESC');
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Error fetching quotes:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const quote = await request.json();

        // Ensure items are stringified if sent as object
        const itemsJson = typeof quote.items === 'string' ? quote.items : JSON.stringify(quote.items);

        const [result]: any = await pool.query(
            `INSERT INTO quotes (client_name, items, subtotal, tax, total_price, status, client_phone, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                quote.clientName,
                itemsJson,
                quote.totalCost || 0, // Mapping from frontend totalCost as subtotal
                0, // tax
                quote.totalClientPrice,
                quote.status || 'draft',
                quote.clientPhone,
                quote.notes
            ]
        );

        return NextResponse.json({ id: result.insertId, ...quote });
    } catch (error: any) {
        console.error('Error creating quote:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
