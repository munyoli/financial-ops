import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        // Fetch invoices joined with potential payments (or fetch payments separately in context)
        const [rows] = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const invoice = await request.json();

        // Ensure items are stringified for JSON column
        const itemsJson = typeof invoice.items === 'string' ? invoice.items : JSON.stringify(invoice.items || []);

        const [result]: any = await pool.query(
            `INSERT INTO invoices (quote_id, client_name, client_phone, invoice_number, items, total_amount, status, issue_date, due_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                invoice.quoteId || null,
                invoice.clientName,
                invoice.clientPhone || null,
                invoice.invoiceNumber,
                itemsJson,
                invoice.totalAmount,
                invoice.status || 'pending',
                invoice.issueDate,
                invoice.dueDate
            ]
        );

        if (invoice.quoteId) {
            await pool.query('UPDATE quotes SET status = ? WHERE id = ?', ['accepted', invoice.quoteId]);
        }

        return NextResponse.json({ id: result.insertId, ...invoice });
    } catch (error: any) {
        console.error('Error creating invoice:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
